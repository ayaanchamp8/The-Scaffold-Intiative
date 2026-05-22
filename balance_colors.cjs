const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Section changes
// WhyMatters to Teal
content = content.replace(
  '<section className="py-32 bg-brand-pink text-brand-charcoal relative overflow-hidden border-t ">',
  '<section className="py-32 bg-brand-teal text-brand-charcoal relative overflow-hidden border-t ">'
);

// Footer to Green
content = content.replace(
  '<footer className="py-24 bg-brand-pink text-brand-charcoal border-t ">',
  '<footer className="py-24 bg-brand-green text-brand-charcoal border-t ">'
);

// We had some text-brand-rose, let's fix that to text-black or brand-pink depending on what it is
content = content.replace(/text-brand-rose/g, 'text-brand-charcoal');

// Make the Admin Panel sidebar Teal? And Timeline Green?
content = content.replace(
  '<div className="bg-brand-pink text-brand-charcoal p-12 md:p-20 rounded-[4rem] relative overflow-hidden shadow-sm shadow-brand-charcoal/20">',
  '<div className="bg-brand-green text-brand-charcoal p-12 md:p-20 rounded-[4rem] relative overflow-hidden shadow-sm shadow-brand-charcoal/20">'
);

// In AdminPortal sidebar:
content = content.replace(
  '<div className="w-full md:w-80 bg-brand-pink text-brand-charcoal p-8 md:min-h-screen flex flex-col border-r ">',
  '<div className="w-full md:w-80 bg-brand-teal/20 text-brand-charcoal p-8 md:min-h-screen flex flex-col border-r ">'
);

// The active tab in admin Sidebar
// We have `bg-brand-pink text-brand-charcoal` for activeTab => leave as pink to match brand

// About section blobs and badges:
// Currently: block quote "Education shouldn't be a privilege..."
// Let's add an accent to the blob in About section
content = content.replace(
  '<div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal opacity-30 blur-3xl -mr-16 -mt-16" />',
  '<div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal opacity-30 blur-3xl -mr-16 -mt-16" />' // Already Teal
);

// Hero blobs
// <div className="absolute top-1/4 -right-20 w-96 h-96 bg-brand-pink opacity-10 blur-3xl rounded-full" />
// <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-brand-teal opacity-20 blur-3xl rounded-full" />
// No change.

// Partner Page: "Thank You" check circle color
content = content.replace(
  'bg-brand-teal/20 text-brand-teal',
  'bg-brand-green text-brand-charcoal'
);

// Also buttons on Partner page
// "bg-brand-pink text-brand-charcoal rounded-full font-bold uppercase tracking-widest text-sm hover:bg-brand-teal"
// Make the hover color for pink buttons be either teal or green
content = content.replace(/hover:bg-brand-teal/g, 'hover:bg-brand-teal'); // Fine, already teal

fs.writeFileSync('src/App.tsx', content);
console.log('Colors balanced across sections');
