import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { setPasswordForEmail } from '../src/services/authService';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const e = new URLSearchParams(window.location.search).get('email') || '';
    setEmail(e);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Validate token server-side first
      const token = new URLSearchParams(window.location.search).get('token');
      const resp = await fetch('/api/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, newPassword: password })
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || 'Failed to reset');

      // Update local user store
      setPasswordForEmail(email, password);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      setError(err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Reset password</h1>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        {success && <p className="mb-4 text-sm text-green-600">Password updated. Redirecting…</p>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="form-label" htmlFor="email">Email</label>
            <input id="email" className="form-input" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="form-label" htmlFor="password">New password</label>
            <input id="password" className="form-input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-md w-full" disabled={loading}>
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}


