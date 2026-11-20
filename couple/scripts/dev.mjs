// Local preview with live rebuilds. Uses real React from node_modules.
// Outside claude.ai there is no shared database, so the app runs in its built-in preview mode
// with sample content and nothing is saved.
import { context } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, '.dev-out');
fs.mkdirSync(out, { recursive: true });
const copy = () => {
  fs.copyFileSync(path.join(root, 'src/styles.css'), path.join(out, 'styles.css'));
  fs.writeFileSync(path.join(out, 'index.html'), `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Our Days (dev)</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700&family=Caveat:wght@500;600;700&family=Caveat+Brush&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=IM+Fell+English:ital@0;1&family=Mrs+Saint+Delafield&display=swap">
<link rel="stylesheet" href="styles.css"><div id="root"></div><script src="main.js"></script>`);
};
copy();
const ctx = await context({
  entryPoints: [path.join(root, 'src/main.jsx')], outfile: path.join(out, 'main.js'),
  bundle: true, format: 'iife', target: ['es2019'], sourcemap: true,
  jsx: 'transform', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment',
  define: {
    'process.env.NODE_ENV': '"development"',
    'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL || ''),
    'process.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY || ''),
  },
  plugins: [{ name: 'css-copy', setup(b) { b.onEnd(copy); } }],
});
await ctx.watch();
const { port } = await ctx.serve({ servedir: out, port: 5173 });
console.log(`Dev server: http://localhost:${port}  (edit src/ and refresh)`);
fs.watch(path.join(root, 'src/styles.css'), copy);
