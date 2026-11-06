import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  // If already logged in, redirect them to their correct dashboard automatically
  useEffect(() => {
    if (user) {
      if (user.role === 'presidency') nav('/admin');
      else if (user.role === 'reg_admin') nav('/admin/registrations');
      else if (user.role === 'executive') nav('/portal/reports');
      else nav('/');
    }
  }, [user, nav]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); 
    setErr('');
    
    try { 
      await login(email, password); 
    } catch (e) { 
      setErr('Invalid email or password. Please try again.'); 
    } finally { 
      setBusy(false); 
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center items-center px-4">
      
      {/* Back to Home Link */}
      <Link to="/" className="mb-8 text-brand-purple hover:text-brand-orange font-medium transition-colors">
        &larr; Back to Website
      </Link>

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="bg-white p-2 rounded-md inline-block mb-4 shadow-sm">
            <img src="/logo.png" alt="Logo" className="h-16 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-brand-purple">Staff Portal Login</h1>
          <p className="text-gray-500 text-sm mt-2">Enter your credentials to access the dashboard.</p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" 
              type="email"
              placeholder="you@email.com" 
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" 
              type="password"
              placeholder="••••••••" 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              required 
            />
          </div>

          {err && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{err}</p>}

          <button 
            disabled={busy} 
            className="w-full bg-brand-purple text-white py-3 rounded-lg font-semibold hover:bg-brand-purple/90 transition-colors disabled:opacity-60"
          >
            {busy ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}