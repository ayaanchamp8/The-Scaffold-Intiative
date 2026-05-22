const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Hero
code = code.replace(
  '<section className="relative min-h-[90vh] pt-32 pb-20 overflow-hidden flex flex-col justify-center scaffold-grid bg-brand-cream">',
  '<section className="relative min-h-[90vh] pt-32 pb-20 overflow-hidden flex flex-col justify-center scaffold-grid bg-brand-blue/10">'
);

// About
code = code.replace(
  '<section id="about" className="py-32 bg-brand-cream overflow-hidden">',
  '<section id="about" className="py-32 bg-brand-mint/20 overflow-hidden">'
);

// Pipeline
code = code.replace(
  '<section className="py-32 bg-brand-cream relative overflow-hidden">',
  '<section className="py-32 bg-brand-teal/10 relative overflow-hidden">'
);

// FinalCTA
code = code.replace(
  '<section className="py-40 bg-brand-cream relative overflow-hidden text-center border-t ">',
  '<section className="py-40 bg-brand-blue/20 relative overflow-hidden text-center border-t border-brand-blue/30">'
);

// TeamPage
code = code.replace(
  '<div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 scaffold-grid bg-brand-cream">',
  '<div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 scaffold-grid bg-brand-blue/10">'
);

// PartnerPage Wrapper
code = code.replace(
  '<div className="min-h-screen bg-brand-cream py-20 px-6">',
  '<div className="min-h-screen bg-brand-mint/20 py-20 px-6">'
);

fs.writeFileSync('src/App.tsx', code);
console.log('Colors injected');
