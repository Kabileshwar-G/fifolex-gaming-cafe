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
  // Page backgrounds & card surfaces
  [/#0A0E17/g, '#F8FAFC'],
  [/#0a0e17/g, '#F8FAFC'],
  [/#121826/g, '#FFFFFF'],
  [/#161F32/g, '#F8FAFC'],
  [/#1A2438/g, '#F1F5F9'],
  [/#1F293D/g, '#E2E8F0'],
  [/#2A3854/g, '#CBD5E1'],

  // Old dark tokens just in case
  [/#111111/g, '#F8FAFC'],
  [/#1E1E1E/g, '#FFFFFF'],
  [/#161616/g, '#F8FAFC'],
  [/#2A2A2A/g, '#E2E8F0'],
  [/#2E2E2E/g, '#E2E8F0'],
  [/#333333/g, '#E2E8F0'],
  [/#252525/g, '#F1F5F9'],
  [/#282828/g, '#F1F5F9'],
  [/#202020/g, '#F1F5F9'],

  // Accents: #00D2FF / #00B4D8 -> #2563EB / #1D4ED8
  [/#00D2FF/g, '#2563EB'],
  [/#00d2ff/g, '#2563EB'],
  [/#00B4D8/g, '#1D4ED8'],
  [/#00b4d8/g, '#1D4ED8'],

  // Indigo / Purple: #6366F1 -> #4F46E5, #8A2BE2 -> #7C3AED
  [/#6366F1/g, '#4F46E5'],
  [/#818CF8/g, '#6366F1'],
  [/#8A2BE2/g, '#7C3AED'],
  [/#c084fc/g, '#7C3AED'],

  // Cyan text & backgrounds
  [/text-\[#00D2FF\]/g, 'text-[#2563EB]'],
  [/bg-\[#00D2FF\]\/15/g, 'bg-blue-50'],
  [/border-\[#00D2FF\]\/30/g, 'border-blue-200'],
  [/border-\[#00D2FF\]\/40/g, 'border-blue-200'],

  // Neutral colors
  [/text-gray-400/g, 'text-slate-500'],
  [/text-\[#A3A3A3\]/g, 'text-slate-500'],
  [/text-\[#94A3B8\]/g, 'text-slate-500'],
  [/placeholder-gray-500/g, 'placeholder-slate-400'],
  [/divide-gray-800/g, 'divide-slate-200'],
  [/border-gray-800/g, 'border-slate-200'],
  [/border-gray-700/g, 'border-slate-200'],
  [/divide-\[#1F293D\]/g, 'divide-slate-200'],
  [/border-\[#1F293D\]/g, 'border-slate-200'],
  [/divide-\[#2A2A2A\]/g, 'divide-slate-200'],
  [/border-\[#2A2A2A\]/g, 'border-slate-200'],

  // Labels and text contrast
  [/text-white tracking-wide/g, 'text-slate-900 tracking-wide'],
  [/font-bold text-white text-/g, 'font-bold text-slate-900 text-'],
  [/font-extrabold text-white text-/g, 'font-extrabold text-slate-900 text-'],
  [/font-black text-white/g, 'font-black text-slate-900'],
  [/font-bold text-white/g, 'font-bold text-slate-900'],
  [/text-gray-300/g, 'text-slate-700'],
  [/text-gray-200/g, 'text-slate-800']
];

for (const relPath of filesToUpdate) {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) continue;
  let content = fs.readFileSync(fullPath, 'utf8');
  let count = 0;
  for (const [pattern, repl] of replacements) {
    const matches = content.match(pattern);
    if (matches) {
      count += matches.length;
      content = content.replace(pattern, repl);
    }
  }

  // Ensure modals and floating elements have crisp white backgrounds and dark text
  content = content.replace(/bg-black\/85/g, 'bg-black/50');
  content = content.replace(/bg-black\/80/g, 'bg-black/50');

  // Fix button text contrast: buttons with bg-[#2563EB] or bg-emerald-600 must have text-white
  content = content.replace(/bg-\[#2563EB\] hover:bg-\[#1D4ED8\] text-\[#0A0E17\]/g, 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm');
  content = content.replace(/bg-\[#2563EB\] text-\[#0A0E17\]/g, 'bg-[#2563EB] text-white shadow-sm');
  content = content.replace(/text-\[#111111\]/g, 'text-white');

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated ${relPath} (${count} changes)`);
}
console.log('All routes updated to clean light theme.');
