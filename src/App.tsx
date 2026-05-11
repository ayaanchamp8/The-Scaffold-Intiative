import { useState, useEffect, FormEvent, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  MessageCircle,
  LogIn
} from "lucide-react";
import { 
  db, 
  auth, 
  googleProvider, 
  signInWithPopup, 
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
  throw new Error(JSON.stringify(errInfo));
};

// --- Components ---

const PartnerModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [formData, setFormData] = useState({
    name: "",
    org: "",
    email: "",
    whatsapp: "",
    message: ""
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      console.log("Submitting inquiry to API", formData);
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const msg = errorData.message ? `${errorData.error}: ${errorData.message}` : (errorData.error || "Failed to submit inquiry");
        throw new Error(msg);
      }

      console.log("Inquiry submitted successfully via API");
      
      setStatus("success");
      setTimeout(() => {
        onClose();
        setStatus("idle");
        setFormData({ name: "", org: "", email: "", whatsapp: "", message: "" });
      }, 3000);
    } catch (err: any) {
      console.error("Submission failed", err);
      setStatus("error");
      setErrorMessage(err.message || "Failed to send inquiry. Please check your connection and try again.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-brand-white rounded-[2.5rem] shadow-2xl relative"
          >
            <div className="p-6 md:p-8 text-center pt-8 md:pt-10">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 md:top-6 md:right-6 p-2 hover:bg-brand-pink-light rounded-full transition-colors group cursor-pointer"
              >
                <X className="w-5 h-5 text-brand-plum group-hover:rotate-90 transition-transform" />
              </button>
              
              <div className="mb-6">
                <span className="text-[10px] font-bold tracking-[3px] uppercase text-brand-pink mb-2 block">Take Action</span>
                <h3 className="text-2xl md:text-3xl font-display tracking-tight text-brand-plum">Partner With Us</h3>
                <p className="text-brand-charcoal/50 mt-2 text-xs font-medium px-2">Join our global network to support neurodivergent inclusion.</p>
              </div>

              {status === "success" ? (
                <div className="py-8 text-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle2 className="w-8 h-8" />
                  </motion.div>
                  <h4 className="text-xl font-bold text-brand-plum mb-2">Thank You!</h4>
                  <p className="text-brand-charcoal/60 text-xs md:text-sm">We have received your message and will get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4 text-left">
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-brand-plum/40 mb-1 block px-2">Full Name</label>
                    <input 
                      required
                      disabled={status === "loading"}
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 bg-brand-cream border border-brand-plum/5 rounded-2xl md:rounded-[1.5rem] focus:outline-none focus:border-brand-pink/30 text-sm font-medium transition-all disabled:opacity-50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-black tracking-widest text-brand-plum/40 mb-1 block px-2">Organization</label>
                      <input 
                        disabled={status === "loading"}
                        type="text" 
                        value={formData.org}
                        onChange={(e) => setFormData({...formData, org: e.target.value})}
                        placeholder="Organization"
                        className="w-full px-4 py-3 bg-brand-cream border border-brand-plum/5 rounded-2xl md:rounded-[1.5rem] focus:outline-none focus:border-brand-pink/30 text-sm font-medium transition-all disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-black tracking-widest text-brand-plum/40 mb-1 block px-2">WhatsApp / Phone</label>
                      <input 
                        required
                        disabled={status === "loading"}
                        type="tel" 
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                        placeholder="+91 XXXXX"
                        className="w-full px-4 py-3 bg-brand-cream border border-brand-plum/5 rounded-2xl md:rounded-[1.5rem] focus:outline-none focus:border-brand-pink/30 text-sm font-medium transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-brand-plum/40 mb-1 block px-2">Work Email</label>
                    <input 
                      required
                      disabled={status === "loading"}
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="email@example.com"
                      className="w-full px-4 py-3 bg-brand-cream border border-brand-plum/5 rounded-2xl md:rounded-[1.5rem] focus:outline-none focus:border-brand-pink/30 text-sm font-medium transition-all disabled:opacity-50"
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-brand-plum/40 mb-1 block px-2">How you'd like to help</label>
                    <textarea 
                      required
                      disabled={status === "loading"}
                      rows={2}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Tell us about the collaboration..."
                      className="w-full px-4 py-3 bg-brand-cream border border-brand-plum/5 rounded-2xl md:rounded-[1.5rem] focus:outline-none focus:border-brand-pink/30 text-sm font-medium transition-all resize-none disabled:opacity-50"
                    />
                  </div>
                  
                  {status === "error" && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold">
                      {errorMessage}
                    </div>
                  )}

                  <button 
                    disabled={status === "loading"}
                    type="submit"
                    className="w-full py-5 bg-brand-plum text-white rounded-full font-bold uppercase tracking-widest text-sm hover:bg-brand-charcoal transition-all shadow-lg flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === "loading" ? (
                      <>Processing... <Loader2 className="w-4 h-4 animate-spin" /></>
                    ) : (
                      <>Send Inquiry <Send className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              )}
            </div>
            
            <div className="bg-brand-pink-light/30 p-6 text-center border-t border-brand-plum/5">
              <p className="text-[10px] font-black text-brand-plum/30 uppercase tracking-[2px]">
                Inquiry will be sent automatically
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Admin Portal ---

const AdminPortal = ({ onExit }: { onExit: () => void }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<"admin" | "moderator" | null>(null);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"inquiries" | "staff">("inquiries");
  const [filter, setFilter] = useState<string>("all");

  const [showRoleInfo, setShowRoleInfo] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u && u.email) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', u.email));
          if (adminDoc.exists()) {
            setUserRole(adminDoc.data().role);
          } else if (u.email === 'ayaan.kriplani2213@gmail.com') {
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

  const handleSignIn = async () => {
    if (isSigningIn) return;
    
    setIsSigningIn(true);
    setAuthError(null);
    
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Sign in failed", err);
      // Specific handling for common popup errors in iframe/development environments
      if (err.code === 'auth/cancelled-popup-request') {
        setAuthError("Sign-in process was interrupted. This can happen if multiple clicks occur or if the request timed out. Please try again.");
      } else if (err.code === 'auth/popup-blocked') {
        setAuthError("The sign-in popup was blocked by your browser. Please enable popups for this site and try again.");
      } else if (err.code === 'auth/popup-closed-by-user') {
        setAuthError("Sign-in was cancelled because the window was closed.");
      } else {
        setAuthError(`Sign-in failed: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsSigningIn(false);
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
      
      if (inquiry.whatsapp) {
        const cleanWA = inquiry.whatsapp.replace(/[^0-9]/g, '');
        window.open(`https://wa.me/${cleanWA}?text=${encodeURIComponent("Hi " + inquiry.name + ",\n\n" + formalizedMessage)}`, '_blank');
      }
      
      if (inquiry.email) {
        window.open(`mailto:${inquiry.email}?subject=${encodeURIComponent("Thank you for contacting The Scaffold Initiative")}&body=${encodeURIComponent("Hi " + inquiry.name + ",\n\n" + formalizedMessage)}`, '_blank');
      }

      await handleUpdateStatus(inquiry.id, 'contacted');
    } catch (e: any) {
      console.error("Error: " + e.message);
    }
  };

  const filteredInquiries = useMemo(() => {
    if (filter === "all") return inquiries;
    return inquiries.filter(i => i.status === filter);
  }, [inquiries, filter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-plum animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white p-12 rounded-[3.5rem] shadow-2xl text-center border border-brand-plum/10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-brand-pink" />
          
          <div className="w-24 h-24 bg-brand-cream rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner border border-brand-plum/5">
            <div className="w-12 h-12 bg-brand-plum rounded-xl flex items-center justify-center font-display font-black text-2xl text-brand-cream">S</div>
          </div>
          
          <h2 className="text-4xl font-display text-brand-plum mb-4 tracking-tighter">Staff Access</h2>
          <p className="text-brand-charcoal/50 mb-12 font-medium px-4">
            Sign in to manage the Scaffold Initiative global network.
          </p>
          
          <button 
            disabled={isSigningIn}
            onClick={handleSignIn}
            className="w-full py-5 bg-white border-2 border-brand-plum/10 text-brand-plum rounded-2xl font-bold text-sm flex items-center justify-center gap-4 hover:bg-brand-cream hover:border-brand-plum/30 transition-all shadow-sm cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningIn ? (
              <Loader2 className="w-5 h-5 animate-spin text-brand-plum" />
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
              className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[10px] font-bold leading-relaxed"
            >
              {authError}
            </motion.div>
          )}

          <div className="mt-12 flex flex-col items-center gap-6">
            <div className="h-px w-8 bg-brand-plum/10" />
            <button 
              onClick={onExit}
              className="text-xs font-black text-brand-plum/30 uppercase tracking-[0.2em] hover:text-brand-pink transition-colors cursor-pointer"
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
          className="w-full max-w-lg bg-white p-12 md:p-16 rounded-[4rem] shadow-2xl text-center border border-brand-plum/10"
        >
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-red-100">
            <ShieldCheck className="w-10 h-10" />
          </div>
          
          <h2 className="text-4xl font-display text-brand-plum mb-6 tracking-tighter">Access Denied</h2>
          
          <div className="bg-brand-cream/50 p-8 rounded-3xl border border-brand-plum/5 mb-10 text-left">
            <p className="text-sm text-brand-charcoal/60 mb-6 font-medium leading-relaxed">
              Your account <strong>{user?.email}</strong> is not yet authorized.
            </p>
            <div className="space-y-4">
              <p className="text-[11px] text-brand-plum/60 font-medium">
                An administrator must add your email address to the authorized staff list to grant you access.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={handleSignOut}
              className="w-full py-5 bg-brand-plum text-white rounded-full font-bold uppercase tracking-widest text-sm hover:bg-brand-charcoal transition-all shadow-lg cursor-pointer"
            >
              Sign Out & Try Again
            </button>
            <button 
              onClick={onExit}
              className="py-5 text-xs font-black text-brand-plum/40 uppercase tracking-widest hover:text-brand-plum transition-colors cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf9f8] text-brand-plum font-sans flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-brand-plum text-brand-cream p-8 md:min-h-screen flex flex-col border-r border-white/5">
        <div className="flex items-center gap-3 mb-16">
          <div className="w-10 h-10 bg-brand-cream rounded-xl flex items-center justify-center font-display font-black text-xl text-brand-plum">S</div>
          <div>
            <h1 className="font-display font-black text-lg tracking-tight uppercase leading-none">Scaffold</h1>
            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mt-1">Admin Panel</p>
          </div>
        </div>

        <nav className="space-y-2 flex-grow">
          <div className="mb-4">
            <p className="text-[10px] font-black opacity-30 uppercase tracking-[2px] px-6 mb-2">Inquiries</p>
            {[
              { id: 'all', label: 'All Inquiries', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'new', label: 'New', icon: <Sparkles className="w-4 h-4" /> },
              { id: 'contacted', label: 'Contacted', icon: <MessageCircle className="w-4 h-4" /> },
              { id: 'archived', label: 'Archived', icon: <Trash2 className="w-4 h-4" /> }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab("inquiries"); setFilter(item.id); }}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === "inquiries" && filter === item.id ? 'bg-brand-pink text-brand-plum' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}
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
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === "staff" ? 'bg-brand-pink text-brand-plum' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}
              >
                <Users className="w-4 h-4" /> Staff Management
              </button>
            </div>
          )}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <img src={user.photoURL || ""} alt="" className="w-10 h-10 rounded-full border border-white/20" />
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">{user.displayName}</p>
              <p className="text-[10px] opacity-40 truncate">{user.email}</p>
            </div>
          </div>
          <div className="space-y-2">
            <button 
              onClick={() => setShowRoleInfo(true)}
              className="w-full flex items-center justify-center gap-2 py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer"
            >
              <Info className="w-4 h-4" /> Role Permissions
            </button>
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 hover:text-red-400 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
            <button 
              onClick={onExit}
              className="w-full flex items-center justify-center gap-2 py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-pink transition-all text-white cursor-pointer"
            >
              Exit Admin
            </button>
          </div>
        </div>
      </div>

      {/* Role Info Modal */}
      <AnimatePresence>
        {showRoleInfo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-charcoal/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-10 border-b border-brand-plum/5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-cream rounded-2xl flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-brand-plum" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-display font-bold text-brand-plum">Access Roles</h3>
                      <p className="text-xs text-brand-charcoal/40 font-medium">System Permission Overview</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowRoleInfo(false)}
                    className="p-2 hover:bg-brand-cream rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-6 h-6 text-brand-plum" />
                  </button>
                </div>
              </div>

              <div className="p-10 overflow-y-auto space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Admin Power */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-plum text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-lg">A</div>
                      <h4 className="font-bold text-brand-plum">Administrator</h4>
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
                        <li key={i} className="flex gap-3 text-xs font-medium text-brand-charcoal/60">
                          <CheckCircle2 className="w-4 h-4 text-brand-plum flex-shrink-0 mt-0.5" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Moderator Power */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-pink text-brand-plum rounded-lg flex items-center justify-center font-bold text-xs shadow-md">M</div>
                      <h4 className="font-bold text-brand-plum">Moderator</h4>
                    </div>
                    <ul className="space-y-4">
                      {[
                        "Full view of all incoming inquiries",
                        "Update inquiry status (New, Contacted, Archive)",
                        "Cannot delete inquiry records",
                        "No access to Staff Management",
                        "Cannot add or remove other users"
                      ].map((p, i) => (
                        <li key={i} className="flex gap-3 text-xs font-medium text-brand-charcoal/60">
                          <CheckCircle2 className="w-4 h-4 text-brand-plum flex-shrink-0 mt-0.5" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-6 bg-brand-cream/50 rounded-2xl border border-brand-plum/5">
                  <p className="text-[10px] text-brand-plum/40 font-bold uppercase tracking-widest leading-relaxed">
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
        {activeTab === "inquiries" ? (
          <>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-display tracking-tighter text-brand-plum">
                  {filter === 'all' ? 'All Inquiries' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Inquiries`}
                </h2>
                <p className="text-brand-charcoal/50 font-medium mt-2">Managing the future of neurodivergent inclusion.</p>
              </div>
              <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-brand-plum/5">
                <div className="px-6 py-3 border-r border-brand-plum/5">
                    <p className="text-[10px] font-black text-brand-plum/30 uppercase tracking-widest mb-1">Total</p>
                    <p className="text-xl font-display text-brand-plum">{inquiries.length}</p>
                </div>
                <div className="px-6 py-3">
                    <p className="text-[10px] font-black text-brand-plum/30 uppercase tracking-widest mb-1">New Today</p>
                    <p className="text-xl font-display text-brand-pink">
                      {inquiries.filter(i => i.status === 'new').length}
                    </p>
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
                      <Filter className="w-10 h-10 text-brand-plum/20" />
                    </div>
                    <p className="text-brand-charcoal/40 font-bold uppercase tracking-widest text-sm">No inquiries found for this filter</p>
                  </motion.div>
                ) : (
                  filteredInquiries.map((inquiry) => (
                    <motion.div
                      layout
                      key={inquiry.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-brand-plum/5 group hover:border-brand-pink/30 hover:shadow-xl transition-all"
                    >
                      <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-grow">
                          <div className="flex items-center gap-4 mb-4">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              inquiry.status === 'new' ? 'bg-brand-pink-light text-brand-plum' :
                              inquiry.status === 'contacted' ? 'bg-blue-50 text-blue-600' :
                              'bg-gray-100 text-gray-500'
                            }`}>
                              {inquiry.status}
                            </span>
                            <div className="flex items-center gap-2 text-brand-charcoal/30 text-[10px] font-black uppercase tracking-widest">
                              <Clock className="w-3 h-3" /> {inquiry.createdAt}
                            </div>
                          </div>
                          
                          <h3 className="text-3xl font-display tracking-tight text-brand-plum mb-2">{inquiry.name}</h3>
                          <div className="flex flex-wrap gap-4 mb-8">
                            <div className="flex items-center gap-2 text-sm font-bold text-brand-charcoal/60">
                              <Building className="w-4 h-4 text-brand-pink" /> {inquiry.org || "Independent Individual"}
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-brand-charcoal/60">
                              <Mail className="w-4 h-4 text-brand-pink" /> 
                              <a href={`mailto:${inquiry.email}`} className="hover:text-brand-plum transition-colors underline decoration-brand-rose/30">
                                {inquiry.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-brand-charcoal/60">
                              <Phone className="w-4 h-4 text-brand-pink" /> 
                              <a href={`https://wa.me/${inquiry.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-plum transition-colors flex items-center gap-1 group/wa">
                                {inquiry.whatsapp} <ExternalLink className="w-3 h-3 opacity-0 group-hover/wa:opacity-100 transition-opacity" />
                              </a>
                            </div>
                          </div>

                          <div className="bg-brand-cream/50 p-8 rounded-3xl border border-brand-plum/5">
                            <h4 className="text-[10px] font-black text-brand-plum/40 uppercase tracking-widest mb-4">Inquiry Message</h4>
                            <p className="text-brand-charcoal/80 font-medium leading-relaxed whitespace-pre-wrap">{inquiry.message}</p>
                          </div>
                        </div>

                        <div className="lg:w-64 flex lg:flex-col gap-3 justify-end lg:justify-start">
                          {inquiry.status !== 'contacted' && (
                            <button 
                              onClick={() => handleSendInitialContact(inquiry)}
                              className="flex-grow lg:flex-none py-4 bg-brand-pink text-brand-plum rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-rose transition-all shadow-md cursor-pointer"
                            >
                              Send Initial Msg
                            </button>
                          )}
                          {inquiry.status !== 'contacted' && (
                            <button 
                              onClick={() => handleUpdateStatus(inquiry.id, 'contacted')}
                              className="flex-grow lg:flex-none py-4 bg-brand-plum text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-charcoal transition-all shadow-md cursor-pointer"
                            >
                              Mark Contacted
                            </button>
                          )}
                          {inquiry.status !== 'archived' && (
                            <button 
                              onClick={() => handleUpdateStatus(inquiry.id, 'archived')}
                              className="flex-grow lg:flex-none py-4 bg-white border border-brand-plum/10 text-brand-plum rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all cursor-pointer"
                            >
                              Archive
                            </button>
                          )}
                          {userRole === 'admin' && (
                            <button 
                              onClick={() => handleDelete(inquiry.id)}
                              className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all cursor-pointer border border-red-100 disabled:opacity-30 disabled:cursor-not-allowed"
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
              <h2 className="text-4xl md:text-5xl font-display tracking-tighter text-brand-plum">Staff Management</h2>
              <p className="text-brand-charcoal/50 font-medium mt-2">Manage access and roles for the initiative's digital portal.</p>
            </header>

            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-[3px] text-brand-plum/30 mb-6">Current Staff</h3>
                <div className="grid gap-4">
                  {staff.map(member => (
                    <div key={member.id} className="bg-white p-8 rounded-[2.5rem] border border-brand-plum/5 flex items-center justify-between group hover:shadow-lg transition-all">
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white ${member.role === 'admin' ? 'bg-brand-plum' : 'bg-brand-pink'}`}>
                          {member.role === 'admin' ? 'A' : 'M'}
                        </div>
                        <div>
                          <p className="font-bold text-brand-plum">{member.id}</p>
                          <div className="flex gap-4 mt-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-pink">{member.role}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveStaff(member.id)}
                        className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all cursor-pointer border border-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-brand-plum/10 h-fit sticky top-12">
                <h3 className="text-2xl font-display tracking-tight text-brand-plum mb-8">Add New Staff</h3>
                <form onSubmit={handleAddStaff} className="space-y-6">
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-brand-plum/40 mb-2 block">Email Address</label>
                    <input 
                      name="email"
                      type="email"
                      required
                      placeholder="staff@scaffold.org"
                      className="w-full px-6 py-4 bg-brand-cream border border-brand-plum/5 rounded-2xl focus:outline-none focus:border-brand-pink/30 font-medium transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-brand-plum/40 mb-2 block">Role</label>
                    <select 
                      name="role"
                      className="w-full px-6 py-4 bg-brand-cream border border-brand-plum/5 rounded-2xl focus:outline-none focus:border-brand-pink/30 font-bold transition-all appearance-none cursor-pointer"
                    >
                      <option value="moderator">Moderator</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-5 bg-brand-plum text-white rounded-full font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-brand-charcoal transition-all shadow-lg active:scale-95"
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
const Navbar = ({ onOpenModal }: { onOpenModal: () => void }) => (
  <nav className="fixed top-0 left-0 w-full z-50 bg-brand-cream/80 backdrop-blur-md border-b border-brand-plum/10">
    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div className="flex items-center gap-2 font-display text-brand-plum">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="w-8 h-8 bg-brand-plum rounded-lg flex items-center justify-center font-bold text-brand-cream group-hover:scale-110 transition-transform">S</div>
          <span className="font-bold text-xl tracking-tight text-brand-charcoal uppercase letter-spacing-[-0.5px]">The Scaffold Initiative</span>
        </button>
      </div>
      <div className="hidden md:flex items-center gap-8 text-brand-plum">
        <a href="#about" className="text-sm font-semibold hover:text-brand-pink transition-colors">About</a>
        <a href="#impact" className="text-sm font-semibold hover:text-brand-pink transition-colors">Impact</a>
        <a href="#model" className="text-sm font-semibold hover:text-brand-pink transition-colors">Model</a>
        <button 
          onClick={onOpenModal}
          className="px-6 py-2.5 bg-brand-plum text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-brand-charcoal transition-all hover:scale-105 cursor-pointer"
        >
          Partner With Us
        </button>
      </div>
    </div>
  </nav>
);

const Hero = ({ onOpenModal }: { onOpenModal: () => void }) => (
  <section className="relative min-h-[90vh] pt-32 pb-20 overflow-hidden flex flex-col justify-center scaffold-grid bg-brand-cream">
    {/* Decorative Elements */}
    <div className="absolute top-1/4 -right-20 w-96 h-96 bg-brand-pink opacity-10 blur-3xl rounded-full" />
    <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-brand-rose opacity-20 blur-3xl rounded-full" />
    
    <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
      <div className="max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1.5 bg-brand-rose text-brand-plum text-[10px] font-black tracking-[0.2em] uppercase rounded-full mb-8 shadow-sm">
            EST. FEB 2026
          </span>
          <h1 className="text-5xl md:text-7xl mb-8 leading-[1.1] text-brand-plum max-w-3xl tracking-tighter">
            Redefining inclusion 
            <span className="block italic mt-2 opacity-90 font-display">for neurodivergent students</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-charcoal/80 mb-10 leading-relaxed max-w-2xl font-medium">
            Bridging the gap between diagnosis and support in Tier 2 and Tier 3 regions across India, Thailand, Spain, and the UAE. Providing structure and care where students need it most.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#impact" className="px-8 py-4 bg-brand-plum text-white rounded-full text-sm font-bold uppercase tracking-wider hover:bg-brand-charcoal transition-all flex items-center gap-3 group shadow-xl shadow-brand-plum/10">
              View Impact <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <button 
              onClick={onOpenModal}
              className="px-8 py-4 border border-brand-plum text-brand-plum rounded-full text-sm font-bold uppercase tracking-wider hover:bg-brand-plum hover:text-white transition-all cursor-pointer"
            >
              Partner With Us
            </button>
          </div>
        </motion.div>
      </div>
      
      {/* Impact Strip */}
      <motion.div 
        id="impact"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-brand-plum/10 py-12"
      >
        {[
          { label: "Countries Active", value: "4" },
          { label: "Vetted Volunteers", value: "35+" },
          { label: "Passive Reach", value: "15,000+" },
          { label: "School Partnerships", value: "15+" }
        ].map((stat, i) => (
          <div key={i}>
            <p className="text-4xl md:text-5xl font-display font-bold text-brand-pink mb-2">{stat.value}</p>
            <p className="text-[11px] font-bold text-brand-plum/60 uppercase tracking-[1px]">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

const About = () => (
  <section id="about" className="py-32 bg-brand-cream overflow-hidden">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid lg:grid-cols-2 gap-20 items-center">
        <motion.div
           whileInView={{ opacity: 1, x: 0 }}
           initial={{ opacity: 0, x: -50 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
        >
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-brand-rose rounded-full opacity-20 blur-2xl" />
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-brand-pink mb-4 block">The Mission</span>
            <h2 className="text-4xl md:text-6xl mb-10 relative z-10 leading-tight tracking-tighter">Empowering students through academic and social inclusion.</h2>
            <p className="text-lg text-brand-charcoal/80 mb-8 leading-relaxed font-medium">
              Launched in February 2026, The Scaffold Initiative is a youth-led organization born from a critical observation: the "diagnostic cliff" between receiving a diagnosis and receiving actual support.
            </p>
            <p className="text-lg text-brand-charcoal/80 mb-12 leading-relaxed font-medium">
              We focus on academic inclusion for neurodivergent students in underserved Tier 2 and Tier 3 regions, ensuring that mental well-being is never an afterthought in the classroom.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-white rounded-3xl shadow-sm border border-brand-plum/5">
                <Users className="w-10 h-10 text-brand-pink mb-6" />
                <h4 className="font-bold text-xl mb-3">Youth-Led Advocacy</h4>
                <p className="text-brand-charcoal/60 leading-relaxed text-sm">Built and driven by those who understand the modern educational landscape from the inside.</p>
              </div>
              <div className="p-8 bg-white rounded-3xl shadow-sm border border-brand-plum/5">
                <Heart className="w-10 h-10 text-brand-pink mb-6" />
                <h4 className="font-bold text-xl mb-3">Holistic Well-being</h4>
                <p className="text-brand-charcoal/60 leading-relaxed text-sm">Centering compassion and mental health as fundamental pillars of academic success.</p>
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
          <div className="aspect-[4/5] bg-brand-pink-light/50 rounded-[3rem] flex flex-col justify-center items-center p-16 relative overflow-hidden border border-brand-plum/5">
             <div className="absolute inset-0 border border-brand-plum/10 rounded-[3rem] rotate-3 -z-10" />
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-rose opacity-30 blur-3xl -mr-16 -mt-16" />
             <div className="text-center">
                <blockquote className="text-3xl md:text-5xl font-display italic text-brand-plum mb-10 leading-tight tracking-tight px-4">
                  "Education shouldn't be a privilege of neuro-conformity. We build the scaffolds so every student can reach the top."
                </blockquote>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-px bg-brand-pink mb-2" />
                  <p className="font-bold text-brand-plum tracking-[0.1em] uppercase text-sm">The Scaffold Team</p>
                  <p className="text-xs text-brand-plum/30 font-bold uppercase tracking-widest">Global Leadership</p>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const GlobalReach = () => (
  <section className="py-32 bg-brand-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-24">
        <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-brand-plum/40 mb-4 block">Proven Scalability</span>
        <h2 className="text-5xl md:text-6xl mb-8 tracking-tighter">30 Days of Global Impact</h2>
        <p className="max-w-2xl mx-auto text-brand-charcoal/60 text-lg font-medium">From pilot concept to active operations across four countries in our first 30 days.</p>
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
        {[
          { country: "India", status: "Operational Hub", regions: "Delhi NCR, Chandigarh, Jaipur" },
          { country: "UAE", status: "Active Network", regions: "Pilot Phase Launched" },
          { country: "Thailand", status: "Direct Reach", regions: "Community Partnerships" },
          { country: "Spain", status: "Volunteer Hub", regions: "Advocacy & Support" }
        ].map((item, idx) => (
          <motion.div 
            key={item.country}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="p-10 glass-card rounded-[2.5rem] hover:bg-brand-pink-light/30 group border border-brand-plum/10"
          >
            <Globe className="w-12 h-12 mb-8 text-brand-plum group-hover:scale-110 transition-transform duration-500" />
            <h3 className="text-2xl mb-2 font-display">{item.country}</h3>
            <p className="text-[10px] font-black text-brand-pink mb-6 uppercase tracking-widest leading-none">{item.status}</p>
            <p className="text-sm font-medium text-brand-charcoal/50 leading-relaxed">{item.regions}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-brand-plum text-white p-12 md:p-20 rounded-[4rem] relative overflow-hidden shadow-2xl shadow-brand-plum/20">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Globe className="w-96 h-96" />
        </div>
        <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h3 className="text-4xl md:text-5xl mb-12 font-display text-brand-rose">The Timeline of Growth</h3>
            <div className="space-y-12">
              {[
                { date: "Feb 1, 2026", task: "Initiative Launch & Global Identity Reveal" },
                { date: "Feb 15, 2026", task: "Secured 15+ School Partnerships in India" },
                { date: "Feb 28, 2026", task: "Volunteer Network Expanded to 4 Countries" },
                { date: "March 2026", task: "Commenced 90-Day Impact Pipeline Planning" }
              ].map((m, i) => (
                <div key={i} className="flex gap-6">
                  <div className="w-px h-full bg-white/10 mt-2 relative">
                    <div className="absolute top-0 -left-1.5 w-3 h-3 rounded-full bg-brand-pink shadow-[0_0_10px_rgba(240,98,146,0.8)]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-brand-rose uppercase tracking-[0.2em] mb-2">{m.date}</p>
                    <p className="text-xl font-medium opacity-90 leading-tight">{m.task}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center lg:text-right hidden sm:block">
            <p className="text-[12rem] md:text-[16rem] font-display text-brand-pink/10 leading-none -mb-8">30</p>
            <p className="text-2xl md:text-3xl font-display text-white/40">Days to Global Operations</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Pipeline = () => (
  <section className="py-32 bg-brand-cream relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-20">
        <div className="max-w-2xl">
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-brand-pink mb-4 block">Future Outlook</span>
          <h2 className="text-5xl md:text-7xl mb-8 tracking-tighter font-display text-brand-plum">90-Day Impact Pipeline</h2>
          <p className="text-brand-charcoal/60 leading-relaxed text-lg font-medium">
            Active scaling across North India, focused on high-engagement school environments and community diagnostic hubs.
          </p>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-7xl md:text-9xl font-display text-brand-plum leading-none tracking-tighter">2,000+</p>
          <p className="text-[11px] font-bold text-brand-plum/40 uppercase tracking-[2px] mt-4">Projected Students Affected by July</p>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {[
          { 
            title: "Tier 1 School Network", 
            description: "Deep, multi-session engagement across 15+ premier schools in Delhi NCR, Chandigarh, and Jaipur.",
            icon: <School className="w-8 h-8" />,
            label: "15+ Schools"
          },
          { 
            title: "Destigmatization Sessions", 
            description: "Tailored workshops for students and teachers designed to dismantle academic biases against neurodivergence.",
            icon: <MessageSquare className="w-8 h-8" />,
            label: "Projected 100+ Hours"
          },
          { 
            title: "Diagnostic Hub Pilots", 
            description: "Scaling our diagnostic camp model to serve students in Tier 2/3 regions through subsidized screening.",
            icon: <Calendar className="w-8 h-8" />,
            label: "Ongoing Rollout"
          }
        ].map((item, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ y: -12 }}
            className="bg-white p-12 rounded-[2rem] shadow-sm border border-brand-plum/5 group"
          >
            <div className="w-16 h-16 bg-brand-cream rounded-2xl flex items-center justify-center text-brand-pink mb-10 border border-brand-plum/5 group-hover:bg-brand-plum group-hover:text-white transition-all duration-500">
              {item.icon}
            </div>
            <p className="text-brand-pink text-[12px] font-bold uppercase tracking-[1.5px] mb-4">{item.label}</p>
            <h3 className="text-2xl mb-6 font-display leading-tight tracking-tight text-brand-plum">{item.title}</h3>
            <p className="text-brand-charcoal/60 leading-relaxed text-sm font-medium">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const SupportModel = () => {
  const models = [
    { title: "Academic Inclusion", text: "Direct collaboration with schools to implement practical accommodations and IEPs that empower neurodivergent learners." },
    { title: "Diagnostic Camps", text: "Subsidized hubs for professional screening and evaluation in tech-underserved Tier 2 and Tier 3 regions." },
    { title: "Post-Diagnostic Care", text: "A continuous feedback loop and support system for families navigating life after initial diagnosis." },
    { title: "Peer Support Groups", text: "Guided communities led by trained youth volunteers to foster a sense of belonging and advocacy." },
    { title: "Helpline Facilitation", text: "Connecting individuals in need with vetted professional resources and crisis support instantly." },
    { title: "Awareness Sessions", text: "Education-focused sessions designed to dismantle stigma at its root in schools and communities." }
  ];

  return (
    <section id="model" className="py-32 bg-brand-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <span className="text-[11px] font-bold tracking-[2px] uppercase text-brand-pink mb-4 block">Operational Framework</span>
          <h2 className="text-5xl md:text-6xl mb-8 tracking-tighter font-display text-brand-plum">A Holistic Support Model</h2>
          <p className="text-brand-charcoal/60 max-w-2xl mx-auto text-lg font-medium">Bridging the gap between initial diagnosis and long-term academic success.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {models.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="p-10 border border-brand-plum/5 rounded-3xl hover:bg-brand-cream transition-all cursor-default group"
            >
              <div className="flex gap-4 items-center mb-6">
                <div className="w-1.5 h-8 bg-brand-pink rounded-full group-hover:bg-brand-plum transition-all" />
                <h3 className="text-2xl font-display leading-tight tracking-tight text-brand-plum">{item.title}</h3>
              </div>
              <p className="text-sm text-brand-charcoal/60 leading-relaxed font-medium">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const WhyMatters = ({ onOpenModal }: { onOpenModal: () => void }) => (
  <section className="py-32 bg-brand-plum text-brand-cream relative overflow-hidden border-t border-white/5">
    <div className="absolute inset-0 scaffold-grid opacity-5 pointer-events-none" />
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="grid lg:grid-cols-2 gap-24 items-center">
        <div>
          <span className="text-[11px] font-bold tracking-[3px] uppercase text-brand-rose mb-6 block">Systemic Advocacy</span>
          <h2 className="text-5xl md:text-7xl mb-10 leading-[1.1] font-display tracking-tighter">Confronting the Diagnostic Cliff</h2>
          <p className="text-xl text-brand-cream/70 mb-12 leading-relaxed font-medium">
            In many underserved communities, "neurodivergence" is invisible. Stigma often replaces support.
          </p>
          <div className="space-y-10">
            <div className="flex gap-6">
               <div className="w-14 h-14 rounded-2xl bg-white/5 flex-shrink-0 flex items-center justify-center border border-white/10 group hover:bg-brand-pink transition-all">
                 <Zap className="w-7 h-7 text-brand-pink group-hover:text-brand-plum transition-colors" />
               </div>
               <div>
                 <h4 className="text-2xl mb-4 font-display tracking-tight">Invisible Barriers</h4>
                 <p className="text-sm text-brand-cream/50 leading-relaxed font-medium">The lack of awareness often leads to neurodivergent students being labeled as "difficult" rather than supported, creating lifelong academic scars.</p>
               </div>
            </div>
            <div className="flex gap-6">
               <div className="w-14 h-14 rounded-2xl bg-white/5 flex-shrink-0 flex items-center justify-center border border-white/10 group hover:bg-brand-pink transition-all">
                 <Sparkles className="w-7 h-7 text-brand-pink group-hover:text-brand-plum transition-colors" />
               </div>
               <div>
                 <h4 className="text-2xl mb-4 font-display tracking-tight">Structural Scaffolding</h4>
                 <p className="text-sm text-brand-cream/50 leading-relaxed font-medium">We focus on Tier 2 & 3 regions where stigma is highest, providing the tools that bridge the gap between classroom and care.</p>
               </div>
            </div>
          </div>
        </div>
        <div className="bg-white/5 p-16 rounded-[3rem] border border-white/10 backdrop-blur-md relative">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-pink opacity-10 blur-3xl" />
          <h3 className="text-5xl font-display mb-10 text-brand-rose leading-tight tracking-tighter">The Scaffold is the bridge.</h3>
          <p className="text-lg opacity-60 leading-relaxed mb-12 font-medium italic">
            Advocacy without infrastructure is just talk. By building partnerships with schools and psychiatrists, we create a sustainable ecosystem of care for every neurodivergent mind.
          </p>
          <button 
            onClick={onOpenModal}
            className="w-full py-6 bg-brand-cream text-brand-plum rounded-full font-bold uppercase tracking-widest text-sm hover:bg-brand-pink hover:text-white transition-all transform hover:scale-[1.02] cursor-pointer shadow-lg"
          >
            Support Our Mission
          </button>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-24 bg-brand-plum text-brand-cream border-t border-white/10">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
        <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-brand-cream rounded-xl flex items-center justify-center font-display font-black text-xl text-brand-plum">S</div>
              <span className="font-display font-black text-2xl tracking-tight text-brand-cream uppercase">The Scaffold Initiative</span>
            </div>
            <p className="text-brand-cream/60 max-w-sm mb-10 text-lg leading-relaxed font-medium">
              A youth-led non-profit redefining academic and social inclusion for neurodivergent minds globally.
            </p>
            <div className="flex gap-6">
              {['LinkedIn', 'Instagram', 'Twitter'].map(social => (
                <a key={social} href="#" className="text-xs font-black tracking-widest uppercase text-brand-cream/40 hover:text-brand-rose transition-colors">
                  {social}
                </a>
              ))}
            </div>
        </div>
        <div>
          <h4 className="font-black mb-8 uppercase text-[10px] tracking-[0.3em] text-brand-rose">Engagement</h4>
          <ul className="space-y-5 text-sm font-bold text-brand-cream/70 tracking-tight">
             <li><a href="#" className="hover:text-brand-rose transition-colors">Partner with us</a></li>
             <li><a href="#" className="hover:text-brand-rose transition-colors">Volunteer network</a></li>
             <li><a href="#" className="hover:text-brand-rose transition-colors">School outreach</a></li>
             <li><a href="#" className="hover:text-brand-rose transition-colors">Emergency support</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-black mb-8 uppercase text-[10px] tracking-[0.3em] text-brand-rose">Organization</h4>
          <ul className="space-y-5 text-sm font-bold text-brand-cream/70 tracking-tight">
             <li><a href="#" className="hover:text-brand-rose transition-colors">Impact roadmap</a></li>
             <li><a href="#" className="hover:text-brand-rose transition-colors">Leadership</a></li>
             <li><a href="#" className="hover:text-brand-rose transition-colors">Contact center</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-brand-cream/30">
        <p>© 2026 THE SCAFFOLD INITIATIVE.</p>
        <div className="flex gap-8 px-8 py-3 border border-white/10 rounded-full items-center">
          <p>Global Advocacy</p>
          <div className="w-px h-3 bg-white/20" />
          <p>Youth-Led Project</p>
          <div className="w-px h-3 bg-white/20" />
          <button 
            onClick={() => (window as any).toggleAdmin?.()} 
            className="hover:text-brand-rose transition-colors cursor-pointer uppercase tracking-[0.2em] font-black"
          >
            Staff Login
          </button>
        </div>
      </div>
    </div>
  </footer>
);

const FinalCTA = ({ onOpenModal }: { onOpenModal: () => void }) => (
  <section className="py-40 bg-brand-cream relative overflow-hidden text-center border-t border-brand-plum/5">
     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-brand-pink opacity-[0.05] blur-3xl rounded-full" />
     <div className="max-w-5xl mx-auto px-6 relative z-10">
        <span className="text-[11px] font-bold tracking-[4px] uppercase text-brand-pink mb-8 block">Call to Action</span>
        <h2 className="text-6xl md:text-9xl mb-16 font-display leading-none tracking-tighter leading-[0.85] text-brand-plum">Will you help us build the next scaffold?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            "Partner With Us",
            "Support a Camp",
            "Bring Us to School",
            "Join Volunteers"
          ].map((text, i) => (
            <button 
              key={i} 
              onClick={onOpenModal}
              className="py-12 bg-white border border-brand-plum/5 rounded-3xl hover:shadow-2xl hover:shadow-brand-pink/10 transition-all font-display font-medium text-xl text-brand-charcoal cursor-pointer group"
            >
              <span className="group-hover:scale-110 block transition-transform">{text}</span>
            </button>
          ))}
        </div>
     </div>
  </section>
);

// --- Main App ---

export default function App() {
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [view, setView] = useState<"landing" | "admin">("landing");

  // Handle /admin routing
  useEffect(() => {
    const checkPath = () => {
      if (window.location.pathname === "/admin") {
        setView("admin");
      } else {
        setView("landing");
      }
    };

    checkPath();
    
    // Listen for back/forward navigation
    window.addEventListener("popstate", checkPath);
    
    // Global toggle helper
    (window as any).toggleAdmin = () => {
      const newView = window.location.pathname === "/admin" ? "/" : "/admin";
      window.history.pushState({}, "", newView);
      checkPath();
    };

    return () => window.removeEventListener("popstate", checkPath);
  }, []);

  if (view === "admin") {
    return <AdminPortal onExit={() => {
      window.history.pushState({}, "", "/");
      setView("landing");
    }} />;
  }

  return (
    <div className="bg-brand-white selection:bg-brand-rose selection:text-brand-plum font-sans">
      <Navbar onOpenModal={() => setIsPartnerModalOpen(true)} />
      <Hero onOpenModal={() => setIsPartnerModalOpen(true)} />
      <About />
      <GlobalReach />
      <Pipeline />
      <SupportModel />
      <WhyMatters onOpenModal={() => setIsPartnerModalOpen(true)} />
      <FinalCTA onOpenModal={() => setIsPartnerModalOpen(true)} />
      <Footer />
      
      <PartnerModal 
        isOpen={isPartnerModalOpen} 
        onClose={() => setIsPartnerModalOpen(false)} 
      />
    </div>
  );
}
