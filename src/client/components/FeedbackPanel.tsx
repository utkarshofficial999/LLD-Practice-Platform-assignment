import React from 'react';
import { Award, AlertTriangle, CheckCircle, ArrowRight, Lightbulb, Star, ShieldAlert, RotateCcw } from 'lucide-react';

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
        <div className="pane-content" style={{ textAlign: 'center', paddingTop: '40px' }}>
          <AlertTriangle size={40} style={{ color: '#fb7185', margin: '0 auto 16px' }} />
          <h3 style={{ marginBottom: '8px' }}>Evaluation Stopped</h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '20px' }}>
            {errorDiagnostic || 'An error occurred during evaluation.'}
          </p>
          <button id="retry-eval-btn" className="header-btn primary" onClick={onRetry}>
            <RotateCcw size={16} /> Retry Evaluation
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
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Version {evaluation.version} ({evaluation.evaluationSource})
          </span>
        )}
      </div>

      <div className="pane-content">
        {/* Pipeline Stepper */}
        <div className="pipeline-stepper">
          <div className={`step-item ${submissionStatus ? 'completed' : ''}`}>
            <div className="step-dot" />
            <span>Submitted</span>
          </div>
          <div
            className={`step-item ${
              isEvaluating ? 'active' : evaluation ? 'completed' : ''
            }`}
          >
            <div className="step-dot" />
            <span>Deterministic</span>
          </div>
          <div
            className={`step-item ${
              isEvaluating ? 'active' : evaluation ? 'completed' : ''
            }`}
          >
            <div className="step-dot" />
            <span>AI Reasoning</span>
          </div>
          <div className={`step-item ${evaluation ? 'completed' : ''}`}>
            <div className="step-dot" />
            <span>Scorecard</span>
          </div>
        </div>

        {!evaluation && !isEvaluating && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <Lightbulb size={36} style={{ margin: '0 auto 12px', opacity: 0.6 }} />
            <h4 style={{ color: '#cbd5e1', marginBottom: '6px' }}>Ready for Evaluation</h4>
            <p style={{ fontSize: '0.84rem' }}>
              Submit your class skeleton and design rationale to receive multi-dimensional rubric feedback and anti-pattern analysis.
            </p>
          </div>
        )}

        {isEvaluating && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(99, 102, 241, 0.2)',
                borderTopColor: '#6366f1',
                borderRadius: '50%',
                margin: '0 auto 16px',
                animation: 'spin 1s linear infinite',
              }}
            />
            <h4 style={{ color: '#cbd5e1', marginBottom: '6px' }}>Evaluating Low-Level Design</h4>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              Running static structural analysis, checking entity coverage, and generating rubric ratings...
            </p>
          </div>
        )}

        {evaluation && (
          <>
            {/* Score Hero Card */}
            <div className="score-hero-card">
              <div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                  Design Quality Score
                </div>
                <div className="score-number">{evaluation.overallScore}%</div>
                <div
                  className={`score-badge ${
                    evaluation.overallScore >= 80 ? 'high' : evaluation.overallScore >= 60 ? 'medium' : 'low'
                  }`}
                >
                  {evaluation.overallScore >= 80
                    ? 'Production Ready'
                    : evaluation.overallScore >= 60
                    ? 'Competent Structure'
                    : 'Needs Refactoring'}
                </div>
              </div>

              <button
                id="try-again-btn"
                className="header-btn primary"
                onClick={onTryAgain}
                style={{ alignSelf: 'center' }}
              >
                <RotateCcw size={14} /> Try Again (Next Attempt)
              </button>
            </div>

            {/* Actionable Summary Banner */}
            {evaluation.actionableSummary.length > 0 && (
              <div
                style={{
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  marginBottom: '18px',
                }}
              >
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#a5b4fc',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '6px',
                  }}
                >
                  <Lightbulb size={14} /> Recommended Next Steps
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {evaluation.actionableSummary.map((item, idx) => (
                    <li key={idx} style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'flex', gap: '6px' }}>
                      <ArrowRight size={13} style={{ color: '#818cf8', flexShrink: 0, marginTop: '2px' }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Anti-Pattern Alerts */}
            {evaluation.deterministicFindings.antiPatternFlags.length > 0 && (
              <div style={{ marginBottom: '18px' }}>
                <div className="section-label">Design Smells & Anti-Patterns</div>
                {evaluation.deterministicFindings.antiPatternFlags.map((flag, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: flag.severity === 'critical' ? 'rgba(244, 63, 94, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                      border: `1px solid ${flag.severity === 'critical' ? 'rgba(244, 63, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 12px',
                      marginBottom: '8px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: flag.severity === 'critical' ? '#fb7185' : '#fbbf24',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '4px',
                      }}
                    >
                      <AlertTriangle size={14} /> {flag.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{flag.details}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Rubric Criteria Breakdown */}
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
                          fill={i < item.score ? '#f59e0b' : 'transparent'}
                          color={i < item.score ? '#f59e0b' : '#64748b'}
                        />
                      ))}
                      <span style={{ marginLeft: '4px', color: '#f59e0b' }}>{item.score}/5</span>
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
