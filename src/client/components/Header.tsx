import React from 'react';
import { Layers, History, Sparkles, RefreshCw } from 'lucide-react';

interface HeaderProps {
  problems: { id: string; title: string; difficulty: string }[];
  selectedProblemId: string;
  onSelectProblem: (id: string) => void;
  currentVersion: number;
  hasMultipleVersions: boolean;
  onOpenComparison: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  problems,
  selectedProblemId,
  onSelectProblem,
  currentVersion,
  hasMultipleVersions,
  onOpenComparison,
  onReset,
}) => {
  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-logo">
          <Layers size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="brand-title">LLD Studio</span>
            <span className="brand-badge">Practice & Eval</span>
          </div>
        </div>
      </div>

      <div className="header-actions">
        <select
          id="problem-select"
          className="problem-selector"
          value={selectedProblemId}
          onChange={(e) => onSelectProblem(e.target.value)}
        >
          {problems.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} ({p.difficulty})
            </option>
          ))}
        </select>

        {currentVersion > 0 && (
          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#a5b4fc',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={14} /> Attempt #{currentVersion}
          </div>
        )}

        {hasMultipleVersions && (
          <button
            id="compare-attempts-btn"
            className="header-btn"
            onClick={onOpenComparison}
            title="Compare your attempts side-by-side"
          >
            <History size={15} /> Compare Attempts
          </button>
        )}

        <button
          id="reset-template-btn"
          className="header-btn"
          onClick={onReset}
          title="Reset to starter template"
        >
          <RefreshCw size={15} /> Clean Template
        </button>
      </div>
    </header>
  );
};
