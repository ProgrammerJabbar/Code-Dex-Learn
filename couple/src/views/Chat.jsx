import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp, timeStr, longDate, dayKey } from '../lib.jsx';
import { Avatar, Icon, StickerArt, STICKERS } from '../art.jsx';

const QUICK = ['💚', '😂', '🥺', '😘', '🫶', '✨', '😴', '🍜'];

export default function Chat() {
  const { data, uid, me, partner, add, del, markSeen } = useApp();
  const [text, setText] = useState('');
  const [tray, setTray] = useState(false);
  const [sel, setSel] = useState(null);
  const end = useRef(null), box = useRef(null);
  const msgs = useMemo(() => [...data.messages].reverse(), [data.messages]);
  useEffect(() => { const t = setTimeout(() => markSeen('chat'), 800); return () => clearTimeout(t); }, [markSeen, msgs.length]);
  useEffect(() => {
    const el = box.current; if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 220;
    if (near || msgs.length < 2) end.current && end.current.scrollIntoView({ block: 'end' });
  }, [msgs.length]);
  useEffect(() => { end.current && end.current.scrollIntoView({ block: 'end' }); }, []);

  async function send(m) {
    const body = m || { text: text.trim() };
    if (!m && !body.text) return;
    if (!m) setText('');
    setTray(false);
    await add('messages', body);
  }
  let lastDay = '';
  return (
    <div className="chat">
      <header className="head pad">
        <Avatar p={partner} size={42} />
        <div className="head-t"><h1>{partner ? partner.name : 'Chat'}</h1><p>{partner ? 'Your private conversation' : 'Waiting for your partner to join'}</p></div>
      </header>
      <div className="msgs pad" ref={box}>
        {msgs.length === 0 && <div className="empty"><StickerArt s="a:frog:green" size={84} /><h2>Say hello</h2><p>Messages appear here for both of you, with the time they were sent.</p></div>}
        {msgs.map((m, i) => {
          const mineM = m.by === uid; const k = dayKey(m.ts); const sep = k !== lastDay; lastDay = k;
          const prev = msgs[i - 1]; const grouped = prev && prev.by === m.by && !sep && m.ts - prev.ts < 5 * 6e4;
          return (
            <React.Fragment key={m.id}>
              {sep && <div className="day-sep"><span>{longDate(m.ts)}</span></div>}
              <div className={'msg ' + (mineM ? 'me' : 'them') + (grouped ? ' grouped' : '')}>
                <button className={'bubble' + (m.sticker ? ' stk' : '')} onClick={() => setSel(sel === m.id ? null : m.id)} aria-label="Message options">
                  {m.sticker ? <StickerArt s={m.sticker} size={84} /> : m.text}
                </button>
                <span className="mt">{timeStr(m.ts)}{sel === m.id && mineM && <button className="unsend" onClick={() => { del('messages/' + m.id); setSel(null); }}>Unsend</button>}</span>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={end} />
      </div>
      {tray && (
        <div className="tray pad">
          <div className="tray-q">{QUICK.map((e) => <button key={e} onClick={() => setText((t) => t + e)}>{e}</button>)}</div>
          <div className="tray-s">{STICKERS.slice(0, 11).map((s) => <button key={s} onClick={() => send({ sticker: s })} aria-label={'Send sticker ' + s}><StickerArt s={s} size={44} /></button>)}</div>
        </div>
      )}
      <form className="composer pad" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <button type="button" className={'icon-btn' + (tray ? ' on' : '')} onClick={() => setTray(!tray)} aria-label="Stickers"><Icon n="smile" size={24} /></button>
        <input id="chat-in" className="input" value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder="Write a message" autoComplete="off" />
        <button type="submit" className="send" disabled={!text.trim()} aria-label="Send"><Icon n="send" size={20} /></button>
      </form>
    </div>
  );
}
