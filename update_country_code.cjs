const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Update state
content = content.replace(
  'const [formData, setFormData] = useState({ name: "", org: "", email: "", whatsapp: "", message: "" });',
  'const [formData, setFormData] = useState({ name: "", org: "", email: "", whatsapp: "", phoneCode: "+91", message: "" });'
);

// Update inquiryPayload to include both
content = content.replace(
  /whatsapp: formData.whatsapp,/,
  'whatsapp: formData.phoneCode + " " + formData.whatsapp,'
);

// Update input to include the select
const targetInput = `<input type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full px-6 py-4 bg-brand-cream/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-pink/50 transition-all font-medium border border-transparent" placeholder="+1..." />`;

const replacementInput = `<div className="flex gap-2">
  <select
    className="w-[100px] px-4 py-4 bg-brand-cream/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-pink/50 transition-all font-medium border border-transparent appearance-none cursor-pointer"
    value={formData.phoneCode || "+91"}
    onChange={e => setFormData({...formData, phoneCode: e.target.value})}
  >
    <option value="+91">+91 (IN)</option>
    <option value="+971">+971 (AE)</option>
    <option value="+66">+66 (TH)</option>
    <option value="+34">+34 (ES)</option>
    <option value="+1">+1 (US)</option>
    <option value="+44">+44 (UK)</option>
    <option value="+61">+61 (AU)</option>
  </select>
  <input 
    type="tel" 
    value={formData.whatsapp} 
    onChange={e => setFormData({...formData, whatsapp: e.target.value})} 
    className="flex-1 px-6 py-4 bg-brand-cream/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-pink/50 transition-all font-medium border border-transparent" 
    placeholder="1234567890" 
  />
</div>`;

content = content.replace(targetInput, replacementInput);

fs.writeFileSync('src/App.tsx', content);
console.log('Country code dropdown added successfully');
