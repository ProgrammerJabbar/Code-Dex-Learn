import React from 'react';

/* ---------- palettes ---------- */
export const PAL = {
  cat: {
    orange: { b: '#f4a85c', d: '#d98438', l: '#fff1de' },
    gray: { b: '#aeb6c2', d: '#8791a0', l: '#eef1f5' },
    black: { b: '#50505c', d: '#34343e', l: '#74748a' },
    cream: { b: '#f3e2c3', d: '#dcc298', l: '#fffaf0' },
  },
  frog: {
    green: { b: '#7bc95a', d: '#58a53c', l: '#d9f2b6' },
    teal: { b: '#4cc3b8', d: '#2f9e94', l: '#c8f1ec' },
    yellow: { b: '#f2cf4c', d: '#cfa626', l: '#fff1b0' },
  },
  capybara: {
    brown: { b: '#b98b5e', d: '#8f6a45', l: '#d1a97c' },
    ginger: { b: '#d19a62', d: '#a9773f', l: '#e6bf8f' },
  },
  penguin: {
    classic: { b: '#2f3b52', d: '#222b3d', l: '#f7f9fc' },
    blue: { b: '#5a79ab', d: '#43608f', l: '#f2f6fc' },
  },
};

export const ANIMALS = {
  cat: { label: 'Cat', treat: '🐟', noise: 'mrrp' },
  frog: { label: 'Frog', treat: '🪰', noise: 'ribbit' },
  capybara: { label: 'Capybara', treat: '🍊', noise: 'prrt' },
  penguin: { label: 'Penguin', treat: '🐟', noise: 'honk' },
};
export const FLOWERS = {
  lavender: { label: 'Lavender', color: '#9b7fd6' },
  lily: { label: 'Lily', color: '#f6c9d9' },
  rose: { label: 'Rose', color: '#e5486b' },
};

/* ---------- animals ---------- */
const Cat = ({ v }) => (
  <g>
    <path d="M70 80C92 82 96 56 84 48" fill="none" stroke={v.d} strokeWidth="8" strokeLinecap="round" />
    <ellipse cx="50" cy="76" rx="25" ry="19" fill={v.b} />
    <ellipse cx="50" cy="82" rx="13" ry="10" fill={v.l} />
    <ellipse cx="38" cy="93" rx="8" ry="5" fill={v.b} />
    <ellipse cx="62" cy="93" rx="8" ry="5" fill={v.b} />
    <path d="M25 42 L28 12 L47 27Z" fill={v.b} />
    <path d="M75 42 L72 12 L53 27Z" fill={v.b} />
    <path d="M30 34 L31 21 L40 28Z" fill="#f6a0b0" />
    <path d="M70 34 L69 21 L60 28Z" fill="#f6a0b0" />
    <ellipse cx="50" cy="46" rx="27" ry="23" fill={v.b} />
    <path d="M50 24v8M42 25l2 6M58 25l-2 6" stroke={v.d} strokeWidth="2.4" strokeLinecap="round" />
    <ellipse className="eye" cx="39" cy="46" rx="3.4" ry="4.4" fill="#2b2320" />
    <ellipse className="eye" cx="61" cy="46" rx="3.4" ry="4.4" fill="#2b2320" />
    <circle cx="40.2" cy="44.4" r="1.2" fill="#fff" />
    <circle cx="62.2" cy="44.4" r="1.2" fill="#fff" />
    <circle cx="31" cy="54" r="4.5" fill="#ff8fa3" opacity=".4" />
    <circle cx="69" cy="54" r="4.5" fill="#ff8fa3" opacity=".4" />
    <path d="M47 52h6l-3 3.6z" fill="#f08a9b" />
    <path d="M50 55.6q-3.5 4-7.5 1.2M50 55.6q3.5 4 7.5 1.2" fill="none" stroke="#2b2320" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M30 51l-12-2M30 55l-12 3M70 51l12-2M70 55l12 3" stroke="#2b2320" strokeWidth="1" opacity=".5" strokeLinecap="round" />
  </g>
);
const Frog = ({ v }) => (
  <g>
    <ellipse cx="22" cy="88" rx="13" ry="6" fill={v.d} />
    <ellipse cx="78" cy="88" rx="13" ry="6" fill={v.d} />
    <ellipse cx="50" cy="68" rx="31" ry="25" fill={v.b} />
    <ellipse cx="50" cy="76" rx="20" ry="15" fill={v.l} />
    <ellipse cx="50" cy="52" rx="32" ry="21" fill={v.b} />
    <circle cx="31" cy="35" r="13" fill={v.b} />
    <circle cx="69" cy="35" r="13" fill={v.b} />
    <circle cx="31" cy="34" r="9.5" fill="#fff" />
    <circle cx="69" cy="34" r="9.5" fill="#fff" />
    <circle className="eye" cx="32" cy="35" r="5" fill="#26301f" />
    <circle className="eye" cx="68" cy="35" r="5" fill="#26301f" />
    <circle cx="33.6" cy="33" r="1.8" fill="#fff" />
    <circle cx="69.6" cy="33" r="1.8" fill="#fff" />
    <path d="M30 57Q50 72 70 57" fill="none" stroke="#2f4a27" strokeWidth="2.4" strokeLinecap="round" />
    <circle cx="26" cy="58" r="5" fill="#ff8fa3" opacity=".45" />
    <circle cx="74" cy="58" r="5" fill="#ff8fa3" opacity=".45" />
    <circle cx="46" cy="50" r="1.3" fill="#2f4a27" />
    <circle cx="54" cy="50" r="1.3" fill="#2f4a27" />
    <circle cx="38" cy="72" r="2.6" fill={v.d} opacity=".45" />
    <circle cx="63" cy="70" r="2.2" fill={v.d} opacity=".45" />
  </g>
);
const Capy = ({ v }) => (
  <g>
    <ellipse cx="50" cy="80" rx="36" ry="18" fill={v.b} />
    <rect x="22" y="88" width="12" height="8" rx="4" fill={v.d} />
    <rect x="66" y="88" width="12" height="8" rx="4" fill={v.d} />
    <circle cx="28" cy="28" r="7" fill={v.d} />
    <circle cx="72" cy="28" r="7" fill={v.d} />
    <rect x="24" y="22" width="52" height="46" rx="22" fill={v.b} />
    <rect x="35" y="44" width="30" height="22" rx="11" fill={v.l} />
    <path d="M34 40q4 3.4 8 0M58 40q4 3.4 8 0" stroke="#3a2a1e" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <ellipse cx="44" cy="52" rx="2" ry="2.8" fill="#4a3426" />
    <ellipse cx="56" cy="52" rx="2" ry="2.8" fill="#4a3426" />
    <path d="M46 59q4 3 8 0" stroke="#4a3426" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    <circle cx="30" cy="50" r="4" fill="#ff8fa3" opacity=".35" />
    <circle cx="70" cy="50" r="4" fill="#ff8fa3" opacity=".35" />
    <circle cx="50" cy="19" r="8" fill="#ffb627" />
    <path d="M50 11q4-5 8-3-3 5-8 3z" fill="#4f9a3a" />
  </g>
);
const Peng = ({ v }) => (
  <g>
    <ellipse cx="38" cy="95" rx="9" ry="4" fill="#ffaf2e" />
    <ellipse cx="62" cy="95" rx="9" ry="4" fill="#ffaf2e" />
    <ellipse cx="50" cy="58" rx="29" ry="36" fill={v.b} />
    <path d="M24 52q-14 14-6 30 10-6 12-22z" fill={v.d} />
    <path d="M76 52q14 14 6 30-10-6-12-22z" fill={v.d} />
    <ellipse cx="50" cy="66" rx="19" ry="26" fill={v.l} />
    <circle cx="40" cy="38" r="9" fill={v.l} />
    <circle cx="60" cy="38" r="9" fill={v.l} />
    <circle className="eye" cx="41" cy="39" r="3.2" fill="#1d2230" />
    <circle className="eye" cx="59" cy="39" r="3.2" fill="#1d2230" />
    <circle cx="42" cy="37.8" r="1.1" fill="#fff" />
    <circle cx="60" cy="37.8" r="1.1" fill="#fff" />
    <path d="M43 46q7-5 14 0q-7 9-14 0z" fill="#ffaf2e" />
    <circle cx="33" cy="47" r="4" fill="#ff8fa3" opacity=".45" />
    <circle cx="67" cy="47" r="4" fill="#ff8fa3" opacity=".45" />
  </g>
);
const BODY = { cat: Cat, frog: Frog, capybara: Capy, penguin: Peng };

export function Animal({ kind = 'cat', variant, size = 80, box = '0 0 100 100', className = '', style }) {
  const P = PAL[kind] || PAL.cat;
  const v = P[variant] || P[Object.keys(P)[0]];
  const B = BODY[kind] || Cat;
  return (
    <svg className={'animal ' + className} viewBox={box} width={size} height={size} style={style} aria-hidden="true">
      <B v={v} />
    </svg>
  );
}
export const variantsOf = (kind) => Object.keys(PAL[kind] || {});

/* ---------- flowers ---------- */
function Leaves({ y, s = 1 }) {
  return (
    <g>
      <path d={`M50 ${y} q${-20 * s} ${-3 * s} ${-24 * s} ${-18 * s} q${19 * s} 0 ${24 * s} ${18 * s}z`} fill="#4fa14a" />
      <path d={`M50 ${y - 6} q${20 * s} ${-3 * s} ${24 * s} ${-18 * s} q${-19 * s} 0 ${-24 * s} ${18 * s}z`} fill="#3f8f44" />
    </g>
  );
}
function LavenderBloom({ stage }) {
  const cols = ['#9b7fd6', '#b79ef0', '#7b5cc2', '#a68be3'];
  const top = stage === 3 ? 26 : 62;
  const items = [];
  for (let y = stage === 3 ? 90 : 78, i = 0; y >= top + 6; y -= 7, i++) {
    const c = stage === 3 ? cols[i % 4] : '#a9b86a';
    items.push(<ellipse key={'l' + i} cx={45.5} cy={y} rx="4" ry="6.5" transform={`rotate(-28 45.5 ${y})`} fill={c} />);
    items.push(<ellipse key={'r' + i} cx={54.5} cy={y - 3} rx="4" ry="6.5" transform={`rotate(28 54.5 ${y - 3})`} fill={cols[(i + 2) % 4]} opacity={stage === 3 ? 1 : 0} />);
    if (stage !== 3) items.push(<ellipse key={'r2' + i} cx={54.5} cy={y - 3} rx="4" ry="6.5" transform={`rotate(28 54.5 ${y - 3})`} fill="#b2c070" />);
  }
  return (
    <g>
      {items}
      <ellipse cx="50" cy={top - 2} rx="3.8" ry="7" fill={stage === 3 ? '#8d6fd0' : '#a9b86a'} />
    </g>
  );
}
function LilyBloom() {
  return (
    <g transform="translate(50 52)">
      {[0, 60, 120, 180, 240, 300].map((a, i) => (
        <path key={a} d="M0 0 C-11 -9 -10 -26 0 -34 C10 -26 11 -9 0 0Z" transform={`rotate(${a + (i % 2 ? 0 : 0)})`} fill={i % 2 ? '#fde7ef' : '#fff6f9'} stroke="#efb8cd" strokeWidth="1" />
      ))}
      {[0, 120, 240].map((a) => (
        <path key={'s' + a} d="M0 -6 L0 -24" stroke="#f3a3c0" strokeWidth="1.6" transform={`rotate(${a + 60})`} strokeLinecap="round" />
      ))}
      {[[-4, -12], [5, -16], [-2, -20], [6, -8], [-7, -6]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.1" fill="#e46a97" />
      ))}
      {[-22, 0, 22].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d="M0 0 L0 -17" stroke="#f1c45d" strokeWidth="1.6" strokeLinecap="round" />
          <ellipse cx="0" cy="-19" rx="2" ry="3.4" fill="#e89d2b" />
        </g>
      ))}
    </g>
  );
}
function RoseBloom() {
  return (
    <g transform="translate(50 48)">
      <circle r="19" fill="#e5486b" />
      <path d="M-15 -4 q15 -17 30 0 q-4 19 -15 19 q-15 -2 -15 -19z" fill="#cf2f55" />
      <path d="M-9 -2 q9 -11 18 0 q-2 11 -9 11 q-9 -1 -9 -11z" fill="#ec5f80" />
      <path d="M-4 1 q4 -5 8 0 q-1 5 -4 5 q-4 0 -4 -5z" fill="#c42b50" />
      <path d="M-13 -9 q13 -10 26 0" fill="none" stroke="#f58aa4" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M-11 15 q11 8 22 0 q-4 9 -11 9 q-7 0 -11 -9z" fill="#3f9b4a" />
    </g>
  );
}
export function Flower({ kind = 'rose', stage = 3, size = 80, className = '' }) {
  const lav = kind === 'lavender';
  const top = { 1: 108, 2: 82, 3: lav ? 30 : 58 }[stage];
  return (
    <svg className={'flower ' + className} viewBox="0 0 100 140" width={size * 0.714} height={size} aria-hidden="true">
      <ellipse cx="50" cy="136" rx="17" ry="6" fill="#8a6a49" />
      <ellipse cx="50" cy="134" rx="12" ry="4" fill="#a07e58" />
      {stage === 0 && <path d="M50 134 q-2 -6 0 -8 q3 3 0 8z" fill="#6fb257" />}
      {stage >= 1 && (
        <path d={`M50 136 C47 ${(136 + top) / 2} 53 ${(136 + top) / 2} 50 ${top}`} stroke="#3f9444" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      )}
      {stage === 1 && <Leaves y={124} s={0.7} />}
      {stage >= 2 && <Leaves y={122} s={1} />}
      {stage === 3 && !lav && <Leaves y={100} s={0.8} />}
      {stage === 3 && lav && <Leaves y={104} s={0.9} />}
      {stage === 2 && kind === 'rose' && (
        <g>
          <path d="M50 88 q-10 -2 -10 -14 q10 -9 20 0 q0 12 -10 14z" fill="#d93a5f" />
          <path d="M42 86 q8 8 16 0 q-3 8 -8 8 q-5 0 -8 -8z" fill="#3f9b4a" />
        </g>
      )}
      {stage === 2 && kind === 'lily' && (
        <path d="M50 88 C39 80 41 62 50 54 C59 62 61 80 50 88z" fill="#f6e9ef" stroke="#e8b7cb" strokeWidth="1.4" />
      )}
      {lav && stage === 2 && <LavenderBloom stage={2} />}
      {stage === 3 && kind === 'rose' && <RoseBloom />}
      {stage === 3 && kind === 'lily' && <LilyBloom />}
      {lav && stage === 3 && <LavenderBloom stage={3} />}
    </svg>
  );
}
export const stageName = (s) => ['Seed', 'Sprout', 'Bud', 'In bloom'][s];

/* ---------- stickers: "a:cat:orange" | "f:rose" | emoji ---------- */
export function StickerArt({ s, size = 80 }) {
  if (typeof s !== 'string') return null;
  if (s.startsWith('a:')) {
    const [, k, v] = s.split(':');
    return <Animal kind={k} variant={v} size={size} />;
  }
  if (s.startsWith('f:')) return <Flower kind={s.slice(2)} stage={3} size={size * 1.15} />;
  return <span className="emoji-sticker" style={{ fontSize: size * 0.8, lineHeight: 1 }}>{s}</span>;
}
export const STICKERS = [
  'a:cat:orange', 'a:cat:gray', 'a:cat:black', 'a:frog:green', 'a:frog:teal', 'a:capybara:brown', 'a:penguin:classic', 'a:penguin:blue',
  'f:rose', 'f:lily', 'f:lavender', '💚', '🥰', '😴', '🍜', '☕', '🌙', '✨', '🎂', '🌧️', '🎬', '🧸',
];

/* ---------- avatar ---------- */
export function Avatar({ p, size = 36, className = '' }) {
  const kind = p?.animal || 'cat';
  return (
    <span className={'avatar ' + className} style={{ width: size, height: size, background: p?.color || '#d7efc6' }}>
      <Animal kind={kind} variant={p?.variant} size={size * 1.12} box="10 4 80 80" />
    </span>
  );
}

/* ---------- icons ---------- */
const ICONS = {
  planet: <><circle cx="12" cy="12" r="6" /><path d="M3.5 15C2 11 7 6.5 15.5 5.5M20.5 9c1.5 4-3.500 8.500-12 9.500" /></>,
  frame: <><rect x="3" y="3" width="18" height="18" rx="1.5" /><rect x="7.500" y="7.500" width="9" height="9" /></>,
  mail: <><rect x="2.500" y="4.500" width="19" height="15" rx="2" /><path d="m21.500 7.500-9.500 6-9.500-6" /></>,
  chat: <path d="M21 12a8 8 0 0 1-11.600 7.100L3 21l1.900-5.400A8 8 0 1 1 21 12z" />,
  more: <><circle cx="5.500" cy="12" r="1.200" /><circle cx="12" cy="12" r="1.200" /><circle cx="18.500" cy="12" r="1.200" /></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></>,
  smile: <><circle cx="12" cy="12" r="9.500" /><path d="M8 14s1.500 2 4 2 4-2 4-2M9 9.500h.01M15 9.500h.01" /></>,
  palette: <><path d="M12 3a9 9 0 1 0 0 18c1.100 0 1.500-.8 1.200-1.700-.4-1 .2-2.300 1.500-2.300H17a4 4 0 0 0 4-4 9 9 0 0 0-9-10z" /><circle cx="7.500" cy="11" r="1" /><circle cx="10" cy="7" r="1" /><circle cx="15" cy="7" r="1" /></>,
  type: <path d="M4 7V4h16v3M9 20h6M12 4v16" />,
  plus: <path d="M12 5v14M5 12h14" />,
  back: <path d="m15 18-6-6 6-6" />,
  next: <path d="m9 18 6-6-6-6" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  send: <><path d="m22 2-7 20-4-9-9-4z" /><path d="M22 2 11 13" /></>,
  heart: <path d="M19 14c1.500-1.500 3-3.200 3-5.500A5.500 5.500 0 0 0 16.500 3c-1.800 0-3 .5-4.500 2-1.500-1.500-2.700-2-4.500-2A5.500 5.500 0 0 0 2 8.500c0 2.300 1.500 4 3 5.500l7 7z" />,
  trash: <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />,
  drop: <path d="M12 2.700C9 7 6 10 6 14a6 6 0 0 0 12 0c0-4-3-7-6-11.300z" />,
  gift: <><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13M19 12v9H5v-9M7.500 8a2.500 2.500 0 1 1 0-5C11 3 12 8 12 8s1-5 4.500-5a2.500 2.500 0 0 1 0 5" /></>,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  undo: <><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-15-6.700L3 13" /></>,
  flip: <><path d="M3 12a9 9 0 0 1 15-6.700L21 8" /><path d="M21 3v5h-5M21 12a9 9 0 0 1-15 6.700L3 16" /><path d="M3 21v-5h5" /></>,
  library: <><rect x="6" y="5" width="15" height="13" rx="2" /><path d="M3 8v11a2 2 0 0 0 2 2h13" /><circle cx="11" cy="10" r="1.200" /><path d="m21 15-3.500-3.500L8 18" /></>,
  flash: <><path d="M13 2 4 14h7l-1 8 9-12h-7z" /><path d="M3 3l18 18" /></>,
  quill: <><path d="M20 4c-8 0-13 5-14 13l-2 3 3-2c8-1 13-6 13-14z" /><path d="M16 8 6 18" /></>,
  paw: <><circle cx="6" cy="11" r="2" /><circle cx="10" cy="6.500" r="2" /><circle cx="15" cy="6.500" r="2" /><circle cx="19" cy="11" r="2" /><path d="M12 12c-3 0-5.500 3-5.500 5.500 0 1.500 1.200 2.500 2.800 2.500 1 0 1.700-.5 2.700-.5s1.700.5 2.700.5c1.600 0 2.800-1 2.800-2.500C17.500 15 15 12 12 12z" /></>,
  flower: <><circle cx="12" cy="12" r="2.500" /><path d="M12 9.500C10 6 10.500 3 12 3s2 3 0 6.500zM12 14.500c-2 3.500-1.500 6.500 0 6.500s2-3 0-6.500zM9.500 12C6 10 3 10.500 3 12s3 2 6.500 0zM14.500 12c3.500 2 6.500 1.500 6.500 0s-3-2-6.500 0z" /></>,
  users: <><circle cx="9" cy="8" r="3.500" /><path d="M2.500 20c.5-4 3-6 6.500-6s6 2 6.500 6M16 4.500a3.500 3.500 0 0 1 0 7M18 14.500c2 .7 3.200 2.700 3.500 5.500" /></>,
  check: <path d="m5 12.500 4.500 4.500L19 7" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  expand: <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />,
};
export function Icon({ n, size = 22, sw = 2, className = '' }) {
  return (
    <svg className={'icon ' + className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[n]}
    </svg>
  );
}

/* the little polaroid camera from the "Pin it" button */
export function PolaroidCam({ size = 64 }) {
  return (
    <svg width={size} height={size * 0.9} viewBox="0 0 80 72" aria-hidden="true">
      <rect x="3" y="12" width="70" height="52" rx="7" fill="#f4f1ec" stroke="#2f2a26" strokeWidth="3" />
      <rect x="3" y="12" width="70" height="14" rx="7" fill="#e5e0d8" />
      <rect x="9" y="17" width="14" height="5" rx="2" fill="#2f2a26" />
      <circle cx="16" cy="36" r="4.500" fill="#e8383d" />
      <circle cx="43" cy="38" r="15" fill="#2f2a26" />
      <circle cx="43" cy="38" r="9" fill="#4a4f59" />
      <circle cx="40" cy="35" r="3" fill="#fff" opacity=".8" />
      <rect x="58" y="16" width="9" height="7" rx="2" fill="#fff" stroke="#2f2a26" strokeWidth="2" />
      <rect x="40" y="54" width="36" height="16" rx="3" fill="#fff" stroke="#2f2a26" strokeWidth="3" />
      <path d="M58 57v10M53 62h10" stroke="#2f2a26" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- gift box ---------- */
export function GiftBox({ color = '#e8587a', ribbon = '#ffe27a', open = false, size = 160, className = '' }) {
  return (
    <svg className={'giftbox ' + (open ? 'open ' : '') + className} viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      <ellipse cx="60" cy="112" rx="40" ry="5" fill="#000" opacity=".12" />
      <rect x="18" y="52" width="84" height="56" rx="6" fill={color} />
      <rect x="53" y="52" width="14" height="56" fill={ribbon} />
      <g className="lid">
        <rect x="12" y="36" width="96" height="22" rx="6" fill={color} />
        <rect x="12" y="36" width="96" height="22" rx="6" fill="#fff" opacity=".12" />
        <rect x="53" y="36" width="14" height="22" fill={ribbon} />
        <path d="M60 36C44 14 28 22 38 32c6 5 16 4 22 4zM60 36c16-22 32-14 22-4-6 5-16 4-22 4z" fill={ribbon} />
        <circle cx="60" cy="36" r="5" fill={ribbon} stroke="#000" strokeOpacity=".1" />
      </g>
    </svg>
  );
}

/* ---------- confetti ---------- */
const CONF = ['#ff6b8b', '#ffd166', '#58b536', '#6ec6ff', '#c79bff', '#ff9f68'];
export function Confetti({ n = 36 }) {
  const items = React.useMemo(
    () => Array.from({ length: n }, (_, i) => ({
      dx: (Math.random() - 0.5) * 300, dy: -80 - Math.random() * 240, r: Math.random() * 720 - 360,
      c: CONF[i % CONF.length], d: 0.9 + Math.random() * 0.9, w: 6 + Math.random() * 6,
    })), [n]);
  return (
    <div className="confetti" aria-hidden="true">
      {items.map((it, i) => (
        <i key={i} style={{ '--dx': it.dx + 'px', '--dy': it.dy + 'px', '--r': it.r + 'deg', background: it.c, animationDuration: it.d + 's', width: it.w, height: it.w * 0.6 }} />
      ))}
    </div>
  );
}
