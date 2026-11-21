import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Animal, Icon } from './art.jsx';
import { supabase, useAuth } from './auth.jsx';
import { createSupabaseDb } from './supabaseDb.js';

export const DAY = 864e5;
export const rid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-3);
export const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };
export const tiltOf = (id, max = 4) => (((hash(String(id)) % 1000) / 1000) * 2 - 1) * max;

const fDate = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const fShort = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
const fTime = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const fLong = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
export const dateStr = (t) => fDate.format(t);
export const shortDate = (t) => fShort.format(t);
export const timeStr = (t) => fTime.format(t);
export const longDate = (t) => fLong.format(t);
export const stamp = (t) => `${fDate.format(t)} · ${fTime.format(t)}`;
export const dayKey = (t = Date.now()) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const parseDay = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d).getTime(); };
export const daysBetween = (a, b) => Math.round((parseDay(dayKey(b)) - parseDay(dayKey(a))) / DAY);
export const untilText = (t) => {
  const ms = t - Date.now();
  if (ms <= 0) return 'now';
  const d = Math.floor(ms / DAY), h = Math.floor((ms % DAY) / 36e5), m = Math.floor((ms % 36e5) / 6e4);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${Math.max(1, m)}m`;
};
export const agoText = (t) => {
  const s = (Date.now() - t) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

/* images in shared data are untrusted: only accept asset ids and data:image URLs */
export function imgSrc(item) {
  if (!item) return null;
  if (typeof item.assetId === 'string' && /^[0-9a-f]{32}$/.test(item.assetId)) return '/_blob/' + item.assetId;
  if (typeof item.img === 'string' && /^data:image\/(jpeg|png|webp|svg\+xml)/.test(item.img)) return item.img;
  return null;
}

/* ---------- image packing (resize, then asset store or inline) ---------- */
async function bitmapOf(src) {
  if (src instanceof HTMLCanvasElement) return src;
  if (window.createImageBitmap) {
    try { return await createImageBitmap(src, { imageOrientation: 'from-image' }); } catch (e) { /* fall through */ }
  }
  return new Promise((res, rej) => {
    const u = URL.createObjectURL(src), i = new Image();
    i.onload = () => res(i); i.onerror = rej; i.src = u;
  });
}
function draw(src, max, square) {
  const w = src.width || src.naturalWidth, h = src.height || src.naturalHeight;
  let sx = 0, sy = 0, sw = w, sh = h;
  if (square) { const m = Math.min(w, h); sx = (w - m) / 2; sy = (h - m) / 2; sw = sh = m; }
  const k = Math.min(1, max / Math.max(sw, sh));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(sw * k)); c.height = Math.max(1, Math.round(sh * k));
  const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
  g.drawImage(src, sx, sy, sw, sh, 0, 0, c.width, c.height);
  return c;
}
const toBlob = (c, q) => new Promise((r) => c.toBlob(r, 'image/jpeg', q));

/* ---------- in-memory database used when the page is opened outside a signed-in viewer ---------- */
function makeMemDB() {
  const store = new Map(); const subs = new Set();
  const emit = () => subs.forEach((f) => f());
  const segs = (p) => p.split('/');
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const merge = (a, b) => {
    const o = { ...a };
    for (const k in b) o[k] = b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && o[k] && typeof o[k] === 'object' && !Array.isArray(o[k]) ? merge(o[k], b[k]) : b[k];
    return o;
  };
  const snapOf = (p) => ({ id: segs(p).pop(), exists: store.has(p), data: () => store.get(p), metadata: { fromCache: false } });
  const docRef = (p) => ({
    id: segs(p).pop(), path: p,
    get: async () => snapOf(p),
    set: async (d) => { store.set(p, clone(d)); emit(); },
    update: async (d) => { store.set(p, merge(store.get(p) || {}, clone(d))); emit(); },
    delete: async () => { store.delete(p); emit(); },
    onSnapshot(next) { const run = () => next(snapOf(p)); subs.add(run); setTimeout(run, 0); return () => subs.delete(run); },
  });
  const colRef = (p, q = {}) => {
    const api = {
      path: p,
      where: () => api,
      orderBy: (f, dir = 'asc') => colRef(p, { ...q, f, dir }),
      limit: (n) => colRef(p, { ...q, n }),
      doc: (id) => docRef(p + '/' + (id || rid())),
      add: async (d) => { const r = docRef(p + '/' + rid()); await r.set(d); return r; },
      onSnapshot(next) {
        const run = () => {
          let docs = [...store.keys()].filter((k) => k.startsWith(p + '/') && segs(k).length === segs(p).length + 1).map(snapOf);
          if (q.f) docs.sort((a, b) => { const x = a.data()[q.f], y = b.data()[q.f]; return (x > y ? 1 : x < y ? -1 : 0) * (q.dir === 'desc' ? -1 : 1); });
          if (q.n) docs = docs.slice(0, q.n);
          next({ docs, size: docs.length, empty: !docs.length });
        };
        subs.add(run); setTimeout(run, 0); return () => subs.delete(run);
      },
    };
    return api;
  };
  return { db: { doc: docRef, collection: (p) => colRef(p) }, store };
}

function scene(c1, c2, c3, sun = '#fff6d6') {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'><defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='${c1}'/><stop offset='1' stop-color='${c2}'/></linearGradient></defs><rect width='400' height='400' fill='url(#g)'/><circle cx='290' cy='120' r='46' fill='${sun}' opacity='.92'/><path d='M0 300Q100 230 200 290T400 270V400H0Z' fill='${c3}'/><path d='M0 345Q120 295 240 345T400 330V400H0Z' fill='${c3}' opacity='.7'/></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function makeDemo() {
  const { db, store } = makeMemDB();
  const now = Date.now();
  const S = (p, d) => store.set(p, d);
  S('profiles/me', { name: 'You', animal: 'frog', variant: 'green', color: '#d3efbd' });
  S('profiles/p2', { name: 'Partner', animal: 'capybara', variant: 'brown', color: '#f7dcc4' });
  S('couple/settings', { anniversary: dayKey(now - 214 * DAY) });
  const pins = [
    { type: 'photo', img: scene('#ffd6a5', '#fdffb6', '#8ccf7e'), caption: 'sunset walk', by: 'p2', ts: now - 3 * 36e5 },
    { type: 'sticker', sticker: 'a:capybara:brown', caption: 'me rn', by: 'p2', ts: now - 20 * 36e5, color: '#e3f4d8' },
    { type: 'photo', img: scene('#bde0fe', '#e2f0cb', '#6fb87a'), caption: 'picnic!', emoji: '🧺', by: 'me', ts: now - 2 * DAY },
    { type: 'note', text: 'bring home\nboba please', color: '#ffe5ec', by: 'me', ts: now - 3 * DAY },
    { type: 'doodle', img: scene('#fff1e6', '#ffd7ba', '#f4a6a6', '#fff'), caption: 'our house', by: 'p2', ts: now - 6 * DAY },
    { type: 'photo', img: scene('#cdb4db', '#ffc8dd', '#8fb996'), caption: 'lavender field', by: 'me', ts: now - 9 * DAY },
  ];
  pins.forEach((p, i) => S('pins/d' + i, p));
  [
    { title: 'First sunset together', caption: 'You said the sky looked like peach tea.', date: dayKey(now - 200 * DAY), frame: 'gold', img: scene('#ffb88c', '#de6262', '#59315f'), by: 'me', ts: now - 9 * DAY },
    { title: 'The lavender farm', caption: 'We got lost twice and it was the best day.', date: dayKey(now - 120 * DAY), frame: 'walnut', img: scene('#cdb4db', '#a2d2ff', '#7a5c9e'), by: 'p2', ts: now - 8 * DAY },
    { title: 'Rainy day in', caption: 'Soup, blankets, no plans.', date: dayKey(now - 40 * DAY), frame: 'black', img: scene('#8da9c4', '#eef4ed', '#134074', '#e8eddf'), by: 'me', ts: now - 7 * DAY },
  ].forEach((g, i) => S('gallery/d' + i, g));
  S('letters/d0', { by: 'p2', ts: now - 2 * DAY, salutation: 'My dearest', body: 'I saved a seat for you in every plan I made this week.\n\nThe frog on my desk says hello, and so do I.', closing: 'Yours always,', signature: 'Partner', seal: '#9d2235', paper: 'cream', openedAt: null });
  S('letters/d1', { by: 'me', ts: now - 5 * DAY, salutation: 'Dear you', body: 'Thank you for the soup, the song, and the long walk home.', closing: 'With all my love,', signature: 'You', seal: '#2f6b3c', paper: 'sage', openedAt: now - 4 * DAY });
  [
    ['p2', 'good morning, frog', 11 * 36e5], ['me', 'morning!! did you sleep ok', 10.9 * 36e5], ['p2', 'a2:capybara:brown', 10.8 * 36e5], ['me', 'dinner at 7?', 4 * 36e5], ['p2', 'yes. i will bring the dessert', 3.9 * 36e5],
  ].forEach(([by, t, ago], i) => S('messages/d' + i, t.startsWith('a2:') ? { by, sticker: 'a:' + t.slice(3), ts: now - ago } : { by, text: t, ts: now - ago }));
  S('gifts/d0', { by: 'p2', ts: now - 36e5, title: 'Open me', message: 'A little something for a long week.', coupon: 'One long hug, redeemable anytime', bouquet: ['lavender', 'lily', 'rose'], color: '#e8587a', unlockAt: null, openedAt: null });
  [['rose', 22, 70, 3], ['lavender', 50, 62, 2], ['lily', 74, 78, 3], ['rose', 36, 88, 1]].forEach(([kind, x, y, n], i) =>
    S('garden/d' + i, { kind, x, y, by: i % 2 ? 'p2' : 'me', ts: now - (i + 2) * DAY, note: i === 0 ? 'For the first week of spring' : '', waters: Array.from({ length: n }, (_, j) => ({ by: j % 2 ? 'p2' : 'me', day: dayKey(now - j * DAY), ts: now - j * DAY })) }));
  [['Biscuit', 'cat', 'orange', 'p2'], ['Kero', 'frog', 'green', 'me'], ['Yuzu', 'capybara', 'brown', 'me']].forEach(([name, kind, variant, by], i) =>
    S('critters/d' + i, { name, kind, variant, by, ts: now - (i + 3) * DAY, pets: 4 + i, lastFed: now - (i * 8 + 1) * 36e5 }));
  return { db, uid: 'me' };
}

/* ---------- app context ---------- */
const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export function Splash({ slow }) {
  return (
    <div className="splash">
      <Animal kind="frog" size={96} className="bob" />
      <p className="splash-t">Opening Our Days…</p>
      {slow && <p className="splash-s">This is taking longer than usual. Your connection may be slow.</p>}
    </div>
  );
}

export function Provider({ children }) {
  const { user } = useAuth();
  const [boot, setBoot] = useState(null);
  const [bootError, setBootError] = useState(null);
  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const c = window.claude;
        if (c && c.use) {
          const [db, user, assets] = await Promise.all([c.use('db'), c.use('user'), c.use('assets')]);
          const uid = user ? await user.id() : null;
          if (!db || !uid) throw new Error('The Claude runtime did not provide a database and user.');
          if (!dead) setBoot({ db, assets, uid });
          return;
        }
        if (!supabase || !user) throw new Error('Supabase authentication is required to open shared data.');
        const { data: isMember, error } = await supabase.rpc('is_couple_member');
        if (error) throw error;
        if (!isMember) throw new Error('This account is not authorized for this shared space. Ask the owner to add it to couple_members.');
        if (!dead) setBoot({ db: createSupabaseDb(supabase), assets: null, uid: user.id });
      } catch (error) {
        console.error('App initialization failed:', error);
        if (!dead) setBootError(error.message || 'Could not initialize the app.');
      }
    })();
    return () => { dead = true; };
  }, [user]);
  if (bootError) return <div className="storage-error" role="alert"><h1>Could not open Our Days</h1><p>{bootError}</p><p>Check your Supabase setup and try again.</p></div>;
  if (!boot) return <Splash />;
  return <Data boot={boot}>{children}</Data>;
}

function Data({ boot, children }) {
  const { db, assets, uid } = boot;
  const [data, setData] = useState({});
  const [seen, setSeen] = useState(null);
  const [slow, setSlow] = useState(false);
  const [toastMsg, setToast] = useState(null);
  const [dataError, setDataError] = useState(null);
  const baseline = useRef(null);
  const seenRef = useRef({});

  useEffect(() => {
    const un = []; const bad = (e) => { console.error('Data sync failed:', e); setDataError(e.message || 'Could not load shared data.'); };
    const col = (key, q) => un.push(q.onSnapshot((s) => setData((d) => ({ ...d, [key]: s.docs.map((x) => ({ id: x.id, ...x.data() })) })), bad));
    col('pins', db.collection('pins').orderBy('ts', 'desc').limit(200));
    col('gallery', db.collection('gallery'));
    col('songs', db.collection('songs'));
    col('letters', db.collection('letters').orderBy('ts', 'desc').limit(200));
    col('messages', db.collection('messages').orderBy('ts', 'desc').limit(300));
    col('gifts', db.collection('gifts'));
    col('critters', db.collection('critters'));
    col('garden', db.collection('garden'));
    col('profiles', db.collection('profiles'));
    col('questions', db.collection('questions'));
    un.push(db.doc('couple/settings').onSnapshot((s) => setData((d) => ({ ...d, settings: s.exists ? s.data() : {} })), bad));
    un.push(db.doc(`data/users/${uid}/seen`).onSnapshot((s) => {
      const v = s.exists ? s.data() : {};
      if (baseline.current === null) baseline.current = v;
      seenRef.current = v; setSeen(v);
    }, bad));
    const t = setTimeout(() => setSlow(true), 10000);
    return () => { un.forEach((u) => u()); clearTimeout(t); };
  }, [db, uid]);

  const toast = useCallback((msg) => { setToast({ msg, k: rid() }); }, []);
  useEffect(() => { if (!toastMsg) return; const t = setTimeout(() => setToast(null), 2600); return () => clearTimeout(t); }, [toastMsg]);

  const run = useCallback(async (fn) => {
    try { return (await fn()) || true; } catch (e) {
      console.warn(e);
      toast(e && e.code === 'quota_exceeded' ? 'The memory box is full. Remove something old to add more.' : 'Could not save that. Check your connection and try again.');
      return null;
    }
  }, [toast]);

  const api = useMemo(() => ({
    add: (c, d) => run(() => db.collection(c).add({ ...d, by: uid, ts: Date.now() })),
    put: (p, d) => run(() => db.doc(p).set(d)),
    patch: (p, d) => run(() => db.doc(p).update(d)),
    del: (p) => run(() => db.doc(p).delete()),
    async pack(src, { max = 1400, square = false } = {}) {
      try {
        const bmp = await bitmapOf(src);
        if (assets) {
          const blob = await toBlob(draw(bmp, max, square), 0.84);
          const r = await assets.upload(blob);
          return { assetId: r.id };
        }
        let size = Math.min(max, 900), q = 0.72, url;
        for (let i = 0; i < 6; i++) {
          url = draw(bmp, size, square).toDataURL('image/jpeg', q);
          if (url.length < 170000) break;
          size = Math.round(size * 0.8); q = Math.max(0.5, q - 0.05);
        }
        return { img: url };
      } catch (e) {
        console.warn(e); toast('That picture could not be added. Try another one.'); return null;
      }
    },
  }), [db, assets, uid, run, toast]);

  const profiles = data.profiles;
  const byId = useMemo(() => Object.fromEntries((profiles || []).map((p) => [p.id, p])), [profiles]);
  const me = byId[uid] || null;
  const partner = (profiles || []).find((p) => p.id !== uid) || null;
  const nameOf = (id) => (byId[id] && byId[id].name) || 'Someone';

  const markSeen = useCallback((sec) => {
    const list = { days: data.pins, chat: data.messages, gallery: data.gallery }[sec] || [];
    let latest = 0;
    for (const x of list) if (x.by !== uid && x.ts > latest) latest = x.ts;
    if (!latest || latest <= (seenRef.current[sec] || 0)) return;
    const next = { ...seenRef.current, [sec]: Math.max(Date.now(), latest) };
    seenRef.current = next; setSeen(next);
    db.doc(`data/users/${uid}/seen`).set(next).catch((error) => {
      console.error('Could not update read status:', error);
      toast('Could not sync read status. Check your connection and try again.');
    });
  }, [data.pins, data.messages, data.gallery, db, uid, toast]);

  const isNew = (sec, item) => !!baseline.current && item.by !== uid && item.ts > (baseline.current[sec] || 0);

  const counts = useMemo(() => {
    const s = seen || {}; const now = Date.now();
    const fresh = (list, k) => (list || []).filter((x) => x.by !== uid && x.ts > (s[k] || 0)).length;
    const waiting = (list) => (list || []).filter((x) => x.by !== uid && !x.openedAt && (!x.unlockAt || x.unlockAt <= now)).length;
    return { days: fresh(data.pins, 'days'), chat: fresh(data.messages, 'chat'), gallery: fresh(data.gallery, 'gallery'), letters: waiting(data.letters), gifts: waiting(data.gifts) };
  }, [data.pins, data.messages, data.gallery, data.letters, data.gifts, seen, uid]);

  const ready = data.profiles && data.settings && seen && data.pins && data.messages && data.songs;
  const value = { uid, hasAssets: !!assets, data, me, partner, byId, nameOf, ...api, toast, markSeen, isNew, counts };
  return (
    <Ctx.Provider value={value}>
      {dataError ? <div className="storage-error" role="alert"><h1>Could not sync Our Days</h1><p>{dataError}</p><p>Check the database schema and row-level security settings.</p></div> : ready ? children : <Splash slow={slow} />}
      {toastMsg && <div className="toast" role="status" key={toastMsg.k}>{toastMsg.msg}</div>}
    </Ctx.Provider>
  );
}

/* ---------- shared UI ---------- */
export function Sheet({ title, onClose, children, wide, className = '' }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={'sheet ' + (wide ? 'wide ' : '') + className} role="dialog" aria-label={title}>
        <div className="sheet-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon n="x" /></button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}

export function Header({ title, sub, back, right, className = '' }) {
  return (
    <header className={'head pad ' + className}>
      {back && <button className="icon-btn" onClick={back} aria-label="Back"><Icon n="back" size={24} /></button>}
      <div className="head-t">
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      <div className="head-r">{right}</div>
    </header>
  );
}

export function Confirm({ label = 'Remove', onYes, icon = 'trash' }) {
  const [ask, setAsk] = useState(false);
  useEffect(() => { if (!ask) return; const t = setTimeout(() => setAsk(false), 3500); return () => clearTimeout(t); }, [ask]);
  return ask
    ? <button className="btn danger" onClick={onYes}>Tap again to confirm</button>
    : <button className="btn ghost" onClick={() => setAsk(true)}><Icon n={icon} size={18} /> {label}</button>;
}

export const SWATCH = ['#d3efbd', '#f7dcc4', '#ffd9e2', '#d6e6ff', '#e6dcff', '#fff0b8'];
export const dayNumber = (anniv) => (anniv ? daysBetween(parseDay(anniv), Date.now()) + 1 : null);
