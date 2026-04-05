import React from 'react';

const SCORE_MAP = {
  'Excellent': { width: '100%', barColor: '#059669', cls: 'score-excellent' },
  'Good':      { width: '75%',  barColor: '#2563EB', cls: 'score-good' },
  'Average':   { width: '50%',  barColor: '#D97706', cls: 'score-average' },
  'Poor':      { width: '25%',  barColor: '#DC2626', cls: 'score-poor' },
};

const ScoreMeter = ({ score }) => {
  const cfg = SCORE_MAP[score] || SCORE_MAP['Average'];
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Fit Score
        </span>
        <span className={cfg.cls} style={{ fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 99 }}>
          {score || 'N/A'}
        </span>
      </div>
      <div style={{ width: '100%', background: '#EDE9FE', borderRadius: 99, height: 6 }}>
        <div style={{
          height: 6, borderRadius: 99,
          width: cfg.width,
          background: cfg.barColor,
          transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)'
        }} />
      </div>
    </div>
  );
};

export default ScoreMeter;
