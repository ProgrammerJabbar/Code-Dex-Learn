import React, { useState } from 'react';
import { useApp, Sheet, dayKey, parseDay, dateStr, longDate, untilText, tiltOf } from '../lib.jsx';
import { Icon, Animal } from '../art.jsx';

const SEALS = ['#9d2235', '#2f6b3c', '#27457a', '#6b3a8a', '#b9812b'];
const PAPERS = [['cream', 'Cream'], ['rose', 'Rose'], ['sage', 'Sage'], ['sky', 'Sky']];
const CLOSINGS = ['Yours always,', 'With all my love,', 'Forever yours,', 'Until we meet again,', 'Fondly,'];

const isLocked = (l, uid) => l.by !== uid && l.unlockAt && l.unlockAt > Date.now();

function Seal({ color, size = 44, mark = '♥' }) {
  return <span className="seal" style={{ width: size, height: size, '--seal': color, fontSize: size * 0.42 }}><i>{mark}</i></span>;
}

function Envelope({ l, mine, onOpen }) {
  const { nameOf, uid } = useApp();
  const locked = isLocked(l, uid);
  const unread = !mine && !l.openedAt && !locked;
  return (
    <button className={'env paper-' + (l.paper || 'cream') + (unread ? ' unread' : '')} style={{ '--tilt': tiltOf(l.id, 2.5) + 'deg' }} onClick={() => onOpen(l)}>
      <span className="env-flap" />
      <Seal color={l.seal || SEALS[0]} size={46} mark={locked ? '🔒' : '♥'} />
      <span className="env-to">{mine ? 'To my love' : `From ${nameOf(l.by)}`}</span>
      <span className="env-date">{locked ? `Opens in ${untilText(l.unlockAt)}` : dateStr(l.ts)}</span>
      {unread && <span className="new-tag">New</span>}
      {mine && l.openedAt ? <span className="env-read">Read {dateStr(l.openedAt)}</span> : mine ? <span className="env-read">Not opened yet</span> : null}
    </button>
  );
}

function LetterSheet({ l, onClose }) {
  const { uid, nameOf, patch } = useApp();
  React.useEffect(() => { if (l.by !== uid && !l.openedAt) patch('letters/' + l.id, { openedAt: Date.now() }); }, []); // eslint-disable-line
  return (
    <Sheet title="A letter" onClose={onClose} wide className="letter-sheet">
      <article className={'letter paper-' + (l.paper || 'cream')}>
        <p className="l-date">{longDate(l.ts)}</p>
        <p className="l-sal">{l.salutation}</p>
        <p className="l-body">{l.body}</p>
        <p className="l-clo">{l.closing}</p>
        <p className="l-sig">{l.signature || nameOf(l.by)}</p>
        <Seal color={l.seal || SEALS[0]} size={54} />
      </article>
    </Sheet>
  );
}

function Compose({ onClose }) {
  const { add, me, partner, toast } = useApp();
  const [sal, setSal] = useState(partner ? `My dearest ${partner.name}` : 'My dearest');
  const [body, setBody] = useState('');
  const [closing, setClosing] = useState(CLOSINGS[0]);
  const [sig, setSig] = useState(me ? me.name : '');
  const [seal, setSeal] = useState(SEALS[0]);
  const [paper, setPaper] = useState('cream');
  const [when, setWhen] = useState('');
  const [busy, setBusy] = useState(false);
  async function send() {
    if (!body.trim() || busy) return;
    setBusy(true);
    const unlockAt = when ? parseDay(when) + 8 * 36e5 : null; // 8 AM that day
    const ok = await add('letters', { salutation: sal.trim().slice(0, 60), body: body.trim().slice(0, 3000), closing, signature: sig.trim().slice(0, 40), seal, paper, unlockAt, openedAt: null });
    if (ok) { toast(unlockAt ? 'Letter sealed until ' + dateStr(unlockAt) : 'Letter sent'); onClose(); return; }
    setBusy(false);
  }
  return (
    <Sheet title="Write a letter" onClose={onClose} wide className="letter-sheet">
      <div className={'letter compose paper-' + paper}>
        <p className="l-date">{longDate(Date.now())}</p>
        <label className="sr" htmlFor="l-sal">Greeting</label>
        <input id="l-sal" className="l-sal-in" value={sal} onChange={(e) => setSal(e.target.value)} maxLength={60} />
        <label className="sr" htmlFor="l-body">Letter</label>
        <textarea id="l-body" className="l-body-in" rows={10} value={body} onChange={(e) => setBody(e.target.value)} maxLength={3000} placeholder="Take your time. Write it the way you would say it when no one else is listening." />
        <select aria-label="Closing" className="l-clo-in" value={closing} onChange={(e) => setClosing(e.target.value)}>{CLOSINGS.map((c) => <option key={c}>{c}</option>)}</select>
        <label className="sr" htmlFor="l-sig">Signature</label>
        <input id="l-sig" className="l-sig-in" value={sig} onChange={(e) => setSig(e.target.value)} maxLength={40} />
      </div>
      <div className="lbl">Stationery</div>
      <div className="seg">{PAPERS.map(([k, n]) => <button key={k} className={paper === k ? 'on' : ''} onClick={() => setPaper(k)}>{n}</button>)}</div>
      <div className="lbl">Wax seal</div>
      <div className="swatches">{SEALS.map((c) => <button key={c} className={'sw' + (c === seal ? ' on' : '')} style={{ background: c }} onClick={() => setSeal(c)} aria-label={'Seal ' + c} />)}</div>
      <label className="lbl" htmlFor="l-when">Keep it sealed until (optional)</label>
      <input id="l-when" type="date" className="input" min={dayKey(Date.now() + 864e5)} value={when} onChange={(e) => setWhen(e.target.value)} />
      <p className="soft small">A sealed letter stays closed for your partner until 8 AM on that day.</p>
      <button className="btn big" disabled={!body.trim() || busy} onClick={send}>{busy ? 'Sealing…' : 'Seal and send'}</button>
    </Sheet>
  );
}

export default function Letters() {
  const { data, uid, partner } = useApp();
  const [tab, setTab] = useState('in');
  const [open, setOpen] = useState(null);
  const [writing, setWriting] = useState(false);
  const mine = data.letters.filter((l) => l.by === uid);
  const theirs = data.letters.filter((l) => l.by !== uid);
  const list = tab === 'in' ? theirs : mine;
  const current = open && data.letters.find((l) => l.id === open);
  return (
    <div className="letters">
      <header className="head pad">
        <div className="head-t"><h1>Letters</h1><p>Slow words, kept in the drawer</p></div>
        <button className="btn" onClick={() => setWriting(true)}><Icon n="quill" size={18} /> Write</button>
      </header>
      <div className="seg pad2">
        <button className={tab === 'in' ? 'on' : ''} onClick={() => setTab('in')}>Mailbox{theirs.filter((l) => !l.openedAt && !isLocked(l, uid)).length ? <b className="dot" /> : null}</button>
        <button className={tab === 'out' ? 'on' : ''} onClick={() => setTab('out')}>Sent</button>
      </div>
      {list.length === 0 ? (
        <div className="empty pad">
          <Animal kind="penguin" size={84} />
          <h2>{tab === 'in' ? 'Nothing in the mailbox' : 'No letters sent yet'}</h2>
          <p>{tab === 'in' ? (partner ? `${partner.name} hasn't written yet.` : 'When your partner writes, it will land here.') : 'Write something by hand-ish. It will arrive sealed in an envelope.'}</p>
          {tab === 'out' && <button className="btn" onClick={() => setWriting(true)}>Write the first letter</button>}
        </div>
      ) : (
        <div className="env-list pad">{list.map((l) => <Envelope key={l.id} l={l} mine={tab === 'out'} onOpen={(x) => (isLocked(x, uid) ? setOpen('locked:' + x.id) : setOpen(x.id))} />)}</div>
      )}
      {current && !String(open).startsWith('locked:') && <LetterSheet l={current} onClose={() => setOpen(null)} />}
      {String(open).startsWith('locked:') && (
        <Sheet title="Still sealed" onClose={() => setOpen(null)}>
          {(() => { const l = data.letters.find((x) => 'locked:' + x.id === open); return l ? <div className="center"><Seal color={l.seal} size={80} mark="🔒" /><p>This letter opens in <strong>{untilText(l.unlockAt)}</strong>.</p><p className="soft">{longDate(l.unlockAt)}</p></div> : null; })()}
        </Sheet>
      )}
      {writing && <Compose onClose={() => setWriting(false)} />}
    </div>
  );
}
