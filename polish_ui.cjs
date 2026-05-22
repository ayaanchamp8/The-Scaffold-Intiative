const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// The scaffold grid doesn't need to be gray, it needs to be black
// Wait, I updated index.css for that.

// Make sure buttons with bg-brand-green or bg-brand-teal or bg-brand-pink have black text
// They already do from previous replacements.

// Find remaining brand-plum text
if (content.includes('brand-plum')) {
  console.log('Still has brand-plum');
  content = content.replace(/brand-plum/g, 'brand-charcoal');
}

// Remove glass effect from other elements
// e.g. backdrop-blur-sm, backdrop-blur-md, etc.
content = content.replace(/backdrop-blur-(sm|md|lg|xl)/g, '');

// Give inputs a strong border
content = content.replace(/border-brand-charcoal border-2 focus/g, 'border-2 border-brand-charcoal focus');

fs.writeFileSync('src/App.tsx', content);
console.log('Final polish on App.tsx');
