import React from 'react';
import { FileText, CheckCircle2, Circle, ChevronRight } from 'lucide-react';

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
    return (
      <div className="pane" id="problem-pane">
        <div className="pane-header">
          <div className="pane-label">
            <FileText size={12} className="pane-label-icon" /> Specification
          </div>
        </div>
        <div className="pane-content">
          <div className="empty-state">
            <div className="empty-icon"><FileText size={18} /></div>
            <div className="empty-title">Loading</div>
            <div className="empty-subtitle">Fetching problem specification...</div>
          </div>
        </div>
      </div>
    );
  }

  const difficultyClass = problem.difficulty.toLowerCase();
  const detectedCount = problem.requiredEntities.filter((entity) => {
    const normReq = entity.toLowerCase().replace(/[^a-z0-9]/g, '');
    return detectedEntities.some((d) => {
      const normD = d.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normD === normReq || normD.includes(normReq) || normReq.includes(normD);
    });
  }).length;
  const totalEntities = problem.requiredEntities.length;
  const coveragePercent = totalEntities > 0 ? Math.round((detectedCount / totalEntities) * 100) : 0;

  return (
    <div className="pane" id="problem-pane">
      <div className="pane-header">
        <div className="pane-label">
          <FileText size={12} className="pane-label-icon" /> Problem Specification
        </div>
        <div className={`difficulty-indicator ${difficultyClass}`}>
          {problem.difficulty}
        </div>
      </div>

      <div className="pane-content">
        <div className="problem-number">Problem 01</div>
        <h2 className="problem-title">{problem.title}</h2>

        <p className="problem-desc">{problem.description}</p>

        {/* Domain Entities */}
        <div className="section-heading">
          Domain Entities
          <span className="section-count">{detectedCount.toString().padStart(2, '0')} / {totalEntities.toString().padStart(2, '0')}</span>
        </div>

        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${coveragePercent}%` }} />
        </div>

        <div className="entity-grid">
          {problem.requiredEntities.map((entity) => {
            const normReq = entity.toLowerCase().replace(/[^a-z0-9]/g, '');
            const isDetected = detectedEntities.some((d) => {
              const normD = d.toLowerCase().replace(/[^a-z0-9]/g, '');
              return normD === normReq || normD.includes(normReq) || normReq.includes(normD);
            });

            return (
              <div
                key={entity}
                className={`entity-row ${isDetected ? 'detected' : ''}`}
                title={isDetected ? 'Detected in your code' : 'Not yet defined'}
              >
                {isDetected ? (
                  <CheckCircle2 size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                ) : (
                  <div className="entity-dot" />
                )}
                <span>{entity}</span>
              </div>
            );
          })}
        </div>

        {/* Behavioral Expectations */}
        <div className="section-heading">Behavioral Expectations</div>
        <ul className="expectation-list">
          {problem.keyExpectations.map((exp, idx) => (
            <li key={idx} className="expectation-item">
              <ChevronRight size={12} className="expectation-icon" />
              <span>{exp}</span>
            </li>
          ))}
        </ul>

        {/* Evaluation Rubric */}
        <div className="section-heading">Evaluation Criteria</div>
        <div>
          {problem.rubric.map((r) => (
            <div key={r.id} className="rubric-spec-item">
              <span className="rubric-spec-name">{r.name}</span>
              <span className="rubric-spec-weight">{Math.round(r.weight * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
