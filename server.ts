import express from "express";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import twilio from "twilio";
import fs from "fs";

// Firebase Admin SDK Imports (Modular v11+)
import { initializeApp as initializeAdminApp, getApps, getApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore as getAdminFirestore, FieldValue as AdminFieldValue } from "firebase-admin/firestore";

// Firebase Client SDK Imports (for fallback)
import { initializeApp as initializeClientApp } from "firebase/app";
import { getFirestore as getClientFirestore, collection as clientCollection, addDoc as clientAddDoc, serverTimestamp as clientTimestamp } from "firebase/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read firebase config
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, "firebase-applet-config.json"), "utf8"));

// Initialize Client SDK (used as a fallback)
const clientApp = initializeClientApp(firebaseConfig);
const clientDb = getClientFirestore(clientApp, firebaseConfig.firestoreDatabaseId);

// Lazy initialization helper for Firebase Admin
let adminAppInstance: any = null;
const getFirebaseAdmin = () => {
  if (!adminAppInstance) {
    if (getApps().length > 0) {
      adminAppInstance = getApp();
      console.log("Firebase Admin: Using existing app instance");
    } else {
      try {
        console.log("Firebase Admin: Starting initialization...");
        const options: any = {
          projectId: firebaseConfig.projectId,
        };

        const saJson = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_ADMIN_KEY;
        if (saJson) {
          try {
            const certData = JSON.parse(saJson);
            options.credential = cert(certData);
            console.log("Firebase Admin: Credential set via Service Account JSON.");
          } catch (e) {
            console.warn("Firebase Admin: Service account JSON is invalid.");
          }
        }

        if (!options.credential) {
          try {
            options.credential = applicationDefault();
            console.log("Firebase Admin: Using application default credentials.");
          } catch (e) {
            console.warn("Firebase Admin: Application default credentials not available.");
          }
        }

        adminAppInstance = initializeAdminApp(options);
        console.log("Firebase Admin: Initialized successfully.");
      } catch (e: any) {
        console.error("Firebase Admin: Critical initialization error:", e.message);
        // Fallback to simple initialization if possible
        adminAppInstance = initializeAdminApp({ projectId: firebaseConfig.projectId });
      }
    }
  }
  return adminAppInstance;
};

// Notification Service Helpers
let resendClient: Resend | null = null;
const getResend = () => {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
};

let twilioClient: any = null;
const getTwilio = () => {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for inquiry submission
  app.post("/api/inquiries", async (req, res) => {
    const { name, email, whatsapp, message, org } = req.body;

    console.log(`Processing inquiry from ${name} (${email})`);

    if (!name || !email || !whatsapp || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // 1. Data Preparation
      const inquiryPayload = {
        name,
        org: org || "",
        email,
        whatsapp,
        message,
        status: "new",
      };

      let docId: string;

      // 2. Storage (Primary: Admin SDK, Fallback: Client SDK)
      try {
        console.log("Writing with Admin SDK...");
        const adminApp = getFirebaseAdmin();
        const adminDb = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)"
          ? getAdminFirestore(adminApp, firebaseConfig.firestoreDatabaseId)
          : getAdminFirestore(adminApp);
        
        const docRef = await adminDb.collection("inquiries").add({
          ...inquiryPayload,
          createdAt: AdminFieldValue.serverTimestamp(),
        });
        docId = docRef.id;
        console.log("Admin SDK write success:", docId);
      } catch (adminErr: any) {
        console.warn("Admin SDK write failed, trying fallback. Error:", adminErr.message);
        
        // Fallback to Client SDK (uses API Key + Security Rules)
        try {
          const docRef = await clientAddDoc(clientCollection(clientDb, "inquiries"), {
            ...inquiryPayload,
            createdAt: clientTimestamp(),
          });
          docId = docRef.id;
          console.log("Client SDK fallback success:", docId);
        } catch (clientErr: any) {
          console.error("Both SDKs failed to write to Firestore.");
          throw new Error(`Storage failed. Admin: ${adminErr.message}. Client: ${clientErr.message}`);
        }
      }

      // 3. Automated Notifications (Email & WhatsApp)
      const resend = getResend();
      const twilioSms = getTwilio();
      const fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM;
      const adminEmail = process.env.ADMIN_EMAIL || "ayaan.kriplani2213@gmail.com";
      const adminWhatsApp = process.env.ADMIN_WHATSAPP;

      // Submitter Email
      if (resend) {
        try {
          await resend.emails.send({
            from: "The Scaffold Initiative <onboarding@resend.dev>",
            to: email,
            subject: "We received your inquiry - The Scaffold Initiative",
            html: `<div style="font-family:sans-serif;padding:20px;max-width:600px;">
              <h1>Hi ${name},</h1>
              <p>Thank you for contacting The Scaffold Initiative. We've received your request and will follow up shortly.</p>
              <div style="background:#f4f4f4;padding:15px;border-radius:8px;">
                <p><strong>Org:</strong> ${org || "N/A"}</p>
                <p><strong>Message:</strong> ${message}</p>
              </div>
            </div>`
          });
        } catch (e) {
          console.error("Confirmation email failed:", e);
        }
      }

      // Submitter WhatsApp
      if (twilioSms && fromWhatsApp) {
        try {
          const toWA = whatsapp.startsWith("whatsapp:") ? whatsapp : `whatsapp:${whatsapp.startsWith("+") ? whatsapp : "+" + whatsapp}`;
          await twilioSms.messages.create({
            from: fromWhatsApp,
            to: toWA,
            body: `Hi ${name}, this is a confirmation from The Scaffold Initiative. We've received your inquiry and will reach out to you soon!`,
          });
        } catch (e) {
          console.error("Confirmation WhatsApp failed:", e);
        }
      }

      // Admin Notifications
      if (resend && adminEmail) {
        try {
          await resend.emails.send({
            from: "System <onboarding@resend.dev>",
            to: adminEmail,
            subject: `New Inquiry: ${name}`,
            html: `<p>New partner inquiry from <strong>${name}</strong>.</p><p>Email: ${email}</p><p>WhatsApp: ${whatsapp}</p><p>Message: ${message}</p>`
          });
        } catch (e) {}
      }

      if (twilioSms && fromWhatsApp && adminWhatsApp) {
        try {
          const adminToWA = adminWhatsApp.startsWith("whatsapp:") ? adminWhatsApp : `whatsapp:${adminWhatsApp.startsWith("+") ? adminWhatsApp : "+" + adminWhatsApp}`;
          await twilioSms.messages.create({
            from: fromWhatsApp,
            to: adminToWA,
            body: `NEW INQUIRY\nName: ${name}\nOrg: ${org || "N/A"}\nMessage: ${message.substring(0, 200)}...`,
          });
        } catch (e) {}
      }

      res.status(201).json({ id: docId, success: true });
    } catch (error: any) {
      console.error("Submission error:", error);
      res.status(500).json({ error: "Service unavailable", details: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
