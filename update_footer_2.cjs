const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  '<ul className="space-y-5 text-sm font-bold text-brand-charcoal tracking-tight">\\n             <li><span className="text-brand-charcoal">Partner with us</span></li>\\n             <li><span className="text-brand-charcoal">Volunteer network</span></li>\\n             <li><span className="text-brand-charcoal">School outreach</span></li>\\n             <li><span className="text-brand-charcoal">Emergency support</span></li>\\n          </ul>',
  `<ul className="space-y-5 text-sm font-bold text-brand-charcoal tracking-tight">
             <li><button onClick={() => (window as any).navigate('partner')} className="hover:text-brand-pink transition-colors">Partner with us</button></li>
             <li><button onClick={() => (window as any).navigate('partner')} className="hover:text-brand-pink transition-colors">Volunteer network</button></li>
             <li><button onClick={() => (window as any).navigate('about')} className="hover:text-brand-pink transition-colors">School outreach</button></li>
             <li><button onClick={() => (window as any).navigate('partner')} className="hover:text-brand-pink transition-colors">Emergency support</button></li>
          </ul>`
);

code = code.replace(
  '<ul className="space-y-5 text-sm font-bold text-brand-charcoal tracking-tight">\\n             <li><span className="text-brand-charcoal">Impact roadmap</span></li>\\n             <li><span className="text-brand-charcoal">Leadership</span></li>\\n             <li><span className="text-brand-charcoal">Contact center</span></li>\\n          </ul>',
  `<ul className="space-y-5 text-sm font-bold text-brand-charcoal tracking-tight">
             <li><button onClick={() => (window as any).navigate('impact')} className="hover:text-brand-pink transition-colors">Impact roadmap</button></li>
             <li><button onClick={() => (window as any).navigate('team')} className="hover:text-brand-pink transition-colors">Leadership</button></li>
             <li><button onClick={() => (window as any).navigate('partner')} className="hover:text-brand-pink transition-colors">Contact center</button></li>
          </ul>`
);

fs.writeFileSync('src/App.tsx', code);
