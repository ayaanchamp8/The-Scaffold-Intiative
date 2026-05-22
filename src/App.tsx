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
  Instagram
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
          className="w-full max-w-md bg-white p-12 rounded-[3.5rem] shadow-sm text-center  relative overflow-hidden"
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
              <span className="px-4 bg-white text-brand-charcoal font-bold uppercase tracking-widest">or</span>
            </div>
          </div>

          <button 
            type="button"
            disabled={isSigningIn}
            onClick={handleGoogleSignIn}
            className="w-full py-5 bg-white border-2  text-brand-charcoal rounded-[2rem] font-bold text-sm flex items-center justify-center gap-4 hover:bg-brand-cream hover: transition-all shadow-sm cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="w-full max-w-lg bg-white p-12 md:p-16 rounded-[4rem] shadow-sm text-center "
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
    <div className="min-h-screen bg-[#fcf9f8] text-brand-charcoal font-sans flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-brand-blue/20 text-brand-charcoal p-8 md:min-h-screen flex flex-col border-r ">
        <div className="flex items-center gap-3 mb-16">
          <div className="w-10 h-10 bg-brand-cream rounded-[1.5rem] flex items-center justify-center font-display font-black text-xl text-brand-charcoal">S</div>
          <div>
            <h1 className="font-display font-black text-lg tracking-tight uppercase leading-none">Scaffold</h1>
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
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-[2rem] text-sm font-bold transition-all ${activeTab === "inquiries" && filter === item.id ? 'bg-brand-pink text-brand-charcoal' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}
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
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-[2rem] text-sm font-bold transition-all ${activeTab === "staff" ? 'bg-brand-pink text-brand-charcoal' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}
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
              className="w-full flex items-center justify-center gap-2 py-4 bg-white/5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer"
            >
              <Info className="w-4 h-4" /> Role Permissions
            </button>
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-4 bg-white/5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 hover:text-red-400 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
            <button 
              onClick={onExit}
              className="w-full flex items-center justify-center gap-2 py-4 bg-white/5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-brand-pink transition-all text-brand-charcoal cursor-pointer"
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
              className="w-full max-w-2xl bg-white rounded-[3rem] shadow-sm relative overflow-hidden flex flex-col max-h-[80vh]"
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
              <div className="bg-white p-6 rounded-3xl shadow-sm">
                 <p className="text-[10px] font-black uppercase text-brand-charcoal/50 tracking-widest mb-2">Total Inquiries</p>
                 <p className="text-4xl font-display text-brand-charcoal">{inquiries.length}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm">
                 <p className="text-[10px] font-black uppercase text-brand-charcoal/50 tracking-widest mb-2">New</p>
                 <p className="text-4xl font-display text-brand-pink">{inquiries.filter(i => i.status === 'new').length}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm">
                 <p className="text-[10px] font-black uppercase text-brand-charcoal/50 tracking-widest mb-2">Contacted</p>
                 <p className="text-4xl font-display text-brand-green">{inquiries.filter(i => i.status === 'contacted').length}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm">
                 <p className="text-[10px] font-black uppercase text-brand-charcoal/50 tracking-widest mb-2">Staff Members</p>
                 <p className="text-4xl font-display text-brand-green">{staff.length || 1}</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
               <div className="bg-white p-8 rounded-[2.5rem] shadow-sm">
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
                 <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center mb-6">
                    <Zap className="w-8 h-8 text-brand-pink" />
                 </div>
                 <h3 className="text-3xl font-display tracking-tight mb-4">Quick Actions</h3>
                 <p className="font-medium text-sm mb-8 opacity-80">Navigate directly to the management sections or handle pending items.</p>
                 <div className="flex flex-col gap-3">
                   <button onClick={() => {setActiveTab('inquiries'); setFilter('new');}} className="px-6 py-4 bg-white rounded-full text-sm font-bold text-left hover:bg-brand-blue transition-all">Review New Inquiries ({inquiries.filter(i => i.status === 'new').length})</button>
                   {userRole === 'admin' && (
                     <button onClick={() => setActiveTab('staff')} className="px-6 py-4 bg-white rounded-full text-sm font-bold text-left hover:bg-brand-blue transition-all">Manage Staff</button>
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
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-2 rounded-[2rem] shadow-sm ">
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
                      className="bg-white p-8 rounded-[2.5rem] shadow-sm  group hover:border-brand-pink/30 hover:shadow-sm transition-all"
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
                              className="flex-grow lg:flex-none py-4 bg-white  text-brand-charcoal rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all cursor-pointer"
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
                    <div key={member.id} className="bg-white p-8 rounded-[2.5rem]  flex items-center justify-between group hover:shadow-sm transition-all">
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

              <div className="bg-white p-12 rounded-[3.5rem] shadow-sm  h-fit sticky top-12">
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
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="w-8 h-8 bg-brand-pink rounded-lg flex items-center justify-center font-bold text-brand-charcoal group-hover:scale-110 transition-transform">S</div>
          <span className="font-bold text-xl tracking-tight text-brand-charcoal uppercase letter-spacing-[-0.5px] hidden sm:block">The Scaffold Initiative</span>
        </button>
      </div>
      <div className="hidden md:flex items-center gap-8 text-brand-charcoal">
        <button onClick={() => (window as any).navigate('about')} className="text-sm font-semibold hover:text-brand-pink transition-colors cursor-pointer">About</button>
        <button onClick={() => (window as any).navigate('impact')} className="text-sm font-semibold hover:text-brand-pink transition-colors cursor-pointer">Impact</button>
        <button onClick={() => (window as any).navigate('model')} className="text-sm font-semibold hover:text-brand-pink transition-colors cursor-pointer">Model</button>
        <button onClick={() => (window as any).navigate('team')} className="text-sm font-semibold hover:text-brand-pink transition-colors cursor-pointer">Core Team</button>
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
          className="px-6 py-2.5 bg-brand-pink text-brand-charcoal rounded-full text-xs font-bold uppercase tracking-wider hover:bg-brand-blue hover:text-brand-charcoal hover:shadow-md transition-all hover:scale-105 cursor-pointer"
        >
          Partner With Us
        </button>
      </div>
    </div>
  </nav>
);

const Hero = ({ onViewPartner }: { onViewPartner: () => void }) => (
  <section className="relative min-h-[90vh] pt-32 pb-20 overflow-hidden flex flex-col justify-center scaffold-grid bg-brand-blue/10">
    {/* Decorative Elements */}
    <div className="absolute top-1/4 -right-20 w-96 h-96 bg-brand-pink opacity-10 blur-3xl rounded-full" />
    <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-brand-blue opacity-20 blur-3xl rounded-full" />
    <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-brand-green opacity-20 blur-3xl rounded-full" />
    
    <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
      <div className="max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1.5 bg-brand-blue text-brand-charcoal text-[10px] font-black tracking-[0.2em] uppercase rounded-full mb-8 shadow-sm">
            EST. FEB 2026
          </span>
          <h1 className="text-5xl md:text-7xl mb-8 leading-[1.1] text-brand-charcoal max-w-3xl tracking-tighter">
            Redefining inclusion 
            <span className="block italic mt-2 opacity-90 font-display">for neurodivergent students</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-charcoal mb-10 leading-relaxed max-w-2xl font-medium">
            Bridging the gap between diagnosis and support in Tier 2 and Tier 3 regions across India, Thailand, Spain, and the UAE. Providing structure and care where students need it most.
          </p>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => (window as any).navigate('impact')} className="px-8 py-4 bg-brand-pink text-brand-charcoal rounded-full text-sm font-bold uppercase tracking-wider hover:bg-brand-blue hover:text-brand-charcoal hover:shadow-md transition-all flex items-center gap-3 group shadow-sm shadow-brand-charcoal/10">
              View Impact <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => (window as any).navigate('partner')}
              className="px-8 py-4 border border-brand-charcoal/10 text-brand-charcoal rounded-full text-sm font-bold uppercase tracking-wider hover:bg-brand-pink hover:text-brand-charcoal transition-all cursor-pointer"
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
        className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 border-y  py-12"
      >
        {[
          { label: "Countries Active", value: "4" },
          { label: "Vetted Volunteers", value: "35+" },
          { label: "Passive Reach", value: "15,000+" },
          { label: "School Partnerships", value: "15+" }
        ].map((stat, i) => (
          <div key={i}>
            <p className="text-4xl md:text-5xl font-display font-bold text-brand-pink mb-2">{stat.value}</p>
            <p className="text-[11px] font-bold text-brand-charcoal uppercase tracking-[1px]">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

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
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-brand-pink mb-4 block">The Mission</span>
            <h2 className="text-4xl md:text-6xl mb-10 relative z-10 leading-tight tracking-tighter">Empowering students through academic and social inclusion.</h2>
            <p className="text-lg text-brand-charcoal mb-8 leading-relaxed font-medium">
              Launched in February 2026, The Scaffold Initiative is a youth-led organization born from a critical observation: the "diagnostic cliff" between receiving a diagnosis and receiving actual support.
            </p>
            <p className="text-lg text-brand-charcoal mb-12 leading-relaxed font-medium">
              We focus on academic inclusion for neurodivergent students in underserved Tier 2 and Tier 3 regions, ensuring that mental well-being is never an afterthought in the classroom.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-white rounded-3xl shadow-sm ">
                <Users className="w-10 h-10 text-brand-pink mb-6" />
                <h4 className="font-bold text-xl mb-3">Youth-Led Advocacy</h4>
                <p className="text-brand-charcoal leading-relaxed text-sm">Built and driven by those who understand the modern educational landscape from the inside.</p>
              </div>
              <div className="p-8 bg-white rounded-3xl shadow-sm ">
                <Heart className="w-10 h-10 text-brand-pink mb-6" />
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
                  <div className="w-12 h-px bg-brand-pink mb-2" />
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

const Timeline = () => (
  <section className="py-32 bg-brand-blue/10 relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="text-center mb-20">
        <span className="text-[11px] font-black tracking-[0.2em] uppercase text-brand-pink mb-4 block">Proven Scalability</span>
        <h2 className="text-5xl md:text-6xl mb-8 tracking-tighter font-display text-brand-charcoal">The Timeline of Growth</h2>
        <p className="max-w-2xl mx-auto text-brand-charcoal text-lg font-medium">From concept to active operations, driving neurodivergent inclusion regionally.</p>
      </div>

      <div className="bg-brand-green/20 text-brand-charcoal p-12 md:p-20 rounded-[4rem] relative shadow-sm">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h3 className="text-4xl md:text-5xl mb-12 font-display text-brand-charcoal">Impact Mapping</h3>
            <div className="space-y-12">
              {[
                { date: "Feb 1, 2026", task: "Initiative Launch & Global Identity Reveal" },
                { date: "Feb 15, 2026", task: "Secured 15+ School Partnerships" },
                { date: "Feb 28, 2026", task: "Volunteer Network Expanded to 4 Hubs" },
                { date: "March 2026", task: "Commenced 90-Day Impact Pipeline Planning" }
              ].map((m, i) => (
                <div key={i} className="flex gap-6">
                  <div className="w-px h-full bg-brand-charcoal/10 mt-2 relative">
                    <div className="absolute top-0 -left-1.5 w-3 h-3 rounded-full bg-brand-pink shadow-[0_0_10px_rgba(240,98,146,0.8)]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black tracking-[0.2em] uppercase text-brand-pink mb-2">{m.date}</h4>
                    <p className="text-lg font-bold">{m.task}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
             <div className="aspect-square bg-brand-blue/20 rounded-full flex items-center justify-center opacity-70 border border-brand-blue/30 mx-auto max-w-sm">
                <Globe className="w-1/2 h-1/2 text-brand-blue drop-shadow-md" />
             </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Pipeline = () => (
  <section className="py-32 bg-brand-blue/10 relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-20">
        <div className="max-w-2xl">
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-brand-pink mb-4 block">Future Outlook</span>
          <h2 className="text-5xl md:text-7xl mb-8 tracking-tighter font-display text-brand-charcoal">90-Day Impact Pipeline</h2>
          <p className="text-brand-charcoal leading-relaxed text-lg font-medium">
            Active scaling across North India, focused on high-engagement school environments and community diagnostic hubs.
          </p>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-7xl md:text-9xl font-display text-brand-charcoal leading-none tracking-tighter">2,000+</p>
          <p className="text-[11px] font-bold text-brand-charcoal uppercase tracking-[2px] mt-4">Projected Students Affected by July</p>
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
            className="bg-white p-12 rounded-[2rem] shadow-sm  group"
          >
            <div className="w-16 h-16 bg-brand-cream rounded-[2rem] flex items-center justify-center text-brand-pink mb-10  group-hover:bg-brand-pink group-hover:text-brand-charcoal transition-all duration-500">
              {item.icon}
            </div>
            <p className="text-brand-pink text-[12px] font-bold uppercase tracking-[1.5px] mb-4">{item.label}</p>
            <h3 className="text-2xl mb-6 font-display leading-tight tracking-tight text-brand-charcoal">{item.title}</h3>
            <p className="text-brand-charcoal leading-relaxed text-sm font-medium">{item.description}</p>
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
    <section id="model" className="py-32 bg-brand-mint/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <span className="text-[11px] font-bold tracking-[2px] uppercase text-brand-pink mb-4 block">Operational Framework</span>
          <h2 className="text-5xl md:text-6xl mb-8 tracking-tighter font-display text-brand-charcoal">A Holistic Support Model</h2>
          <p className="text-brand-charcoal max-w-2xl mx-auto text-lg font-medium">Bridging the gap between initial diagnosis and long-term academic success.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {models.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="p-10  rounded-3xl hover:bg-brand-cream transition-all cursor-default group"
            >
              <div className="flex gap-4 items-center mb-6">
                <div className="w-1.5 h-8 bg-brand-pink rounded-full group-hover:bg-brand-pink transition-all" />
                <h3 className="text-2xl font-display leading-tight tracking-tight text-brand-charcoal">{item.title}</h3>
              </div>
              <p className="text-sm text-brand-charcoal leading-relaxed font-medium">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const WhyMatters = ({ onViewPartner }: { onViewPartner: () => void }) => (
  <section className="py-32 bg-brand-blue text-brand-charcoal relative overflow-hidden border-t ">
    <div className="absolute inset-0 scaffold-grid opacity-5 pointer-events-none" />
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="grid lg:grid-cols-2 gap-24 items-center">
        <div>
          <span className="text-[11px] font-bold tracking-[3px] uppercase text-brand-charcoal mb-6 block">Systemic Advocacy</span>
          <h2 className="text-5xl md:text-7xl mb-10 leading-[1.1] font-display tracking-tighter">Confronting the Diagnostic Cliff</h2>
          <p className="text-xl text-brand-charcoal mb-12 leading-relaxed font-medium">
            In many underserved communities, "neurodivergence" is invisible. Stigma often replaces support.
          </p>
          <div className="space-y-10">
            <div className="flex gap-6">
               <div className="w-14 h-14 rounded-[2rem] bg-white/5 flex-shrink-0 flex items-center justify-center  group hover:bg-brand-pink transition-all">
                 <Zap className="w-7 h-7 text-brand-pink group-hover:text-brand-charcoal transition-colors" />
               </div>
               <div>
                 <h4 className="text-2xl mb-4 font-display tracking-tight">Invisible Barriers</h4>
                 <p className="text-sm text-brand-charcoal leading-relaxed font-medium">The lack of awareness often leads to neurodivergent students being labeled as "difficult" rather than supported, creating lifelong academic scars.</p>
               </div>
            </div>
            <div className="flex gap-6">
               <div className="w-14 h-14 rounded-[2rem] bg-white/5 flex-shrink-0 flex items-center justify-center  group hover:bg-brand-pink transition-all">
                 <Sparkles className="w-7 h-7 text-brand-pink group-hover:text-brand-charcoal transition-colors" />
               </div>
               <div>
                 <h4 className="text-2xl mb-4 font-display tracking-tight">Structural Scaffolding</h4>
                 <p className="text-sm text-brand-charcoal leading-relaxed font-medium">We focus on Tier 2 & 3 regions where stigma is highest, providing the tools that bridge the gap between classroom and care.</p>
               </div>
            </div>
          </div>
        </div>
        <div className="bg-white/5 p-16 rounded-[3rem]   relative">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
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
        <div>
          <h4 className="font-black mb-8 uppercase text-[10px] tracking-[0.3em] text-brand-cream">Organization</h4>
          <ul className="space-y-5 text-sm font-bold text-brand-cream tracking-tight">
             <li><button onClick={() => (window as any).navigate('impact')} className="hover:text-brand-cream transition-colors">Impact roadmap</button></li>
             <li><button onClick={() => (window as any).navigate('team')} className="hover:text-brand-cream transition-colors">Leadership</button></li>
             <li><button onClick={() => (window as any).navigate('partner')} className="hover:text-brand-cream transition-colors">Contact center</button></li>
          </ul>
        </div>
      </div>
      <div className="border-t  pt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-brand-cream">
        <p>© 2026 THE SCAFFOLD INITIATIVE.</p>
        <div className="flex gap-8 px-8 py-3  rounded-full items-center">
          <p>Global Advocacy</p>
          <div className="w-px h-3 bg-white/20" />
          <p>Youth-Led Project</p>
          <div className="w-px h-3 bg-white/20" />
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
  <section className="py-40 bg-brand-blue/20 relative overflow-hidden text-center border-t border-brand-blue/30">
     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-brand-pink opacity-[0.05] blur-3xl rounded-full" />
     <div className="max-w-5xl mx-auto px-6 relative z-10">
        <span className="text-[11px] font-bold tracking-[4px] uppercase text-brand-pink mb-8 block">Call to Action</span>
        <h2 className="text-6xl md:text-9xl mb-16 font-display leading-none tracking-tighter leading-[0.85] text-brand-charcoal">Will you help us build the next scaffold?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            "Partner With Us",
            "Support a Camp",
            "Bring Us to School",
            "Join Volunteers"
          ].map((text, i) => (
            <button 
              key={i} 
              onClick={onViewPartner}
              className="py-12 bg-white  rounded-3xl hover:shadow-sm hover:shadow-brand-pink/10 transition-all font-display font-medium text-xl text-brand-charcoal cursor-pointer group"
            >
              <span className="group-hover:scale-110 block transition-transform">{text}</span>
            </button>
          ))}
        </div>
     </div>
  </section>
);


const TeamPage = () => (
  <section className="min-h-[80vh] bg-brand-cream py-32 px-6 flex flex-col justify-center">
    <div className="max-w-7xl mx-auto text-center">
      <div className="text-center mb-16">
        <div className="w-24 h-24 bg-brand-pink/20 text-brand-pink rounded-[2rem] flex items-center justify-center mb-8 mx-auto shadow-sm">
          <Users className="w-12 h-12" />
        </div>
        <h1 className="text-5xl md:text-7xl font-display text-brand-charcoal mb-6 tracking-tighter">Meet The Team</h1>
        <p className="text-lg text-brand-charcoal max-w-2xl mx-auto font-medium mb-12">
          The core team details will be revealed shortly. Stay tuned!
        </p>
      </div>

      <div className="mb-20 py-20 bg-brand-blue/5 rounded-[2.5rem] border border-brand-blue/10 max-w-2xl mx-auto shadow-sm">
        <h2 className="text-3xl font-display text-brand-charcoal mb-4">Coming Soon</h2>
        <p className="text-brand-charcoal/70 font-medium">We are putting together an incredible global team.</p>
      </div>
      
      <div className="text-center">
        <button 
          onClick={() => (window as any).navigate('home')}
          className="px-8 py-4 bg-brand-charcoal text-brand-cream rounded-full text-sm font-bold uppercase tracking-wider hover:bg-brand-pink hover:text-brand-charcoal transition-all shadow-sm"
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
      className="p-8 bg-white rounded-3xl cursor-pointer hover:-translate-y-2 hover:shadow-xl hover:shadow-brand-pink/10 transition-all border border-brand-charcoal/10"
    >
      <div className="w-16 h-16 bg-brand-pink/20 rounded-2xl flex items-center justify-center text-brand-pink mb-6">
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
          className="flex items-center gap-2 text-brand-charcoal/50 hover:text-brand-pink transition-colors font-bold text-sm mb-12 uppercase tracking-wide"
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
              className="text-brand-pink font-bold text-sm mb-8 flex items-center gap-2 hover:underline"
            >
              <ChevronRight className="w-4 h-4 rotate-180" /> Choose another option
            </button>
            <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-brand-charcoal/10">
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
                      <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 bg-brand-cream/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-pink/50 transition-all font-medium border border-transparent" placeholder="Jane Doe" />
                    </div>
                    {partnerType === "school" && (
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-brand-charcoal/50 mb-2 px-4">School / Organization</label>
                        <input type="text" required value={formData.org} onChange={e => setFormData({...formData, org: e.target.value})} className="w-full px-6 py-4 bg-brand-cream/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-pink/50 transition-all font-medium border border-transparent" placeholder="Global Academy" />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-brand-charcoal/50 mb-2 px-4">Email Address</label>
                      <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-6 py-4 bg-brand-cream/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-pink/50 transition-all font-medium border border-transparent" placeholder="jane@example.com" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-brand-charcoal/50 mb-2 px-4">WhatsApp (Optional)</label>
                      <div className="flex gap-2">
    <input 
    type="text"
    list="country-codes"
    className="w-[110px] px-4 py-4 bg-brand-cream/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-pink/50 transition-all font-medium border border-transparent appearance-none cursor-text text-center whitespace-nowrap"
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
    value={formData.whatsapp} 
    onChange={e => setFormData({...formData, whatsapp: e.target.value})} 
    className="flex-1 px-6 py-4 bg-brand-cream/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-pink/50 transition-all font-medium border border-transparent" 
    placeholder="1234567890" 
  />
</div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-brand-charcoal/50 mb-2 px-4">
                      {partnerType === "donate" ? "Message or Amount Intent" : "How can we collaborate?"}
                    </label>
                    <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full px-6 py-4 bg-brand-cream/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-pink/50 transition-all font-medium border border-transparent resize-none h-32" placeholder="Tell us a bit more..."></textarea>
                  </div>
                  <button type="submit" disabled={status === "loading"} className="w-full py-5 bg-brand-pink text-brand-charcoal rounded-full font-bold uppercase tracking-widest text-sm hover:bg-brand-blue transition-all flex justify-center items-center gap-3">
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
    <div className="bg-brand-white selection:bg-brand-blue selection:text-brand-charcoal font-sans min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col">
        {view === "home" && (
          <>
            <Hero onViewPartner={() => (window as any).navigate('partner')} />
            <About />
            <Timeline />
            <Pipeline />
            <FinalCTA onViewPartner={() => (window as any).navigate('partner')} />
          </>
        )}
        {view === "about" && (
          <>
            <div className="pt-20"> {/* Spacer for navbar */}
              <About />
              <Timeline />
            </div>
            <FinalCTA onViewPartner={() => (window as any).navigate('partner')} />
          </>
        )}
        {view === "impact" && (
          <>
            <div className="pt-20">
              <WhyMatters onViewPartner={() => (window as any).navigate('partner')} />
              <Pipeline />
            </div>
          </>
        )}
        {view === "model" && (
          <>
            <div className="pt-20">
              <SupportModel />
            </div>
            <FinalCTA onViewPartner={() => (window as any).navigate('partner')} />
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
