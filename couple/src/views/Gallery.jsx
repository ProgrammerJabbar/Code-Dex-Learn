import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp, imgSrc, Sheet, Confirm, dayKey, parseDay, dateStr } from '../lib.jsx';
import { Icon } from '../art.jsx';

const FRAMES = [['gold', 'Gilt'], ['walnut', 'Walnut'], ['black', 'Ebony'], ['white', 'Gallery white']];

function AddPiece({ onClose }) {
  const { pack, add, toast } = useApp();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState(dayKey());
  const [frame, setFrame] = useState('gold');
  const [busy, setBusy] = useState(false);
  const input = useRef(null);
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);
  const pick = (e) => {
    const f = e.target.files && e.target.files[0]; e.target.value = '';
    if (!f) return;
    if (!/^image\//.test(f.type)) { toast('Please choose a picture.'); return; }
    setFile(f); setPreview(URL.createObjectURL(f));
  };
  async function save() {
    if (!file || !title.trim() || busy) return;
    setBusy(true);
    const r = await pack(file, { max: 1600 });
    if (r && (await add('gallery', { ...r, title: title.trim().slice(0, 60), caption: caption.trim().slice(0, 240), date, frame }))) { toast('Hung in the gallery'); onClose(); return; }
    setBusy(false);
  }
  return (
    <Sheet title="Hang a new piece" onClose={onClose}>
      <button className="drop" onClick={() => input.current.click()}>
        {preview ? <img src={preview} alt="Chosen memory" /> : <><Icon n="image" size={36} sw={1.5} /><span>Choose a photo</span></>}
      </button>
      <input ref={input} type="file" accept="image/*" hidden onChange={pick} />
      <label className="lbl" htmlFor="g-title">Title</label>
      <input id="g-title" className="input" value={title} maxLength={60} onChange={(e) => setTitle(e.target.value)} placeholder="The lavender farm" />
      <label className="lbl" htmlFor="g-cap">Little story</label>
      <textarea id="g-cap" className="input" rows={3} value={caption} maxLength={240} onChange={(e) => setCaption(e.target.value)} placeholder="Why this day matters" />
      <label className="lbl" htmlFor="g-date">Day it happened</label>
      <input id="g-date" type="date" className="input" value={date} max={dayKey()} onChange={(e) => setDate(e.target.value || dayKey())} />
      <div className="lbl">Frame</div>
      <div className="seg">
        {FRAMES.map(([k, l]) => <button key={k} className={frame === k ? 'on' : ''} onClick={() => setFrame(k)}>{l}</button>)}
      </div>
      <button className="btn big" disabled={!file || !title.trim() || busy} onClick={save}>{busy ? 'Hanging…' : 'Hang it on the wall'}</button>
    </Sheet>
  );
}

export default function Gallery() {
  const { data, uid, markSeen, isNew, nameOf, del, byId } = useApp();
  const [adding, setAdding] = useState(false);
  const [zoom, setZoom] = useState(null);
  const [idx, setIdx] = useState(0);
  const sc = useRef(null);
  useEffect(() => { const t = setTimeout(() => markSeen('gallery'), 2000); return () => clearTimeout(t); }, [markSeen]);

  const items = useMemo(() => [...data.gallery].sort((a, b) => parseDay(a.date || dayKey(a.ts)) - parseDay(b.date || dayKey(b.ts))), [data.gallery]);
  const rooms = items.length + 2; // entrance + pieces + empty frame
  const go = (i) => {
    const el = sc.current; if (!el) return;
    const k = Math.max(0, Math.min(rooms - 1, i));
    el.scrollTo({ left: k * el.clientWidth, behavior: 'smooth' });
  };
  const onScroll = () => { const el = sc.current; if (el) setIdx(Math.round(el.scrollLeft / el.clientWidth)); };
  useEffect(() => {
    const k = (e) => { if (e.target.closest('input,textarea')) return; if (e.key === 'ArrowRight') go(idx + 1); if (e.key === 'ArrowLeft') go(idx - 1); };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  });
  const names = [...new Set((data.profiles || []).map((p) => p.name))].join(' & ');
  const zoomed = zoom && items.find((x) => x.id === zoom);

  return (
    <div className="gal">
      <div className="gal-scroll" ref={sc} onScroll={onScroll}>
        <section className="room entrance">
          <div className="exhibit">
            <div className="door" aria-hidden="true"><i /><i /></div>
            <p className="eyebrow">Permanent collection</p>
            <h1>The Museum of Us</h1>
            <p className="curated">Curated by {names || 'the two of you'}</p>
            <p className="walk">{items.length === 0 ? 'No pieces yet. Hang the first one at the end of the hall.' : `${items.length} piece${items.length === 1 ? '' : 's'} on view. Swipe to walk the hall`} <Icon n="next" size={16} /></p>
          </div>
        </section>
        {items.map((g, i) => {
          const src = imgSrc(g);
          return (
            <section className="room" key={g.id}>
              <div className="exhibit">
                <button className={'frame ' + (g.frame || 'gold')} onClick={() => setZoom(g.id)} aria-label={'Look closer at ' + g.title}>
                  <span className="mat">{src ? <img src={src} alt={g.title} loading="lazy" /> : <span className="missing">Photo unavailable</span>}</span>
                  {isNew('gallery', g) && <span className="new-tag">New</span>}
                </button>
                <div className="plaque">
                  <p className="p-no">No. {i + 1} · {dateStr(parseDay(g.date || dayKey(g.ts)))}</p>
                  <h2>{g.title}</h2>
                  {g.caption && <p className="p-cap">{g.caption}</p>}
                  <p className="p-by">Added by {nameOf(g.by)}</p>
                </div>
              </div>
            </section>
          );
        })}
        <section className="room">
          <div className="exhibit">
            <button className="frame empty" onClick={() => setAdding(true)} aria-label="Hang a new piece">
              <span className="mat"><span className="empty-in"><Icon n="plus" size={40} sw={1.6} /><span>Next exhibit</span></span></span>
            </button>
            <div className="plaque"><p className="p-no">Coming soon</p><h2>Something you haven't made yet</h2></div>
          </div>
        </section>
      </div>
      <div className="gal-ui">
        <span className="gal-count">{idx === 0 ? 'Entrance' : idx > items.length ? 'Next exhibit' : `${idx} of ${items.length}`}</span>
        <button className="gal-add" onClick={() => setAdding(true)}><Icon n="plus" size={18} /> Add piece</button>
      </div>
      {idx > 0 && <button className="gal-arrow l" onClick={() => go(idx - 1)} aria-label="Previous room"><Icon n="back" size={28} /></button>}
      {idx < rooms - 1 && <button className="gal-arrow r" onClick={() => go(idx + 1)} aria-label="Next room"><Icon n="next" size={28} /></button>}
      <div className="gal-dots" aria-hidden="true">{Array.from({ length: rooms }, (_, i) => <i key={i} className={i === idx ? 'on' : ''} />)}</div>
      {adding && <AddPiece onClose={() => setAdding(false)} />}
      {zoomed && (
        <Sheet title={zoomed.title} onClose={() => setZoom(null)} wide>
          <img className="zoom-img" src={imgSrc(zoomed)} alt={zoomed.title} />
          {zoomed.caption && <p>{zoomed.caption}</p>}
          <p className="soft">Added by {nameOf(zoomed.by)}</p>
          {zoomed.by === uid && <div className="row end"><Confirm label="Take down" onYes={async () => { if (await del('gallery/' + zoomed.id)) setZoom(null); }} /></div>}
        </Sheet>
      )}
    </div>
  );
}
