const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace large glossy drop shadows with flat aesthetic or small shadow
content = content.replace(/shadow-2xl/g, 'shadow-sm');
content = content.replace(/shadow-xl/g, 'shadow-sm');
content = content.replace(/shadow-lg/g, 'shadow-sm');
content = content.replace(/shadow-md/g, 'shadow-sm');
content = content.replace(/shadow-inner/g, ''); // removes inner depths

fs.writeFileSync('src/App.tsx', content);
console.log('Simplified shadows to be modern and flat');
