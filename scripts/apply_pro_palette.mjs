import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  'src/app/sessions/page.tsx',
  'src/app/bookings/page.tsx',
  'src/app/pos/page.tsx',
  'src/app/kitchen/page.tsx',
  'src/app/customers/page.tsx',
  'src/app/equipment/page.tsx',
  'src/app/staff/page.tsx',
  'src/app/reports/page.tsx',
  'src/app/settings/page.tsx',
  'src/app/portal/page.tsx'
];

const replacements = [
  // Backgrounds & Surfaces
  [/#111111/g, '#0A0E17'],
  [/#1E1E1E/g, '#121826'],
  [/#161616/g, '#161F32'],
  [/#2A2A2A/g, '#1F293D'],
  [/#2E2E2E/g, '#1F293D'],
  [/#333333/g, '#1F293D'],
  [/#252525/g, '#161F32'],
  [/#282828/g, '#161F32'],
  [/#202020/g, '#161F32'],
  [/#090b10/g, '#0A0E17'],
  [/#0e121c/g, '#121826'],
  [/#121622/g, '#161F32'],
  [/#181d2e/g, '#161F32'],
  [/#1f2538/g, '#1F293D'],
  [/#232b40/g, '#1F293D'],
  [/#07090e/g, '#0A0E17'],
  [/#0c0e14/g, '#0E1422'],
  [/#0f1422/g, '#121826'],
  [/#0b0d13/g, '#0A0E17'],
  [/#080a0f/g, '#0A0E17'],

  // Accents: Acid Yellow-Green (#CCFF00) -> Electric Cyan (#00D2FF)
  [/#CCFF00/g, '#00D2FF'],
  [/#ccff00/g, '#00D2FF'],
  [/#b8e600/g, '#00B4D8'],
  [/#B8E600/g, '#00B4D8'],

  // Secondary: Ultraviolet (#8A2BE2) -> Royal Indigo / Violet (#6366F1 / #8B5CF6)
  [/#8A2BE2/g, '#6366F1'],
  [/#8a2be2/g, '#6366F1'],
  [/#c084fc/g, '#818CF8'],
  [/#7822c9/g, '#4F46E5'],
  [/#7A20CE/g, '#4F46E5'],

  // Neon Red/Crimson (#FF0055) -> Refined Coral Red (#EF4444)
  [/#FF0055/g, '#EF4444'],

  // Glitch art text replacement
  [/Glitch Art/gi, 'Esports Arena'],
  [/Rebel Dark/gi, 'Midnight Obsidian'],
  [/GLITCH/g, 'PRO']
];

for (const relPath of filesToUpdate) {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping missing file: ${relPath}`);
    continue;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  let count = 0;
  for (const [pattern, repl] of replacements) {
    const matches = content.match(pattern);
    if (matches) {
      count += matches.length;
      content = content.replace(pattern, repl);
    }
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated ${relPath} (${count} replacements)`);
}
console.log('All files converted to professional Midnight Obsidian & Electric Cyan palette.');
