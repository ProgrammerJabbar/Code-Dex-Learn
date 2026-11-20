import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider, useApp, SWATCH } from './lib.jsx';
import { Icon, Animal, Flower, GiftBox, ANIMALS, variantsOf } from './art.jsx';
import Days from './views/Days.jsx';
import PinIt from './views/PinIt.jsx';
import Gallery from './views/Gallery.jsx';
import Letters from './views/Letters.jsx';
import Chat from './views/Chat.jsx';
import Garden from './views/Garden.jsx';
import Critters from './views/Critters.jsx';
import Gifts from './views/Gifts.jsx';
import Us from './views/Us.jsx';

const TABS = [['days', 'planet', 'Days'], ['gallery', 'frame', 'Gallery'], ['chat', 'chat', 'Chat'], ['letters', 'mail', 'Letters'], ['more', 'more', 'More']];
const SUB = ['garden', 'critters', 'gifts', 'us'];
const ROUTES = [...TABS.map((t) => t[0]), ...SUB];

function Welcome() {
  const { put, uid } = useApp();
  const [name, setName] = useState('');
  const [animal, setAnimal] = useState('frog');
  const [variant, setVariant] = useState('green');
  const [color, setColor] = useState(SWATCH[0]);
  const save = () => name.trim() && put('profiles/' + uid, { name: name.trim().slice(0, 24), animal, variant, color, ts: Date.now() });
  return (
    <div className="welcome">
      <div className="welcome-card">
        <Animal kind={animal} variant={variant} size={110} className="bob" />
        <h1>Welcome to Our Days</h1>
        <p>A private place for just the two of you. Tell it who you are first.</p>
        <label className="lbl" htmlFor="w-name">Your name or nickname</label>
        <input id="w-name" className="input" value={name} maxLength={24} onChange={(e) => setName(e.target.value)} placeholder="What should they call you here?" autoFocus />
        <div className="lbl">Your animal</div>
        <div className="kinds">
          {Object.entries(ANIMALS).map(([k, v]) => <button key={k} className={'kind' + (animal === k ? ' on' : '')} onClick={() => { setAnimal(k); setVariant(variantsOf(k)[0]); }}><Animal kind={k} size={48} /><span>{v.label}</span></button>)}
        </div>
        <div className="swatches center" role="group" aria-label="Backdrop colour">{SWATCH.map((c) => <button key={c} className={'sw' + (c === color ? ' on' : '')} style={{ background: c }} onClick={() => setColor(c)} aria-label={'Colour ' + c} />)}</div>
        <button className="btn big" disabled={!name.trim()} onClick={save}>Come in</button>
      </div>
    </div>
  );
}

function MoreHub({ go }) {
  const { counts, data } = useApp();
  const tiles = [
    ['garden', 'Garden', `${data.garden.length} flower${data.garden.length === 1 ? '' : 's'} growing`, <div className="art-row"><Flower kind="lavender" stage={3} size={64} /><Flower kind="lily" stage={3} size={64} /><Flower kind="rose" stage={3} size={64} /></div>, 0],
    ['critters', 'Critter Corner', `${data.critters.length} friend${data.critters.length === 1 ? '' : 's'} at home`, <div className="art-row"><Animal kind="frog" size={58} /><Animal kind="capybara" size={58} /><Animal kind="penguin" size={58} /><Animal kind="cat" size={58} /></div>, 0],
    ['gifts', 'Surprises', counts.gifts ? `${counts.gifts} waiting for you` : 'Wrap something small', <GiftBox size={70} />, counts.gifts],
    ['us', 'Us', 'Days together, daily question, profile', <div className="art-row"><Icon n="heart" size={44} sw={1.6} /></div>, 0],
  ];
  return (
    <div className="more">
      <header className="head pad"><div className="head-t"><h1>More</h1><p>Everything else in your world</p></div></header>
      <div className="tiles pad">
        {tiles.map(([k, t, s, art, n]) => (
          <button key={k} className={'tile tile-' + k} onClick={() => go(k)}>
            <span className="tile-art">{art}</span>
            <strong>{t}</strong><span className="soft small">{s}</span>
            {n ? <span className="new-tag">{n}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function Shell() {
  const { me, demo, counts } = useApp();
  const [route, setRoute] = useState(() => { const h = (location.hash || '').slice(1); return ROUTES.includes(h) ? h : 'days'; });
  const [pin, setPin] = useState(false);
  useEffect(() => {
    const f = () => { const h = (location.hash || '').slice(1); if (ROUTES.includes(h)) setRoute(h); };
    window.addEventListener('hashchange', f); return () => window.removeEventListener('hashchange', f);
  }, []);
  const go = (r) => { setRoute(r); try { location.hash = r; } catch (e) { /* hash may be unavailable */ } };
  if (!me) return <Welcome />;
  const tab = SUB.includes(route) ? 'more' : route;
  const back = () => go('more');
  const badge = { days: counts.days, gallery: counts.gallery, chat: counts.chat, letters: counts.letters, more: counts.gifts };
  return (
    <div className="app">
      {demo && <div className="demo-bar" role="note">Preview mode: nothing here is saved</div>}
      <main className="view" key={route}>
        {route === 'days' && <Days openPin={() => setPin(true)} />}
        {route === 'gallery' && <Gallery />}
        {route === 'chat' && <Chat />}
        {route === 'letters' && <Letters />}
        {route === 'more' && <MoreHub go={go} />}
        {route === 'garden' && <Garden back={back} />}
        {route === 'critters' && <Critters back={back} />}
        {route === 'gifts' && <Gifts back={back} />}
        {route === 'us' && <Us back={back} />}
      </main>
      <nav className="tabbar" aria-label="Main">
        {TABS.map(([k, ic, label]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => go(k)} aria-current={tab === k ? 'page' : undefined}>
            <span className="ti"><Icon n={ic} size={24} />{badge[k] > 0 && <b className="badge">{badge[k] > 9 ? '9+' : badge[k]}</b>}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
      {pin && <PinIt onClose={() => setPin(false)} />}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<Provider><Shell /></Provider>);
