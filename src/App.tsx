import { useState, useEffect, FormEvent, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { 
  Globe, 
  Users, 
  School, 
  Heart, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Zap,
  Calendar,
  MessageSquare,
  Stethoscope,
  BookOpen,
  X,
  Send,
  Loader2,
  CheckCircle2,
  LayoutDashboard,
  LogOut,
  Info,
  Check,
  Phone,
  Mail,
  Building,
  Clock,
  ChevronRight,
  Filter,
  Trash2,
  ExternalLink,
  Download,
  MessageCircle,
  LogIn,
  Instagram,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import { 
  db, 
  auth, 
  googleProvider, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User
} from "./lib/firebase";
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  setDoc,
  doc, 
  deleteDoc,
  getDoc
} from "firebase/firestore";

// --- Types & Enums ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // Not throwing error to avoid unhandled promise rejection crashing the app
  // throw new Error(JSON.stringify(errInfo));
};

// --- Components ---

const ScaffoldLogo = ({ className = "w-10 h-10", size = 48 }: { className?: string; size?: number }) => (
  <svg 
    viewBox="0 0 320 320" 
    width={size} 
    height={size} 
    className={className}
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* LEFT SIDE: PINK BRAIN */}
    <path 
      d="M130,50 C110,50 95,60 90,70 C80,68 65,75 60,95 C55,100 45,115 48,135 C42,145 40,160 45,175 C42,185 45,200 55,215 C52,225 58,245 75,255 C78,265 92,275 110,270 C118,272 130,265 135,255 C140,256 145,255 148,250 C150,250 152,230 152,160 M130,50 C140,100 148,125 152,160"
      fill="#F8AFCB"
      stroke="#2D141C"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Internal sulci / fold lines of the brain */}
    <path d="M135,255 C120,250 115,235 125,225 C135,215 140,225 148,215" stroke="#2D141C" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M110,270 C95,260 95,240 105,230 C115,220 120,230 130,220" stroke="#2D141C" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M75,255 C65,240 70,220 85,215 C100,210 110,220 120,205" stroke="#2D141C" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M55,215 C45,200 55,180 70,180 C85,180 95,190 110,180" stroke="#2D141C" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M45,175 C35,160 45,140 60,140 C75,140 85,155 100,150" stroke="#2D141C" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M48,135 C42,115 55,100 70,110 C85,120 90,130 105,120" stroke="#2D141C" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M60,95 C60,80 75,70 90,80 C105,90 105,105 115,100" stroke="#2D141C" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M90,70 C95,55 110,50 125,60 C135,68 135,85 142,85" stroke="#2D141C" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M130,95 C120,110 100,110 95,125" stroke="#2D141C" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M138,130 C125,140 110,135 105,155" stroke="#2D141C" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M142,165 C130,170 120,165 115,185" stroke="#2D141C" strokeWidth="3" fill="none" strokeLinecap="round" />
    
    {/* MIDDLE VERTICAL DIVIDER: "SCAFFOLD" Stacked Letter Blocks */}
    <g transform="translate(155, 45)">
      {/* Block 1: S (Teal) */}
      <rect x="0" y="0" width="28" height="28" rx="5" fill="#68BAC6" stroke="#2D141C" strokeWidth="3" />
      <text x="14" y="20" fill="white" fontSize="16" fontWeight="bold" fontFamily="system-ui, sans-serif" textAnchor="middle">S</text>
      
      {/* Block 2: C (Sage Green) */}
      <rect x="0" y="31" width="28" height="28" rx="5" fill="#97BA9B" stroke="#2D141C" strokeWidth="3" />
      <text x="14" y="51" fill="white" fontSize="16" fontWeight="bold" fontFamily="system-ui, sans-serif" textAnchor="middle">C</text>
      
      {/* Block 3: A (Pink) */}
      <rect x="0" y="62" width="28" height="28" rx="5" fill="#F8AFCB" stroke="#2D141C" strokeWidth="3" />
      <text x="14" y="82" fill="white" fontSize="16" fontWeight="bold" fontFamily="system-ui, sans-serif" textAnchor="middle">A</text>
      
      {/* Block 4: F (Teal) */}
      <rect x="0" y="93" width="28" height="28" rx="5" fill="#68BAC6" stroke="#2D141C" strokeWidth="3" />
      <text x="14" y="113" fill="white" fontSize="16" fontWeight="bold" fontFamily="system-ui, sans-serif" textAnchor="middle">F</text>
      
      {/* Block 5: F (Cream/Beige-White) */}
      <rect x="0" y="124" width="28" height="28" rx="5" fill="#FFF1F4" stroke="#2D141C" strokeWidth="3" />
      <text x="14" y="144" fill="#2D141C" fontSize="16" fontWeight="bold" fontFamily="system-ui, sans-serif" textAnchor="middle">F</text>
      
      {/* Block 6: O (Pink) */}
      <rect x="0" y="155" width="28" height="28" rx="5" fill="#F8AFCB" stroke="#2D141C" strokeWidth="3" />
      <text x="14" y="175" fill="white" fontSize="16" fontWeight="bold" fontFamily="system-ui, sans-serif" textAnchor="middle">O</text>
      
      {/* Block 7: L (Teal) */}
      <rect x="0" y="186" width="28" height="28" rx="5" fill="#68BAC6" stroke="#2D141C" strokeWidth="3" />
      <text x="14" y="206" fill="white" fontSize="16" fontWeight="bold" fontFamily="system-ui, sans-serif" textAnchor="middle">L</text>
      
      {/* Block 8: D (Sage Green) */}
      <rect x="0" y="217" width="28" height="28" rx="5" fill="#97BA9B" stroke="#2D141C" strokeWidth="3" />
      <text x="14" y="237" fill="white" fontSize="16" fontWeight="bold" fontFamily="system-ui, sans-serif" textAnchor="middle">D</text>
    </g>
    
    {/* RIGHT SIDE: SCAFFOLD AND BUILDER */}
    <g stroke="#2D141C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="190" y1="45" x2="190" y2="290" />
      <line x1="230" y1="120" x2="230" y2="290" />
      <line x1="270" y1="120" x2="270" y2="290" />
      
      <line x1="190" y1="145" x2="270" y2="145" strokeWidth="2.5" />
      <line x1="190" y1="185" x2="270" y2="185" strokeWidth="2.5" />
      <line x1="190" y1="225" x2="270" y2="225" strokeWidth="2.5" />
      <line x1="190" y1="265" x2="270" y2="265" strokeWidth="2.5" />
      
      <line x1="220" y1="120" x2="280" y2="120" strokeWidth="4" />
      
      <line x1="190" y1="145" x2="230" y2="185" opacity="0.8" />
      <line x1="230" y1="145" x2="190" y2="185" opacity="0.8" />
      <line x1="230" y1="145" x2="270" y2="185" opacity="0.8" />
      <line x1="270" y1="145" x2="230" y2="185" opacity="0.8" />
      
      <line x1="190" y1="185" x2="230" y2="225" opacity="0.8" />
      <line x1="230" y1="185" x2="190" y2="225" opacity="0.8" />
      <line x1="230" y1="185" x2="270" y2="225" opacity="0.8" />
      <line x1="270" y1="185" x2="230" y2="225" opacity="0.8" />

      <line x1="190" y1="225" x2="230" y2="265" opacity="0.8" />
      <line x1="230" y1="225" x2="190" y2="265" opacity="0.8" />
      <line x1="230" y1="225" x2="270" y2="265" opacity="0.8" />
      <line x1="270" y1="225" x2="230" y2="265" opacity="0.8" />
      
      <rect x="220" y="55" width="20" height="15" rx="2" fill="#2D141C" />
      <rect x="195" y="55" width="15" height="15" rx="2" fill="#2D141C" />
      <rect x="235" y="80" width="25" height="15" rx="2" fill="#2D141C" />
      <rect x="210" y="90" width="15" height="15" rx="2" fill="#2D141C" />
      
      {/* Human/Builder */}
      <circle cx="250" cy="72" r="7" fill="#2D141C" stroke="none" />
      <line x1="250" y1="79" x2="250" y2="105" strokeWidth="5.5" />
      <line x1="250" y1="85" x2="232" y2="80" strokeWidth="3" />
      <line x1="250" y1="85" x2="235" y2="76" strokeWidth="2.5" />
      <line x1="232" y1="65" x2="232" y2="118" strokeWidth="2" stroke="#2D141C" />
      <line x1="245" y1="105" x2="242" y2="120" strokeWidth="4" />
      <line x1="255" y1="105" x2="258" y2="120" strokeWidth="4" />
    </g>
  </svg>
);

// --- Admin Portal ---

const AdminPortal = ({ onExit }: { onExit: () => void }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<"admin" | "moderator" | null>(null);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"inquiries" | "staff" | "dashboard">("dashboard");
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "status-asc" | "status-desc">("date-desc");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const [showRoleInfo, setShowRoleInfo] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u && u.email) {
        try {
          const emailForCheck = u.email.toLowerCase();
          const adminDoc = await getDoc(doc(db, 'admins', emailForCheck));
          if (adminDoc.exists()) {
            setUserRole(adminDoc.data().role);
          } else if (emailForCheck === 'ayaan.kriplani2213@gmail.com') {
            setUserRole('admin');
          } else {
            setUserRole(null);
          }
        } catch (err) {
          console.error("Auth check failed", err);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userRole) return;

    // Load Inquiries
    console.log("Setting up inquiries listener...");
    const qI = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
    const unsubscribeI = onSnapshot(qI, (snapshot) => {
      console.log("Received inquiries snapshot:", snapshot.size, "documents");
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toLocaleString() || "Pending..."
      }));
      setInquiries(data);
    }, (err) => {
      console.error("Inquiries listener failed", err);
      handleFirestoreError(err, OperationType.LIST, 'inquiries');
    });

    // Load Staff (only for admins)
    let unsubscribeS = () => {};
    if (userRole === "admin") {
      const qS = collection(db, 'admins');
      unsubscribeS = onSnapshot(qS, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStaff(data);
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'admins'));
    }

    return () => {
      unsubscribeI();
      unsubscribeS();
    };
  }, [userRole]);

  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google sign in failed", err);
      if (err.code === 'auth/cancelled-popup-request') {
        setAuthError("Sign-in process was interrupted. This can happen if multiple clicks occur or if the request timed out. Please try again.");
      } else if (err.code === 'auth/popup-blocked') {
        setAuthError("The sign-in popup was blocked by your browser. Please enable popups for this site and try again.");
      } else if (err.code === 'auth/popup-closed-by-user') {
        setAuthError("Sign-in was cancelled because the window was closed.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setAuthError("This domain is not authorized for Google Sign-In. Please use Email/Password sign-in instead.");
      } else {
        setAuthError(`Sign-in failed: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    if (isSigningIn) return;
    if (!email || !password) {
      setAuthError("Please enter both email and password.");
      return;
    }
    
    setIsSigningIn(true);
    setAuthError(null);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error("Email auth failed", err);
      if (err.code === 'auth/invalid-credential') {
        setAuthError("Invalid email or password.");
      } else if (err.code === 'auth/email-already-in-use') {
        setAuthError("An account with this email already exists. Try signing in.");
      } else if (err.code === 'auth/weak-password') {
        setAuthError("Password should be at least 6 characters.");
      } else {
        setAuthError(`Auth failed: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setAuthError("Please enter your email address first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setAuthError("Password reset email sent! Please check your inbox.");
    } catch (err: any) {
      console.error("Password reset failed", err);
      setAuthError(`Failed to send reset email: ${err.message || 'Unknown error'}`);
    }
  };

  const handleSignOut = () => auth.signOut();

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const path = `inquiries/${id}`;
    try {
      await updateDoc(doc(db, 'inquiries', id), { status: newStatus });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Name,Email,WhatsApp,Type,Organization,Status,Message\n";
    inquiries.forEach(row => {
      const msg = row.message ? row.message.replace(/\"/g, '""').replace(/\n/g, ' ') : "";
      csvContent += `"${row.createdAt}","${row.name}","${row.email}","${row.whatsapp || ''}","${row.type || ''}","${row.org || ''}","${row.status || ''}","${msg}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inquiries_export.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    const path = `inquiries/${id}`;
    try {
      await deleteDoc(doc(db, 'inquiries', id));
    } catch (err: any) {
      alert("Failed to delete inquiry: " + err.message);
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const handleAddStaff = async (e: FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.toLowerCase().trim();
    const role = (form.elements.namedItem('role') as HTMLSelectElement).value;

    const path = `admins/${email}`;
    try {
      await setDoc(doc(db, 'admins', email), { role });
      form.reset();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const handleRemoveStaff = async (id: string) => {
    if (id === user?.email) return alert("You cannot remove yourself.");
    if (!confirm("Remove this staff member?")) return;
    const path = `admins/${id}`;
    try {
      await deleteDoc(doc(db, 'admins', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const handleSendInitialContact = async (inquiry: any) => {
    try {
      const formalizedMessage = `Thank you for contacting The Scaffold Initiative. We are thrilled at the prospect of working with you. We will review your inquiry and get back to you shortly. Please note that this chat will serve as our primary platform for communication.`;
      
      if (inquiry.whatsapp && inquiry.whatsapp.replace(/[^0-9]/g, '').length > 5) {
        const cleanWA = inquiry.whatsapp.replace(/[^0-9]/g, '');
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent("Hi " + inquiry.name + ",\n\n" + formalizedMessage)}&phone=${cleanWA}`, '_blank');
      } else if (inquiry.email) {
        window.open(`mailto:${inquiry.email}?subject=${encodeURIComponent("Thank you for contacting The Scaffold Initiative")}&body=${encodeURIComponent("Hi " + inquiry.name + ",\n\n" + formalizedMessage)}`, '_blank');
      }

      await handleUpdateStatus(inquiry.id, 'contacted');
    } catch (e: any) {
      console.error("Error: " + e.message);
    }
  };

  const filteredInquiries = useMemo(() => {
    let result = filter === "all" ? [...inquiries] : inquiries.filter(i => i.status === filter);
    result.sort((a, b) => {
      // CreatedAt is formatted as localized string. We should ideally parse it back? 
      // Wait, in Firebase it's a ToDate().toLocaleString(). 
      // Actually to sort date properly, we should use the string as best effort or raw createdAt.
      // Wait, we need to make sure createdAt can be sorted. Let's see what is inside 'inquiries'.
      const dateA = a.createdAt === "Pending..." ? new Date() : new Date(a.createdAt);
      const dateB = b.createdAt === "Pending..." ? new Date() : new Date(b.createdAt);
      const timeA = dateA.getTime() || 0;
      const timeB = dateB.getTime() || 0;

      if (sortBy === "date-desc") {
        return timeB - timeA;
      }
      if (sortBy === "date-asc") {
        return timeA - timeB;
      }
      if (sortBy === "status-asc") {
        return (a.status || "").localeCompare(b.status || "");
      }
      if (sortBy === "status-desc") {
        return (b.status || "").localeCompare(a.status || "");
      }
      return 0;
    });
    return result;
  }, [inquiries, filter, sortBy]);

  const dashboardStats = useMemo(() => {
    const types: Record<string, number> = {};
    inquiries.forEach(i => {
      const type = i.type || 'Other';
      types[type] = (types[type] || 0) + 1;
    });
    return Object.keys(types).map(k => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: types[k] }));
  }, [inquiries]);

  const COLORS = ['#F5AFC3', '#7FC7D3', '#A8B987', '#A2D5F2', '#C8E6C9', '#F7F7F4'];

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-charcoal animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-brand-blue/20 p-12 rounded-[3.5rem] shadow-sm text-center  relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-brand-pink" />
          
          <div className="w-24 h-24 bg-brand-cream rounded-[2rem] flex items-center justify-center mx-auto mb-10  ">
            <div className="w-12 h-12 bg-brand-pink rounded-[1.5rem] flex items-center justify-center font-display font-black text-2xl text-brand-charcoal">S</div>
          </div>
          
          <h2 className="text-4xl font-display text-brand-charcoal mb-4 tracking-tighter">Staff Access</h2>
          <p className="text-brand-charcoal mb-12 font-medium px-4">
            Sign in to manage the Scaffold Initiative global network.
          </p>
          
          <form onSubmit={handleEmailAuth} className="flex flex-col gap-4 mb-6">
            <input 
              type="email" 
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-6 py-4 bg-brand-cream/50  rounded-[2rem] outline-none focus: transition-colors text-sm font-medium"
              required
            />
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-6 py-4 bg-brand-cream/50  rounded-[2rem] outline-none focus: transition-colors text-sm font-medium"
              required
            />
            <div className="text-right">
              {!isRegistering && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-brand-charcoal font-bold hover:underline"
                >
                  Forgot your password?
                </button>
              )}
            </div>
            <button 
              type="submit"
              disabled={isSigningIn}
              className="w-full py-4 bg-brand-pink text-brand-charcoal rounded-[2rem] font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSigningIn ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                isRegistering ? "Create Account" : "Sign In with Email"
              )}
            </button>
            <button 
              type="button" 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs text-brand-charcoal font-bold hover:text-brand-charcoal transition-colors mt-2"
            >
              {isRegistering ? "Already have an account? Sign In" : "Need an account? Register"}
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t "></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-brand-pink/20 text-brand-charcoal font-bold uppercase tracking-widest">or</span>
            </div>
          </div>

          <button 
            type="button"
            disabled={isSigningIn}
            onClick={handleGoogleSignIn}
            className="w-full py-5 bg-brand-green/20 border-2  text-brand-charcoal rounded-[2rem] font-bold text-sm flex items-center justify-center gap-4 hover:bg-brand-cream hover: transition-all shadow-sm cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningIn ? (
              <Loader2 className="w-5 h-5 animate-spin text-brand-charcoal" />
            ) : (
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {isSigningIn ? "Connecting..." : "Sign in with Google"}
          </button>

          {authError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-50 border border-red-100 rounded-[2rem] text-red-600 text-[10px] font-bold leading-relaxed"
            >
              {authError}
            </motion.div>
          )}

          <div className="mt-12 flex flex-col items-center gap-6">
            <div className="h-px w-8 bg-brand-pink/10" />
            <button 
              onClick={onExit}
              className="text-xs font-black text-brand-charcoal uppercase tracking-[0.2em] hover:text-brand-pink transition-colors cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (userRole === null) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-brand-blue/20 p-12 md:p-16 rounded-[4rem] shadow-sm text-center "
        >
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-red-100">
            <ShieldCheck className="w-10 h-10" />
          </div>
          
          <h2 className="text-4xl font-display text-brand-charcoal mb-6 tracking-tighter">Access Denied</h2>
          
          <div className="bg-brand-cream/50 p-8 rounded-3xl  mb-10 text-left">
            <p className="text-sm text-brand-charcoal mb-6 font-medium leading-relaxed">
              Your account <strong>{user?.email}</strong> is not yet authorized.
            </p>
            <div className="space-y-4">
              <p className="text-[11px] text-brand-charcoal font-medium">
                An administrator must add your email address to the authorized staff list to grant you access.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={handleSignOut}
              className="w-full py-5 bg-brand-pink text-brand-charcoal rounded-full font-bold uppercase tracking-widest text-sm hover:bg-brand-blue hover:text-brand-charcoal hover:shadow-md transition-all shadow-sm cursor-pointer"
            >
              Sign Out & Try Again
            </button>
            <button 
              onClick={onExit}
              className="py-5 text-xs font-black text-brand-charcoal uppercase tracking-widest hover:text-brand-charcoal transition-colors cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream text-brand-charcoal font-sans flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-brand-pink/15 text-brand-charcoal p-8 md:min-h-screen flex flex-col border-r border-brand-pink/20">
        <div className="flex items-center gap-3 mb-16 animate-pulse-slow">
          <ScaffoldLogo className="w-12 h-12" />
          <div>
            <h1 className="font-display font-black text-lg tracking-tight uppercase leading-none text-brand-charcoal">Scaffold</h1>
            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mt-1">Admin Panel</p>
          </div>
        </div>

        <nav className="space-y-2 flex-grow">
          <div className="mb-4">
            <p className="text-[10px] font-black opacity-30 uppercase tracking-[2px] px-6 mb-2">Inquiries</p>
            {[
              
              { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'all', label: 'All Inquiries', icon: <MessageSquare className="w-4 h-4" /> },
              { id: 'new', label: 'New', icon: <Sparkles className="w-4 h-4" /> },
              { id: 'contacted', label: 'Contacted', icon: <MessageCircle className="w-4 h-4" /> },
              { id: 'archived', label: 'Archived', icon: <Trash2 className="w-4 h-4" /> }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab("inquiries"); setFilter(item.id); }}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-[2rem] text-sm font-bold transition-all ${activeTab === "inquiries" && filter === item.id ? 'bg-brand-pink text-brand-charcoal' : 'hover:bg-brand-cream/10 opacity-60 hover:opacity-100'}`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>

          {userRole === "admin" && (
            <div>
              <p className="text-[10px] font-black opacity-30 uppercase tracking-[2px] px-6 mb-2 mt-8">Administration</p>
              <button
                onClick={() => setActiveTab("staff")}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-[2rem] text-sm font-bold transition-all ${activeTab === "staff" ? 'bg-brand-pink text-brand-charcoal' : 'hover:bg-brand-cream/10 opacity-60 hover:opacity-100'}`}
              >
                <Users className="w-4 h-4" /> Staff Management
              </button>
            </div>
          )}
        </nav>

        <div className="mt-auto pt-8 border-t ">
          <div className="flex items-center gap-4 mb-6">
            <img src={user.photoURL || ""} alt="" className="w-10 h-10 rounded-full " />
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">{user.displayName}</p>
              <p className="text-[10px] opacity-40 truncate">{user.email}</p>
            </div>
          </div>
          <div className="space-y-2">
            <button 
              onClick={() => setShowRoleInfo(true)}
              className="w-full flex items-center justify-center gap-2 py-4 bg-brand-cream/10 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-brand-cream/20 transition-all cursor-pointer"
            >
              <Info className="w-4 h-4" /> Role Permissions
            </button>
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-4 bg-brand-cream/10 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 hover:text-red-400 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
            <button 
              onClick={onExit}
              className="w-full flex items-center justify-center gap-2 py-4 bg-brand-cream/10 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-brand-pink transition-all text-brand-charcoal cursor-pointer"
            >
              Exit Admin
            </button>
          </div>
        </div>
      </div>

      {/* Role Info Modal */}
      <AnimatePresence>
        {showRoleInfo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-charcoal/40">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-brand-pink/20 rounded-[3rem] shadow-sm relative overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-10 border-b ">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-cream rounded-[2rem] flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-brand-charcoal" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-display font-bold text-brand-charcoal">Access Roles</h3>
                      <p className="text-xs text-brand-charcoal font-medium">System Permission Overview</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowRoleInfo(false)}
                    className="p-2 hover:bg-brand-cream rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-6 h-6 text-brand-charcoal" />
                  </button>
                </div>
              </div>

              <div className="p-10 overflow-y-auto space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Admin Power */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-pink text-brand-charcoal rounded-lg flex items-center justify-center font-bold text-xs shadow-sm">A</div>
                      <h4 className="font-bold text-brand-charcoal">Administrator</h4>
                    </div>
                    <ul className="space-y-4">
                      {[
                        "Full view & management of all inquiries",
                        "Update inquiry status (New, Contacted, Archive)",
                        "Delete inquiry records",
                        "Staff Management (Add/Remove staff members)",
                        "Assign roles (Admin/Moderator) to staff",
                        "Complete system control"
                      ].map((p, i) => (
                        <li key={i} className="flex gap-3 text-xs font-medium text-brand-charcoal">
                          <CheckCircle2 className="w-4 h-4 text-brand-charcoal flex-shrink-0 mt-0.5" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Moderator Power */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-pink text-brand-charcoal rounded-lg flex items-center justify-center font-bold text-xs shadow-sm">M</div>
                      <h4 className="font-bold text-brand-charcoal">Moderator</h4>
                    </div>
                    <ul className="space-y-4">
                      {[
                        "Full view of all incoming inquiries",
                        "Update inquiry status (New, Contacted, Archive)",
                        "Cannot delete inquiry records",
                        "No access to Staff Management",
                        "Cannot add or remove other users"
                      ].map((p, i) => (
                        <li key={i} className="flex gap-3 text-xs font-medium text-brand-charcoal">
                          <CheckCircle2 className="w-4 h-4 text-brand-charcoal flex-shrink-0 mt-0.5" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-6 bg-brand-cream/50 rounded-[2rem] ">
                  <p className="text-[10px] text-brand-charcoal font-bold uppercase tracking-widest leading-relaxed">
                    Access is granted solely by existing Administrators. Every staff action is logged for system integrity.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-12 overflow-y-auto">
        
        {activeTab === "dashboard" ? (
          <>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-display tracking-tighter text-brand-charcoal">Dashboard</h2>
                <p className="text-brand-charcoal font-medium mt-2">Overview of network and inquiries.</p>
              </div>
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-6 py-3 bg-brand-pink text-brand-charcoal font-bold uppercase tracking-widest text-xs rounded-full hover:bg-brand-blue transition-all shadow-sm"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </header>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-brand-green/20 p-6 rounded-3xl shadow-sm">
                 <p className="text-[10px] font-black uppercase text-brand-charcoal/50 tracking-widest mb-2">Total Inquiries</p>
                 <p className="text-4xl font-display text-brand-charcoal">{inquiries.length}</p>
              </div>
              <div className="bg-brand-blue/20 p-6 rounded-3xl shadow-sm">
                 <p className="text-[10px] font-black uppercase text-brand-charcoal/50 tracking-widest mb-2">New</p>
                 <p className="text-4xl font-display text-brand-pink">{inquiries.filter(i => i.status === 'new').length}</p>
              </div>
              <div className="bg-brand-pink/20 p-6 rounded-3xl shadow-sm">
                 <p className="text-[10px] font-black uppercase text-brand-charcoal/50 tracking-widest mb-2">Contacted</p>
                 <p className="text-4xl font-display text-brand-green">{inquiries.filter(i => i.status === 'contacted').length}</p>
              </div>
              <div className="bg-brand-green/20 p-6 rounded-3xl shadow-sm">
                 <p className="text-[10px] font-black uppercase text-brand-charcoal/50 tracking-widest mb-2">Staff Members</p>
                 <p className="text-4xl font-display text-brand-green">{staff.length || 1}</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
               <div className="bg-brand-blue/20 p-8 rounded-[2.5rem] shadow-sm">
                 <h3 className="font-bold text-lg mb-6 text-brand-charcoal">Inquiries By Type</h3>
                 {inquiries.length > 0 ? (
                   <div className="h-64">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dashboardStats}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {dashboardStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                             contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Legend />
                        </PieChart>
                     </ResponsiveContainer>
                   </div>
                 ) : (
                   <div className="h-64 flex items-center justify-center text-sm font-medium text-brand-charcoal/50">No data available</div>
                 )}
               </div>
               <div className="bg-brand-pink p-8 rounded-[2.5rem] shadow-sm text-brand-charcoal flex flex-col justify-center">
                 <div className="w-16 h-16 bg-brand-pink/20 rounded-[2rem] flex items-center justify-center mb-6">
                    <Zap className="w-8 h-8 text-brand-pink" />
                 </div>
                 <h3 className="text-3xl font-display tracking-tight mb-4">Quick Actions</h3>
                 <p className="font-medium text-sm mb-8 opacity-80">Navigate directly to the management sections or handle pending items.</p>
                 <div className="flex flex-col gap-3">
                   <button onClick={() => {setActiveTab('inquiries'); setFilter('new');}} className="px-6 py-4 bg-brand-green/20 rounded-full text-sm font-bold text-left hover:bg-brand-blue transition-all">Review New Inquiries ({inquiries.filter(i => i.status === 'new').length})</button>
                   {userRole === 'admin' && (
                     <button onClick={() => setActiveTab('staff')} className="px-6 py-4 bg-brand-blue/20 rounded-full text-sm font-bold text-left hover:bg-brand-blue transition-all">Manage Staff</button>
                   )}
                 </div>
               </div>
            </div>
          </>
        ) : activeTab === "inquiries" ? (

          <>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-display tracking-tighter text-brand-charcoal">
                  {filter === 'all' ? 'All Inquiries' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Inquiries`}
                </h2>
                <p className="text-brand-charcoal font-medium mt-2">Managing the future of neurodivergent inclusion.</p>
              </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-brand-pink/20 p-2 rounded-[2rem] shadow-sm ">
                <div className="flex">
                  <div className="px-6 py-3 border-r border-brand-charcoal/10">
                      <p className="text-[10px] font-black text-brand-charcoal uppercase tracking-widest mb-1">Total</p>
                      <p className="text-xl font-display text-brand-charcoal">{inquiries.length}</p>
                  </div>
                  <div className="px-6 py-3">
                      <p className="text-[10px] font-black text-brand-charcoal uppercase tracking-widest mb-1">New</p>
                      <p className="text-xl font-display text-brand-pink">
                        {inquiries.filter(i => i.status === 'new').length}
                      </p>
                  </div>
                </div>
                <div className="px-4 border-l border-brand-charcoal/10">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-brand-cream/50 px-4 py-2 rounded-xl text-sm font-bold text-brand-charcoal outline-none border cursor-pointer border-transparent focus:border-brand-pink transition-all"
                  >
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="status-asc">Status (A-Z)</option>
                    <option value="status-desc">Status (Z-A)</option>
                  </select>
                </div>
              </div>
            </header>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredInquiries.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-32 text-center"
                  >
                    <div className="w-20 h-20 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-6">
                      <Filter className="w-10 h-10 text-brand-charcoal" />
                    </div>
                    <p className="text-brand-charcoal font-bold uppercase tracking-widest text-sm">No inquiries found for this filter</p>
                  </motion.div>
                ) : (
                  filteredInquiries.map((inquiry) => (
                    <motion.div
                      layout
                      key={inquiry.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="bg-brand-green/20 p-8 rounded-[2.5rem] shadow-sm  group hover:border-brand-pink/30 hover:shadow-sm transition-all"
                    >
                      <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-grow">
                          <div className="flex items-center gap-4 mb-4">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              inquiry.status === 'new' ? 'bg-brand-blue/20 text-brand-charcoal' :
                              inquiry.status === 'contacted' ? 'bg-blue-50 text-blue-600' :
                              'bg-gray-100 text-gray-500'
                            }`}>
                              {inquiry.status}
                            </span>
                            <div className="flex items-center gap-2 text-brand-charcoal text-[10px] font-black uppercase tracking-widest">
                              <Clock className="w-3 h-3" /> {inquiry.createdAt}
                            </div>
                          </div>
                          
                          <h3 className="text-3xl font-display tracking-tight text-brand-charcoal mb-2">{inquiry.name}</h3>
                          <div className="flex flex-wrap gap-4 mb-8">
                            <div className="flex flex-col gap-1">
   {inquiry.type && (
     <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-green mb-1">
        Type: {inquiry.type}
     </div>
   )}
   <div className="flex items-center gap-2 text-sm font-bold text-brand-charcoal">
     <Building className="w-4 h-4 text-brand-pink" /> {inquiry.org || "Independent Individual"}
   </div>
</div>
                            <div className="flex items-center gap-2 text-sm font-bold text-brand-charcoal">
                              <Mail className="w-4 h-4 text-brand-pink" /> 
                              <a href={`mailto:${inquiry.email}`} className="hover:text-brand-charcoal transition-colors underline decoration-brand-rose/30">
                                {inquiry.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-brand-charcoal">
                              <Phone className="w-4 h-4 text-brand-pink" /> 
                              <a href={`https://wa.me/${inquiry.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-charcoal transition-colors flex items-center gap-1 group/wa">
                                {inquiry.whatsapp} <ExternalLink className="w-3 h-3 opacity-0 group-hover/wa:opacity-100 transition-opacity" />
                              </a>
                            </div>
                          </div>

                          <div className="bg-brand-cream/50 p-8 rounded-3xl ">
                            <h4 className="text-[10px] font-black text-brand-charcoal uppercase tracking-widest mb-4">Inquiry Message</h4>
                            <p className="text-brand-charcoal font-medium leading-relaxed whitespace-pre-wrap">{inquiry.message}</p>
                          </div>
                        </div>

                        <div className="lg:w-64 flex lg:flex-col gap-3 justify-end lg:justify-start">
                          {inquiry.status !== 'contacted' && (
                            <button 
                              onClick={() => handleSendInitialContact(inquiry)}
                              className="flex-grow lg:flex-none py-4 bg-brand-pink text-brand-charcoal rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-brand-blue transition-all shadow-sm cursor-pointer"
                            >
                              Send Initial Msg
                            </button>
                          )}
                          {inquiry.status !== 'contacted' && (
                            <button 
                              onClick={() => handleUpdateStatus(inquiry.id, 'contacted')}
                              className="flex-grow lg:flex-none py-4 bg-brand-pink text-brand-charcoal rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-brand-blue hover:text-brand-charcoal hover:shadow-md transition-all shadow-sm cursor-pointer"
                            >
                              Mark Contacted
                            </button>
                          )}
                          {inquiry.status !== 'archived' && (
                            <button 
                              onClick={() => handleUpdateStatus(inquiry.id, 'archived')}
                              className="flex-grow lg:flex-none py-4 bg-brand-blue/20  text-brand-charcoal rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all cursor-pointer"
                            >
                              Archive
                            </button>
                          )}
                          {userRole === 'admin' && (
                            <button 
                              onClick={() => handleDelete(inquiry.id)}
                              className="p-4 bg-red-50 text-red-500 rounded-[2rem] hover:bg-red-500 hover:text-brand-charcoal transition-all cursor-pointer border border-red-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <>
            <header className="mb-12">
              <h2 className="text-4xl md:text-5xl font-display tracking-tighter text-brand-charcoal">Staff Management</h2>
              <p className="text-brand-charcoal font-medium mt-2">Manage access and roles for the initiative's digital portal.</p>
            </header>

            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-[3px] text-brand-charcoal mb-6">Current Staff</h3>
                <div className="grid gap-4">
                  {staff.map(member => (
                    <div key={member.id} className="bg-brand-pink/20 p-8 rounded-[2.5rem]  flex items-center justify-between group hover:shadow-sm transition-all">
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-[2rem] flex items-center justify-center font-bold text-brand-charcoal ${member.role === 'admin' ? 'bg-brand-pink' : 'bg-brand-pink'}`}>
                          {member.role === 'admin' ? 'A' : 'M'}
                        </div>
                        <div>
                          <p className="font-bold text-brand-charcoal">{member.id}</p>
                          <div className="flex gap-4 mt-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-pink">{member.role}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveStaff(member.id)}
                        className="p-3 bg-red-50 text-red-500 rounded-[1.5rem] hover:bg-red-500 hover:text-brand-charcoal transition-all cursor-pointer border border-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-brand-green/20 p-12 rounded-[3.5rem] shadow-sm  h-fit sticky top-12">
                <h3 className="text-2xl font-display tracking-tight text-brand-charcoal mb-8">Add New Staff</h3>
                <form onSubmit={handleAddStaff} className="space-y-6">
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-brand-charcoal mb-2 block">Email Address</label>
                    <input 
                      name="email"
                      type="email"
                      required
                      placeholder="staff@scaffold.org"
                      className="w-full px-6 py-4 bg-brand-cream  rounded-[2rem] focus:outline-none focus:border-brand-pink/30 font-medium transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-brand-charcoal mb-2 block">Role</label>
                    <select 
                      name="role"
                      className="w-full px-6 py-4 bg-brand-cream  rounded-[2rem] focus:outline-none focus:border-brand-pink/30 font-bold transition-all appearance-none cursor-pointer"
                    >
                      <option value="moderator">Moderator</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-5 bg-brand-pink text-brand-charcoal rounded-full font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-brand-blue hover:text-brand-charcoal hover:shadow-md transition-all shadow-sm active:scale-95"
                  >
                    Authorize User <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

const Navbar = () => (
  <nav className="fixed top-0 left-0 w-full z-50 bg-brand-cream/80 backdrop-blur-md border-b border-brand-charcoal/10">
    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div className="flex items-center gap-2 font-display text-brand-charcoal">
        <button 
          onClick={() => (window as any).navigate('home')}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <ScaffoldLogo className="w-10 h-10 transition-transform group-hover:scale-[1.10]" />
          <span className="font-bold text-xl tracking-tight text-brand-charcoal uppercase letter-spacing-[-0.5px] hidden sm:block font-display">The Scaffold Initiative</span>
        </button>
      </div>
      <div className="hidden md:flex items-center gap-6 text-brand-charcoal">
        <button onClick={() => (window as any).navigate('about')} className="text-sm font-semibold hover:text-brand-blue transition-colors cursor-pointer">About</button>
        <button onClick={() => (window as any).navigate('impact')} className="text-sm font-semibold hover:text-brand-pink transition-colors cursor-pointer">Impact</button>
        <button onClick={() => (window as any).navigate('team')} className="text-sm font-semibold hover:text-brand-green transition-colors cursor-pointer">Core Team</button>
        <a 
          href="https://www.instagram.com/the.scaffold.initiative?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-brand-pink transition-colors"
        >
          <Instagram className="w-5 h-5" />
        </a>

        <button 
          onClick={() => (window as any).navigate('partner')}
          className="px-6 py-2.5 bg-brand-pink text-brand-charcoal rounded-full text-xs font-bold uppercase tracking-wider hover:bg-brand-blue hover:text-brand-charcoal hover:shadow-md transition-all hover:scale-105 cursor-pointer shadow-sm"
        >
          Partner With Us
        </button>
      </div>
    </div>
  </nav>
);

const Hero = ({ onViewPartner }: { onViewPartner: () => void }) => {
  const [countries, setCountries] = useState(0);
  const [volunteers, setVolunteers] = useState(0);
  const [reach, setReach] = useState(0);
  const [partners, setPartners] = useState(0);

  useEffect(() => {
    let step = 0;
    const steps = 30;
    const interval = setInterval(() => {
      step++;
      setCountries(Math.min(5, Math.round((5 / steps) * step)));
      setVolunteers(Math.min(35, Math.round((35 / steps) * step)));
      setReach(Math.min(15000, Math.round((15000 / steps) * step)));
      setPartners(Math.min(15, Math.round((15 / steps) * step)));
      
      if (step >= steps) {
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[90vh] pt-32 pb-20 overflow-hidden flex flex-col justify-center scaffold-grid bg-gradient-to-tr from-brand-green/25 via-brand-pink/15 to-brand-blue/30">
      {/* Decorative Elements */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-brand-pink opacity-25 blur-3xl rounded-full animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-brand-blue opacity-35 blur-3xl rounded-full animate-pulse duration-[6000ms]" />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-brand-green opacity-30 blur-3xl rounded-full" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-1.5 bg-brand-pink text-brand-charcoal text-[10px] font-black tracking-[0.2em] uppercase rounded-full mb-8 shadow-sm">
                EST. FEB 2026
              </span>
              <h1 className="text-5xl md:text-7xl mb-8 leading-[1.1] text-brand-charcoal max-w-3xl tracking-tighter">
                Redefining inclusion 
                <span className="block italic mt-2 opacity-90 font-display">for neurodivergent students</span>
              </h1>
              <p className="text-lg md:text-xl text-brand-charcoal mb-10 leading-relaxed max-w-2xl font-medium">
                Bridging the gap between diagnosis and support in Tier 2 and Tier 3 regions across India, Thailand, Spain, UAE, and Singapore. Providing structure and care where students need it most.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => (window as any).navigate('impact')} className="px-8 py-4 bg-brand-pink text-brand-charcoal rounded-full text-sm font-bold uppercase tracking-wider hover:bg-brand-blue hover:text-brand-charcoal hover:shadow-md transition-all flex items-center gap-3 group shadow-sm shadow-brand-charcoal/10 cursor-pointer">
                  View Impact <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => (window as any).navigate('partner')}
                  className="px-8 py-4 border border-brand-charcoal/10 text-brand-charcoal rounded-full text-sm font-bold uppercase tracking-wider hover:bg-brand-green hover:text-brand-charcoal transition-all cursor-pointer"
                >
                  Partner With Us
                </button>
              </div>
            </motion.div>
          </div>
 
          {/* Brand Illustrated Logo Showcase */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="p-8 md:p-12 bg-white/45 backdrop-blur-md rounded-[4rem] border-2 border-brand-pink/30 hover:border-brand-blue/60 transition-all duration-300 shadow-xl shadow-brand-charcoal/5 flex justify-center items-center cursor-pointer"
            >
              <ScaffoldLogo size={320} className="w-64 h-64 md:w-80 md:h-80 drop-shadow-xl" />
            </motion.div>
          </div>
        </div>
        
        {/* Impact Strip */}
        <motion.div 
          id="impact"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-brand-charcoal/10 py-12"
        >
          {[
            { label: "Countries Active", value: `${countries}`, colorClass: "text-brand-blue" },
            { label: "Vetted Volunteers", value: `${volunteers}+`, colorClass: "text-brand-pink" },
            { label: "Passive Reach", value: `${reach.toLocaleString()}+`, colorClass: "text-brand-green" },
            { label: "School Partnerships", value: `${partners}+`, colorClass: "text-brand-blue" }
          ].map((stat, i) => (
            <div key={i} className="hover:scale-105 transition-transform duration-300">
              <p className={`text-4xl md:text-5xl font-display font-bold mb-2 ${stat.colorClass}`}>{stat.value}</p>
              <p className="text-[11px] font-bold text-brand-charcoal uppercase tracking-[1px]">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const About = () => (
  <section id="about" className="py-32 bg-brand-mint/20 overflow-hidden">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid lg:grid-cols-2 gap-20 items-center">
        <motion.div
           whileInView={{ opacity: 1, x: 0 }}
           initial={{ opacity: 0, x: -50 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
        >
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-brand-blue rounded-full opacity-20 blur-2xl" />
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-brand-green mb-4 block">The Mission</span>
            <h2 className="text-4xl md:text-6xl mb-10 relative z-10 leading-tight tracking-tighter">Empowering students through academic and social inclusion.</h2>
            <p className="text-lg text-brand-charcoal mb-8 leading-relaxed font-medium">
              Launched in February 2026, The Scaffold Initiative is a youth-led organization born from a critical observation: the "diagnostic cliff" between receiving a diagnosis and receiving actual support.
            </p>
            <p className="text-lg text-brand-charcoal mb-12 leading-relaxed font-medium">
              We focus on academic inclusion for neurodivergent students in underserved Tier 2 and Tier 3 regions, ensuring that mental well-being is never an afterthought in the classroom.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-brand-blue/20 rounded-3xl shadow-sm ">
                <Users className="w-10 h-10 text-brand-blue mb-6" />
                <h4 className="font-bold text-xl mb-3">Youth-Led Advocacy</h4>
                <p className="text-brand-charcoal leading-relaxed text-sm">Built and driven by those who understand the modern educational landscape from the inside.</p>
              </div>
              <div className="p-8 bg-brand-green/20 rounded-3xl shadow-sm ">
                <Heart className="w-10 h-10 text-brand-green mb-6" />
                <h4 className="font-bold text-xl mb-3">Holistic Well-being</h4>
                <p className="text-brand-charcoal leading-relaxed text-sm">Centering compassion and mental health as fundamental pillars of academic success.</p>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          whileInView={{ opacity: 1, scale: 1 }}
          initial={{ opacity: 0, scale: 0.95 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="aspect-[4/5] bg-brand-blue/20 rounded-[3rem] flex flex-col justify-center items-center p-16 relative overflow-hidden ">
             <div className="absolute inset-0  rounded-[3rem] rotate-3 -z-10" />
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue opacity-30 blur-3xl -mr-16 -mt-16" />
             <div className="text-center">
                <blockquote className="text-3xl md:text-5xl font-display italic text-brand-charcoal mb-10 leading-tight tracking-tight px-4">
                  "Education shouldn't be a privilege of neuro-conformity. We build the scaffolds so every student can reach the top."
                </blockquote>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-px bg-brand-green/60 mb-2" />
                  <p id="team" className="font-bold text-brand-charcoal tracking-[0.1em] uppercase text-sm scroll-mt-24">The Scaffold Team</p>
                  <p className="text-xs text-brand-charcoal font-bold uppercase tracking-widest">Global Leadership</p>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

// --- INTERACTIVE INCLUSION SANDBOX & EMULATION SUITE ---

const startLowFreqSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    const ctx = new AudioContextClass();
    
    // Low alpha/theta state hum oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.value = 85; 
    
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 100;
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.8); 
    
    osc.start();
    return { ctx, osc, gain };
  } catch (e) {
    console.warn("Web Audio not supported or blocked", e);
    return null;
  }
};

const stopLowFreqSound = (sound: { ctx: AudioContext; osc: OscillatorNode; gain: GainNode } | null) => {
  if (sound) {
    try {
      const { ctx, osc, gain } = sound;
      gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      setTimeout(() => {
        try {
          osc.stop();
          ctx.close();
        } catch (err) {}
      }, 500);
    } catch (e) {
      console.warn("Failed to stop soundscape gracefully", e);
    }
  }
};

const InclusionSandbox = () => {
  const [activeTab, setActiveTab] = useState<"adhd" | "autism" | "dyslexia" | "sensory">("adhd");
  
  // ADHD State
  const [adhdDistraction, setAdhdDistraction] = useState(60); 
  const [adhdScaffold, setAdhdScaffold] = useState(false);
  const [audioFocusPlaying, setAudioFocusPlaying] = useState(false);
  const [synthSound, setSynthSound] = useState<any>(null);
  const [jitterTick, setJitterTick] = useState(0);

  // Autism State
  const [autismSenses, setAutismSenses] = useState(70); 
  const [autismScaffold, setAutismScaffold] = useState(false);
  const [countdownTime, setCountdownTime] = useState(120); 
  const [timerRunning, setTimerRunning] = useState(false);
  const [pulseTick, setPulseTick] = useState(0);

  // Dyslexia State
  const [dyslexiaScaffold, setDyslexiaScaffold] = useState(false);
  const [dyslexiaTheme, setDyslexiaTheme] = useState<"mint" | "peach" | "blue">("mint");
  const [isDictating, setIsDictating] = useState(false);

  // Sensory State
  const [sensoryGlare, setSensoryGlare] = useState(80); 
  const [sensoryScaffold, setSensoryScaffold] = useState(false);
  const [restCycleActive, setRestCycleActive] = useState(false);
  const [eyeProgress, setEyeProgress] = useState(100);

  // ADHD text jitter simulator
  useEffect(() => {
    let interval: any;
    if (!adhdScaffold && adhdDistraction > 10) {
      interval = setInterval(() => {
        setJitterTick(prev => prev + 1);
      }, 60);
    }
    return () => clearInterval(interval);
  }, [adhdScaffold, adhdDistraction]);

  // Web Audio trigger for focus sounds
  useEffect(() => {
    if (audioFocusPlaying && adhdScaffold && activeTab === "adhd") {
      const sound = startLowFreqSound();
      setSynthSound(sound);
    } else {
      if (synthSound) {
        stopLowFreqSound(synthSound);
        setSynthSound(null);
      }
    }
    return () => {
      if (synthSound) {
        stopLowFreqSound(synthSound);
      }
    };
  }, [audioFocusPlaying, adhdScaffold, activeTab]);

  // Autism heartbeat simulation pulse and timer
  useEffect(() => {
    let pulseInterval: any;
    if (!autismScaffold && autismSenses > 20) {
      pulseInterval = setInterval(() => {
        setPulseTick(prev => (prev + 1) % 4);
      }, 250);
    }
    return () => clearInterval(pulseInterval);
  }, [autismScaffold, autismSenses]);

  useEffect(() => {
    let timerInterval: any;
    if (timerRunning && countdownTime > 0) {
      timerInterval = setInterval(() => {
        setCountdownTime(prev => prev - 1);
      }, 1000);
    } else if (countdownTime === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(timerInterval);
  }, [timerRunning, countdownTime]);

  // Sensory Progress breakdown for ocular tracking exercises
  useEffect(() => {
    let progressInterval: any;
    if (restCycleActive) {
      progressInterval = setInterval(() => {
        setEyeProgress(prev => {
          if (prev <= 0) {
            setRestCycleActive(false);
            return 100;
          }
          return prev - 2.5; 
        });
      }, 100);
    }
    return () => clearInterval(progressInterval);
  }, [restCycleActive]);

  // speech dictation helper
  const handleDictate = (text: string) => {
    if ("speechSynthesis" in window) {
      if (isDictating) {
        window.speechSynthesis.cancel();
        setIsDictating(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.onend = () => setIsDictating(false);
        utterance.onerror = () => setIsDictating(false);
        setIsDictating(true);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      alert("Text-to-speech functionality is not supported in the active browser.");
    }
  };

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getJitterStyle = () => {
    if (adhdScaffold || adhdDistraction <= 15) return {};
    const intensity = (adhdDistraction - 15) / 12;
    const x = (Math.sin(jitterTick * 1.8) * intensity).toFixed(1);
    const y = (Math.cos(jitterTick * 2.2) * intensity).toFixed(1);
    const scale = (1 + (Math.sin(jitterTick * 0.9) * (intensity / 100))).toFixed(3);
    return { transform: `translate(${x}px, ${y}px) scale(${scale})` };
  };

  const getSensoryBackground = () => {
    if (sensoryScaffold) return "bg-brand-cream/40";
    const intensity = sensoryGlare / 100;
    return `linear-gradient(${135 + (intensity * 40)}deg, rgba(255,255,255,${0.3 + intensity * 0.6}) 0%, rgba(220,230,220,0.15) 100%)`;
  };

  return (
    <section id="sandbox" className="py-32 bg-brand-cream relative overflow-hidden scroll-mt-20 border-t border-brand-charcoal/5">
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-green/10 rounded-full blur-3xl -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-pink/15 rounded-full blur-3xl -ml-20 -mb-20" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="text-[11px] font-black tracking-[0.25em] uppercase text-brand-pink mb-4 block">Inclusive Sandbox</span>
          <h2 className="text-5xl md:text-6xl mb-6 tracking-tighter font-display text-brand-charcoal">Experience the Classroom Scaffold</h2>
          <p className="max-w-3xl mx-auto text-brand-charcoal text-lg font-medium leading-relaxed">
            Move sliders to emulate typical neurodivergent sensory/focus environments. Then, engage the "Scaffold" switch to experience how simple pedagogical structures restore comfort and concentration!
          </p>
        </div>

        {/* Tab Selection Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { id: "adhd", label: "ADHD Sprinting", color: "border-brand-pink hover:bg-brand-pink/10 text-brand-pink", desc: "Executive function burst cycles" },
            { id: "autism", label: "Autism Safety", color: "border-brand-blue hover:bg-brand-blue/10 text-brand-blue", desc: "Predictable routines & transitions" },
            { id: "dyslexia", label: "Dyslexia Reader", color: "border-brand-green hover:bg-brand-green/10 text-brand-green", desc: "Multi-sensory text formatting" },
            { id: "sensory", label: "Sensory Dampener", color: "border-brand-teal hover:bg-brand-teal/10 text-brand-teal", desc: "Environmental glare & rest buffers" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                // Cancel speaking and sounds when switching tabs
                if ("speechSynthesis" in window) window.speechSynthesis.cancel();
                setIsDictating(false);
                setAudioFocusPlaying(false);
                setActiveTab(tab.id as any);
              }}
              className={`p-6 border-2 text-left rounded-[2rem] transition-all duration-300 group cursor-pointer ${
                activeTab === tab.id 
                  ? "bg-brand-charcoal border-brand-charcoal text-brand-white shadow-lg shadow-brand-charcoal/10 scale-[1.02]" 
                  : "bg-white border-brand-charcoal/10 hover:-translate-y-1 hover:border-brand-charcoal/30"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`w-3 h-3 rounded-full ${activeTab === tab.id ? "bg-brand-pink" : "bg-brand-charcoal/25"}`} />
                <ArrowRight className={`w-4 h-4 transition-transform ${activeTab === tab.id ? "text-brand-pink translate-x-0.5" : "text-brand-charcoal/30 group-hover:translate-x-1"}`} />
              </div>
              <h4 className={`font-bold tracking-tight text-md mb-1 ${activeTab === tab.id ? "text-white" : "text-brand-charcoal"}`}>{tab.label}</h4>
              <p className={`text-[11px] font-medium leading-relaxed uppercase tracking-wider ${activeTab === tab.id ? "text-brand-cream/70" : "text-brand-charcoal/55"}`}>{tab.desc}</p>
            </button>
          ))}
        </div>

        {/* Simulation Window Bento Grid */}
        <div className="bg-white border-2 border-brand-charcoal/10 rounded-[3rem] p-8 md:p-14 shadow-xl shadow-brand-charcoal/5 relative overflow-hidden">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* COLUMN 1: INTERACTIVE VIEWPORT (7/12 cols) */}
            <div className="lg:col-span-7 flex flex-col h-full justify-between min-h-[420px]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-pink opacity-75"></span>
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${adhdScaffold || autismScaffold || dyslexiaScaffold || sensoryScaffold ? "bg-brand-green" : "bg-rose-500"}`}></span>
                  </span>
                  <span className="text-[11px] font-black tracking-[0.15em] uppercase text-brand-charcoal/50">
                    Simulation Viewport
                  </span>
                </div>
                <div className="px-3 py-1 bg-brand-cream text-brand-charcoal border border-brand-charcoal/15 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {adhdScaffold || autismScaffold || dyslexiaScaffold || sensoryScaffold ? "🔴 Scaffold Engaged" : "⚠️ Emulated Un-Scaffolded State"}
                </div>
              </div>

              {/* SIMULATED VIEWPORT FRAME */}
              <AnimatePresence mode="wait">
                {activeTab === "adhd" && (
                  <motion.div
                    key="adhd-screen"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-grow flex flex-col justify-center bg-brand-cream/35 border-2 border-dashed border-brand-charcoal/10 rounded-2xl p-8 relative overflow-hidden"
                  >
                    {/* Floating ADHD stress particles representing attention splinters */}
                    {!adhdScaffold && adhdDistraction > 20 && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
                        {Array.from({ length: Math.min(15, Math.ceil(adhdDistraction / 6)) }).map((_, i) => (
                          <div 
                            key={i} 
                            style={{ 
                              top: `${(Math.sin(i * 143) * 50 + 50).toFixed(0)}%`, 
                              left: `${(Math.cos(i * 261) * 50 + 50).toFixed(0)}%`,
                              transform: `scale(${0.5 + Math.sin(jitterTick * 0.1 + i) * 0.5})`
                            }}
                            className="absolute px-2.5 py-1 text-[9px] font-bold uppercase rounded-full border bg-brand-pink/15 border-brand-pink text-brand-pink/90 pointer-events-none"
                          >
                            {["noise", "sighs", "daydreams", "movement", "flutter", "fidget", "fancies"][i % 7]}
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={getJitterStyle()} className="transition-all duration-100 ease-out z-10 w-full">
                      <h3 className="text-3xl font-display mb-4 text-brand-charcoal">Daily Mathematics Operations</h3>
                      
                      {adhdScaffold ? (
                        <div className="space-y-4">
                          <p className="text-brand-charcoal text-sm font-semibold mb-2 bg-brand-green/10 border border-brand-green/30 p-3 rounded-xl flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-brand-green" /> 
                            <strong>Executive Sprint Engaged:</strong> 15-Minute focus window. Micro-chunking enabled:
                          </p>
                          <div className="grid gap-3">
                            <label className="flex items-center gap-3 bg-white p-3 border-2 border-brand-charcoal rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-transform cursor-pointer">
                              <input type="checkbox" defaultChecked className="rounded text-brand-green focus:ring-brand-pink w-5 h-5 bg-brand-cream border-2" />
                              <span className="text-xs font-black tracking-wider text-brand-charcoal uppercase">1. Sketch visual circles representing 14 elements (3 mins)</span>
                            </label>
                            <label className="flex items-center gap-3 bg-white p-3 border-2 border-brand-charcoal rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-transform cursor-pointer">
                              <input type="checkbox" className="rounded text-brand-green focus:ring-brand-pink w-5 h-5 bg-brand-cream border-2" />
                              <span className="text-xs font-black tracking-wider text-brand-charcoal uppercase">2. Group elements into pairs of matching counts (7 mins)</span>
                            </label>
                            <label className="flex items-center gap-3 bg-white p-3 border-2 border-brand-charcoal rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-transform cursor-pointer">
                              <input type="checkbox" className="rounded text-brand-green focus:ring-brand-pink w-5 h-5 bg-brand-cream border-2" />
                              <span className="text-xs font-black tracking-wider text-brand-charcoal uppercase">3. Solve multiplication remainder ratio (5 mins)</span>
                            </label>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-brand-charcoal/70 leading-relaxed font-medium">
                          Today we are going to study the fractions module. Please read Chapter 4 page 112 through page 150 thoroughly and answer the forty complex multi-tier exercises written under the margin columns. Ensure all questions are complete before Tuesday morning classes. Avoid making minor scaling errors on homework papers!
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "autism" && (
                  <motion.div
                    key="autism-screen"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex-grow flex flex-col justify-center border-2 rounded-2xl p-8 relative overflow-hidden transition-all duration-300 ${
                      autismScaffold 
                        ? "bg-brand-cream border-brand-green/30" 
                        : "bg-orange-50 border-orange-500/30"
                    }`}
                  >
                    {/* Visual pulse indicator of background noise overlay */}
                    {!autismScaffold && autismSenses > 30 && (
                      <div 
                        style={{ 
                          borderColor: pulseTick === 0 ? "#F8AFCB" : pulseTick === 2 ? "#68BAC6" : "transparent",
                          borderWidth: "12px",
                        }}
                        className="absolute inset-0 transition-all duration-300 rounded-[1.2rem] pointer-events-none opacity-45"
                      />
                    )}

                    <div className="z-10 w-full relative">
                      <h3 className="text-3xl font-display mb-4 text-brand-charcoal">Classroom Space Transition</h3>
                      
                      {autismScaffold ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-brand-green/10 border border-brand-green/30 rounded-xl mb-4">
                            <span className="text-xs font-black tracking-wider block text-brand-pink uppercase mb-2">Classroom Rule Tracker</span>
                            <p className="text-sm font-bold text-brand-charcoal leading-relaxed leading-[1.6]">
                              1. Pack your materials inside the <span className="bg-white border px-1.5 py-0.5 rounded font-mono text-xs">SAGE CONTAINER #3</span>.
                            </p>
                            <p className="text-sm font-bold text-brand-charcoal leading-relaxed leading-[1.6] mt-2">
                              2. Stand near your designated <span className="bg-white border px-1.5 py-0.5 rounded font-mono text-xs font-bold text-brand-pink">CIRCULAR MAT #B</span>.
                            </p>
                          </div>
                          
                          {/* Visual Sand Timer Countdown */}
                          <div className="bg-white border-2 border-brand-charcoal p-4 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Clock className="w-5 h-5 text-brand-blue animate-spin duration-[4000ms]" />
                              <div>
                                <p className="text-xs font-black uppercase text-brand-charcoal tracking-wide">Transition Sand Timer</p>
                                <p className="text-md font-mono font-bold text-brand-charcoal">
                                  {Math.floor(countdownTime / 60)}:{(countdownTime % 60).toString().padStart(2, "0")} remaining
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setTimerRunning(!timerRunning)} 
                                className="px-3 py-1.5 bg-brand-pink border border-brand-charcoal/10 text-[10px] font-bold uppercase tracking-wider rounded-lg cursor-pointer"
                              >
                                {timerRunning ? "Pause" : "Start"}
                              </button>
                              <button 
                                onClick={() => { setCountdownTime(120); setTimerRunning(false); }} 
                                className="p-1.5 border border-brand-charcoal/20 hover:bg-brand-cream rounded-lg cursor-pointer"
                              >
                                <RotateCcw className="w-4 h-4 text-brand-charcoal" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm text-brand-charcoal/70 font-medium italic">
                            "Alright class, quick change of plans! Fold everything up immediately, hurry up, and rush out to the outdoor courtyard now! Go, let"s move fast!"
                          </p>
                          {/* Simulated stress meter indicators */}
                          <div className="pt-4">
                            <p className="text-[10px] font-black tracking-wider text-rose-500 uppercase mb-2">Transition Uncertainty spike</p>
                            <div className="h-2 bg-rose-200 border border-rose-500/20 rounded-full overflow-hidden">
                              <div style={{ width: `${Math.max(30, autismSenses)}%` }} className="h-full bg-rose-500 transition-all duration-300" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "dyslexia" && (
                  <motion.div
                    key="dyslexia-screen"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex-grow flex flex-col justify-center border-2 rounded-2xl p-8 relative overflow-hidden transition-all duration-300 ${
                      dyslexiaScaffold 
                        ? dyslexiaTheme === "mint" 
                          ? "bg-brand-cream border-brand-green/30" 
                          : dyslexiaTheme === "peach" 
                            ? "bg-amber-50 border-amber-300/30" 
                            : "bg-sky-50 border-sky-300/30"
                        : "bg-white border-brand-charcoal/10"
                    }`}
                  >
                    <div className="z-10 w-full">
                      <h3 className="text-3xl font-display mb-4 text-brand-charcoal">Visual Crowding Alleviation</h3>
                      
                      {/* Dyslexia scaffold styling */}
                      <p 
                        className={`text-brand-charcoal transition-all duration-500 font-medium ${
                          dyslexiaScaffold 
                            ? "leading-[2.1] tracking-[0.10em] text-md" 
                            : "leading-[1.1] tracking-tighter text-sm space-y-0.5 line-clamp-6 opacity-75 select-none font-sans"
                        }`}
                      >
                        {dyslexiaScaffold ? (
                          <>
                            <span className="block mb-4 p-2.5 bg-brand-pink/15 border-l-4 border-brand-pink font-semibold">
                              Tinted high-legibility layout:
                            </span>
                            The standard printed page frequently contains highly crowded characters that cause visual overlapping. By increasing row margins, applying cozy tint filters (such as mint-green or soft peach), and utilizing double spacing, we enable readers to isolate row segments comfortably without ocular crowding.
                          </>
                        ) : (
                          "Thestandardprintedpagefrequentlycontainshighlycrowdedcharactersthatcausevisualoverlapping.Byincreasingrowmargins,applyingcozytintfilters(suchasmint-greenorsoftpeach),andutilizingdoublespacing,weenablereaderstoisolaterowsegmentscomfortablywithoutocularcrowding."
                        )}
                      </p>

                      {dyslexiaScaffold && (
                        <div className="mt-6 flex flex-wrap gap-3">
                          <button 
                            onClick={() => handleDictate("The standard printed page frequently contains highly crowded characters that cause visual overlapping. By increasing row margins, applying cozy tint filters, and utilizing double spacing, we enable readers to isolate row segments comfortably.")}
                            className={`px-4 py-2 border-2 border-brand-charcoal rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
                              isDictating ? "bg-brand-pink text-brand-charcoal" : "bg-white text-brand-charcoal hover:bg-brand-cream"
                            }`}
                          >
                            <BookOpen className="w-4 h-4" />
                            {isDictating ? "Stop Audio Screen-Read" : "Read-Aloud Scaffold (TTS)"}
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "sensory" && (
                  <motion.div
                    key="sensory-screen"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ background: getSensoryBackground() }}
                    className="flex-grow flex flex-col justify-center border-2 border-brand-charcoal/10 rounded-2xl p-8 relative overflow-hidden transition-all duration-300"
                  >
                    {/* Harsh Specular Glare simulator */}
                    {!sensoryScaffold && (
                      <div 
                        style={{ opacity: sensoryGlare / 110 }}
                        className="absolute inset-0 bg-gradient-to-tr from-white/95 via-transparent to-transparent pointer-events-none mix-blend-overlay z-10"
                      />
                    )}

                    <div className="z-10 w-full relative">
                      <h3 className="text-3xl font-display mb-4 text-brand-charcoal">Visual Fatigue Dampening</h3>
                      
                      {sensoryScaffold ? (
                        <div className="space-y-4">
                          <p className="text-brand-charcoal text-sm leading-relaxed font-semibold">
                            Harsh lighting and whiteboard glare trigger intense neurological fatigue. By converting classroom lighting to indirect angles and implementing structured 50-second ocular breaks, energy remains stable.
                          </p>

                          <div className="bg-white border-2 border-brand-charcoal rounded-xl p-4 flex items-center justify-between">
                            <div>
                              <p className="text-xs font-black uppercase text-brand-charcoal tracking-wide">Ocular Rest Synchronizer</p>
                              <p className="text-xs text-brand-charcoal/60 mt-1">Soft breathing cycle to relax tracking muscles.</p>
                            </div>
                            <button
                              onClick={() => setRestCycleActive(true)}
                              className="px-4 py-2 bg-brand-teal text-brand-charcoal border border-brand-charcoal/10 text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer hover:bg-brand-blue"
                            >
                              {restCycleActive ? "Breathing..." : "Trigger Rest Cycle"}
                            </button>
                          </div>

                          {restCycleActive && (
                            <div className="bg-brand-cream/40 p-4 border rounded-xl flex items-center gap-4 animate-pulse">
                              <div 
                                style={{ transform: `scale(${0.8 + Math.sin(eyeProgress * 0.1) * 0.4})` }}
                                className="w-8 h-8 rounded-full bg-brand-teal border-2 border-brand-charcoal transition-transform" 
                              />
                              <div className="flex-grow">
                                <div className="h-2 bg-brand-charcoal/10 rounded-full overflow-hidden">
                                  <div style={{ width: `${eyeProgress}%` }} className="h-full bg-brand-teal" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm text-brand-charcoal/50 leading-relaxed font-bold italic uppercase tracking-wider">
                            🔴 HIGH SPECULAR INTERFERENCE IN PROGRESS
                          </p>
                          <p className="text-sm text-brand-charcoal/75 leading-relaxed font-medium">
                            Whiteboard reflects direct fluorescents. Eye tracking strains to isolate symbols, burning valuable cognitive focus within minutes and leading to severe sensory depletion.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* VIEWPORT FOOTER DESCRIPTION */}
              <div className="mt-4 text-xs font-mono text-brand-charcoal/55 text-center p-2 bg-brand-cream/25 border border-brand-charcoal/5 rounded-lg">
                {activeTab === "adhd" && (adhdScaffold ? "Focus Scaffold: Material segmented into modular high-contrast sprints." : "Challenge: Dense instructions lead to immediate detail dismissal.")}
                {activeTab === "autism" && (autismScaffold ? "Routines Scaffold: Pictorial countdown blocks establish complete transition predictability." : "Challenge: Ambiguous, rapid announcements spark high situational defense.")}
                {activeTab === "dyslexia" && (dyslexiaScaffold ? "Formatting Scaffold: Tint overlays and read-aloud modules alleviate letter-stress." : "Challenge: Tight visual character crowding generates line track confusion.")}
                {activeTab === "sensory" && (sensoryScaffold ? "Atmosphere Scaffold: Satin muffle modes and micro eye-resets limit physical depletion." : "Challenge: Harsh specular flare triggers headaches and reading-loop dropouts.")}
              </div>
            </div>

            {/* COLUMN 2: CONTROL DESK (5/12 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between py-2 border-t lg:border-t-0 lg:border-l border-brand-charcoal/10 lg:pl-12 h-full min-h-[420px]">
              <div>
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-brand-pink mb-2 block">Pedagogy Control Desk</span>
                <h3 className="text-3xl font-display text-brand-charcoal mb-4">Toggle the Scaffold</h3>
                <p className="text-sm text-brand-charcoal/70 leading-relaxed font-semibold mb-8">
                  Adjust environmental obstacles on the sliders to raise the barrier, then trigger the Scaffold to see the classroom adapt!
                </p>

                {/* ACTIVE CONTROLS SUB-PANEL */}
                <div className="space-y-8">
                  {/* SLIDERS MODULE */}
                  {activeTab === "adhd" && (
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-black uppercase text-brand-charcoal tracking-wide">Environmental Distractions</span>
                          <span className="text-xs font-black text-brand-pink font-mono">{adhdDistraction}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={adhdDistraction}
                          onChange={(e) => setAdhdDistraction(Number(e.target.value))}
                          disabled={adhdScaffold}
                          className="w-full h-2.5 bg-brand-cream rounded-lg appearance-none cursor-pointer accent-brand-pink border border-brand-charcoal/10"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-brand-cream/40 rounded-2xl border border-brand-charcoal/10">
                        <div>
                          <span className="text-xs font-black uppercase text-brand-charcoal tracking-wide block">Auditory Calmer Loop</span>
                          <span className="text-[11px] text-brand-charcoal/60">Generate comforting low alpha frequency</span>
                        </div>
                        <button
                          onClick={() => setAudioFocusPlaying(!audioFocusPlaying)}
                          disabled={!adhdScaffold}
                          className={`w-12 h-12 flex items-center justify-center rounded-xl border border-brand-charcoal/10 cursor-pointer transition-all ${
                            audioFocusPlaying 
                              ? "bg-brand-pink text-brand-charcoal ring-2 ring-brand-pink/50 scale-105" 
                              : "bg-white hover:bg-brand-cream text-brand-charcoal disabled:opacity-40 disabled:cursor-not-allowed"
                          }`}
                        >
                          {audioFocusPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === "autism" && (
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-black uppercase text-brand-charcoal tracking-wide font-sans">Noise & Unexpected Changes</span>
                          <span className="text-xs font-black text-brand-blue font-mono">{autismSenses}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={autismSenses}
                          onChange={(e) => setAutismSenses(Number(e.target.value))}
                          disabled={autismScaffold}
                          className="w-full h-2.5 bg-brand-cream rounded-lg appearance-none cursor-pointer accent-brand-blue border border-brand-charcoal/10"
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === "dyslexia" && (
                    <div className="space-y-6">
                      <div>
                        <span className="text-xs font-black uppercase text-brand-charcoal tracking-wide block mb-3">Workspace Tint Overlays</span>
                        <div className="flex gap-2">
                          {[
                            { name: "mint", bg: "bg-brand-cream border-brand-green/35", label: "Mint Forest" },
                            { name: "peach", bg: "bg-amber-50 border-amber-300", label: "Peach Warmth" },
                            { name: "blue", bg: "bg-sky-50 border-sky-300", label: "Ocean Mist" }
                          ].map(t => (
                            <button
                              key={t.name}
                              disabled={!dyslexiaScaffold}
                              onClick={() => setDyslexiaTheme(t.name as any)}
                              className={`flex-grow py-3 px-1 border-2 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all ${t.bg} ${
                                dyslexiaTheme === t.name && dyslexiaScaffold
                                  ? "ring-2 ring-brand-charcoal border-brand-charcoal scale-105" 
                                  : "opacity-60 disabled:opacity-40 cursor-pointer"
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "sensory" && (
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-black uppercase text-brand-charcoal tracking-wide">Specular Ceiling Glare</span>
                          <span className="text-xs font-black text-brand-teal font-mono">{sensoryGlare}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={sensoryGlare}
                          onChange={(e) => setSensoryGlare(Number(e.target.value))}
                          disabled={sensoryScaffold}
                          className="w-full h-2.5 bg-brand-cream rounded-lg appearance-none cursor-pointer accent-brand-teal border border-brand-charcoal/10"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* PRIMARY SCAFFOLD ENGAGER ACTION SWITCH */}
              <div className="pt-10 border-t border-brand-charcoal/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-brand-charcoal text-sm uppercase tracking-wide">
                      {activeTab === "adhd" && "Apply Sprint Support"}
                      {activeTab === "autism" && "Apply Predictable Schedule"}
                      {activeTab === "dyslexia" && "Apply Double Margin Spacing"}
                      {activeTab === "sensory" && "Muffle Specular Glare"}
                    </h5>
                    <p className="text-xs text-brand-charcoal/60">Enable real-time inclusive adaptations</p>
                  </div>
                  
                  {/* Retro Sleek Switch */}
                  <button
                    onClick={() => {
                      if (activeTab === "adhd") {
                        setAdhdScaffold(!adhdScaffold);
                        setAudioFocusPlaying(false);
                      }
                      if (activeTab === "autism") {
                        setAutismScaffold(!autismScaffold);
                        setTimerRunning(!autismScaffold); // auto run transition countdown on apply!
                      }
                      if (activeTab === "dyslexia") {
                        setDyslexiaScaffold(!dyslexiaScaffold);
                        if (isDictating && "speechSynthesis" in window) {
                          window.speechSynthesis.cancel();
                          setIsDictating(false);
                        }
                      }
                      if (activeTab === "sensory") {
                        setSensoryScaffold(!sensoryScaffold);
                        setRestCycleActive(false);
                      }
                    }}
                    className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none cursor-pointer ${
                      (activeTab === "adhd" && adhdScaffold) ||
                      (activeTab === "autism" && autismScaffold) ||
                      (activeTab === "dyslexia" && dyslexiaScaffold) ||
                      (activeTab === "sensory" && sensoryScaffold)
                        ? "bg-brand-pink" 
                        : "bg-brand-charcoal/20"
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 shadow ${
                        ((activeTab === "adhd" && adhdScaffold) ||
                        (activeTab === "autism" && autismScaffold) ||
                        (activeTab === "dyslexia" && dyslexiaScaffold) ||
                        (activeTab === "sensory" && sensoryScaffold))
                          ? "translate-x-9" 
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

// --- END OF CORE COMPONENTS ---


const WhyMatters = ({ onViewPartner }: { onViewPartner: () => void }) => (
  <section className="py-32 bg-gradient-to-br from-brand-blue/20 via-brand-cream to-brand-pink/20 text-brand-charcoal relative overflow-hidden border-t border-brand-pink/30">
    <div className="absolute inset-0 scaffold-grid opacity-5 pointer-events-none" />
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="grid lg:grid-cols-2 gap-24 items-center">
        <div>
          <span className="text-[11px] font-bold tracking-[3px] uppercase text-brand-pink mb-6 block">Systemic Advocacy</span>
          <h2 className="text-5xl md:text-7xl mb-10 leading-[1.1] font-display tracking-tighter">Confronting the Diagnostic Cliff</h2>
          <p className="text-xl text-brand-charcoal mb-12 leading-relaxed font-medium">
            In many underserved communities, "neurodivergence" is invisible. Stigma often replaces support.
          </p>
          <div className="space-y-10">
            <div className="flex gap-6">
               <div className="w-14 h-14 rounded-[2rem] bg-brand-cream/10 flex-shrink-0 flex items-center justify-center  group hover:bg-brand-pink transition-all">
                 <Zap className="w-7 h-7 text-brand-pink group-hover:text-brand-charcoal transition-colors" />
               </div>
               <div>
                 <h4 className="text-2xl mb-4 font-display tracking-tight">Invisible Barriers</h4>
                 <p className="text-sm text-brand-charcoal leading-relaxed font-medium">The lack of awareness often leads to neurodivergent students being labeled as "difficult" rather than supported, creating lifelong academic scars.</p>
               </div>
            </div>
            <div className="flex gap-6">
               <div className="w-14 h-14 rounded-[2rem] bg-brand-cream/10 flex-shrink-0 flex items-center justify-center  group hover:bg-brand-green transition-all">
                 <Sparkles className="w-7 h-7 text-brand-green group-hover:text-brand-charcoal transition-colors" />
               </div>
               <div>
                 <h4 className="text-2xl mb-4 font-display tracking-tight">Structural Scaffolding</h4>
                 <p className="text-sm text-brand-charcoal leading-relaxed font-medium">We focus on Tier 2 & 3 regions where stigma is highest, providing the tools that bridge the gap between classroom and care.</p>
               </div>
            </div>
          </div>
        </div>
        <div className="bg-brand-cream/10 p-16 rounded-[3rem]   relative">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-pink opacity-10 blur-3xl" />
          <h3 className="text-5xl font-display mb-10 text-brand-charcoal leading-tight tracking-tighter">The Scaffold is the bridge.</h3>
          <p className="text-lg opacity-60 leading-relaxed mb-12 font-medium italic">
            Advocacy without infrastructure is just talk. By building partnerships with schools and psychiatrists, we create a sustainable ecosystem of care for every neurodivergent mind.
          </p>
          <button 
            onClick={onViewPartner}
            className="w-full py-6 bg-brand-cream text-brand-charcoal rounded-full font-bold uppercase tracking-widest text-sm hover:bg-brand-pink hover:text-brand-charcoal transition-all transform hover:scale-[1.02] cursor-pointer shadow-sm"
          >
            Support Our Mission
          </button>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-24 bg-brand-charcoal text-brand-cream border-t ">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 mb-20">
        <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-brand-cream rounded-[1.5rem] flex items-center justify-center font-display font-black text-xl text-brand-cream">S</div>
              <span className="font-display font-black text-2xl tracking-tight text-brand-cream uppercase">The Scaffold Initiative</span>
            </div>
            <p className="text-brand-cream max-w-sm mb-10 text-lg leading-relaxed font-medium">
              A youth-led non-profit redefining academic and social inclusion for neurodivergent minds globally.
            </p>
            <div className="flex gap-6">
              <a href="https://www.instagram.com/the.scaffold.initiative?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="text-xs font-black tracking-widest uppercase text-brand-cream hover:text-brand-cream transition-colors">
                  Instagram
                </a>
            </div>
        </div>
        <div>
          <h4 className="font-black mb-8 uppercase text-[10px] tracking-[0.3em] text-brand-cream">Engagement</h4>
          <ul className="space-y-5 text-sm font-bold text-brand-cream tracking-tight">
             <li><button onClick={() => (window as any).navigate('partner')} className="hover:text-brand-cream transition-colors">Partner with us</button></li>
             <li><button onClick={() => (window as any).navigate('partner')} className="hover:text-brand-cream transition-colors">Volunteer network</button></li>
             <li><button onClick={() => (window as any).navigate('about')} className="hover:text-brand-cream transition-colors">School outreach</button></li>
             <li><button onClick={() => (window as any).navigate('partner')} className="hover:text-brand-cream transition-colors">Emergency support</button></li>
          </ul>
        </div>
      </div>
      <div className="border-t  pt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-brand-cream">
        <p>© 2026 THE SCAFFOLD INITIATIVE.</p>
        <div>
          <button 
            onClick={() => (window as any).navigate('admin')} 
            className="hover:text-brand-cream transition-colors cursor-pointer uppercase tracking-[0.2em] font-black"
          >
            Staff Login
          </button>
        </div>
      </div>
    </div>
  </footer>
);

const FinalCTA = ({ onViewPartner }: { onViewPartner: () => void }) => (
  <section className="py-40 bg-gradient-to-br from-brand-blue/15 via-brand-cream/50 to-brand-pink/15 relative overflow-hidden text-center border-t border-brand-pink/20">
     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-brand-pink opacity-[0.03] blur-3xl rounded-full" />
     <div className="max-w-5xl mx-auto px-6 relative z-10">
        <span className="text-[11px] font-bold tracking-[4px] uppercase text-brand-pink mb-8 block">Call to Action</span>
        <h2 className="text-6xl md:text-9xl mb-16 font-display leading-none tracking-tighter leading-[0.85] text-brand-charcoal">Will you help us build the next scaffold?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { text: "Partner With Us", style: "bg-brand-blue/15 hover:bg-brand-blue/25 border-brand-blue/30 shadow-brand-blue/5" },
            { text: "Support a Camp", style: "bg-brand-pink/20 hover:bg-brand-pink/30 border-brand-pink/35 shadow-brand-pink/5" },
            { text: "Bring Us to School", style: "bg-brand-green/15 hover:bg-brand-green/25 border-brand-green/30 shadow-brand-green/5" },
            { text: "Join Volunteers", style: "bg-brand-pink/25 hover:bg-brand-pink/35 border-brand-pink/45 shadow-brand-pink/10" }
          ].map((item, i) => (
            <button 
              key={i} 
              onClick={onViewPartner}
              className={`py-12 ${item.style} border-2 rounded-3xl hover:-translate-y-1 hover:shadow-lg transition-all duration-300 font-display font-medium text-xl text-brand-charcoal cursor-pointer group`}
            >
              <span className="group-hover:scale-105 block transition-transform">{item.text}</span>
            </button>
          ))}
        </div>
     </div>
  </section>
);




const TeamPage = () => (
  <section className="min-h-[80vh] bg-brand-cream py-32 px-6 flex flex-col justify-center">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <div className="w-24 h-24 bg-brand-green/20 text-brand-green rounded-[2.2rem] flex items-center justify-center mb-8 mx-auto shadow-sm">
          <Users className="w-12 h-12" />
        </div>
        <h1 className="text-5xl md:text-7xl font-display text-brand-charcoal mb-6 tracking-tighter">Meet The Team</h1>
        <p className="text-lg text-brand-charcoal/80 max-w-2xl mx-auto font-medium">
          The core team details will be revealed shortly. Here is an overview of our organizational structure.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-20 max-w-5xl mx-auto">
        <div className="bg-brand-blue/15 border-2 border-brand-blue/30 rounded-[2.5rem] p-10 text-center relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className="w-16 h-16 bg-brand-blue text-brand-charcoal rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8" />
          </div>
          <span className="px-4 py-1.5 bg-brand-blue/20 text-brand-blue border border-brand-blue/30 rounded-full text-[10px] uppercase font-black tracking-widest inline-block mb-4">Advisory & Psychiatry</span>
          <h3 className="text-2xl font-display text-brand-charcoal mb-4">Clinical Liaison</h3>
          <p className="text-sm text-brand-charcoal/80 font-medium">Coordination of psychiatrists, support screening networks, and diagnostic partners.</p>
          <div className="mt-8 text-xs font-black uppercase text-brand-blue tracking-[2px] opacity-65">Revealing Soon</div>
        </div>

        <div className="bg-brand-pink/15 border-2 border-brand-pink/30 rounded-[2.5rem] p-10 text-center relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className="w-16 h-16 bg-brand-pink text-brand-charcoal rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8" />
          </div>
          <span className="px-4 py-1.5 bg-brand-pink/20 text-brand-pink border border-brand-pink/35 rounded-full text-[10px] uppercase font-black tracking-widest inline-block mb-4">Youth Leadership</span>
          <h3 className="text-2xl font-display text-brand-charcoal mb-4">Global Facilitators</h3>
          <p className="text-sm text-brand-charcoal/80 font-medium font-sans">Driving outreach in India, Spain, UAE, Thailand, and Singapore with structured regional leadership.</p>
          <div className="mt-8 text-xs font-black uppercase text-brand-pink tracking-[2px] opacity-75">Revealing Soon</div>
        </div>

        <div className="bg-brand-green/15 border-2 border-brand-green/30 rounded-[2.5rem] p-10 text-center relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className="w-16 h-16 bg-brand-green text-brand-charcoal rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8" />
          </div>
          <span className="px-4 py-1.5 bg-brand-green/20 text-brand-green border border-brand-green/35 rounded-full text-[10px] uppercase font-black tracking-widest inline-block mb-4">Inclusion Outreach</span>
          <h3 className="text-2xl font-display text-brand-charcoal mb-4">School Liaison Hub</h3>
          <p className="text-sm text-brand-charcoal/80 font-medium font-sans">Empowering students through school-specific academic scaffolds and curriculum planning.</p>
          <div className="mt-8 text-xs font-black uppercase text-brand-green tracking-[2px] opacity-65">Revealing Soon</div>
        </div>
      </div>
      
      <div className="text-center">
        <button 
          onClick={() => (window as any).navigate('home')}
          className="px-8 py-4 bg-brand-charcoal text-brand-cream rounded-full text-sm font-bold uppercase tracking-wider hover:bg-brand-pink hover:text-brand-charcoal transition-all shadow-sm cursor-pointer"
        >
          Return Home
        </button>
      </div>
    </div>
  </section>
);

// --- Main App ---


const PartnerPage = ({ onExit }: { onExit: () => void }) => {
  const [partnerType, setPartnerType] = useState<"none" | "school" | "volunteer" | "donate" | "help">("none");

  // Reusing the inquiry form logic but categorized
  const [formData, setFormData] = useState({ name: "", org: "", email: "", whatsapp: "", phoneCode: "+91", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    try {
      const payload = {
        name: formData.name,
        org: formData.org || "",
        email: formData.email,
        whatsapp: (formData.whatsapp && formData.whatsapp.trim().length > 0) ? `${formData.phoneCode} ${formData.whatsapp}` : "",
        message: formData.message,
        type: partnerType,
      };
      
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        let errMessage = "Unknown error";
        try {
          const errData = await response.json();
          errMessage = errData.error || errMessage;
        } catch (e) {}
        throw new Error(errMessage);
      }
      
      setStatus("success");
      setTimeout(() => {
        setPartnerType("none");
        setStatus("idle");
        setFormData({ name: "", org: "", email: "", whatsapp: "", phoneCode: "+91", message: "" });
      }, 3000);
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Failed to send inquiry.");
    }
  };

  const OptionCard = ({ icon, title, desc, type }: { icon: any, title: string, desc: string, type: any }) => (
    <div 
      onClick={() => setPartnerType(type)}
      className="p-8 bg-brand-blue/20 rounded-3xl cursor-pointer hover:-translate-y-2 hover:shadow-xl hover:shadow-brand-blue/10 transition-all border border-brand-charcoal/10"
    >
      <div className="w-16 h-16 bg-brand-blue/20 rounded-2xl flex items-center justify-center text-brand-blue mb-6">
        {icon}
      </div>
      <h3 className="font-bold text-xl mb-2 text-brand-charcoal">{title}</h3>
      <p className="text-sm text-brand-charcoal/70 leading-relaxed font-medium">{desc}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-mint/20 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onExit}
          className="flex items-center gap-2 text-brand-charcoal/50 hover:text-brand-green transition-colors font-bold text-sm mb-12 uppercase tracking-wide"
        >
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to Home
        </button>

        {partnerType === "none" ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-display text-brand-charcoal mb-6 leading-tight tracking-tight">How would you like to partner with us?</h1>
            <p className="text-lg text-brand-charcoal/80 mb-12 max-w-2xl font-medium leading-relaxed">
              Whether you are an educational institution, a passionate advocate, or a philanthropist, your support helps us build the scaffolds every neurodivergent student needs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <OptionCard icon={<School className="w-8 h-8"/>} title="Partner as a School" desc="Implement our frameworks and inclusive programs in your educational institution." type="school" />
              <OptionCard icon={<Users className="w-8 h-8"/>} title="Join as a Volunteer" desc="Become part of our global core team or local on-ground task forces." type="volunteer" />
              <OptionCard icon={<Heart className="w-8 h-8"/>} title="Donate to the Cause" desc="Contribute funds to expand our reach in Tier 2 and Tier 3 cities." type="donate" />
              <OptionCard icon={<Sparkles className="w-8 h-8"/>} title="Help Us Build" desc="Offer technical, creative, or specialized advisory support." type="help" />
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <button 
              onClick={() => setPartnerType("none")}
              className="text-brand-green font-bold text-sm mb-8 flex items-center gap-2 hover:underline"
            >
              <ChevronRight className="w-4 h-4 rotate-180" /> Choose another option
            </button>
            <div className="bg-brand-green/20 p-10 md:p-16 rounded-[3rem] shadow-sm border border-brand-charcoal/10">
              <h2 className="text-3xl md:text-4xl font-display text-brand-charcoal mb-4 capitalize">
                {partnerType === "school" ? "School Partnership" :
                 partnerType === "volunteer" ? "Volunteer Application" :
                 partnerType === "donate" ? "Make a Donation" : "Help Us Build"}
              </h2>
              <p className="text-brand-charcoal/70 mb-10 font-medium">Please fill out this quick form, and our leadership team will reach out to you shortly.</p>
              
              {status === "success" ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-brand-green text-brand-charcoal rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Thank you!</h3>
                  <p className="text-brand-charcoal/70">We have received your details. Expect to hear from us very soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errorMessage && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold">
                      {errorMessage}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-brand-charcoal/50 mb-2 px-4">Full Name</label>
                      <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 bg-brand-cream/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green/40 transition-all font-medium border border-transparent" placeholder="Jane Doe" />
                    </div>
                    {partnerType === "school" && (
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-brand-charcoal/50 mb-2 px-4">School / Organization</label>
                        <input type="text" required value={formData.org} onChange={e => setFormData({...formData, org: e.target.value})} className="w-full px-6 py-4 bg-brand-cream/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green/40 transition-all font-medium border border-transparent" placeholder="Global Academy" />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-brand-charcoal/50 mb-2 px-4">Email Address</label>
                      <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-6 py-4 bg-brand-cream/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green/40 transition-all font-medium border border-transparent" placeholder="jane@example.com" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-brand-charcoal/50 mb-2 px-4">WhatsApp</label>
                      <div className="flex gap-2">
    <input 
    type="text"
    list="country-codes"
    className="w-[110px] px-4 py-4 bg-brand-cream/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green/40 transition-all font-medium border border-transparent appearance-none cursor-text text-center whitespace-nowrap"
    value={formData.phoneCode || "+91"}
    onChange={e => setFormData({...formData, phoneCode: e.target.value})}
    placeholder="+code"
  />
  <datalist id="country-codes">
    <option value="+93">Afghanistan</option>
    <option value="+355">Albania</option>
    <option value="+213">Algeria</option>
    <option value="+1-684">American Samoa</option>
    <option value="+376">Andorra</option>
    <option value="+244">Angola</option>
    <option value="+1-264">Anguilla</option>
    <option value="+672">Antarctica</option>
    <option value="+1-268">Antigua and Barbuda</option>
    <option value="+54">Argentina</option>
    <option value="+374">Armenia</option>
    <option value="+297">Aruba</option>
    <option value="+61">Australia</option>
    <option value="+43">Austria</option>
    <option value="+994">Azerbaijan</option>
    <option value="+1-242">Bahamas</option>
    <option value="+973">Bahrain</option>
    <option value="+880">Bangladesh</option>
    <option value="+1-246">Barbados</option>
    <option value="+375">Belarus</option>
    <option value="+32">Belgium</option>
    <option value="+501">Belize</option>
    <option value="+229">Benin</option>
    <option value="+1-441">Bermuda</option>
    <option value="+975">Bhutan</option>
    <option value="+591">Bolivia</option>
    <option value="+387">Bosnia and Herzegovina</option>
    <option value="+267">Botswana</option>
    <option value="+55">Brazil</option>
    <option value="+246">British Indian Ocean Territory</option>
    <option value="+1-284">British Virgin Islands</option>
    <option value="+673">Brunei</option>
    <option value="+359">Bulgaria</option>
    <option value="+226">Burkina Faso</option>
    <option value="+257">Burundi</option>
    <option value="+855">Cambodia</option>
    <option value="+237">Cameroon</option>
    <option value="+1">Canada</option>
    <option value="+238">Cape Verde</option>
    <option value="+1-345">Cayman Islands</option>
    <option value="+236">Central African Republic</option>
    <option value="+235">Chad</option>
    <option value="+56">Chile</option>
    <option value="+86">China</option>
    <option value="+61">Christmas Island</option>
    <option value="+61">Cocos Islands</option>
    <option value="+57">Colombia</option>
    <option value="+269">Comoros</option>
    <option value="+682">Cook Islands</option>
    <option value="+506">Costa Rica</option>
    <option value="+385">Croatia</option>
    <option value="+53">Cuba</option>
    <option value="+599">Curacao</option>
    <option value="+357">Cyprus</option>
    <option value="+420">Czech Republic</option>
    <option value="+243">Democratic Republic of the Congo</option>
    <option value="+45">Denmark</option>
    <option value="+253">Djibouti</option>
    <option value="+1-767">Dominica</option>
    <option value="+1-809">Dominican Republic</option>
    <option value="+670">East Timor</option>
    <option value="+593">Ecuador</option>
    <option value="+20">Egypt</option>
    <option value="+503">El Salvador</option>
    <option value="+240">Equatorial Guinea</option>
    <option value="+291">Eritrea</option>
    <option value="+372">Estonia</option>
    <option value="+251">Ethiopia</option>
    <option value="+500">Falkland Islands</option>
    <option value="+298">Faroe Islands</option>
    <option value="+679">Fiji</option>
    <option value="+358">Finland</option>
    <option value="+33">France</option>
    <option value="+689">French Polynesia</option>
    <option value="+241">Gabon</option>
    <option value="+220">Gambia</option>
    <option value="+995">Georgia</option>
    <option value="+49">Germany</option>
    <option value="+233">Ghana</option>
    <option value="+350">Gibraltar</option>
    <option value="+30">Greece</option>
    <option value="+299">Greenland</option>
    <option value="+1-473">Grenada</option>
    <option value="+1-671">Guam</option>
    <option value="+502">Guatemala</option>
    <option value="+44">Guernsey</option>
    <option value="+224">Guinea</option>
    <option value="+245">Guinea-Bissau</option>
    <option value="+592">Guyana</option>
    <option value="+509">Haiti</option>
    <option value="+504">Honduras</option>
    <option value="+852">Hong Kong</option>
    <option value="+36">Hungary</option>
    <option value="+354">Iceland</option>
    <option value="+91">India</option>
    <option value="+62">Indonesia</option>
    <option value="+98">Iran</option>
    <option value="+964">Iraq</option>
    <option value="+353">Ireland</option>
    <option value="+44">Isle of Man</option>
    <option value="+972">Israel</option>
    <option value="+39">Italy</option>
    <option value="+225">Ivory Coast</option>
    <option value="+1-876">Jamaica</option>
    <option value="+81">Japan</option>
    <option value="+44">Jersey</option>
    <option value="+962">Jordan</option>
    <option value="+7">Kazakhstan</option>
    <option value="+254">Kenya</option>
    <option value="+686">Kiribati</option>
    <option value="+383">Kosovo</option>
    <option value="+965">Kuwait</option>
    <option value="+996">Kyrgyzstan</option>
    <option value="+856">Laos</option>
    <option value="+371">Latvia</option>
    <option value="+961">Lebanon</option>
    <option value="+266">Lesotho</option>
    <option value="+231">Liberia</option>
    <option value="+218">Libya</option>
    <option value="+423">Liechtenstein</option>
    <option value="+370">Lithuania</option>
    <option value="+352">Luxembourg</option>
    <option value="+853">Macau</option>
    <option value="+389">Macedonia</option>
    <option value="+261">Madagascar</option>
    <option value="+265">Malawi</option>
    <option value="+60">Malaysia</option>
    <option value="+960">Maldives</option>
    <option value="+223">Mali</option>
    <option value="+356">Malta</option>
    <option value="+692">Marshall Islands</option>
    <option value="+222">Mauritania</option>
    <option value="+230">Mauritius</option>
    <option value="+262">Mayotte</option>
    <option value="+52">Mexico</option>
    <option value="+691">Micronesia</option>
    <option value="+373">Moldova</option>
    <option value="+377">Monaco</option>
    <option value="+976">Mongolia</option>
    <option value="+382">Montenegro</option>
    <option value="+1-664">Montserrat</option>
    <option value="+212">Morocco</option>
    <option value="+258">Mozambique</option>
    <option value="+95">Myanmar</option>
    <option value="+264">Namibia</option>
    <option value="+674">Nauru</option>
    <option value="+977">Nepal</option>
    <option value="+31">Netherlands</option>
    <option value="+599">Netherlands Antilles</option>
    <option value="+687">New Caledonia</option>
    <option value="+64">New Zealand</option>
    <option value="+505">Nicaragua</option>
    <option value="+227">Niger</option>
    <option value="+234">Nigeria</option>
    <option value="+683">Niue</option>
    <option value="+850">North Korea</option>
    <option value="+1-670">Northern Mariana Islands</option>
    <option value="+47">Norway</option>
    <option value="+968">Oman</option>
    <option value="+92">Pakistan</option>
    <option value="+680">Palau</option>
    <option value="+970">Palestine</option>
    <option value="+507">Panama</option>
    <option value="+675">Papua New Guinea</option>
    <option value="+595">Paraguay</option>
    <option value="+51">Peru</option>
    <option value="+63">Philippines</option>
    <option value="+64">Pitcairn</option>
    <option value="+48">Poland</option>
    <option value="+351">Portugal</option>
    <option value="+1-787">Puerto Rico</option>
    <option value="+974">Qatar</option>
    <option value="+242">Republic of the Congo</option>
    <option value="+262">Reunion</option>
    <option value="+40">Romania</option>
    <option value="+7">Russia</option>
    <option value="+250">Rwanda</option>
    <option value="+590">Saint Barthelemy</option>
    <option value="+290">Saint Helena</option>
    <option value="+1-869">Saint Kitts and Nevis</option>
    <option value="+1-758">Saint Lucia</option>
    <option value="+590">Saint Martin</option>
    <option value="+508">Saint Pierre and Miquelon</option>
    <option value="+1-784">Saint Vincent and the Grenadines</option>
    <option value="+685">Samoa</option>
    <option value="+378">San Marino</option>
    <option value="+239">Sao Tome and Principe</option>
    <option value="+966">Saudi Arabia</option>
    <option value="+221">Senegal</option>
    <option value="+381">Serbia</option>
    <option value="+248">Seychelles</option>
    <option value="+232">Sierra Leone</option>
    <option value="+65">Singapore</option>
    <option value="+1-721">Sint Maarten</option>
    <option value="+421">Slovakia</option>
    <option value="+386">Slovenia</option>
    <option value="+677">Solomon Islands</option>
    <option value="+252">Somalia</option>
    <option value="+27">South Africa</option>
    <option value="+82">South Korea</option>
    <option value="+211">South Sudan</option>
    <option value="+34">Spain</option>
    <option value="+94">Sri Lanka</option>
    <option value="+249">Sudan</option>
    <option value="+597">Suriname</option>
    <option value="+47">Svalbard and Jan Mayen</option>
    <option value="+268">Swaziland</option>
    <option value="+46">Sweden</option>
    <option value="+41">Switzerland</option>
    <option value="+963">Syria</option>
    <option value="+886">Taiwan</option>
    <option value="+992">Tajikistan</option>
    <option value="+255">Tanzania</option>
    <option value="+66">Thailand</option>
    <option value="+228">Togo</option>
    <option value="+690">Tokelau</option>
    <option value="+676">Tonga</option>
    <option value="+1-868">Trinidad and Tobago</option>
    <option value="+216">Tunisia</option>
    <option value="+90">Turkey</option>
    <option value="+993">Turkmenistan</option>
    <option value="+1-649">Turks and Caicos Islands</option>
    <option value="+688">Tuvalu</option>
    <option value="+1-340">U.S. Virgin Islands</option>
    <option value="+256">Uganda</option>
    <option value="+380">Ukraine</option>
    <option value="+971">United Arab Emirates</option>
    <option value="+44">United Kingdom</option>
    <option value="+1">United States</option>
    <option value="+598">Uruguay</option>
    <option value="+998">Uzbekistan</option>
    <option value="+678">Vanuatu</option>
    <option value="+379">Vatican</option>
    <option value="+58">Venezuela</option>
    <option value="+84">Vietnam</option>
    <option value="+681">Wallis and Futuna</option>
    <option value="+212">Western Sahara</option>
    <option value="+967">Yemen</option>
    <option value="+260">Zambia</option>
    <option value="+263">Zimbabwe</option>
  </datalist>
  <input 
    type="tel" 
    required
    value={formData.whatsapp} 
    onChange={e => setFormData({...formData, whatsapp: e.target.value})} 
    className="flex-1 px-6 py-4 bg-brand-cream/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/40 transition-all font-medium border border-transparent" 
    placeholder="1234567890" 
  />
</div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-brand-charcoal/50 mb-2 px-4">
                      {partnerType === "donate" ? "Message or Amount Intent" : "How can we collaborate?"}
                    </label>
                    <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full px-6 py-4 bg-brand-cream/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/40 transition-all font-medium border border-transparent resize-none h-32" placeholder="Tell us a bit more..."></textarea>
                  </div>
                  <button type="submit" disabled={status === "loading"} className="w-full py-5 bg-brand-blue text-brand-charcoal rounded-full font-bold uppercase tracking-widest text-sm hover:bg-brand-green transition-all flex justify-center items-center gap-3">
                    {status === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Send Details</>}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};


export default function App() {
  const [view, setView] = useState("home");

  useEffect(() => {
    const checkPath = () => {
      const path = window.location.pathname.replace(/^\//, '') || 'home';
      setView(path);
    };

    checkPath();
    window.addEventListener("popstate", checkPath);
    
    (window as any).navigate = (path: string) => {
      window.history.pushState({}, "", path === 'home' ? '/' : `/${path}`);
      checkPath();
      window.scrollTo(0, 0);
    };

    return () => window.removeEventListener("popstate", checkPath);
  }, []);

  // Modals & Single Page Apps
  if (view === "partner") {
    return <PartnerPage onExit={() => (window as any).navigate('home')} />;
  }

  if (view === "admin") {
    return <AdminPortal onExit={() => (window as any).navigate('home')} />;
  }

  // Layout wrapper for site pages
  return (
    <div className="bg-brand-cream selection:bg-brand-blue/30 selection:text-brand-charcoal font-sans min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col">
        {view === "home" && (
          <>
            <Hero onViewPartner={() => (window as any).navigate('partner')} />
            <About />
            <FinalCTA onViewPartner={() => (window as any).navigate('partner')} />
          </>
        )}
        {view === "about" && (
          <>
            <div className="pt-20"> {/* Spacer for navbar */}
              <About />
            </div>
            <FinalCTA onViewPartner={() => (window as any).navigate('partner')} />
          </>
        )}
        {view === "impact" && (
          <>
            <div className="pt-20">
              <WhyMatters onViewPartner={() => (window as any).navigate('partner')} />
            </div>
          </>
        )}
        {view === "team" && (
          <TeamPage />
        )}
      </div>
      <Footer />
    </div>
  );
}
