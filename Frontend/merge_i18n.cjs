const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'locales', 'en.json');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const files = [
  'locales/hi.json',
  'locales/kn.json',
  'locales/te.json',
  'locales/ta.json',
  'locales/ml.json'
].map(f => path.join(__dirname, f));

function merge(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      merge(target[key], source[key]);
    } else {
      if (target[key] === undefined) {
        target[key] = source[key];
      }
    }
  }
}

files.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`Processing ${file}...`);
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    merge(data, en);
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } else {
    console.log(`File not found: ${file}`);
  }
});
