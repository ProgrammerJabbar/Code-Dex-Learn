# Our Days

A private shared space for two people: a polaroid wall of daily updates, a museum-style photo gallery,
old-fashioned letters, live chat, a flower garden, critter friends and surprise gifts.

Built with React 18 and bundled with esbuild into one self-contained `index.html`.

## Structure

```
src/
  main.jsx          App shell, tab bar, hash routing, welcome screen, "More" hub
  lib.jsx           Data layer (db subscriptions, actions, image packing), shared UI (Sheet, Header), demo data
  art.jsx           All artwork as SVG: animals, flowers, gift box, icons, stickers, confetti
  styles.css        Every style, with light and dark themes through CSS variables
  views/            Days, PinIt, Gallery, Letters, Chat, Garden, Critters, Gifts, Us
  shims/            Map `react` to the CDN global in the production build
scripts/
  build.mjs         Produces index.html (React loaded from cdnjs, CSS and JS inlined)
  dev.mjs           Local preview with live rebuilds
index.html          Built output. This is the file that gets published.
```

## Develop

Run these commands from the repository root:

```bash
npm install
npm run dev      # http://localhost:5173, preview mode with sample content
npm run build    # writes index.html
```

## How it stores data

The published page runs as a private Claude artifact and uses its runtime capabilities:

- `db` keeps shared data (pins, gallery, letters, messages, gifts, garden, critters, profiles).
- `user` gives each person a stable id.
- `assets` stores full-size photos. Viewers who cannot upload get compressed inline photos instead.

Collections written by the page: `pins`, `gallery`, `letters`, `messages`, `gifts`, `garden`, `critters`,
`profiles`, `questions`, `couple/settings`, and `data/users/<id>/seen` (private per person).

Outside that environment there is no shared database, so the app falls back to an in-memory preview
with sample content. Hosting `index.html` on GitHub Pages shows that preview only. To run it
as a standalone site you would replace the data layer in `src/lib.jsx` (`Provider`, `Data`, `api`)
with your own backend, for example Supabase or Firebase. The views only use `useApp()`.

## Supabase sign-in

The site uses Supabase Auth for email/password sign-in. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY`
as Vercel environment variables for each deployment environment, then redeploy. The anon key is
intended for browser use; never use a Supabase service-role key in the client. Disable public
sign-ups in Supabase Auth and create or invite only the two accounts you need. Add the deployed
site URL to Supabase Auth's allowed redirect URLs for password resets.

Authentication gates the app interface but does not move its data into Supabase. Outside the
Claude artifact runtime, the app still uses demo data held only in memory. Do not store private
shared content there until a persistent backend with row-level security policies is implemented.

## Publishing changes

After `npm run build`, publish `index.html` again from Claude with the same artifact URL, with the
capabilities `{"db": {}, "user": {}, "assets": {}}`.
