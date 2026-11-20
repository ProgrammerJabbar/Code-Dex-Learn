import React, { useRef, useState } from 'react';
import { useApp, Header, Sheet, Confirm, dayKey, hash, dateStr } from '../lib.jsx';
import { Flower, FLOWERS, Icon, stageName } from '../art.jsx';

const stageOf = (f) => Math.min(3, (f.waters || []).length);

export default function Garden({ back }) {
  const { data, uid, add, patch, del, nameOf, toast } = useApp();
  const [kind, setKind] = useState('rose');
  const [planting, setPlanting] = useState(false);
  const [note, setNote] = useState('');
  const [sel, setSel] = useState(null);
  const [rain, setRain] = useState(null);
  const meadow = useRef(null);
  const today = dayKey();
  const flowers = [...data.garden].sort((a, b) => a.y - b.y);
  const bloomed = flowers.filter((f) => stageOf(f) === 3).length;
  const cur = sel && data.garden.find((f) => f.id === sel);

  async function plant(e) {
    if (!planting) return;
    const r = meadow.current.getBoundingClientRect();
    const x = Math.min(94, Math.max(6, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.min(97, Math.max(16, ((e.clientY - r.top) / r.height) * 100));
    const ok = await add('garden', { kind, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, note: note.trim().slice(0, 80), waters: [] });
    if (ok) { setPlanting(false); setNote(''); toast(`${FLOWERS[kind].label} planted. Water it to help it grow.`); }
  }
  async function water(f) {
    const w = f.waters || [];
    if (w.some((x) => x.by === uid && x.day === today)) { toast('You already watered this one today.'); return; }
    const ok = await patch('garden/' + f.id, { waters: [...w, { by: uid, day: today, ts: Date.now() }] });
    if (ok) { setRain(f.id); setTimeout(() => setRain(null), 1500); }
  }

  return (
    <div className="garden">
      <Header title="Our Garden" sub={`${flowers.length} planted · ${bloomed} in bloom`} back={back} className="on-sky" />
      <div className="scene-garden">
        <div className="sun" /><i className="cloud c1" /><i className="cloud c2" />
        <div className={'meadow' + (planting ? ' planting' : '')} ref={meadow} onClick={plant}>
          {flowers.length === 0 && !planting && <p className="meadow-hint">The meadow is bare. Choose a flower below and plant the first one.</p>}
          {flowers.map((f) => {
            const s = stageOf(f);
            return (
              <button key={f.id} className={'plant' + (rain === f.id ? ' rain' : '')} style={{ left: f.x + '%', top: f.y + '%', '--sc': 0.62 + f.y / 160, '--d': (hash(f.id) % 30) / 10 + 's', zIndex: Math.round(f.y) }} onClick={(e) => { e.stopPropagation(); if (!planting) setSel(f.id); }} aria-label={`${FLOWERS[f.kind]?.label || 'Flower'}, ${stageName(s)}`}>
                <Flower kind={f.kind} stage={s} size={96} />
                {rain === f.id && <span className="drops"><i /><i /><i /><i /></span>}
              </button>
            );
          })}
          {planting && <div className="plant-tip">Tap where it should grow</div>}
        </div>
      </div>
      <div className="dock pad">
        <div className="dock-row">
          {Object.entries(FLOWERS).map(([k, v]) => (
            <button key={k} className={'seed' + (kind === k ? ' on' : '')} onClick={() => { setKind(k); setPlanting(true); }} aria-pressed={kind === k}>
              <Flower kind={k} stage={3} size={46} /><span>{v.label}</span>
            </button>
          ))}
        </div>
        <div className="dock-row">
          <input id="plant-note" className="input" value={note} maxLength={80} onChange={(e) => setNote(e.target.value)} placeholder="Add a note to the next flower (optional)" />
          {planting && <button className="btn ghost" onClick={() => setPlanting(false)}>Cancel</button>}
        </div>
      </div>
      {cur && (
        <Sheet title={FLOWERS[cur.kind]?.label || 'Flower'} onClose={() => setSel(null)}>
          <div className="flower-card">
            <Flower kind={cur.kind} stage={stageOf(cur)} size={170} />
            <div className="grow" role="img" aria-label={`Growth: ${stageName(stageOf(cur))}`}>
              {[0, 1, 2, 3].map((i) => <span key={i} className={i <= stageOf(cur) ? 'on' : ''} />)}
            </div>
            <p><strong>{stageName(stageOf(cur))}</strong>{stageOf(cur) < 3 ? ` · ${3 - stageOf(cur)} more watering${3 - stageOf(cur) === 1 ? '' : 's'} to bloom` : ''}</p>
          </div>
          {cur.note && <p className="note-quote">“{cur.note}”</p>}
          <p className="soft">Planted by {nameOf(cur.by)} on {dateStr(cur.ts)}. Watered {(cur.waters || []).length} time{(cur.waters || []).length === 1 ? '' : 's'}.</p>
          <div className="row">
            <button className="btn" onClick={() => water(cur)} disabled={(cur.waters || []).some((x) => x.by === uid && x.day === today)}><Icon n="drop" size={18} /> {(cur.waters || []).some((x) => x.by === uid && x.day === today) ? 'Watered today' : 'Water it'}</button>
            {cur.by === uid && <Confirm label="Dig up" onYes={async () => { if (await del('garden/' + cur.id)) setSel(null); }} />}
          </div>
        </Sheet>
      )}
    </div>
  );
}
