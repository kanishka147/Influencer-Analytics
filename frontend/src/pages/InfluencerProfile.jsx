import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, Users, Activity, DollarSign, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ScoreMeter from '../components/ScoreMeter';

const SCORE_COLORS = { 'Excellent': '#059669', 'Good': '#2563EB', 'Average': '#D97706', 'Poor': '#DC2626' };
const SCORE_ORDER  = { 'Excellent': 4, 'Good': 3, 'Average': 2, 'Poor': 1 };

const InfluencerProfile = () => {
  const { id } = useParams();
  const [influencer, setInfluencer] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get(`/users/${id}`),
      api.get(`/users/${id}/reports`),
    ]).then(([inf, rep]) => {
      setInfluencer(inf.data);
      setReports(rep.data);
    }).catch(() => setError('Could not load influencer profile.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 14 }}>
      <div style={{ width: 40, height: 40, border: '3px solid #EDE9FE', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: '#6B7280', fontSize: 14 }}>Loading profile...</p>
    </div>
  );

  if (error) return (
    <div className="card" style={{ padding: 40, textAlign: 'center' }}>
      <p style={{ color: '#DC2626' }}>{error}</p>
      <Link to="/dashboard" className="btn-ghost" style={{ textDecoration: 'none', display: 'inline-flex', marginTop: 16 }}>← Dashboard</Link>
    </div>
  );

  const bestReport = reports.reduce((best, r) =>
    (SCORE_ORDER[r.score] || 0) > (SCORE_ORDER[best?.score] || 0) ? r : best, null);

  const avgEarnings = reports.length
    ? Math.round(reports.reduce((s, r) => s + (r.earningsEstimate || 0), 0) / reports.length) : 0;

  const chartData = [...reports].reverse().map(r => ({
    name: r.brandName || '?', earnings: r.earningsEstimate || 0
  }));

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Back */}
      <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#7C3AED', fontSize: 13, fontWeight: 600, textDecoration: 'none', marginBottom: 20 }}>
        <ArrowLeft size={15} /> Back to Dashboard
      </Link>

      {/* Hero */}
      <div className="card" style={{ marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)', borderBottom: '1px solid #E2D9FB', padding: '28px 32px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ width: 72, height: 72, borderRadius: 18, background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 28, fontWeight: 800, flexShrink: 0 }}>
            {influencer.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1E1B4B', margin: 0 }}>{influencer.name}</h1>
              <span style={{ background: '#EDE9FE', color: '#5B21B6', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>{influencer.category}</span>
            </div>
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>{reports.length} brand collaboration{reports.length !== 1 ? 's' : ''} analyzed</p>
          </div>
          {bestReport && (
            <div style={{ background: 'white', border: '1px solid #E2D9FB', borderRadius: 12, padding: '14px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Best Fit</p>
              <p style={{ fontSize: 15, fontWeight: 800, color: SCORE_COLORS[bestReport.score], margin: 0 }}>{bestReport.score}</p>
              <p style={{ fontSize: 12, color: '#1E1B4B', fontWeight: 600, margin: '2px 0 0' }}>{bestReport.brandName}</p>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid #E2D9FB' }}>
          {[
            { icon: <Users size={18} color="#7C3AED" />, label: 'Followers', value: influencer.followers?.toLocaleString('en-IN') },
            { icon: <Activity size={18} color="#7C3AED" />, label: 'Engagement', value: `${influencer.engagementRate}%` },
            { icon: <DollarSign size={18} color="#059669" />, label: 'Avg Earnings', value: `₹${avgEarnings.toLocaleString('en-IN')}`, valueColor: '#059669' },
            { icon: <BarChart3 size={18} color="#7C3AED" />, label: 'Total Reports', value: `${reports.length}` },
          ].map((s, i) => (
            <div key={i} style={{ padding: '18px 24px', borderRight: i < 3 ? '1px solid #E2D9FB' : 'none', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
              {s.icon}
              <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.valueColor || '#1E1B4B' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1E1B4B', marginBottom: 20 }}>Earnings Across Brands</h3>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ background: '#fff', borderRadius: 10, border: '1px solid #E2D9FB', fontSize: 12, color: '#1E1B4B' }}
                  formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Earnings']} />
                <Line type="monotone" dataKey="earnings" stroke="#7C3AED" strokeWidth={2.5} dot={{ fill: '#7C3AED', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* History */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1E1B4B', marginBottom: 16 }}>Brand Collaboration History</h3>
        {reports.length === 0 ? (
          <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '40px 0', fontSize: 14 }}>No collaborations yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reports.map(r => (
              <Link to={`/report/${r._id}`} state={{ report: r }} key={r._id}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 12, background: '#FAFAFA', border: '1px solid #E2D9FB', textDecoration: 'none', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F5F3FF'}
                onMouseLeave={e => e.currentTarget.style.background = '#FAFAFA'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED', fontWeight: 700, fontSize: 13 }}>
                    {r.brandName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: '#1E1B4B', margin: 0, fontSize: 14 }}>{r.brandName}</p>
                    <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>{new Date(r.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>₹{r.earningsEstimate?.toLocaleString('en-IN')}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: SCORE_COLORS[r.score] || '#6B7280' }}>{r.score}</span>
                  <ArrowLeft size={14} color="#9CA3AF" style={{ transform: 'rotate(180deg)' }} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InfluencerProfile;
