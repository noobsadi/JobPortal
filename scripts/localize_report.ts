import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const reportPath = path.join(__dirname, '../DATABASE_REPORT.md');
let content = fs.readFileSync(reportPath, 'utf8');

console.log('📖 Read DATABASE_REPORT.md (' + content.length + ' bytes)');

// Update Date and Version
content = content.replace('**Date:** 2026-07-01', '**Date:** 2026-07-05 (Updated with Bangladeshi Localization)');
content = content.replace('**Last Updated:** 2026-07-01', '**Last Updated:** 2026-07-05 (Localized for Bangladesh)');

// Add bullet point under Key Business Features if not already present
if (!content.includes('**Localized for Bangladesh**')) {
  content = content.replace(
    '- **Multi-Company Support**: Employers can manage multiple companies and candidates',
    '- **Multi-Company Support**: Employers can manage multiple companies and candidates\n- **Localized for Bangladesh**: All database records, sample seeding data, seeker profiles, tech companies (e.g., Pathao, bKash, Brain Station 23), universities (e.g., BUET, Dhaka University), and locations (Dhaka, Chattogram, Sylhet) are tailored to authentic Bangladeshi identities and institutions.'
  );
}

// Add bullet point under Conclusion Key Business Capabilities if not already present
if (!content.includes('**Bangladeshi Localization**')) {
  content = content.replace(
    '✓ **Data Privacy** - Enforces role-based access control via RLS',
    '✓ **Data Privacy** - Enforces role-based access control via RLS  \n✓ **Bangladeshi Localization** - Fully customized with Bangladeshi seeker profiles, tech employers, educational institutions, and geographic locations'
  );
}

// Replacement pairs (Order matters: longer/specific phrases first!)
const replacements: [RegExp | string, string][] = [
  // Full Names (Case Sensitive & Uppercase)
  [/Alice Johnson/g, 'Tanvir Rahman'],
  [/ALICE JOHNSON/g, 'TANVIR RAHMAN'],
  [/Bob Smith/g, 'Sadia Begum'],
  [/BOB SMITH/g, 'SADIA BEGUM'],
  [/Charlie Brown/g, 'Rakib Ghosh'],
  [/CHARLIE BROWN/g, 'RAKIB GHOSH'],
  [/Grace Lee/g, 'Niloy Mukherjee'],
  [/GRACE LEE/g, 'NILOY MUKHERJEE'],
  [/Henry Wilson/g, 'Sakhawat Hosen'],
  [/HENRY WILSON/g, 'SAKHAWAT HOSEN'],
  [/Jack Davis/g, 'Mohammad Sakhawat'],
  [/JACK DAVIS/g, 'MOHAMMAD SAKHAWAT'],
  [/David Clark/g, 'Ashraful Chowdhury'],
  [/DAVID CLARK/g, 'ASHRAFUL CHOWDHURY'],
  [/Emma Taylor/g, 'Farhana Talukder'],
  [/EMMA TAYLOR/g, 'FARHANA TALUKDER'],
  [/Michael Brown/g, 'Zahidul Ali'],
  [/MICHAEL BROWN/g, 'ZAHIDUL ALI'],
  [/Sarah Williams/g, 'Jannatul Choudhury'],
  [/SARAH WILLIAMS/g, 'JANNATUL CHOUDHURY'],
  [/John Doe/g, 'Joy Siddique'],
  [/JOHN DOE/g, 'JOY SIDDIQUE'],
  [/Jane Doe/g, 'Mehedi Begum'],
  [/JANE DOE/g, 'MEHEDI BEGUM'],

  // Standalone First Names / Last Names
  [/\bAlice\b/g, 'Tanvir'],
  [/\bBob\b/g, 'Sadia'],
  [/\bCharlie\b/g, 'Rakib'],
  [/\bGrace\b/g, 'Niloy'],
  [/\bHenry\b/g, 'Sakhawat'],
  [/\bJack\b/g, 'Mohammad'],
  [/\bDiana\b/g, 'Nusrat'],
  [/\bEvan\b/g, 'Faysal'],
  [/\bFrank\b/g, 'Tukabbir'],
  [/\bIsla\b/g, 'Animesh'],
  [/\bDavid\b/g, 'Ashraful'],
  [/\bEmma\b/g, 'Farhana'],
  [/\bMichael\b/g, 'Zahidul'],
  [/\bSarah\b/g, 'Jannatul'],
  [/\bJohn\b/g, 'Joy'],
  [/\bJane\b/g, 'Mehedi'],
  [/\bJohnson\b/g, 'Rahman'],
  [/\bSmith\b/g, 'Begum'],
  [/\bBrown\b/g, 'Ghosh'],
  [/\bLee\b/g, 'Mukherjee'],
  [/\bWilson\b/g, 'Hosen'],
  [/\bDavis\b/g, 'Sakhawat'],
  [/\bClark\b/g, 'Chowdhury'],
  [/\bTaylor\b/g, 'Talukder'],
  [/\bWilliams\b/g, 'Choudhury'],
  [/\bDoe\b/g, 'Siddique'],

  // Lowercase & dotted names in emails / URLs
  [/alice\.johnson@/g, 'tanvir.rahman@'],
  [/bob\.smith@/g, 'sadia.begum@'],
  [/charlie\.brown@/g, 'rakib.ghosh@'],
  [/grace\.lee@/g, 'niloy.mukherjee@'],
  [/henry\.wilson@/g, 'sakhawat.hosen@'],
  [/jack\.davis@/g, 'mohammad.sakhawat@'],
  [/john\.doe@/g, 'joy.siddique@'],
  [/jane\.doe@/g, 'mehedi.begum@'],
  [/alice@/g, 'tanvir@'],
  [/bob@/g, 'sadia@'],
  [/charlie@/g, 'rakib@'],
  [/grace@/g, 'niloy@'],
  [/henry@/g, 'sakhawat@'],
  [/jack@/g, 'mohammad@'],
  [/diana@/g, 'nusrat@'],
  [/evan@/g, 'faysal@'],
  [/frank@/g, 'tukabbir@'],
  [/isla@/g, 'animesh@'],
  [/david@/g, 'ashraful@'],
  [/emma@/g, 'farhana@'],
  [/michael@/g, 'zahidul@'],
  [/sarah@/g, 'jannatul@'],
  [/john@/g, 'joy@'],
  [/jane@/g, 'mehedi@'],
  [/resume\.alice/g, 'resume.tanvir'],
  [/resume\.bob/g, 'resume.sadia'],
  [/resume\.charlie/g, 'resume.rakib'],
  [/resume\.grace/g, 'resume.niloy'],
  [/resume\.henry/g, 'resume.sakhawat'],
  [/resume\.jack/g, 'resume.mohammad'],
  [/github\.com\/alice/g, 'github.com/tanvir'],
  [/github\.com\/bob/g, 'github.com/sadia'],
  [/github\.com\/charlie/g, 'github.com/rakib'],
  [/github\.com\/henry/g, 'github.com/sakhawat'],
  [/github\.com\/jack/g, 'github.com/mohammad'],
  [/avatar\.alice/g, 'avatar.tanvir'],
  [/avatar\.bob/g, 'avatar.sadia'],
  [/avatar\.charlie/g, 'avatar.rakib'],
  [/avatar\.grace/g, 'avatar.niloy'],
  [/avatar\.henry/g, 'avatar.sakhawat'],
  [/avatar\.jack/g, 'avatar.mohammad'],

  // Companies
  [/TechCorp Industries/g, 'Pathao'],
  [/\bTechCorp\b/g, 'Pathao'],
  [/InnovateLabs/g, 'bKash'],
  [/DesignStudio/g, 'Brain Station 23'],
  [/DataViz Corp/g, 'TigerIT'],
  [/\bDataViz\b/g, 'TigerIT'],
  [/CloudStack/g, 'Enosis Solutions'],
  [/TechFlow Solutions/g, 'Nagad'],
  [/\bTechFlow\b/g, 'Nagad'],
  [/GreenEnergy Corp/g, 'Therap BD'],
  [/\bGreenEnergy\b/g, 'Therap BD'],
  [/Nexus Innovations/g, 'Optimizely BD'],
  [/\bNexus\b/g, 'Optimizely BD'],
  [/Acme Corp/g, 'Chaldal'],
  [/Acme Inc\./g, 'Chaldal'],
  [/\bAcme\b/g, 'Chaldal'],
  [/techcorp\.com/g, 'pathao.com'],
  [/innovatelabs\.com/g, 'bkash.com'],
  [/designstudio\.com/g, 'brainstation23.com'],
  [/dataviz\.com/g, 'tigerit.com'],
  [/cloudstack\.com/g, 'enosis.com'],
  [/logo\.techcorp\.com/g, 'logo.pathao.com'],
  [/logo\.innovatelabs\.com/g, 'logo.bkash.com'],
  [/logo\.designstudio\.com/g, 'logo.brainstation23.com'],
  [/logo\.dataviz\.com/g, 'logo.tigerit.com'],
  [/logo\.cloudstack\.com/g, 'logo.enosis.com'],

  // Locations / Cities
  [/San Francisco, CA/g, 'Dhaka, Bangladesh'],
  [/New York, NY/g, 'Banani, Dhaka'],
  [/Austin, TX/g, 'Chattogram, Bangladesh'],
  [/Seattle, WA/g, 'Gulshan, Dhaka'],
  [/Boston, MA/g, 'Sylhet, Bangladesh'],
  [/Denver, CO/g, 'Mirpur, Dhaka'],
  [/Chicago, IL/g, 'Uttara, Dhaka'],
  [/Los Angeles, CA/g, 'Khulna, Bangladesh'],
  [/Atlanta, GA/g, 'Rajshahi, Bangladesh'],
  [/\bSan Francisco\b/g, 'Dhaka'],
  [/\bNew York\b/g, 'Banani, Dhaka'],
  [/\bAustin\b/g, 'Chattogram'],
  [/\bSeattle\b/g, 'Gulshan, Dhaka'],
  [/\bBoston\b/g, 'Sylhet'],
  [/\bDenver\b/g, 'Mirpur, Dhaka'],
  [/\bChicago\b/g, 'Uttara, Dhaka'],
  [/\bLos Angeles\b/g, 'Khulna'],
  [/\bAtlanta\b/g, 'Rajshahi'],
  [/\bCA\b/g, 'BD'],
  [/\bNY\b/g, 'BD'],
  [/\bTX\b/g, 'BD'],
  [/\bWA\b/g, 'BD'],
  [/\bMA\b/g, 'BD'],
  [/\bCO\b/g, 'BD'],

  // Universities
  [/\bMIT\b/g, 'BUET'],
  [/Stanford University/g, 'Dhaka University'],
  [/\bStanford\b/g, 'Dhaka University'],
  [/Harvard University/g, 'BRAC University'],
  [/\bHarvard\b/g, 'BRAC University'],
  [/UC Berkeley/g, 'North South University'],
  [/\bBerkeley\b/g, 'NSU'],
  [/Carnegie Mellon/g, 'SUST']
];

for (const [target, replacement] of replacements) {
  content = content.replace(target, replacement);
}

fs.writeFileSync(reportPath, content, 'utf8');
console.log('✅ Successfully localized DATABASE_REPORT.md!');
