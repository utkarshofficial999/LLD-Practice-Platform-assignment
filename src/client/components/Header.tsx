import React from 'react';
import { Layers, History, Sparkles, RefreshCw, Zap } from 'lucide-react';

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
          <Layers size={20} strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="brand-title">LLD Studio</span>
            <span className="brand-badge">
              <Zap size={10} style={{ marginRight: '2px', display: 'inline' }} />
              Practice & Eval
            </span>
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
              fontSize: '0.82rem',
              fontWeight: 700,
              padding: '7px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.12))',
              color: '#c4b5fd',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 16px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
              letterSpacing: '-0.01em',
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
            <History size={14} /> Compare
          </button>
        )}

        <button
          id="reset-template-btn"
          className="header-btn"
          onClick={onReset}
          title="Reset to starter template"
        >
          <RefreshCw size={14} /> Reset
        </button>
      </div>
    </header>
  );
};
