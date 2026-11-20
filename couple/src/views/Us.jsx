import React, { useEffect, useState } from 'react';
import { useApp, Header, dayKey, dayNumber, SWATCH, DAY, parseDay, dateStr } from '../lib.jsx';
import { Animal, Avatar, ANIMALS, PAL, variantsOf, Icon } from '../art.jsx';

const QUESTIONS = [
  'What small thing did I do recently that made you smile?', 'Where would you take us for a weekend with no plans?',
  'What is a song that reminds you of us?', 'What was the first thing you noticed about me?',
  'What meal could you eat together every week without getting tired of it?', 'What is something you are looking forward to this month?',
  'When did you last feel really proud of us?', 'What is a tiny ritual of ours you never want to lose?',
  'If we had a free Saturday, how would you spend it?', 'What is one thing I do that makes you feel safe?',
  'What is a memory of us you replay when you are tired?', 'Which animal are we, and why?',
  'What is something new you want us to try together?', 'What would you put in a time capsule for us?',
  'What is the nicest thing a stranger did while we were together?', 'What do you love about our mornings?',
  'What is a place that feels like ours?', 'What did you learn about yourself from loving me?',
  'What is the funniest thing that happened to us?', 'What is a hard day I helped you through?',
  'Which photo of us is your favourite?', 'What is one thing you want to say more often?',
  'What would our dream cozy evening look like?', 'What is a skill you would love to learn together?',
  'What is your favourite thing I cook, order or bring home?', 'What makes you laugh when I am not even trying?',
  'What is something you are grateful for today?', 'What is a place you want to grow old in?',
  'What is a gift you never forgot?', 'What do you hope we are doing in five years?',
];

function Question() {
  const { uid, partner, put, patch, byId, data } = useApp();
  const key = dayKey();
  const idx = Math.floor(parseDay(key) / DAY) % QUESTIONS.length;
  const [text, setText] = useState('');
  const q = (data.questions || []).find((x) => x.id === key) || null;
  const mine = q && q.a && q.a[uid];
  const theirs = q && q.a && Object.entries(q.a).find(([k]) => k !== uid);
  async function save() {
    const t = text.trim(); if (!t) return;
    const entry = { text: t.slice(0, 500), ts: Date.now() };
    if (q) await patch('questions/' + key, { a: { [uid]: entry } }); else await put('questions/' + key, { a: { [uid]: entry } });
    setText('');
  }
  return (
    <section className="card q-card">
      <p className="eyebrow">Question of the day</p>
      <h2>{QUESTIONS[idx]}</h2>
      {mine ? (
        <>
          <div className="ans me"><strong>You</strong><p>{mine.text}</p></div>
          {theirs ? <div className="ans"><strong>{byId[theirs[0]]?.name || 'Partner'}</strong><p>{theirs[1].text}</p></div> : <p className="soft">{partner ? `${partner.name} hasn't answered yet. Their answer will appear here.` : 'Your partner will see this once they join.'}</p>}
        </>
      ) : (
        <>
          <label className="sr" htmlFor="q-ans">Your answer</label>
          <textarea id="q-ans" className="input" rows={3} value={text} maxLength={500} onChange={(e) => setText(e.target.value)} placeholder="Write your answer. You will see theirs once you have shared yours." />
          <button className="btn" disabled={!text.trim()} onClick={save}>Share my answer</button>
        </>
      )}
    </section>
  );
}

export default function Us({ back }) {
  const { me, partner, uid, put, data, hasAssets } = useApp();
  const [name, setName] = useState(me ? me.name : '');
  const anniv = data.settings.anniversary || '';
  const n = dayNumber(anniv);
  const setMe = (patch) => put('profiles/' + uid, { ...me, ...patch });
  return (
    <div className="us">
      <Header title="Us" sub="Your little corner of the internet" back={back} />
      <div className="pad stack">
        <section className="card days-card">
          <p className="eyebrow">Together</p>
          {n ? <><div className="big-n">{n}</div><p>days since {dateStr(parseDay(anniv))}</p></> : <p>Set the day your story started and a counter appears on Our Days.</p>}
          <label className="lbl" htmlFor="anniv">Our day</label>
          <input id="anniv" type="date" className="input" value={anniv} max={dayKey()} onChange={(e) => e.target.value && put('couple/settings', { ...data.settings, anniversary: e.target.value })} />
        </section>
        <Question />
        <section className="card">
          <p className="eyebrow">You</p>
          <div className="me-row"><Avatar p={me} size={64} />
            <div className="grow1"><label className="sr" htmlFor="my-name">Your name</label><input id="my-name" className="input" value={name} maxLength={24} onChange={(e) => setName(e.target.value)} onBlur={() => name.trim() && name.trim() !== me.name && setMe({ name: name.trim() })} /></div></div>
          <div className="kinds">
            {Object.entries(ANIMALS).map(([k, v]) => (
              <button key={k} className={'kind' + (me?.animal === k ? ' on' : '')} onClick={() => setMe({ animal: k, variant: variantsOf(k)[0] })}><Animal kind={k} size={48} /><span>{v.label}</span></button>
            ))}
          </div>
          {me && variantsOf(me.animal).length > 1 && (
            <div className="swatches" role="group" aria-label="Animal colour">{variantsOf(me.animal).map((v) => <button key={v} className={'sw' + (me.variant === v ? ' on' : '')} style={{ background: PAL[me.animal][v].b }} onClick={() => setMe({ variant: v })} aria-label={v} />)}</div>
          )}
          <div className="lbl">Backdrop</div>
          <div className="swatches">{SWATCH.map((c) => <button key={c} className={'sw' + (me?.color === c ? ' on' : '')} style={{ background: c }} onClick={() => setMe({ color: c })} aria-label={'Backdrop ' + c} />)}</div>
        </section>
        <section className="card">
          <p className="eyebrow">Your partner</p>
          {partner ? <div className="me-row"><Avatar p={partner} size={56} /><div><strong>{partner.name}</strong><p className="soft">Joined {dateStr(partner.ts || Date.now())}</p></div></div>
            : <p>Nobody else has joined yet. Open this page's Share menu on claude.ai and invite your partner as an Editor so they can post, upload photos and write back.</p>}
        </section>
        {!hasAssets && <section className="card"><p className="soft small">Photos are compressed in your browser and saved with the shared data.</p></section>}
      </div>
    </div>
  );
}
