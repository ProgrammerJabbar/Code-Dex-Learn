import React, { useEffect, useState } from 'react';
import { useApp, Header, Sheet, Confirm, hash, rid, dateStr, agoText } from '../lib.jsx';
import { Animal, ANIMALS, PAL, variantsOf, Icon } from '../art.jsx';

const NAMES = ['Biscuit', 'Mochi', 'Pudding', 'Noodle', 'Pickle', 'Tofu', 'Bean', 'Waffle', 'Kero', 'Yuzu', 'Sprout', 'Boba'];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const hungry = (c) => Date.now() - (c.lastFed || c.ts) > 10 * 36e5;

function Adopt({ onClose }) {
  const { add, toast } = useApp();
  const [kind, setKind] = useState('cat');
  const [variant, setVariant] = useState('orange');
  const [name, setName] = useState(() => NAMES[Math.floor(Math.random() * NAMES.length)]);
  const pickKind = (k) => { setKind(k); setVariant(variantsOf(k)[0]); };
  async function save() {
    if (!name.trim()) return;
    if (await add('critters', { kind, variant, name: name.trim().slice(0, 24), pets: 0, lastFed: Date.now() })) { toast(`${name.trim()} moved in`); onClose(); }
  }
  return (
    <Sheet title="Adopt a friend" onClose={onClose}>
      <div className="adopt-stage"><Animal kind={kind} variant={variant} size={130} className="bob" /></div>
      <div className="kinds">
        {Object.entries(ANIMALS).map(([k, v]) => (
          <button key={k} className={'kind' + (kind === k ? ' on' : '')} onClick={() => pickKind(k)}><Animal kind={k} size={52} /><span>{v.label}</span></button>
        ))}
      </div>
      {variantsOf(kind).length > 1 && (
        <div className="swatches center" role="group" aria-label="Colour">
          {variantsOf(kind).map((v) => <button key={v} className={'sw' + (v === variant ? ' on' : '')} style={{ background: PAL[kind][v].b }} onClick={() => setVariant(v)} aria-label={v} />)}
        </div>
      )}
      <label className="lbl" htmlFor="critter-name">Name</label>
      <input id="critter-name" className="input" value={name} maxLength={24} onChange={(e) => setName(e.target.value)} />
      <button className="btn big" onClick={save} disabled={!name.trim()}>Bring them home</button>
    </Sheet>
  );
}

export default function Critters({ back }) {
  const { data, uid, patch, del, nameOf, toast } = useApp();
  const crit = data.critters;
  const [pos, setPos] = useState({});
  const [sel, setSel] = useState(null);
  const [adopt, setAdopt] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [munch, setMunch] = useState(null);
  const [rename, setRename] = useState('');

  useEffect(() => {
    setPos((p) => {
      let ch = false; const n = { ...p };
      for (const c of crit) if (!n[c.id]) { n[c.id] = { x: 14 + (hash(c.id) % 72), y: 44 + (hash(c.id + 'y') % 44), f: 1 }; ch = true; }
      return ch ? n : p;
    });
  }, [crit]);
  useEffect(() => {
    const t = setInterval(() => setPos((p) => {
      const n = { ...p };
      for (const id in n) if (Math.random() < 0.5) {
        const o = n[id]; const x = clamp(o.x + (Math.random() - 0.5) * 36, 10, 90), y = clamp(o.y + (Math.random() - 0.5) * 18, 40, 92);
        n[id] = { x, y, f: x < o.x ? -1 : 1 };
      }
      return n;
    }), 4200);
    return () => clearInterval(t);
  }, []);

  const cur = sel && crit.find((c) => c.id === sel);
  useEffect(() => { if (cur) setRename(cur.name); }, [sel]); // eslint-disable-line

  function pet(c) {
    const k = rid(); const p = pos[c.id] || { x: 50, y: 60 };
    setHearts((h) => [...h, { k, x: p.x, y: p.y }]);
    setTimeout(() => setHearts((h) => h.filter((x) => x.k !== k)), 1200);
    patch('critters/' + c.id, { pets: (c.pets || 0) + 1 });
  }
  async function feed(c) {
    if (await patch('critters/' + c.id, { lastFed: Date.now() })) { setMunch(c.id); setTimeout(() => setMunch(null), 1400); toast(`${c.name} enjoyed the ${ANIMALS[c.kind]?.treat || '🍎'}`); }
  }

  return (
    <div className="critters">
      <Header title="Critter Corner" sub={crit.length ? `${crit.length} friend${crit.length === 1 ? '' : 's'} living here` : 'Nobody lives here yet'} back={back} className="on-sky" right={<button className="btn" onClick={() => setAdopt(true)}><Icon n="paw" size={18} /> Adopt</button>} />
      <div className="yard">
        <i className="cloud c1" /><i className="cloud c2" />
        <div className="pond" aria-hidden="true"><i /><i /></div>
        <div className="tree" aria-hidden="true"><b /><u /></div>
        {crit.length === 0 && <p className="meadow-hint">Adopt a frog, capybara, penguin or cat. They wander around while you are away.</p>}
        {crit.map((c) => {
          const p = pos[c.id] || { x: 50, y: 60, f: 1 };
          return (
            <button key={c.id} className="critter" style={{ left: p.x + '%', top: p.y + '%', zIndex: Math.round(p.y), '--sc': 0.72 + p.y / 220 }} onClick={() => setSel(c.id)} aria-label={`${c.name} the ${c.kind}`}>
              {hungry(c) && <span className="hungry" title="Hungry">🍽️</span>}
              {munch === c.id && <span className="munch">{ANIMALS[c.kind]?.treat}</span>}
              <span className="walker" style={{ transform: `scaleX(${p.f})` }}><Animal kind={c.kind} variant={c.variant} size={88} className="bob" style={{ animationDelay: (hash(c.id) % 20) / 10 + 's' }} /></span>
              <span className="tag">{c.name}</span>
            </button>
          );
        })}
        {hearts.map((h) => <span key={h.k} className="heart-pop" style={{ left: h.x + '%', top: h.y - 14 + '%' }}>💚</span>)}
      </div>
      {cur && (
        <Sheet title={cur.name} onClose={() => setSel(null)}>
          <div className="adopt-stage"><Animal kind={cur.kind} variant={cur.variant} size={120} className="bob" /></div>
          <p className="center soft">{ANIMALS[cur.kind]?.label} · adopted by {nameOf(cur.by)} on {dateStr(cur.ts)}</p>
          <div className="stats">
            <div><strong>{cur.pets || 0}</strong><span>pats</span></div>
            <div><strong>{hungry(cur) ? 'Hungry' : 'Full'}</strong><span>fed {agoText(cur.lastFed || cur.ts)}</span></div>
          </div>
          <div className="row">
            <button className="btn" onClick={() => pet(cur)}><Icon n="heart" size={18} /> Pat</button>
            <button className="btn" onClick={() => feed(cur)}>{ANIMALS[cur.kind]?.treat} Feed</button>
          </div>
          <label className="lbl" htmlFor="rename">Name</label>
          <div className="row"><input id="rename" className="input" value={rename} maxLength={24} onChange={(e) => setRename(e.target.value)} />
            <button className="btn ghost" disabled={!rename.trim() || rename.trim() === cur.name} onClick={() => patch('critters/' + cur.id, { name: rename.trim() })}>Save</button></div>
          <div className="row end"><Confirm label="Find a new home" onYes={async () => { if (await del('critters/' + cur.id)) setSel(null); }} /></div>
        </Sheet>
      )}
      {adopt && <Adopt onClose={() => setAdopt(false)} />}
    </div>
  );
}
