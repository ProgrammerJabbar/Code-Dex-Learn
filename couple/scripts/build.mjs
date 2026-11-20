// Bundles src/ into one self-contained index.html (React comes from the CDN as a global).
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = await build({
  entryPoints: [path.join(root, 'src/main.jsx')],
  bundle: true, write: false, format: 'iife', minify: true, target: ['es2019'],
  jsx: 'transform', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment',
  loader: { '.js': 'jsx' },
  alias: { react: path.join(root, 'src/shims/react.js'), 'react-dom/client': path.join(root, 'src/shims/rdc.js') },
  banner: { js: 'var React=window.React;' },
});
const js = out.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const css = fs.readFileSync(path.join(root, 'src/styles.css'), 'utf8');
const fonts = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700&family=Caveat:wght@500;600;700&family=Caveat+Brush&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=IM+Fell+English:ital@0;1&family=Mrs+Saint+Delafield&display=swap';
const html = `<title>Our Days</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="${fonts}">
<style>
${css}
</style>
<div id="root"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script>
${js}
</script>
`;
fs.writeFileSync(path.join(root, 'index.html'), html);
console.log('index.html', (html.length / 1024).toFixed(0) + ' KB');
