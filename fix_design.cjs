const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Remove black outlines completely to match modern look
content = content.replace(/border-brand-charcoal border-2 border-2/g, '');
content = content.replace(/border border-brand-charcoal border-2/g, '');
content = content.replace(/border-brand-charcoal border-2/g, '');
content = content.replace(/border-brand-charcoal/g, 'border-brand-charcoal/10');

// 2. Primary: Pink, Secondary: Teal, Tertiary: Green
// Currently buttons are green `bg-brand-green` 
content = content.replace(/bg-brand-green/g, 'bg-brand-pink');
content = content.replace(/bg-brand-teal\/20\/30/g, 'bg-brand-teal/20');
content = content.replace(/bg-brand-teal\/20\/50/g, 'bg-brand-teal/20');
// The teal overlay for some buttons or hover
content = content.replace(/hover:bg-brand-charcoal hover:text-white/g, 'hover:bg-brand-teal hover:text-brand-charcoal hover:shadow-md');
content = content.replace(/hover:bg-brand-charcoal transition-all/g, 'hover:bg-brand-teal transition-all hover:shadow-md');

// Also update index.css variables? App.tsx first.

fs.writeFileSync('src/App.tsx', content);
console.log('Design updated in App.tsx');
