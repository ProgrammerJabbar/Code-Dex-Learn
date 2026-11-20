import React, { useEffect, useState } from 'react';
import { useApp, imgSrc, tiltOf, dateStr, stamp, Sheet, Confirm, dayNumber } from '../lib.jsx';
import { Avatar, PolaroidCam, StickerArt, Icon } from '../art.jsx';

const REACTS = ['❤️', '😂', '🥹', '🤗', '🔥'];

function Face({ p, size }) {
  const src = imgSrc(p);
  if (p.type === 'sticker') {
    return <div className="face sticker" style={{ background: p.color || 'var(--green-s)' }}><StickerArt s={p.sticker} size={size} /></div>;
  }
  if (p.type === 'note') {
    return <div className="face note" style={{ background: p.color || '#fff0b8' }}><span style={{ fontSize: size > 120 ? 34 : 22 }}>{p.text}</span></div>;
  }
  return src ? <img className="face" src={src} alt={p.caption || 'Shared photo'} loading="lazy" /> : <div className="face missing">Photo unavailable</div>;
}

function PinCard({ p, i, onOpen, fresh }) {
  const { byId } = useApp();
  return (
    <button className={'pin ' + (i % 2 ? 'r' : 'l')} style={{ '--tilt': tiltOf(p.id, 4.5) + 'deg' }} onClick={() => onOpen(p)}>
      {fresh && <span className="new-tag">New</span>}
      {(p.caption || p.emoji) && <span className="pin-cap">{p.emoji ? <span className="pin-emoji">{p.emoji}</span> : null}{p.caption}</span>}
      <Face p={p} size={86} />
      <span className="pin-foot">
        <Avatar p={byId[p.by]} size={22} />
        <span className="pin-date">{dateStr(p.ts)}</span>
      </span>
    </button>
  );
}

function PinSheet({ p, onClose }) {
  const { uid, byId, nameOf, patch, del } = useApp();
  const mine = p.by === uid;
  const rx = p.r || {};
  const react = (e) => patch('pins/' + p.id, { r: { [uid]: rx[uid] === e ? null : e } });
  const remove = async () => { if (await del('pins/' + p.id)) onClose(); };
  return (
    <Sheet title="Pinned moment" onClose={onClose}>
      <div className="pin-big" style={{ '--tilt': tiltOf(p.id, 2) + 'deg' }}>
        <Face p={p} size={170} />
        {p.caption && <p className="pin-big-cap">{p.emoji} {p.caption}</p>}
      </div>
      <div className="byline">
        <Avatar p={byId[p.by]} size={34} />
        <div><strong>{nameOf(p.by)}</strong><br /><span className="soft">{stamp(p.ts)}</span></div>
      </div>
      <div className="reacts" role="group" aria-label="Reactions">
        {REACTS.map((e) => <button key={e} className={'react' + (rx[uid] === e ? ' on' : '')} onClick={() => react(e)} aria-label={'React ' + e}>{e}</button>)}
      </div>
      {Object.entries(rx).filter(([k, v]) => v && k !== uid).map(([k, v]) => <p key={k} className="soft">{nameOf(k)} reacted {v}</p>)}
      {mine && <div className="row end"><Confirm label="Remove pin" onYes={remove} /></div>}
    </Sheet>
  );
}

export default function Days({ openPin }) {
  const { data, isNew, markSeen, partner, me } = useApp();
  const [open, setOpen] = useState(null);
  useEffect(() => { const t = setTimeout(() => markSeen('days'), 1600); return () => clearTimeout(t); }, [markSeen]);
  const pins = data.pins;
  const n = dayNumber(data.settings.anniversary);
  const current = open && pins.find((x) => x.id === open);
  return (
    <div className="days">
      <header className="days-head pad">
        <div className="days-title">
          <h1><mark>Our Days</mark></h1>
          <div className="pair">
            <Avatar p={me} size={34} />
            <Avatar p={partner} size={34} />
            {n ? <span className="chip day-chip"><Icon n="heart" size={14} /> Day {n}</span> : null}
          </div>
        </div>
        <button className="cam-btn" onClick={openPin} aria-label="Pin a new moment"><PolaroidCam size={76} /></button>
      </header>
      {pins.length === 0 ? (
        <div className="empty pad">
          <PolaroidCam size={96} />
          <h2>Your wall is empty</h2>
          <p>Tap the camera to pin a photo, a doodle, a sticker or a note. Each one gets a date and time.</p>
          <button className="btn" onClick={openPin}>Pin the first one</button>
        </div>
      ) : (
        <div className="wall pad">
          {pins.map((p, i) => <PinCard key={p.id} p={p} i={i} onOpen={() => setOpen(p.id)} fresh={isNew('days', p)} />)}
        </div>
      )}
      <button className="fab" onClick={openPin}><Icon n="plus" size={20} /> Pin it</button>
      {current && <PinSheet p={current} onClose={() => setOpen(null)} />}
    </div>
  );
}
