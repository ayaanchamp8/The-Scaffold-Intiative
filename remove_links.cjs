const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace standard # links
text = text.replace(/<a href="#" className="hover:text-brand-rose transition-colors">/g, '<span className="text-brand-charcoal">');
text = text.replace(/<\/a><\/li>/g, '</span></li>');

// Social links list
text = text.replace(/\{\['LinkedIn', 'Instagram', 'Twitter'\].map\(social => \(\n\s*<a key=\{social\} href="#" className="text-xs font-black tracking-widest uppercase text-brand-charcoal hover:text-brand-rose transition-colors">\n\s*\{social\}\n\s*<\/a>\n\s*\)\)}/g, `<a href="https://www.instagram.com/the.scaffold.initiative?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="text-xs font-black tracking-widest uppercase text-brand-charcoal hover:text-brand-cream transition-colors">
                  Instagram
                </a>`);

// Also Privacy policy / terms of service
text = text.replace(/<a href="#" className="hover:text-brand-rose transition-colors">Privacy Policy<\/a>/g, '');
text = text.replace(/<a href="#" className="hover:text-brand-rose transition-colors">Terms of Service<\/a>/g, '');

fs.writeFileSync('src/App.tsx', text);
