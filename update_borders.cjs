const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Make borders solid and thick
content = content.replace(/border-brand-charcoal border-opacity-20/g, 'border-brand-charcoal border-2');

// Text adjustments
content = content.replace(/text-brand-charcoal\/50/g, 'text-brand-charcoal/70');
content = content.replace(/text-brand-charcoal\/40/g, 'text-brand-charcoal/70');
content = content.replace(/text-brand-charcoal\/30/g, 'text-brand-charcoal/70');

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed borders in App.tsx');
