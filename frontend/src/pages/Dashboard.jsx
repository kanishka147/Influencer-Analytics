import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { ArrowRight, BarChart3, TrendingUp, DollarSign, ChevronDown, Download } from 'lucide-react';
import ScoreMeter from '../components/ScoreMeter';

const exportToCSV = (reports) => {
  const headers = ['Influencer Name', 'Category', 'Brand', 'Engagement Rate (%)', 'Earnings Estimate (INR)', 'Fit Score', 'Status', 'Date'];
  const rows = reports.map(r => [
    r.influencerId?.name || 'Unknown',
    r.influencerId?.category || '',
    r.brandName || '',
    r.influencerId?.engagementRate || 0,
    r.earningsEstimate || 0,
    r.score || '',
    r.status || 'Draft',
    new Date(r.createdAt).toLocaleDateString(),
  ]);
  const csvContent = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `InflueMetrics_Campaigns_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const STATUS_CONFIG = {
  'Draft':       { color: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB' },
  'Pitch Sent':  { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  'Negotiating': { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  'Active':      { color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  'Completed':   { color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
};
const STATUSES = Object.keys(STATUS_CONFIG);

const StatusBadge = ({ reportId, currentStatus, onStatusChange }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const cfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG['Draft'];

  const handleChange = async (newStatus) => {
    if (newStatus === currentStatus) { setOpen(false); return; }
    setLoading(true);
    try {
      await api.patch(`/reports/${reportId}/status`, { status: newStatus });
      onStatusChange(reportId, newStatus);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setOpen(false); }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} disabled={loading}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700,
          padding: '3px 10px', borderRadius: 99, border: `1px solid ${cfg.border}`,
          background: cfg.bg, color: cfg.color, cursor: 'pointer', fontFamily: 'inherit' }}>
        {loading ? '...' : currentStatus}
        <ChevronDown size={11} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>
      {open && (
        <div className="card" style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', width: 148, zIndex: 50, padding: 4, borderRadius: 12 }}>
          {STATUSES.map(s => {
            const c = STATUS_CONFIG[s];
            return (
              <button key={s} onClick={() => handleChange(s)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 12px', fontSize: 12,
                  fontWeight: 600, color: c.color, background: s === currentStatus ? c.bg : 'transparent',
                  border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
                {s}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/reports')
      .then(res => setReports(res.data))
      .catch(() => setError('Failed to load analytics data'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = (reportId, newStatus) =>
    setReports(prev => prev.map(r => r._id === reportId ? { ...r, status: newStatus } : r));

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 14 }}>
      <div style={{ width: 40, height: 40, border: '3px solid #EDE9FE', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: '#6B7280', fontSize: 14 }}>Loading campaigns...</p>
    </div>
  );

  if (error) return (
    <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: 20, color: '#DC2626' }}>{error}</div>
  );

  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = reports.filter(r => (r.status || 'Draft') === s).length;
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1E1B4B', margin: 0 }}>Campaign <span className="text-gradient">Hub</span></h1>
          <p style={{ color: '#6B7280', fontSize: 14, marginTop: 4 }}>Track all your brand collaboration deals</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {reports.length > 0 && (
            <button onClick={() => exportToCSV(reports)} className="btn-ghost">
              <Download size={16} /> Export CSV
            </button>
          )}
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none' }}>
            <BarChart3 size={16} /> New Analysis
          </Link>
        </div>
      </div>

      {/* Status Summary */}
      {reports.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
          {STATUSES.map(s => {
            const c = STATUS_CONFIG[s];
            return (
              <div key={s} className="card" style={{ padding: '14px 12px', textAlign: 'center', borderColor: c.border }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: c.color }}>{statusCounts[s]}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: c.color, opacity: 0.8, marginTop: 2 }}>{s}</div>
              </div>
            );
          })}
        </div>
      )}

      {reports.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 60, height: 60, background: '#EDE9FE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart3 size={28} color="#7C3AED" />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1E1B4B', margin: 0 }}>No Reports Yet</h3>
          <p style={{ color: '#6B7280', fontSize: 14, maxWidth: 360 }}>Run your first influencer-brand analysis to generate actionable insights.</p>
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none', marginTop: 8 }}>Get Started <ArrowRight size={16} /></Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {reports.map((report) => (
            <div key={report._id} className="card card-hover" style={{ padding: 22, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
              {/* Top accent line */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #7C3AED, #A78BFA)' }} />
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <Link to={`/influencer/${report.influencerId?._id}`}
                  style={{ fontSize: 17, fontWeight: 700, color: '#1E1B4B', textDecoration: 'none', flexShrink: 1, marginRight: 8 }}
                  title={report.influencerId?.name}>
                  {report.influencerId?.name || 'Unknown'}
                </Link>
                <StatusBadge reportId={report._id} currentStatus={report.status || 'Draft'} onStatusChange={handleStatusChange} />
              </div>
              
              <div style={{ marginBottom: 14 }}>
                <span style={{ display: 'inline-block', background: '#EDE9FE', color: '#5B21B6', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>
                  {report.brandName}
                </span>
                <span style={{ marginLeft: 8, fontSize: 11, color: '#9CA3AF' }}>
                  {new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {/* Score + Metrics */}
              <div style={{ background: '#F9FAFB', border: '1px solid #E2D9FB', borderRadius: 12, padding: 16, flex: 1 }}>
                <ScoreMeter score={report.score} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14, paddingTop: 14, borderTop: '1px solid #E2D9FB' }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                      <TrendingUp size={11} /> Engagement
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#1E1B4B' }}>{report.influencerId?.engagementRate || 0}%</div>
                  </div>
                  <div style={{ borderLeft: '1px solid #E2D9FB', paddingLeft: 12 }}>
                    <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                      <DollarSign size={11} /> Est. Value
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#7C3AED' }}>₹{report.earningsEstimate?.toLocaleString('en-IN') || 0}</div>
                  </div>
                </div>
              </div>

              <Link to={`/report/${report._id}`} state={{ report }} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                marginTop: 14, padding: '10px', borderRadius: 10, textDecoration: 'none',
                background: '#F5F3FF', color: '#7C3AED', fontWeight: 600, fontSize: 13,
                border: '1px solid #DDD6FE', transition: 'background 0.15s'
              }}>
                View Full Report <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
