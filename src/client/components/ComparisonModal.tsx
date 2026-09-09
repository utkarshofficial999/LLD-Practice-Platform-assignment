import React from 'react';
import { X, TrendingUp, CheckCircle, PlusCircle, ShieldCheck } from 'lucide-react';

interface ProgressionReport {
  previousVersion: number;
  currentVersion: number;
  previousOverallScore: number;
  currentOverallScore: number;
  overallScoreDelta: number;
  criteriaDeltas: {
    criterion: string;
    previousScore: number;
    currentScore: number;
    delta: number;
    status: 'improved' | 'declined' | 'unchanged';
  }[];
  resolvedConcerns: string[];
  newConcerns: string[];
  structuralProgress: {
    classesAdded: string[];
    interfacesAdded: string[];
    antiPatternsResolved: string[];
  };
}

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ProgressionReport | null;
  versions: number[];
  versionA: number;
  versionB: number;
  onChangeVersionA: (v: number) => void;
  onChangeVersionB: (v: number) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  report,
  versions,
  versionA,
  versionB,
  onChangeVersionA,
  onChangeVersionB,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} style={{ color: '#818cf8' }} />
            <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Attempt Progression Comparison</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', color: '#94a3b8', padding: '4px', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Version Selector Bar */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Baseline Version:</span>
              <select
                className="problem-selector"
                value={versionA}
                onChange={(e) => onChangeVersionA(Number(e.target.value))}
              >
                {versions.map((v) => (
                  <option key={v} value={v}>
                    Attempt #{v}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>vs</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Comparison Version:</span>
              <select
                className="problem-selector"
                value={versionB}
                onChange={(e) => onChangeVersionB(Number(e.target.value))}
              >
                {versions.map((v) => (
                  <option key={v} value={v}>
                    Attempt #{v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {report && (
            <>
              {/* Score Progression Overview */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Score Evolution</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                    {report.previousOverallScore}% → {report.currentOverallScore}%
                  </div>
                </div>

                <div
                  className={`delta-badge ${
                    report.overallScoreDelta > 0
                      ? 'improved'
                      : report.overallScoreDelta < 0
                      ? 'declined'
                      : 'unchanged'
                  }`}
                  style={{ fontSize: '0.95rem', padding: '6px 14px' }}
                >
                  {report.overallScoreDelta > 0 ? `+${report.overallScoreDelta}% Improvement` : `${report.overallScoreDelta}%`}
                </div>
              </div>

              {/* Resolved Concerns */}
              {report.resolvedConcerns.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div className="section-label" style={{ color: '#34d399' }}>
                    Resolved Design Concerns
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {report.resolvedConcerns.map((res, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'rgba(16, 185, 129, 0.08)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '8px 12px',
                          fontSize: '0.82rem',
                          color: '#a7f3d0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <CheckCircle size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                        <span>{res}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Structural Evolution */}
              <div style={{ marginBottom: '20px' }}>
                <div className="section-label">Structural Changes in this Iteration</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="checklist-card">
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                      Classes Added
                    </div>
                    {report.structuralProgress.classesAdded.length > 0 ? (
                      <div className="entity-tag-list">
                        {report.structuralProgress.classesAdded.map((c) => (
                          <span key={c} className="entity-chip detected">
                            <PlusCircle size={12} /> {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>No new classes added</span>
                    )}
                  </div>

                  <div className="checklist-card">
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                      Interfaces & Abstractions Added
                    </div>
                    {report.structuralProgress.interfacesAdded.length > 0 ? (
                      <div className="entity-tag-list">
                        {report.structuralProgress.interfacesAdded.map((i) => (
                          <span key={i} className="entity-chip detected">
                            <ShieldCheck size={12} /> {i}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>No new interfaces added</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Criteria Delta Table */}
              <div className="section-label">Rubric Breakdown Delta</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px' }}>Criterion</th>
                    <th style={{ padding: '8px 12px' }}>Attempt #{report.previousVersion}</th>
                    <th style={{ padding: '8px 12px' }}>Attempt #{report.currentVersion}</th>
                    <th style={{ padding: '8px 12px' }}>Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {report.criteriaDeltas.map((c, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#e2e8f0' }}>{c.criterion}</td>
                      <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{c.previousScore} / 5</td>
                      <td style={{ padding: '10px 12px', color: '#fff', fontWeight: 700 }}>{c.currentScore} / 5</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span className={`delta-badge ${c.status}`}>
                          {c.delta > 0 ? `+${c.delta}` : c.delta}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
