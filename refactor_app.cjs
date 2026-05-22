const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Update imports
if (!code.includes('PieChart')) {
  code = code.replace(
    'import { motion, AnimatePresence } from "motion/react";',
    'import { motion, AnimatePresence } from "motion/react";\nimport { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";'
  );
}
if (!code.includes('Download,')) {
    code = code.replace('ExternalLink,', 'ExternalLink,\n  Download,');
}

// 2. Adjust Navbar to use navigate instead of anchor links
const newNavbar = `
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
          className="px-6 py-2.5 bg-brand-pink text-brand-charcoal rounded-full text-xs font-bold uppercase tracking-wider hover:bg-brand-teal hover:text-brand-charcoal hover:shadow-md transition-all hover:scale-105 cursor-pointer"
        >
          Partner With Us
        </button>
      </div>
    </div>
  </nav>
);
`;
code = code.replace(/const Navbar = \(\{.*?\) => \([\s\S]*?<\/nav>\n\);\n/m, newNavbar);

// 3. Update Hero buttons
code = code.replace(/<a href="#impact" className="px-8/g, '<button onClick={() => (window as any).navigate(\'impact\')} className="px-8');
code = code.replace(/<\/a>\n\s*<button \n\s*onClick=\{onViewPartner}/g, '</button>\n            <button \n              onClick={() => (window as any).navigate(\'partner\')}');

// Add "Dashboard" feature to AdminPortal
const dashboardTab = `
              { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'all', label: 'All Inquiries', icon: <MessageSquare className="w-4 h-4" /> },
`;
code = code.replace(/\{ id: 'all', label: 'All Inquiries'.*?\},\n/g, dashboardTab);

// Re-write activeTab state
code = code.replace('const [activeTab, setActiveTab] = useState<"inquiries" | "staff">("inquiries");', 'const [activeTab, setActiveTab] = useState<"inquiries" | "staff" | "dashboard">("dashboard");');

// Add CSV Export logic to AdminPortal
const exportLogic = `
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Name,Email,WhatsApp,Type,Organization,Status,Message\\n";
    inquiries.forEach(row => {
      const msg = row.message ? row.message.replace(/\\"/g, '""').replace(/\\n/g, ' ') : "";
      csvContent += \`"\${row.createdAt}","\${row.name}","\${row.email}","\${row.whatsapp || ''}","\${row.type || ''}","\${row.org || ''}","\${row.status || ''}","\${msg}"\\n\`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inquiries_export.csv");
    document.body.appendChild(link);
    link.click();
  };
`;
code = code.replace('const handleDelete = async', exportLogic + '\n  const handleDelete = async');

// Add pie-chart data to AdminPortal rendering section before return
const dashboardDataCalc = `
  const dashboardStats = useMemo(() => {
    const types: Record<string, number> = {};
    inquiries.forEach(i => {
      const type = i.type || 'Other';
      types[type] = (types[type] || 0) + 1;
    });
    return Object.keys(types).map(k => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: types[k] }));
  }, [inquiries]);

  const COLORS = ['#F06292', '#80CBC4', '#A5D6A7', '#FFCC80', '#90CAF9'];
`;
code = code.replace('if (!user) {', dashboardDataCalc + '\n  if (!user) {');

// Render Dashboard View inside AdminPortal
const dashboardView = `
        {activeTab === "dashboard" ? (
          <>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-display tracking-tighter text-brand-charcoal">Dashboard</h2>
                <p className="text-brand-charcoal font-medium mt-2">Overview of network and inquiries.</p>
              </div>
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-6 py-3 bg-brand-pink text-brand-charcoal font-bold uppercase tracking-widest text-xs rounded-full hover:bg-brand-teal transition-all shadow-sm"
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
                 <p className="text-4xl font-display text-brand-teal">{inquiries.filter(i => i.status === 'contacted').length}</p>
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
                              <Cell key={\`cell-\${index}\`} fill={COLORS[index % COLORS.length]} />
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
                   <button onClick={() => {setActiveTab('inquiries'); setFilter('new');}} className="px-6 py-4 bg-white rounded-full text-sm font-bold text-left hover:bg-brand-teal transition-all">Review New Inquiries ({inquiries.filter(i => i.status === 'new').length})</button>
                   {userRole === 'admin' && (
                     <button onClick={() => setActiveTab('staff')} className="px-6 py-4 bg-white rounded-full text-sm font-bold text-left hover:bg-brand-teal transition-all">Manage Staff</button>
                   )}
                 </div>
               </div>
            </div>
          </>
        ) : activeTab === "inquiries" ? (
`;

code = code.replace(/\{activeTab === "inquiries" \? \(/g, dashboardView);

// 4. Update the router in App
const appRouter = `
export default function App() {
  const [view, setView] = useState("home");

  useEffect(() => {
    const checkPath = () => {
      const path = window.location.pathname.replace(/^\\//, '') || 'home';
      setView(path);
    };

    checkPath();
    window.addEventListener("popstate", checkPath);
    
    (window as any).navigate = (path: string) => {
      window.history.pushState({}, "", path === 'home' ? '/' : \`/\${path}\`);
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
    <div className="bg-brand-white selection:bg-brand-teal selection:text-brand-charcoal font-sans min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col">
        {view === "home" && (
          <>
            <Hero onViewPartner={() => (window as any).navigate('partner')} />
            <About />
            <GlobalReach />
            <Pipeline />
            <FinalCTA onViewPartner={() => (window as any).navigate('partner')} />
          </>
        )}
        {view === "about" && (
          <>
            <div className="pt-20"> {/* Spacer for navbar */}
              <About />
              <GlobalReach />
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
`;

// Remove the old Hero onViewPartner params where they exist inside those components
code = code.replace(/const Hero = \(\{ onViewPartner \}: \{ onViewPartner: \(\) => void \}\) => \(/g, 'const Hero = ({ onViewPartner }: { onViewPartner: () => void }) => (');

// Strip out current export default function App
code = code.substring(0, code.indexOf('export default function App() {')) + appRouter;

// We need to fix FinalCTA onViewPartner params
code = code.replace(/const FinalCTA = \(\{ onViewPartner \}: \{ onViewPartner: \(\) => void \}\) => \(/g, 'const FinalCTA = ({ onViewPartner }: { onViewPartner: () => void }) => (');

fs.writeFileSync('src/App.tsx', code);
console.log('App successfully refactored');
