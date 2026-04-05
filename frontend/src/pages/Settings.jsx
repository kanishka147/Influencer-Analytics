import React, { useState, useEffect } from 'react';
import api from '../api';
import { User, Mail, Link2, Save, CheckCircle, AlertCircle } from 'lucide-react';

const Settings = () => {
  const [form, setForm] = useState({ influencerName: '', instagram: '' });
  const [email, setEmail] = useState('');
  const [joinedAt, setJoinedAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/auth/me')
      .then(res => {
        const u = res.data;
        setForm({
          influencerName: u.influencerName || '',
          instagram: u.instagram || '',
        });
        setEmail(u.email || '');
        setJoinedAt(u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '');
      })
      .catch(() => setMessage('Could not load profile.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      await api.put('/auth/profile', form);
      setStatus('success');
      setMessage('Profile updated successfully!');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ width: 36, height: 36, border: '3px solid #EDE9FE', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
          Account <span className="text-gradient">Settings</span>
        </h1>
        <p style={{ color: '#6B7280', fontSize: 14, marginTop: 4 }}>Manage your profile and Instagram handle</p>
      </div>

      {/* Account Info (read-only) */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, fontWeight: 800, flexShrink: 0 }}>
            {form.influencerName?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 18, color: '#1E1B4B', margin: 0 }}>{form.influencerName}</p>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 5 }}><Mail size={12} /> {email}</p>
            {joinedAt && <p style={{ fontSize: 11, color: '#9CA3AF', margin: '4px 0 0' }}>Member since {joinedAt}</p>}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit}>
        {/* Profile Details */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #E2D9FB' }}>
            <div style={{ width: 30, height: 30, background: '#EDE9FE', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={15} color="#7C3AED" />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: 15, color: '#1E1B4B', margin: 0 }}>Profile Details</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Display Name</label>
              <input type="text" name="influencerName" value={form.influencerName} onChange={handleChange}
                placeholder="Your name" required />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                 Instagram Handle
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}><Link2 size={15} /></div>
                <input type="text" name="instagram" value={form.instagram} onChange={handleChange} placeholder="@yourhandle" style={{ paddingLeft: 38 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        {status && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, padding: '12px 16px',
            borderRadius: 10, marginBottom: 16,
            background: status === 'success' ? '#ECFDF5' : '#FEF2F2',
            color: status === 'success' ? '#065F46' : '#DC2626',
            border: `1px solid ${status === 'success' ? '#A7F3D0' : '#FECACA'}`
          }}>
            {status === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {message}
          </div>
        )}

        {/* Save Button */}
        <button type="submit" className="btn-primary" disabled={saving}
          style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15, opacity: saving ? 0.7 : 1 }}>
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default Settings;
