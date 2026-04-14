const fs = require('fs');
const path = require('path');

// 1. Process style.css
let cssPath = 'style.css';
if (fs.existsSync(cssPath)) {
  let css = fs.readFileSync(cssPath, 'utf-8');

  // Root variables
  css = css.replace(/--bg: #07070e;/g, '--bg: #ffffff;');
  css = css.replace(/--surface: #0e0c1a;/g, '--surface: #f7f7f7;');
  css = css.replace(/--card-bg: rgba\(127,119,221,0.06\)/g, '--card-bg: rgba(0,0,0,0.03)');
  css = css.replace(/--primary: #7F77DD;/g, '--primary: #000000;');
  css = css.replace(/--primary-lt: #AFA9EC;/g, '--primary-lt: #555555;');
  css = css.replace(/--primary-deep: #534AB7;/g, '--primary-deep: #222222;');
  css = css.replace(/--primary-glow: rgba\(127,119,221,0.25\);/g, '--primary-glow: rgba(0,0,0,0.08);');
  css = css.replace(/--heading: #e8e4ff;/g, '--heading: #000000;');
  css = css.replace(/--text-hi: #c8c4ff;/g, '--text-hi: #222222;');
  css = css.replace(/--text-body: rgba\(255,255,255,0.5\);/g, '--text-body: rgba(0,0,0,0.65);');
  css = css.replace(/--text-dim: rgba\(127,119,221,0.7\);/g, '--text-dim: rgba(0,0,0,0.4);');
  css = css.replace(/--border: rgba\(127,119,221,0.12\);/g, '--border: rgba(0,0,0,0.15);');
  css = css.replace(/--border-hover: rgba\(127,119,221,0.25\);/g, '--border-hover: rgba(0,0,0,0.3);');

  // Hardcoded colors
  css = css.replace(/rgba\(127,119,221,/g, 'rgba(0,0,0,');
  css = css.replace(/rgba\(200,190,255,0.5\)/g, 'rgba(0,0,0,0.5)'); 
  css = css.replace(/rgba\(255,255,255,0.07\)/g, 'rgba(0,0,0,0.07)');
  css = css.replace(/color: #c8c4ff;/g, 'color: #111111;'); 
  
  // Specific elements
  css = css.replace(/::selection \{ background: var\(--primary\); color: var\(--bg\); \}/, '::selection { background: var(--heading); color: var(--bg); }');
  css = css.replace(/background: rgba\(7,7,14,0.6\);/g, 'background: rgba(255,255,255,0.8);'); 
  css = css.replace(/background: rgba\(14,12,26,0.85\);/g, 'background: rgba(255,255,255,0.85);');
  css = css.replace(/color: #ff00cc;/g, 'color: #aaaaaa;');
  css = css.replace(/color: #00ffff;/g, 'color: #555555;');
  css = css.replace(/background: radial-gradient\(circle at 50% 50%, rgba\(255,255,255,0.15\), transparent 60%\);/g, 'background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3), transparent 60%);');
  css = css.replace(/#cursor-dot \{.*background: white;/g, '#cursor-dot { position: fixed; width: 6px; height: 6px; background: black;'); 
  css = css.replace(/background: white;/g, 'background: black;'); // footer-stars and cursor trail
  
  fs.writeFileSync(cssPath, css);
}

// 2. Process JS files in src/
const srcDir = './src';
if (fs.existsSync(srcDir)) {
  const files = fs.readdirSync(srcDir);
  for (const file of files) {
    if (file.endsWith('.js')) {
      const filePath = path.join(srcDir, file);
      let content = fs.readFileSync(filePath, 'utf-8');
      
      let modified = false;
      if (content.includes('127,119,221')) {
        content = content.replace(/127,119,221/g, '0,0,0');
        modified = true;
      }
      if (content.includes('175,169,236')) {
        content = content.replace(/175,169,236/g, '85,85,85');
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content);
      }
    }
  }
}

// 3. Process index.html just in case there are inline styles or data-colors needs fading.
let htmlPath = 'index.html';
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf-8');
  // Optional: Convert social cards data-color hexes to black themes if needed?
  // The user said "design the whole color theme to black and white".
  // The social cards have data-color="#378ADD" etc which creates colored borders on hover. 
  // Let's change them to greys or just black so the hover is entirely B&W.
  html = html.replace(/data-color="#378ADD"/g, 'data-color="#000000"');
  html = html.replace(/data-color="#D85A30"/g, 'data-color="#000000"');
  html = html.replace(/data-color="#AFA9EC"/g, 'data-color="#000000"');
  html = html.replace(/data-color="#1DA1F2"/g, 'data-color="#000000"');
  html = html.replace(/data-color="#D4537E"/g, 'data-color="#000000"');
  html = html.replace(/data-color="#5865F2"/g, 'data-color="#000000"');
  
  fs.writeFileSync(htmlPath, html);
  
  // also update style.css social-card hovers
  let css2 = fs.readFileSync(cssPath, 'utf-8');
  css2 = css2.replace(/rgba\(55,138,221/g, 'rgba(0,0,0');
  css2 = css2.replace(/rgba\(216,90,48/g, 'rgba(0,0,0');
  css2 = css2.replace(/rgba\(175,169,236/g, 'rgba(0,0,0');
  css2 = css2.replace(/rgba\(29,161,242/g, 'rgba(0,0,0');
  css2 = css2.replace(/rgba\(212,83,126/g, 'rgba(0,0,0');
  css2 = css2.replace(/rgba\(29,158,117/g, 'rgba(0,0,0');
  css2 = css2.replace(/#378ADD/g, '#000000');
  css2 = css2.replace(/#D85A30/g, '#000000');
  css2 = css2.replace(/#AFA9EC/g, '#000000');
  css2 = css2.replace(/#1DA1F2/g, '#000000');
  css2 = css2.replace(/#D4537E/g, '#000000');
  css2 = css2.replace(/#1D9E75/g, '#000000');
  fs.writeFileSync(cssPath, css2);
}
