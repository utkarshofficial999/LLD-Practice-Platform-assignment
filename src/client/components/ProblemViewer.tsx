import React from 'react';
import { BookOpen, CheckCircle2, Circle, Target, ShieldCheck } from 'lucide-react';

interface ProblemViewerProps {
  problem: {
    id: string;
    title: string;
    difficulty: string;
    description: string;
    requiredEntities: string[];
    keyExpectations: string[];
    rubric: { id: string; name: string; description: string; weight: number }[];
  } | null;
  detectedEntities: string[];
}

export const ProblemViewer: React.FC<ProblemViewerProps> = ({ problem, detectedEntities }) => {
  if (!problem) {
    return <div className="pane-content">Loading problem details...</div>;
  }

  const difficultyClass = problem.difficulty.toLowerCase();

  return (
    <div className="pane" id="problem-pane">
      <div className="pane-header">
        <div className="pane-title">
          <BookOpen size={16} /> Problem Requirements
        </div>
        <span className={`difficulty-pill ${difficultyClass}`}>{problem.difficulty}</span>
      </div>

      <div className="pane-content">
        <h2 style={{ fontSize: '1.15rem', marginBottom: '12px', color: '#fff' }}>{problem.title}</h2>
        <p className="problem-desc">{problem.description}</p>

        {/* Real-time Entity Coverage Checklist */}
        <div className="section-label">Required Domain Entities</div>
        <div className="checklist-card">
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '8px' }}>
            Live static detection updates automatically as you type:
          </p>
          <div className="entity-tag-list">
            {problem.requiredEntities.map((entity) => {
              const normReq = entity.toLowerCase().replace(/[^a-z0-9]/g, '');
              const isDetected = detectedEntities.some((d) => {
                const normD = d.toLowerCase().replace(/[^a-z0-9]/g, '');
                return normD === normReq || normD.includes(normReq) || normReq.includes(normD);
              });

              return (
                <span
                  key={entity}
                  className={`entity-chip ${isDetected ? 'detected' : ''}`}
                  title={isDetected ? 'Detected in your code' : 'Not yet defined'}
                >
                  {isDetected ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                  {entity}
                </span>
              );
            })}
          </div>
        </div>

        {/* Key Design Expectations */}
        <div className="section-label">Key Behavioral Expectations</div>
        <ul className="expectation-list">
          {problem.keyExpectations.map((exp, idx) => (
            <li key={idx} className="expectation-item">
              <Target size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '3px' }} />
              <span>{exp}</span>
            </li>
          ))}
        </ul>

        {/* Rubric Criteria */}
        <div className="section-label">Evaluation Rubric</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {problem.rubric.map((r) => (
            <div
              key={r.id}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 10px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0' }}>{r.name}</span>
                <span style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 600 }}>
                  {Math.round(r.weight * 100)}%
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{r.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
