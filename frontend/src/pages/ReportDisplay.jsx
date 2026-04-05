import React, { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import api from '../api';
import ScoreMeter from '../components/ScoreMeter';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Activity, Users, Tag, DollarSign, CheckCircle2, XCircle, ShieldAlert, Printer } from 'lucide-react';

const ReportDisplay = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    api.get(`/reports/${id}`)
      .then(res => setReport(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!report) return <div>Loading...</div>;

  const { influencerId, brandName, pros, cons, earningsEstimate, score } = report;

  const chartData = [
    { name: 'M1', earnings: earningsEstimate * 0.8 },
    { name: 'M2', earnings: earningsEstimate * 0.9 },
    { name: 'M3', earnings: earningsEstimate * 1.1 },
    { name: 'M4', earnings: earningsEstimate * 1.05 },
    { name: 'M5', earnings: earningsEstimate * 1.2 },
    { name: 'Now', earnings: earningsEstimate },
  ];

  const handleDownloadPDF = () => window.print();

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
            Intelligence <span className="text-gradient">Report</span>
          </h1>
          <p style={{ color: '#6B7280', fontSize: 14, marginTop: 4 }}>AI-driven actionable fit assessment</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }} className="no-print">
          <button onClick={handleDownloadPDF} className="btn-primary">
            <Printer size={15} /> Export PDF
          </button>
          <Link to="/dashboard" className="btn-ghost" style={{ textDecoration: 'none' }}>
            <ArrowLeft size={15} /> Dashboard
          </Link>
        </div>
      </div>

      <div id="report-content">
        {/* Hero Card */}
        <div className="card" style={{ marginBottom: 20, overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)', borderBottom: '1px solid #E2D9FB', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#DDD6FE', color: '#5B21B6', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, marginBottom: 10 }}>
                <Activity size={11} /> Analysis Complete
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1E1B4B', margin: 0 }}>{influencerId.name}</h2>
              <p style={{ color: '#6B7280', fontSize: 14, marginTop: 6 }}>
                Prospective partnership with <strong style={{ color: '#1E1B4B' }}>{brandName}</strong>
              </p>
            </div>
            <div style={{ background: '#FFFFFF', border: '1px solid #E2D9FB', borderRadius: 14, padding: '20px 24px', minWidth: 200 }}>
              <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, textAlign: 'center' }}>Fit Score Rating</p>
              <ScoreMeter score={score} />
            </div>
          </div>

          {/* Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {[
              { icon: <Users size={20} color="#7C3AED" />, label: 'Followers', value: influencerId.followers.toLocaleString('en-IN') },
              { icon: <Activity size={20} color="#7C3AED" />, label: 'Engagement', value: `${influencerId.engagementRate}%` },
              { icon: <Tag size={20} color="#7C3AED" />, label: 'Category', value: influencerId.category },
              { icon: <DollarSign size={20} color="#059669" />, label: 'Est. Post Value', value: `₹${earningsEstimate.toLocaleString('en-IN')}`, valueStyle: { color: '#059669' } },
            ].map((item, i) => (
              <div key={i} style={{ padding: '20px 24px', borderRight: i < 3 ? '1px solid #E2D9FB' : 'none', borderTop: '1px solid #E2D9FB' }}>
                <div style={{ marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1E1B4B', ...item.valueStyle }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Content: Chart + Pros/Cons + Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Chart */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1E1B4B', margin: 0 }}>Projected Value Trend</h3>
                <span style={{ fontSize: 11, background: '#EDE9FE', color: '#5B21B6', padding: '3px 10px', borderRadius: 99, fontWeight: 700 }}>30-Day Forecast</span>
              </div>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                    <Tooltip contentStyle={{ background: '#fff', borderRadius: 10, border: '1px solid #E2D9FB', fontSize: 12, color: '#1E1B4B' }}
                      formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Earnings']} />
                    <Area type="monotone" dataKey="earnings" stroke="#7C3AED" strokeWidth={2.5} fillOpacity={1} fill="url(#earningsGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pros & Cons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="card" style={{ padding: 20, borderColor: '#A7F3D0', background: '#F0FDF4' }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#065F46', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                  <CheckCircle2 size={16} color="#059669" /> Match Strengths
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {pros.length > 0 ? pros.map((p, i) => (
                    <li key={i} style={{ fontSize: 12, color: '#065F46', display: 'flex', gap: 8, lineHeight: 1.6 }}>
                      <span style={{ color: '#059669', marginTop: 1 }}>•</span> {p}
                    </li>
                  )) : <li style={{ fontSize: 12, color: '#6B7280', fontStyle: 'italic' }}>No strengths identified.</li>}
                </ul>
              </div>
              <div className="card" style={{ padding: 20, borderColor: '#FECACA', background: '#FFF5F5' }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#991B1B', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                  <ShieldAlert size={16} color="#DC2626" /> Risk Factors
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {cons.length > 0 ? cons.map((c, i) => (
                    <li key={i} style={{ fontSize: 12, color: '#991B1B', display: 'flex', gap: 8, lineHeight: 1.6 }}>
                      <span style={{ color: '#DC2626', marginTop: 1 }}>•</span> {c}
                    </li>
                  )) : <li style={{ fontSize: 12, color: '#6B7280', fontStyle: 'italic' }}>No significant risks.</li>}
                </ul>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1E1B4B', marginBottom: 16 }}>Executive Summary</h3>
            <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 12, padding: 16, flex: 1 }}>
              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, margin: 0 }}>
                Based on algorithmic analysis of engagement metrics <strong>({influencerId.engagementRate}%)</strong>, 
                category alignment (<strong>{brandName}</strong> within <strong>{influencerId.category}</strong>), 
                and overall audience size of <strong>{influencerId.followers.toLocaleString('en-IN')}</strong> followers...
              </p>
            </div>
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #E2D9FB' }}>
              <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Final Recommendation</p>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#1E1B4B' }}>
                We rate this collaboration as{' '}
                <span className="text-gradient">{score?.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDisplay;
