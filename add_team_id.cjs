const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf-8');
text = text.replace('<p className="font-bold text-brand-charcoal tracking-[0.1em] uppercase text-sm">The Scaffold Team</p>', '<p id="team" className="font-bold text-brand-charcoal tracking-[0.1em] uppercase text-sm scroll-mt-24">The Scaffold Team</p>');
fs.writeFileSync('src/App.tsx', text);
