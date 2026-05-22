const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace border opacities with solid color, EXCEPT if they are white/something
content = content.replace(/border-brand-charcoal\/[0-9]+/g, 'border-brand-charcoal');
content = content.replace(/text-brand-charcoal\/[0-9]+/g, 'text-brand-charcoal'); // make text crisp
content = content.replace(/bg-brand-charcoal\/[0-9]+/g, 'bg-brand-charcoal'); // overlays

// A modal overlay was `bg-brand-charcoal/40`, if I just made it solid it's opaque.
// Let's restore the modal backdrop overlay manually!
// `absolute inset-0 bg-brand-charcoal backdrop-blur-sm`
// But wait, my script removed backdrop-blur. 
// For modal overly, let's keep it bg-brand-charcoal/40.
content = content.replace(/className="absolute inset-0 bg-brand-charcoal"/g, 'className="absolute inset-0 bg-brand-charcoal/40"');
content = content.replace(/className="fixed inset-0 z-\[100\] flex items-center justify-center p-6 bg-brand-charcoal"/g, 'className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-charcoal/40"');

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed opacities in App.tsx');
