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
            <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '0.93rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Progression Analysis
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Base</span>
              <select
                className="command-selector"
                style={{ minWidth: 'auto', padding: '4px 8px', fontSize: '0.78rem' }}
                value={versionA}
                onChange={(e) => onChangeVersionA(Number(e.target.value))}
              >
                {versions.map((v) => (
                  <option key={v} value={v}>v{v}</option>
                ))}
              </select>
            </div>

            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>→</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Compare</span>
              <select
                className="command-selector"
                style={{ minWidth: 'auto', padding: '4px 8px', fontSize: '0.78rem' }}
                value={versionB}
                onChange={(e) => onChangeVersionB(Number(e.target.value))}
              >
                {versions.map((v) => (
                  <option key={v} value={v}>v{v}</option>
                ))}
              </select>
            </div>
          </div>

          {report && (
            <>
              <div className="comparison-score-bar">
                <div>
                  <div style={{ fontSize: '0.64rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                    Score Evolution
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    {report.previousOverallScore}% → {report.currentOverallScore}%
                  </div>
                </div>
                <span className={`delta-badge ${
                  report.overallScoreDelta > 0 ? 'improved' : report.overallScoreDelta < 0 ? 'declined' : 'unchanged'
                }`} style={{ fontSize: '0.82rem', padding: '4px 12px' }}>
                  {report.overallScoreDelta > 0 ? `+${report.overallScoreDelta}%` : `${report.overallScoreDelta}%`}
                </span>
              </div>

              {report.resolvedConcerns.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div className="section-heading" style={{ color: 'var(--success)' }}>
                    Resolved Concerns
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {report.resolvedConcerns.map((res, idx) => (
                      <div key={idx} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '6px 10px', borderRadius: 'var(--radius-xs)',
                        background: 'var(--success-bg)', border: '1px solid var(--success-border)',
                        fontSize: '0.75rem', color: 'var(--success)',
                      }}>
                        <CheckCircle size={12} style={{ flexShrink: 0 }} />
                        <span>{res}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <div className="section-heading">Structural Changes</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ padding: '10px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.64rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', marginBottom: '6px' }}>
                      Classes Added
                    </div>
                    {report.structuralProgress.classesAdded.length > 0 ? (
                      <div className="chip-list">
                        {report.structuralProgress.classesAdded.map((c) => (
                          <span key={c} className="chip">
                            <PlusCircle size={10} /> {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>None</span>
                    )}
                  </div>

                  <div style={{ padding: '10px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.64rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', marginBottom: '6px' }}>
                      Interfaces Added
                    </div>
                    {report.structuralProgress.interfacesAdded.length > 0 ? (
                      <div className="chip-list">
                        {report.structuralProgress.interfacesAdded.map((i) => (
                          <span key={i} className="chip">
                            <ShieldCheck size={10} /> {i}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>None</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="section-heading">Rubric Delta</div>
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Criterion</th>
                    <th>v{report.previousVersion}</th>
                    <th>v{report.currentVersion}</th>
                    <th style={{ textAlign: 'right' }}>Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {report.criteriaDeltas.map((c, idx) => (
                    <tr key={idx}>
                      <td>{c.criterion}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{c.previousScore}/5</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>{c.currentScore}/5</td>
                      <td style={{ textAlign: 'right' }}>
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
