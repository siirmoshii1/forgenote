import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist');

if (fs.existsSync(distDir)) {
  // 1. Create .nojekyll so GitHub Pages does not ignore underscore files
  fs.writeFileSync(path.join(distDir, '.nojekyll'), '');

  // 2. Duplicate index.html to 404.html for SPA client-side routing on GitHub Pages
  const indexPath = path.join(distDir, 'index.html');
  const notFoundPath = path.join(distDir, '404.html');
  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, notFoundPath);
    console.log('Successfully generated dist/404.html and dist/.nojekyll for GitHub Pages');
  }
}
