import { useState } from 'react';
import { isValidEmail } from '../src/services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const v = isValidEmail(email);
    if (!v.isValid) { setError(v.message); return; }
    setLoading(true);
    try {
      const resp = await fetch('/api/password-reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!resp.ok) {
        const j = await resp.json().catch(()=>({}));
        throw new Error(j.error || 'Failed to send email');
      }
      setSent(true);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Forgot your password?</h1>
        {sent ? (
          <p className="text-gray-700">If an account exists for {email}, a reset link has been sent.</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div>
              <label className="form-label" htmlFor="email">Email</label>
              <input id="email" className="form-input" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-md w-full" disabled={loading}>
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}


