import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    if (!email) { setMsg('Enter your email.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/buildhub/backend/api/forgot_password_request.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      setMsg(result.message || 'If an account exists, a reset link has been sent.');
    } catch (e) {
      setMsg('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page" aria-label="Forgot password">
      <section className="register-form-section" style={{alignItems:'center'}}>
        {/* Top row: back button above the card */}
        <div style={{ width: '100%', maxWidth: 520, marginBottom: 12 }}>
          <button
            type="button"
            onClick={() => navigate('/login')}
            aria-label="Back to login"
            className="back-link"
          >
            <ArrowLeft size={18} />
            <span>Back to Login</span>
          </button>
        </div>

        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit} className="glass-card" style={{maxWidth: 420, width:'100%'}}>
          <div className="full-width">
            <label htmlFor="email">Your Email</label>
            <input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" required />
          </div>
          {msg && <p className={/successfully|sent/i.test(msg)?'success':'error'}>{msg}</p>}
          <button className="btn-submit" disabled={loading} type="submit">{loading? 'Sending...' : 'Send reset link'}</button>
          <div className="full-width" style={{marginTop:12, textAlign:'center'}}>
            <button type="button" className="btn-secondary" onClick={() => {
              if (!email) { setMsg('Enter your email above, then press this.'); return; }
              navigate(`/reset-password?email=${encodeURIComponent(email)}`);
            }}>I have a reset code</button>
          </div>
        </form>
      </section>
    </main>
  );
}