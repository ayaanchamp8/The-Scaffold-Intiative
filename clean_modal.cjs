const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf-8');

const startIndex = text.indexOf('const PartnerModal =');
const adminPortalIndex = text.indexOf('// --- Admin Portal ---');

if (startIndex !== -1 && adminPortalIndex !== -1) {
    text = text.substring(0, startIndex) + text.substring(adminPortalIndex);
    fs.writeFileSync('src/App.tsx', text);
    console.log("Removed old PartnerModal");
}
