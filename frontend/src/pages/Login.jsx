import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { LogIn, Mail, Lock, Activity } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 440, padding: '0 16px' }}>
      <div className="card" style={{ padding: 40 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, justifyContent: 'center' }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={18} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 20, color: '#1E1B4B' }}>
            Influe<span style={{ color: '#7C3AED' }}>Metrics</span>
          </span>
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1E1B4B', marginBottom: 6, textAlign: 'center' }}>Welcome back</h2>
        <p style={{ color: '#6B7280', fontSize: 14, textAlign: 'center', marginBottom: 28 }}>Log in to your influencer dashboard</p>

        {error && (
          <div style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 14, fontWeight: 500 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                <Mail size={16} />
              </div>
              <input type="email" name="email" required value={formData.email} onChange={handleChange}
                placeholder="you@example.com" style={{ paddingLeft: 38 }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                <Lock size={16} />
              </div>
              <input type="password" name="password" required value={formData.password} onChange={handleChange}
                placeholder="••••••••" style={{ paddingLeft: 38 }} />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 4, fontSize: 15, opacity: loading ? 0.7 : 1 }}>
            <LogIn size={18} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#6B7280' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#7C3AED', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
