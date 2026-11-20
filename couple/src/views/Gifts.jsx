import React, { useEffect, useRef, useState } from 'react';
import { useApp, Header, Sheet, imgSrc, dateStr, stamp, untilText, tiltOf } from '../lib.jsx';
import { GiftBox, Confetti, Flower, FLOWERS, Icon, Animal } from '../art.jsx';

const WRAPS = [['#e8587a', '#ffe27a'], ['#43962a', '#ffffff'], ['#4f94e0', '#ffd166'], ['#9b7fd6', '#fff1b8'], ['#f0932b', '#ffffff']];
const COUPONS = ['One long hug, any time', 'Movie night, my pick', 'Breakfast in bed', 'A back rub', 'Anything you want, one day'];
const locked = (g, uid) => g.by !== uid && g.unlockAt && g.unlockAt > Date.now();

function Contents({ g }) {
  const src = imgSrc(g);
  return (
    <div className="gift-reveal">
      <h3>{g.title || 'A surprise'}</h3>
      {g.bouquet && g.bouquet.length > 0 && (
        <div className="bouquet" aria-label="A bouquet">
          {g.bouquet.slice(0, 6).map((k, i) => <span key={i} style={{ '--i': i - (g.bouquet.length - 1) / 2 }}><Flower kind={FLOWERS[k] ? k : 'rose'} stage={3} size={92} /></span>)}
        </div>
      )}
      {src && <img className="gift-photo" src={src} alt="Gift photo" />}
      {g.message && <p className="gift-msg">{g.message}</p>}
      {g.coupon && <div className="coupon"><span>Good for</span><strong>{g.coupon}</strong></div>}
    </div>
  );
}

function Unwrap({ g, onClose }) {
  const { patch, nameOf } = useApp();
  const [stage, setStage] = useState('closed');
  const [wrap, ribbon] = [g.color || WRAPS[0][0], g.ribbon || '#ffe27a'];
  function open() {
    if (stage !== 'closed') return;
    setStage('shake');
    setTimeout(() => { setStage('open'); if (!g.openedAt) patch('gifts/' + g.id, { openedAt: Date.now() }); }, 1000);
  }
  return (
    <Sheet title={stage === 'open' ? 'Surprise!' : `From ${nameOf(g.by)}`} onClose={onClose}>
      {stage !== 'open' ? (
        <div className="unwrap">
          <button className={'gift-btn ' + stage} onClick={open} aria-label="Open the gift"><GiftBox color={wrap} ribbon={ribbon} size={200} /></button>
          <p className="soft">{stage === 'closed' ? 'Tap the box to unwrap it' : 'Opening…'}</p>
        </div>
      ) : (
        <div className="unwrap opened"><Confetti /><Contents g={g} /></div>
      )}
    </Sheet>
  );
}

function Wrap({ onClose }) {
  const { add, pack, toast } = useApp();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [coupon, setCoupon] = useState('');
  const [bouquet, setBouquet] = useState([]);
  const [file, setFile] = useState(null);
  const [wrap, setWrap] = useState(0);
  const [when, setWhen] = useState('');
  const [busy, setBusy] = useState(false);
  const input = useRef(null);
  const can = title.trim() && (message.trim() || coupon.trim() || bouquet.length || file);
  async function save() {
    if (!can || busy) return;
    setBusy(true);
    let img = {};
    if (file) { const r = await pack(file, { max: 1200 }); if (!r) { setBusy(false); return; } img = r; }
    const unlockAt = when ? new Date(when).getTime() : null;
    const ok = await add('gifts', { title: title.trim().slice(0, 50), message: message.trim().slice(0, 600), coupon: coupon.trim().slice(0, 80), bouquet, color: WRAPS[wrap][0], ribbon: WRAPS[wrap][1], unlockAt, openedAt: null, ...img });
    if (ok) { toast('Wrapped and waiting'); onClose(); return; }
    setBusy(false);
  }
  return (
    <Sheet title="Wrap a surprise" onClose={onClose}>
      <div className="adopt-stage"><GiftBox color={WRAPS[wrap][0]} ribbon={WRAPS[wrap][1]} size={110} /></div>
      <div className="swatches center" role="group" aria-label="Wrapping paper">
        {WRAPS.map(([c], i) => <button key={c} className={'sw' + (i === wrap ? ' on' : '')} style={{ background: c }} onClick={() => setWrap(i)} aria-label={'Wrapping ' + (i + 1)} />)}
      </div>
      <label className="lbl" htmlFor="gift-title">What is it called? (shown after opening)</label>
      <input id="gift-title" className="input" value={title} maxLength={50} onChange={(e) => setTitle(e.target.value)} placeholder="For the long week" />
      <label className="lbl" htmlFor="gift-msg">A note</label>
      <textarea id="gift-msg" className="input" rows={3} value={message} maxLength={600} onChange={(e) => setMessage(e.target.value)} placeholder="Write something to find inside" />
      <div className="lbl">Bouquet</div>
      <div className="bq-pick">
        {Object.entries(FLOWERS).map(([k, v]) => (
          <button key={k} onClick={() => bouquet.length < 6 && setBouquet([...bouquet, k])}><Flower kind={k} stage={3} size={44} /><span>{v.label}{bouquet.filter((x) => x === k).length ? ` ×${bouquet.filter((x) => x === k).length}` : ''}</span></button>
        ))}
        {bouquet.length > 0 && <button className="clear" onClick={() => setBouquet([])}>Clear</button>}
      </div>
      <label className="lbl" htmlFor="gift-coupon">A coupon</label>
      <input id="gift-coupon" className="input" value={coupon} maxLength={80} onChange={(e) => setCoupon(e.target.value)} placeholder="Good for…" />
      <div className="chips">{COUPONS.map((c) => <button key={c} className="chip" onClick={() => setCoupon(c)}>{c}</button>)}</div>
      <div className="lbl">A photo</div>
      <button className="btn ghost" onClick={() => input.current.click()}><Icon n="image" size={18} /> {file ? file.name.slice(0, 28) : 'Add a photo'}</button>
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (f && /^image\//.test(f.type)) setFile(f); }} />
      <label className="lbl" htmlFor="gift-when">Can be opened from (optional)</label>
      <input id="gift-when" type="datetime-local" className="input" min={new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 16)} value={when} onChange={(e) => setWhen(e.target.value)} />
      <button className="btn big" disabled={!can || busy} onClick={save}>{busy ? 'Wrapping…' : 'Wrap it up'}</button>
    </Sheet>
  );
}

export default function Gifts({ back }) {
  const { data, uid, nameOf } = useApp();
  const [tab, setTab] = useState('in');
  const [open, setOpen] = useState(null);
  const [wrapping, setWrapping] = useState(false);
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((x) => x + 1), 30000); return () => clearInterval(t); }, []);
  const all = [...data.gifts].sort((a, b) => b.ts - a.ts);
  const incoming = all.filter((g) => g.by !== uid), outgoing = all.filter((g) => g.by === uid);
  const list = tab === 'in' ? incoming : outgoing;
  const cur = open && data.gifts.find((g) => g.id === open);
  const waiting = incoming.filter((g) => !g.openedAt && !locked(g, uid)).length;
  return (
    <div className="gifts">
      <Header title="Surprises" sub="Wrap something small for each other" back={back} right={<button className="btn" onClick={() => setWrapping(true)}><Icon n="gift" size={18} /> Wrap</button>} />
      <div className="seg pad2">
        <button className={tab === 'in' ? 'on' : ''} onClick={() => setTab('in')}>For you{waiting ? <b className="dot" /> : null}</button>
        <button className={tab === 'out' ? 'on' : ''} onClick={() => setTab('out')}>From you</button>
      </div>
      {list.length === 0 ? (
        <div className="empty pad"><Animal kind="cat" variant="cream" size={84} /><h2>{tab === 'in' ? 'No surprises yet' : 'You have not wrapped anything'}</h2>
          <p>{tab === 'in' ? 'When your partner wraps something, it shows up here, still closed.' : 'A note, a bouquet, a coupon or a photo. They open it themselves.'}</p>
          {tab === 'out' && <button className="btn" onClick={() => setWrapping(true)}>Wrap the first one</button>}</div>
      ) : (
        <div className="gift-grid pad">
          {list.map((g) => {
            const lk = locked(g, uid);
            return (
              <button key={g.id} className="gift-card" style={{ '--tilt': tiltOf(g.id, 3) + 'deg' }} onClick={() => !lk && setOpen(g.id)} disabled={lk} aria-label={lk ? `Locked gift, opens in ${untilText(g.unlockAt)}` : 'Open gift'}>
                <GiftBox color={g.color || WRAPS[0][0]} ribbon={g.ribbon || '#ffe27a'} size={96} open={!!g.openedAt} />
                <strong>{tab === 'in' ? `From ${nameOf(g.by)}` : g.title}</strong>
                <span className="soft small">
                  {lk ? <><Icon n="lock" size={13} /> Opens in {untilText(g.unlockAt)}</> : g.openedAt ? `Opened ${dateStr(g.openedAt)}` : tab === 'in' ? 'Tap to unwrap' : 'Waiting to be opened'}
                </span>
                {tab === 'in' && !g.openedAt && !lk && <span className="new-tag">New</span>}
              </button>
            );
          })}
        </div>
      )}
      {cur && (tab === 'in' ? <Unwrap g={cur} onClose={() => setOpen(null)} /> : (
        <Sheet title={cur.title} onClose={() => setOpen(null)}><Contents g={cur} /><p className="soft center">Wrapped {stamp(cur.ts)}</p></Sheet>
      ))}
      {wrapping && <Wrap onClose={() => setWrapping(false)} />}
    </div>
  );
}
