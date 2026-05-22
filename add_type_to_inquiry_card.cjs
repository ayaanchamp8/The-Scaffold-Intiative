const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf-8');

text = text.replace(/<div className="flex items-center gap-2 text-sm font-bold text-brand-charcoal">\n\s*<Building className="w-4 h-4 text-brand-pink" \/> \{inquiry.org \|\| "Independent Individual"\}\n\s*<\/div>/g, 
`<div className="flex flex-col gap-1">
   {inquiry.type && (
     <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-teal mb-1">
        Type: {inquiry.type}
     </div>
   )}
   <div className="flex items-center gap-2 text-sm font-bold text-brand-charcoal">
     <Building className="w-4 h-4 text-brand-pink" /> {inquiry.org || "Independent Individual"}
   </div>
</div>`);

fs.writeFileSync('src/App.tsx', text);
