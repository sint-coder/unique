import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { api, initAttribution } from './lib';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import VerifyEmail from './pages/VerifyEmail';
import Admin from './pages/Admin';
import { Settings, History } from './pages/Account';
import Legal from './pages/Legal';
import Purchase from './pages/Purchase';

initAttribution();
const SEO = ['/ai-humanizer', '/humanize-ai-text', '/ai-humanizer-for-students', '/humanize-essay', '/ai-writing-editor'];

function Header({ user, setUser }) {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  function openPricing() {
    if (window.location.pathname === '/' || SEO.includes(window.location.pathname)) {
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    navigate('/#pricing');
  }
  async function logout() {
    setLogoutError('');
    try {
      await api('/auth/logout', { method: 'POST' });
      setUser(null);
      setProfileOpen(false);
      navigate('/');
    } catch (error) {
      setLogoutError(error.message);
    }
  }
  const initial = (user?.email?.trim()?.[0] || 'U').toUpperCase();
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand"><img className="brand-logo" src="/logo.png" alt="" /> Unique <span>Write</span></Link>
        <nav className={`header-nav ${user ? 'authenticated-nav' : ''}`}>
          {user ? <>
            {user.role === 'admin' && <Link to="/admin">Admin</Link>}
            <div className="words-balance"><span className="words-pill">{(user.wordsRemaining ?? 0).toLocaleString()} words left</span><button type="button" className="words-add" aria-label="Get more words" title="Get more words" onClick={openPricing}><svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></button></div>
            <Link to="/history" className="history-link" aria-label="History" title="History"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M3.5 12a8.5 8.5 0 1 0 2.3-5.8L3.5 8.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M3.5 4.5v4h4M12 7.5V12l3 1.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg></Link>
            <div className="profile-menu-wrap">
              <button className="avatar-button" aria-label="Open profile menu" aria-expanded={profileOpen} onClick={() => setProfileOpen((open) => !open)}>{user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : initial}</button>
              {profileOpen && <div className="profile-menu" role="menu">
                <div className="profile-menu-email">{user.email}</div>
                <Link to="/settings" role="menuitem" onClick={() => setProfileOpen(false)}>Profile</Link>
                <button role="menuitem" onClick={logout}>Log out</button>
                {logoutError && <span className="profile-menu-error" role="status">{logoutError}</span>}
              </div>}
            </div>
          </> : <><a href="/#pricing">Pricing</a><Link to="/login" className="login-link">Log in</Link><Link to="/signup" className="btn btn-primary header-cta">Try it free <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="ui-icon"><path d="M5 15 15 5M6 5h9v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg></Link></>}
        </nav>
      </div>
    </header>
  );
}

function Private({ user, children }) {
  const { search } = useLocation();
  if (user === undefined) return null;
  return user ? children : <Navigate to={'/signup' + search} replace />;
}

function ScrollToHash() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const frame = requestAnimationFrame(() => document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  const [user, setUser] = useState(undefined);
  useEffect(() => { api('/auth/me').then(setUser).catch(() => setUser(null)); }, []);
  return (
    <BrowserRouter>
      <ScrollToHash />
      <Header user={user} setUser={setUser} />
      <Routes>
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/purchase" element={<Purchase />} />
        <Route path="/privacy" element={<Legal page="privacy" />} />
        <Route path="/terms" element={<Legal page="terms" />} />
        <Route path="/cookies" element={<Legal page="cookies" />} />
        <Route path="/refunds" element={<Legal page="refunds" />} />
        <Route path="/" element={<Landing user={user} setUser={setUser} />} />
        {SEO.map((p) => <Route key={p} path={p} element={<Landing user={user} setUser={setUser} />} />)}
        {['login', 'signup', 'forgot', 'reset'].map((k) => <Route key={k} path={'/' + k} element={<Auth kind={k} setUser={setUser} />} />)}
        <Route path="/app" element={<Navigate to="/" replace />} />
        <Route path="/history" element={<Private user={user}><History /></Private>} />
        <Route path="/settings" element={<Private user={user}><Settings user={user} setUser={setUser} /></Private>} />
        <Route path="/admin" element={<Private user={user}><Admin user={user} /></Private>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
