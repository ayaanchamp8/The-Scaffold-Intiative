const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf-8');

const partnerPageComponent = `
const PartnerPage = ({ onExit }: { onExit: () => void }) => {
  const [partnerType, setPartnerType] = useState<"none" | "school" | "volunteer" | "donate" | "help">("none");

  // Reusing the inquiry form logic but categorized
  const [formData, setFormData] = useState({ name: "", org: "", email: "", whatsapp: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    try {
      const inquiryPayload = {
        name: formData.name,
        org: formData.org || "",
        email: formData.email,
        whatsapp: formData.whatsapp,
        message: formData.message,
        type: partnerType,
        status: "new",
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'inquiries'), inquiryPayload);
      setStatus("success");
      setTimeout(() => {
        setPartnerType("none");
        setStatus("idle");
        setFormData({ name: "", org: "", email: "", whatsapp: "", message: "" });
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
    <div className="min-h-screen bg-brand-cream py-20 px-6">
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
                  <div className="w-20 h-20 bg-brand-teal/20 text-brand-teal rounded-full flex items-center justify-center mx-auto mb-6">
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
                      <input type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full px-6 py-4 bg-brand-cream/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-pink/50 transition-all font-medium border border-transparent" placeholder="+1..." />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-brand-charcoal/50 mb-2 px-4">
                      {partnerType === "donate" ? "Message or Amount Intent" : "How can we collaborate?"}
                    </label>
                    <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full px-6 py-4 bg-brand-cream/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-pink/50 transition-all font-medium border border-transparent resize-none h-32" placeholder="Tell us a bit more..."></textarea>
                  </div>
                  <button type="submit" disabled={status === "loading"} className="w-full py-5 bg-brand-pink text-brand-charcoal rounded-full font-bold uppercase tracking-widest text-sm hover:bg-brand-teal transition-all flex justify-center items-center gap-3">
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
`

// Insert PartnerPage before export default function App()
text = text.replace('export default function App() {', partnerPageComponent + '\nexport default function App() {');

// Change view logic
text = text.replace(/const \[view, setView\] = useState<"landing" \\| "admin">\\("landing"\\);/g, 'const [view, setView] = useState<"landing" | "admin" | "partner">("landing");');

text = text.replace(`if (window.location.pathname === "/admin") {
        setView("admin");
      } else {
        setView("landing");
      }`, `if (window.location.pathname === "/admin") {
        setView("admin");
      } else if (window.location.pathname === "/partner") {
        setView("partner");
      } else {
        setView("landing");
      }`);

// Return partner page
text = text.replace('if (view === "admin") {', `if (view === "partner") {
    return <PartnerPage onExit={() => {
      window.history.pushState({}, "", "/");
      setView("landing");
    }} />;
  }

  if (view === "admin") {`);


// Updating Navbar usages
text = text.replace(/onOpenModal/g, 'onViewPartner');

fs.writeFileSync('src/App.tsx', text);
