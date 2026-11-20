import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../lib.jsx';
import { Icon, StickerArt, STICKERS } from '../art.jsx';

const PAPER = ['#fff0b8', '#ffe0e8', '#dff3d4', '#d9e8ff', '#eadfff'];
const INK = ['#2f2a26', '#e8383d', '#f0932b', '#43962a', '#2f7de1', '#8a4fd6', '#ff7aa8'];
const EMOJI = ['', '💚', '😋', '😴', '🌸', '🎉', '🥰', '☔'];

function Doodle({ canvasRef }) {
  const [ink, setInk] = useState(INK[0]);
  const [size, setSize] = useState(6);
  const hist = useRef([]);
  const down = useRef(false);
  const last = useRef(null);
  useEffect(() => {
    const c = canvasRef.current; const g = c.getContext('2d');
    g.fillStyle = '#fffdf9'; g.fillRect(0, 0, c.width, c.height);
  }, [canvasRef]);
  const pt = (e) => {
    const c = canvasRef.current, r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  };
  const start = (e) => {
    const c = canvasRef.current, g = c.getContext('2d');
    hist.current.push(g.getImageData(0, 0, c.width, c.height)); if (hist.current.length > 15) hist.current.shift();
    down.current = true; last.current = pt(e); c.setPointerCapture(e.pointerId); move(e);
  };
  const move = (e) => {
    if (!down.current) return;
    const g = canvasRef.current.getContext('2d'), p = pt(e), l = last.current || p;
    g.strokeStyle = ink; g.lineWidth = size * 1.6; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(l.x, l.y); g.lineTo(p.x + 0.01, p.y); g.stroke(); last.current = p;
  };
  const end = () => { down.current = false; };
  const undo = () => { const h = hist.current.pop(); if (h) canvasRef.current.getContext('2d').putImageData(h, 0, 0); };
  const clear = () => {
    const c = canvasRef.current, g = c.getContext('2d');
    hist.current.push(g.getImageData(0, 0, c.width, c.height));
    g.fillStyle = '#fffdf9'; g.fillRect(0, 0, c.width, c.height);
  };
  return (
    <>
      <div className="viewfinder paper">
        <canvas ref={canvasRef} width="640" height="640" className="doodle" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} aria-label="Drawing area" />
      </div>
      <div className="tools">
        <div className="swatches" role="group" aria-label="Pen colour">
          {INK.map((c) => <button key={c} className={'sw' + (c === ink ? ' on' : '')} style={{ background: c }} onClick={() => setInk(c)} aria-label={'Colour ' + c} />)}
        </div>
        <div className="sizes" role="group" aria-label="Pen size">
          {[3, 6, 11].map((s) => <button key={s} className={'sz' + (s === size ? ' on' : '')} onClick={() => setSize(s)} aria-label={'Size ' + s}><i style={{ width: s + 4, height: s + 4 }} /></button>)}
        </div>
        <button className="icon-btn" onClick={undo} aria-label="Undo"><Icon n="undo" /></button>
        <button className="icon-btn" onClick={clear} aria-label="Clear drawing"><Icon n="trash" /></button>
      </div>
    </>
  );
}

export default function PinIt({ onClose }) {
  const { add, pack, toast } = useApp();
  const [mode, setMode] = useState('photo');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [facing, setFacing] = useState('environment');
  const [sticker, setSticker] = useState(STICKERS[0]);
  const [paper, setPaper] = useState(PAPER[0]);
  const [text, setText] = useState('');
  const [caption, setCaption] = useState('');
  const [emoji, setEmoji] = useState('');
  const [busy, setBusy] = useState(false);
  const cam = useRef(null), lib = useRef(null), canvas = useRef(null), drew = useRef(false);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);
  const pick = (e) => {
    const f = e.target.files && e.target.files[0]; e.target.value = '';
    if (!f) return;
    if (!/^image\//.test(f.type)) { toast('Please choose a picture.'); return; }
    setFile(f); setPreview(URL.createObjectURL(f));
  };
  const can = mode === 'photo' ? !!file : mode === 'note' ? text.trim().length > 0 : true;

  async function post() {
    if (busy || !can) return;
    setBusy(true);
    let body = null;
    if (mode === 'photo') { const r = await pack(file, { max: 1400, square: true }); if (r) body = { type: 'photo', ...r }; }
    else if (mode === 'doodle') { const r = await pack(canvas.current, { max: 640, square: true }); if (r) body = { type: 'doodle', ...r }; }
    else if (mode === 'sticker') body = { type: 'sticker', sticker, color: PAPER[Math.abs(STICKERS.indexOf(sticker)) % PAPER.length] };
    else body = { type: 'note', text: text.trim().slice(0, 120), color: paper };
    if (body) {
      const ok = await add('pins', { ...body, caption: caption.trim().slice(0, 60), emoji: emoji || null });
      if (ok) { toast('Pinned to Our Days'); onClose(); return; }
    }
    setBusy(false);
  }

  const tabs = [['photo', 'image', 'Photo'], ['sticker', 'smile', 'Sticker'], ['doodle', 'palette', 'Doodle'], ['note', 'type', 'Note']];
  return (
    <div className="pinit">
      <header className="head pad">
        <button className="icon-btn" onClick={onClose} aria-label="Back"><Icon n="back" size={24} /></button>
        <div className="head-t"><h1>Pin it!</h1></div>
      </header>
      <div className="modes pad" role="tablist">
        {tabs.map(([k, ic, label]) => (
          <button key={k} role="tab" aria-selected={mode === k} className={'mode' + (mode === k ? ' on' : '')} onClick={() => setMode(k)}>
            <Icon n={ic} size={24} /><span>{label}</span>
          </button>
        ))}
      </div>
      <div className="pinit-body pad">
        {mode === 'photo' && (
          <>
            <div className="viewfinder">
              {preview ? <img src={preview} alt="Chosen photo" /> : <div className="vf-empty"><Icon n="image" size={44} sw={1.5} /><p>Take a photo or choose one from your library.</p></div>}
              <span className="vf-flash"><Icon n="flash" size={20} /></span>
            </div>
            <div className="shutter-row">
              <button className="side" onClick={() => lib.current.click()} aria-label="Choose from library"><Icon n="library" size={30} /></button>
              <button className="shutter" onClick={() => cam.current.click()} aria-label="Take a photo"><i /></button>
              <button className="side" onClick={() => setFacing(facing === 'environment' ? 'user' : 'environment')} aria-label={'Camera: ' + (facing === 'user' ? 'front' : 'back')}><Icon n="flip" size={28} /></button>
            </div>
            <p className="soft center small">Using the {facing === 'user' ? 'front' : 'back'} camera</p>
            <input ref={cam} type="file" accept="image/*" capture={facing} hidden onChange={pick} />
            <input ref={lib} type="file" accept="image/*" hidden onChange={pick} />
          </>
        )}
        {mode === 'sticker' && (
          <>
            <div className="viewfinder paper sticker-stage"><StickerArt s={sticker} size={150} /></div>
            <div className="sticker-grid">
              {STICKERS.map((s) => <button key={s} className={'stk' + (s === sticker ? ' on' : '')} onClick={() => setSticker(s)} aria-label={'Sticker ' + s}><StickerArt s={s} size={42} /></button>)}
            </div>
          </>
        )}
        {mode === 'doodle' && <Doodle canvasRef={canvas} />}
        {mode === 'note' && (
          <>
            <div className="viewfinder note-stage" style={{ background: paper }}>
              <textarea id="note-text" value={text} onChange={(e) => setText(e.target.value)} maxLength={120} placeholder="Write something small and sweet" aria-label="Note text" />
            </div>
            <div className="swatches center" role="group" aria-label="Paper colour">
              {PAPER.map((c) => <button key={c} className={'sw' + (c === paper ? ' on' : '')} style={{ background: c }} onClick={() => setPaper(c)} aria-label={'Paper ' + c} />)}
            </div>
          </>
        )}
        <div className="compose">
          <label className="lbl" htmlFor="pin-cap">Short message</label>
          <input id="pin-cap" className="input" value={caption} maxLength={60} onChange={(e) => setCaption(e.target.value)} placeholder="Say something about this moment" />
          <div className="emoji-row" role="group" aria-label="Mood">
            {EMOJI.map((e) => <button key={e || 'none'} className={'emo' + (e === emoji ? ' on' : '')} onClick={() => setEmoji(e)}>{e || 'None'}</button>)}
          </div>
          <button className="btn big" disabled={!can || busy} onClick={post}>{busy ? 'Pinning…' : 'Pin to Our Days'}</button>
        </div>
      </div>
    </div>
  );
}
