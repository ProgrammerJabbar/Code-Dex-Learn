import React, { useState } from 'react';
import { Animal } from '../art.jsx';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const { configured, configurationError, authError, recovering, signIn, requestPasswordReset, updatePassword } = useAuth();
  const [mode, setMode] = useState(recovering ? 'recovery' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const run = async (action) => {
    setPending(true);
    setMessage('');
    setError('');
    try {
      await action();
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  };

  const submitLogin = (e) => {
    e.preventDefault();
    run(() => signIn(email.trim(), password));
  };

  const submitReset = (e) => {
    e.preventDefault();
    run(async () => {
      await requestPasswordReset(email.trim());
      setMessage('If an account exists for that email, a password reset link is on its way.');
    });
  };

  const submitRecovery = (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Use at least 8 characters for your new password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Those passwords do not match.');
      return;
    }
    run(async () => {
      await updatePassword(password);
      setMessage('Password updated.');
    });
  };

  const recovery = recovering || mode === 'recovery';
  const reset = mode === 'reset' && !recovery;
  const title = recovery ? 'Choose a new password' : reset ? 'Reset your password' : 'Welcome back';
  const description = recovery
    ? 'Choose a new password for your Our Days account.'
    : reset
      ? 'We’ll email you a secure password reset link.'
      : 'Sign in to return to your little world together.';

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-mascot" aria-hidden="true"><Animal kind="frog" size={76} className="bob" /></div>
        <div className="auth-brand">Our Days</div>
        <p className="auth-eyebrow">A little world for two</p>
        <h1 id="auth-title">{title}</h1>
        <p className="auth-description">{description}</p>

        {!configured && (
          <div className="auth-alert" role="alert">
            {configurationError || 'Sign-in is not configured yet. Add SUPABASE_URL and SUPABASE_ANON_KEY to the build environment.'}
          </div>
        )}
        {authError && <div className="auth-alert" role="alert">{authError}</div>}
        {error && <div className="auth-alert" role="alert">{error}</div>}
        {message && <div className="auth-message" role="status">{message}</div>}

        {configured && (
          recovery ? (
            <form className="auth-form" onSubmit={submitRecovery}>
              <label className="auth-label" htmlFor="auth-password">New password</label>
              <input id="auth-password" className="input" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
              <label className="auth-label" htmlFor="auth-confirm">Confirm new password</label>
              <input id="auth-confirm" className="input" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              <button className="btn big" type="submit" disabled={pending}>{pending ? 'Updating…' : 'Update password'}</button>
            </form>
          ) : reset ? (
            <form className="auth-form" onSubmit={submitReset}>
              <label className="auth-label" htmlFor="auth-email">Email address</label>
              <input id="auth-email" className="input" type="email" autoComplete="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
              <button className="btn big" type="submit" disabled={pending}>{pending ? 'Sending…' : 'Send reset link'}</button>
              <button className="auth-link" type="button" onClick={() => { setMode('login'); setError(''); setMessage(''); }}>Back to sign in</button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={submitLogin}>
              <label className="auth-label" htmlFor="auth-email">Email address</label>
              <input id="auth-email" className="input" type="email" autoComplete="username" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
              <label className="auth-label" htmlFor="auth-password">Password</label>
              <input id="auth-password" className="input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              <button className="btn big" type="submit" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button>
              <button className="auth-link" type="button" onClick={() => { setMode('reset'); setError(''); setMessage(''); }}>Forgot your password?</button>
            </form>
          )
        )}

        <p className="auth-foot">Private by invitation · Secured with Supabase</p>
      </section>
    </main>
  );
}
