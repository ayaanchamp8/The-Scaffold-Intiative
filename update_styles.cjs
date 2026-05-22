const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Colors replacement
content = content.replace(/bg-brand-plum/g, 'bg-brand-green');
content = content.replace(/bg-brand-rose/g, 'bg-brand-teal');
content = content.replace(/bg-brand-pink-light/g, 'bg-brand-teal/20');

// Text colors adjustment (because we used plum for dark backgrounds mostly, now we changed it to green, so text on it should be charcoal)
// text-brand-plum -> text-brand-charcoal
content = content.replace(/text-brand-plum/g, 'text-brand-charcoal');

// Change `text-white` inside buttons to `text-brand-charcoal` or `text-brand-cream`? 
// Well, sage green (#A8B987) with charcoal text looks better than white text.
content = content.replace(/text-white/g, 'text-brand-charcoal');

// Add black outlines to buttons and cards
// Replacing `border-brand-plum/10` with `border-brand-charcoal`
content = content.replace(/border-brand-plum\/[0-9]+/g, 'border-brand-charcoal border-opacity-20');
content = content.replace(/border-white\/[0-9]+/g, 'border-brand-charcoal border-opacity-20');

// Making things more rounded "organic rounded corners"
content = content.replace(/rounded-2xl/g, 'rounded-[2rem]');
content = content.replace(/rounded-xl/g, 'rounded-[1.5rem]');

// Also update the brand initials 'S' box text
content = content.replace(/text-brand-cream/g, 'text-brand-charcoal');

fs.writeFileSync('src/App.tsx', content);
console.log('Done replacing strings in App.tsx');
