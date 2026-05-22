const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Fix the overlays to be opaque but with opacity value
content = content.replace(/className="absolute inset-0 bg-brand-charcoal " /g, 'className="absolute inset-0 bg-brand-charcoal/40" ');
content = content.replace(/className="fixed inset-0 z-\[100\] flex items-center justify-center p-6 bg-brand-charcoal "/g, 'className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-charcoal/40"');

// Fix buttons that turn black on hover so their text turns white
content = content.replace(/hover:bg-brand-charcoal/g, 'hover:bg-brand-charcoal hover:text-white');

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed hovers and overlays');
