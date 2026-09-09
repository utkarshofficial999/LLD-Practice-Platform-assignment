import React from 'react';
import { Award, AlertTriangle, CheckCircle, ArrowRight, Lightbulb, Star, ShieldAlert, RotateCcw, Sparkles } from 'lucide-react';

interface RubricAssessment {
  criterion: string;
  score: number;
  evidence: string;
  concern: string;
  suggestion: string;
  confidence: number;
}

interface DeterministicFindings {
  entityCoverage: { entity: string; matched: boolean; detectedName?: string }[];
  detectedClasses: string[];
  detectedInterfaces: string[];
  antiPatternFlags: { name: string; severity: string; details: string }[];
}

interface EvaluationResult {
  submissionId: string;
  version: number;
  overallScore: number;
  rubricAssessments: RubricAssessment[];
  deterministicFindings: DeterministicFindings;
  actionableSummary: string[];
  evaluationSource: string;
}

interface FeedbackPanelProps {
  evaluation: EvaluationResult | null;
  isEvaluating: boolean;
  onTryAgain: () => void;
  submissionStatus: 'SUBMITTED' | 'EVALUATING' | 'COMPLETED' | 'FAILED' | null;
  errorDiagnostic?: string;
  onRetry: () => void;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  evaluation,
  isEvaluating,
  onTryAgain,
  submissionStatus,
  errorDiagnostic,
  onRetry,
}) => {
  if (submissionStatus === 'FAILED') {
    return (
      <div className="pane" id="feedback-pane">
        <div className="pane-header">
          <div className="pane-title" style={{ color: '#fb7185' }}>
            <ShieldAlert size={16} /> Evaluation Failed
          </div>
        </div>
        <div className="pane-content" style={{ textAlign: 'center', paddingTop: '60px' }}>
          <div style={{
            width: 60, height: 60, borderRadius: 'var(--radius-lg)',
            background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', boxShadow: '0 0 24px rgba(244, 63, 94, 0.15)'
          }}>
            <AlertTriangle size={28} style={{ color: '#fb7185' }} />
          </div>
          <h3 style={{ marginBottom: '8px', fontSize: '1.05rem' }}>Evaluation Stopped</h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '24px', maxWidth: 320, margin: '0 auto 24px' }}>
            {errorDiagnostic || 'An unexpected error occurred during design evaluation.'}
          </p>
          <button id="retry-eval-btn" className="header-btn primary" onClick={onRetry}>
            <RotateCcw size={15} /> Retry Evaluation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pane" id="feedback-pane">
      <div className="pane-header">
        <div className="pane-title">
          <Award size={16} /> Explainable Feedback
        </div>
        {evaluation && (
          <span style={{
            fontSize: '0.72rem', color: 'var(--text-dim)',
            fontWeight: 600, padding: '3px 8px',
            background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-color)'
          }}>
            v{evaluation.version} • {evaluation.evaluationSource}
          </span>
        )}
      </div>

      <div className="pane-content">
        {/* Pipeline Stepper */}
        <div className="pipeline-stepper">
          <div className={`step-item ${submissionStatus ? 'completed' : ''}`}>
            <div className="step-dot" />
            <span>Saved</span>
          </div>
          <div className={`step-item ${isEvaluating ? 'active' : evaluation ? 'completed' : ''}`}>
            <div className="step-dot" />
            <span>Static</span>
          </div>
          <div className={`step-item ${isEvaluating ? 'active' : evaluation ? 'completed' : ''}`}>
            <div className="step-dot" />
            <span>AI Rubric</span>
          </div>
          <div className={`step-item ${evaluation ? 'completed' : ''}`}>
            <div className="step-dot" />
            <span>Done</span>
          </div>
        </div>

        {/* Empty state */}
        {!evaluation && !isEvaluating && (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-dim)' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 'var(--radius-lg)',
              background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 18px', boxShadow: '0 0 24px rgba(99, 102, 241, 0.1)'
            }}>
              <Sparkles size={26} style={{ color: '#818cf8', opacity: 0.7 }} />
            </div>
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '1rem' }}>Ready for Evaluation</h4>
            <p style={{ fontSize: '0.84rem', maxWidth: 320, margin: '0 auto', lineHeight: 1.6 }}>
              Submit your class skeleton and design rationale to receive structured rubric feedback with evidence-based suggestions.
            </p>
          </div>
        )}

        {/* Loading state */}
        {isEvaluating && (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <div style={{
              width: 48, height: 48, margin: '0 auto 20px',
              border: '3px solid rgba(99, 102, 241, 0.15)',
              borderTopColor: '#818cf8',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.15)',
            }} />
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '6px' }}>Analyzing Design</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: 300, margin: '0 auto' }}>
              Running structural analysis, checking entity coverage, and generating rubric assessments...
            </p>
          </div>
        )}

        {evaluation && (
          <>
            {/* 3D Score Hero Card */}
            <div className="score-hero-card">
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>
                  Design Quality
                </div>
                <div className="score-number">{evaluation.overallScore}%</div>
                <div className={`score-badge ${
                  evaluation.overallScore >= 80 ? 'high' : evaluation.overallScore >= 60 ? 'medium' : 'low'
                }`}>
                  {evaluation.overallScore >= 80 ? '✦ Production Ready'
                    : evaluation.overallScore >= 60 ? '◉ Competent Structure'
                    : '◌ Needs Refactoring'}
                </div>
              </div>

              <button id="try-again-btn" className="header-btn primary" onClick={onTryAgain} style={{ alignSelf: 'center' }}>
                <RotateCcw size={14} /> Next Attempt
              </button>
            </div>

            {/* Actionable Next Steps */}
            {evaluation.actionableSummary.length > 0 && (
              <div style={{
                background: 'rgba(99, 102, 241, 0.06)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                marginBottom: '20px',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
                animation: 'fade-in-up 0.3s ease-out',
              }}>
                <div style={{
                  fontSize: '0.76rem', fontWeight: 700, color: '#a5b4fc',
                  display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px',
                  textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                  <Lightbulb size={13} /> Improvement Priorities
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {evaluation.actionableSummary.map((item, idx) => (
                    <li key={idx} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px', lineHeight: 1.5 }}>
                      <ArrowRight size={13} style={{ color: '#818cf8', flexShrink: 0, marginTop: '3px' }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Anti-Pattern Alerts */}
            {evaluation.deterministicFindings.antiPatternFlags.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div className="section-label">Design Smells Detected</div>
                {evaluation.deterministicFindings.antiPatternFlags.map((flag, idx) => (
                  <div key={idx} style={{
                    background: flag.severity === 'critical' ? 'rgba(244, 63, 94, 0.06)' : 'rgba(245, 158, 11, 0.06)',
                    border: `1px solid ${flag.severity === 'critical' ? 'rgba(244, 63, 94, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px',
                    marginBottom: '8px',
                    boxShadow: 'var(--shadow-subtle)',
                    animation: `fade-in-up 0.3s ease-out ${0.1 + idx * 0.05}s both`,
                  }}>
                    <div style={{
                      fontSize: '0.8rem', fontWeight: 700,
                      color: flag.severity === 'critical' ? '#fda4af' : '#fcd34d',
                      display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px',
                    }}>
                      <AlertTriangle size={14} /> {flag.name}
                    </div>
                    <div style={{ fontSize: '0.77rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{flag.details}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Rubric Breakdown — 3D cards */}
            <div className="section-label">Structured Rubric Assessment</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {evaluation.rubricAssessments.map((item, idx) => (
                <div key={idx} className="rubric-item">
                  <div className="rubric-item-header">
                    <span className="rubric-title">{item.criterion}</span>
                    <div className="rubric-score-stars">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          fill={i < item.score ? '#fbbf24' : 'transparent'}
                          color={i < item.score ? '#fbbf24' : 'rgba(255,255,255,0.12)'}
                          style={{ filter: i < item.score ? 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.3))' : 'none' }}
                        />
                      ))}
                      <span style={{ marginLeft: '6px', color: '#fbbf24', fontSize: '0.8rem' }}>{item.score}/5</span>
                    </div>
                  </div>

                  <div className="rubric-detail evidence">
                    <strong>Evidence:</strong> {item.evidence}
                  </div>

                  {item.concern && item.concern !== 'None' && item.concern !== 'None.' && (
                    <div className="rubric-detail concern">
                      <strong>Concern:</strong> {item.concern}
                    </div>
                  )}

                  <div className="rubric-detail suggestion">
                    <strong>Suggestion:</strong> {item.suggestion}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
