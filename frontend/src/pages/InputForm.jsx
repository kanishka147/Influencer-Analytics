import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Sparkles, User, Users, MessageCircle, Heart, Search, Target } from 'lucide-react';

const categories = ['Tech', 'Beauty', 'Fashion', 'Gaming', 'Lifestyle', 'Default'];

const Field = ({ label, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
    {children}
  </div>
);

const InputForm = () => {
  const [formData, setFormData] = useState({
    influencerName: '', followers: '', likes: '', comments: '',
    influencerCategory: 'Tech', brandName: '', brandCategory: 'Tech'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const infRes = await api.post('/users', {
        name: formData.influencerName,
        followers: Number(formData.followers),
        likes: Number(formData.likes),
        comments: Number(formData.comments),
        category: formData.influencerCategory
      });
      const analyzeRes = await api.post('/analyze', {
        influencerId: infRes.data._id,
        brandName: formData.brandName,
        brandCategory: formData.brandCategory
      });
      navigate(`/report/${analyzeRes.data._id}`, { state: { report: analyzeRes.data } });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate report. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
          New <span className="text-gradient">Analysis</span>
        </h1>
        <p style={{ color: '#6B7280', fontSize: 14, marginTop: 4 }}>
          Input influencer metrics and brand details to generate an AI-driven fit score.
        </p>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 14, fontWeight: 500 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          
          {/* Influencer Section */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #E2D9FB' }}>
              <div style={{ width: 32, height: 32, background: '#EDE9FE', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} color="#7C3AED" />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 15, color: '#1E1B4B', margin: 0 }}>Influencer Data</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Name / Handle">
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}><Search size={15} /></div>
                  <input type="text" name="influencerName" required value={formData.influencerName} onChange={handleChange} placeholder="@username" style={{ paddingLeft: 36 }} />
                </div>
              </Field>
              <Field label="Total Followers">
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}><Users size={15} /></div>
                  <input type="number" name="followers" required min="1" value={formData.followers} onChange={handleChange} placeholder="e.g. 150000" style={{ paddingLeft: 36 }} />
                </div>
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Avg Likes">
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}><Heart size={15} /></div>
                    <input type="number" name="likes" required min="0" value={formData.likes} onChange={handleChange} placeholder="5000" style={{ paddingLeft: 36 }} />
                  </div>
                </Field>
                <Field label="Avg Comments">
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}><MessageCircle size={15} /></div>
                    <input type="number" name="comments" required min="0" value={formData.comments} onChange={handleChange} placeholder="350" style={{ paddingLeft: 36 }} />
                  </div>
                </Field>
              </div>
              <Field label="Category">
                <select name="influencerCategory" value={formData.influencerCategory} onChange={handleChange}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* Brand Section */}
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #E2D9FB' }}>
              <div style={{ width: 32, height: 32, background: '#EDE9FE', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={16} color="#7C3AED" />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 15, color: '#1E1B4B', margin: 0 }}>Brand Target</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
              <Field label="Brand Name">
                <input type="text" name="brandName" required value={formData.brandName} onChange={handleChange} placeholder="Enter brand name" />
              </Field>
              <Field label="Brand Category">
                <select name="brandCategory" value={formData.brandCategory} onChange={handleChange}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              {/* Info Box */}
              <div style={{ marginTop: 'auto', background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 12, padding: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <Sparkles size={18} color="#7C3AED" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: '#5B21B6', lineHeight: 1.6, margin: 0 }}>
                  Our AI engine computes engagement rate, compatibility matrix, and outputs an actionable fit score report.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" className="btn-primary" disabled={loading}
          style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, opacity: loading ? 0.7 : 1 }}>
          {loading ? (
            <>
              <svg style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" strokeOpacity="0.25" />
                <path d="M4 12a8 8 0 018-8" stroke="white" strokeWidth="4" strokeLinecap="round" />
              </svg>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              Processing Analysis...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Analyze Campaign Fit
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputForm;
