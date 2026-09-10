import React from 'react';
import { Cpu, AlertTriangle, RotateCcw, ArrowRight, Lightbulb, ShieldAlert, Zap } from 'lucide-react';

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

const getBarClass = (score: number) => score >= 4 ? 'high' : score >= 3 ? 'mid' : 'low';

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
          <div className="pane-label" style={{ color: 'var(--danger)' }}>
            <ShieldAlert size={12} /> Evaluation Failed
          </div>
        </div>
        <div className="pane-content">
          <div className="empty-state" style={{ paddingTop: 50 }}>
            <div className="empty-icon" style={{ borderColor: 'var(--danger-border)' }}>
              <AlertTriangle size={18} style={{ color: 'var(--danger)' }} />
            </div>
            <div className="empty-title">Analysis Stopped</div>
            <div className="empty-subtitle" style={{ marginBottom: 18 }}>
              {errorDiagnostic || 'An unexpected error occurred.'}
            </div>
            <button id="retry-eval-btn" className="action-btn-primary" onClick={onRetry}>
              <RotateCcw size={13} /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const overallScoreOutOf10 = evaluation ? (evaluation.overallScore / 10).toFixed(1) : '0.0';
  const scoreTier = evaluation
    ? evaluation.overallScore >= 80 ? 'high' : evaluation.overallScore >= 60 ? 'mid' : 'low'
    : 'low';
  const tierLabel = evaluation
    ? evaluation.overallScore >= 80 ? 'Production Ready' : evaluation.overallScore >= 60 ? 'Competent' : 'Needs Work'
    : '';

  return (
    <div className="pane" id="feedback-pane">
      <div className="pane-header">
        <div className="pane-label">
          <Cpu size={12} className="pane-label-icon" /> AI Architect
        </div>
        {evaluation && (
          <div className="pane-meta">
            <span style={{ color: 'var(--accent)', fontSize: '0.6rem' }}>●</span>
            <span>v{evaluation.version}</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span>{evaluation.evaluationSource}</span>
          </div>
        )}
      </div>

      <div className="pipeline">
        <div className={`pipeline-step ${submissionStatus ? 'completed' : ''}`}>
          <div className="pipeline-dot" />
          <span>Saved</span>
        </div>
        <div className="pipeline-connector" />
        <div className={`pipeline-step ${isEvaluating ? 'active' : evaluation ? 'completed' : ''}`}>
          <div className="pipeline-dot" />
          <span>Static</span>
        </div>
        <div className="pipeline-connector" />
        <div className={`pipeline-step ${isEvaluating ? 'active' : evaluation ? 'completed' : ''}`}>
          <div className="pipeline-dot" />
          <span>AI Rubric</span>
        </div>
        <div className="pipeline-connector" />
        <div className={`pipeline-step ${evaluation ? 'completed' : ''}`}>
          <div className="pipeline-dot" />
          <span>Done</span>
        </div>
      </div>

      <div className="pane-content">
        {!evaluation && !isEvaluating && (
          <div className="empty-state" style={{ paddingTop: 40 }}>
            <div className="empty-icon">
              <Zap size={18} />
            </div>
            <div className="empty-title">Ready for Analysis</div>
            <div className="empty-subtitle">
              Submit your design to receive structured rubric feedback from the AI architect.
            </div>
          </div>
        )}

        {isEvaluating && (
          <div className="scan-container">
            <div className="scan-spinner" />
            <div className="scan-title">Analyzing Design</div>
            <div className="scan-subtitle">Running structural analysis and rubric assessment...</div>
          </div>
        )}

        {evaluation && (
          <>
            <div className="score-display">
              <div className="score-label">Design Quality</div>
              <div className="score-value">
                {overallScoreOutOf10}<span className="score-max"> / 10</span>
              </div>
              <div className={`score-tier ${scoreTier}`}>
                {tierLabel}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '0 4px' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)' }}>
                Rubric Breakdown
              </span>
              <button id="try-again-btn" className="next-attempt-btn" onClick={onTryAgain}>
                <RotateCcw size={12} /> Next Attempt
              </button>
            </div>

            {evaluation.actionableSummary.length > 0 && (
              <ul className="priority-list">
                <li style={{ fontSize: '0.64rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-muted)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Lightbulb size={11} /> Priorities
                </li>
                {evaluation.actionableSummary.map((item, idx) => (
                  <li key={idx} className="priority-item">
                    <ArrowRight size={11} className="priority-icon" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {evaluation.deterministicFindings.antiPatternFlags.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                {evaluation.deterministicFindings.antiPatternFlags.map((flag, idx) => (
                  <div key={idx} className={`antipattern-card ${flag.severity === 'critical' ? 'critical' : 'warning'}`}
                    style={{ animationDelay: `${0.1 + idx * 0.05}s` }}
                  >
                    <div className="antipattern-name">
                      <AlertTriangle size={12} /> {flag.name}
                    </div>
                    <div className="antipattern-details">{flag.details}</div>
                  </div>
                ))}
              </div>
            )}

            <div>
              {evaluation.rubricAssessments.map((item, idx) => {
                const barClass = getBarClass(item.score);
                return (
                  <div key={idx} className="metric-card">
                    <div className="metric-header">
                      <span className="metric-name">{item.criterion}</span>
                      <span className="metric-score">{item.score}<span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>/5</span></span>
                    </div>
                    <div className="metric-bar-track">
                      <div className={`metric-bar-fill ${barClass}`} style={{ width: `${(item.score / 5) * 100}%` }} />
                    </div>

                    <div className="metric-detail evidence">
                      <strong>Evidence</strong><br />
                      {item.evidence}
                    </div>

                    {item.concern && item.concern !== 'None' && item.concern !== 'None.' && item.concern !== 'None identified.' && (
                      <div className="metric-detail concern">
                        <strong>Concern</strong><br />
                        {item.concern}
                      </div>
                    )}

                    <div className="metric-detail suggestion">
                      <strong>Suggestion</strong><br />
                      {item.suggestion}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
