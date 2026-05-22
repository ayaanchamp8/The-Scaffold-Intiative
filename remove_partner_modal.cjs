const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf-8');

// Remove PartnerModal component
// It's quite long, we can remove it by finding the start and end precisely.
const startIndex = text.indexOf('const PartnerModal');
const endString = '};\n\nconst AdminPortal';
const endIndex = text.indexOf(endString);

if (startIndex !== -1 && endIndex !== -1) {
  text = text.substring(0, startIndex) + text.substring(endIndex + endString.length - 'const AdminPortal'.length);
}

// Remove the `setIsPartnerModalOpen` stuff inside App component
text = text.replace(/const \[isPartnerModalOpen, setIsPartnerModalOpen\] = useState\(false\);\n/g, '');

text = text.replace(/<PartnerModal \n.*isOpen=\{isPartnerModalOpen\} \n.*onClose=\{\(\) => setIsPartnerModalOpen\(false\)\} \n.*\/>/g, '');

// Also change `<Navbar onViewPartner={() => setIsPartnerModalOpen(true)} />` etc, wait I had changed onOpenModal -> onViewPartner earlier.
text = text.replace(/onViewPartner=\{.*?setIsPartnerModalOpen.*?}/g, 'onViewPartner={() => { window.history.pushState({}, "", "/partner"); setView("partner"); }}');

fs.writeFileSync('src/App.tsx', text);
