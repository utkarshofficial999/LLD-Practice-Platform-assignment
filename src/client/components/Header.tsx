import React from 'react';
import { Layers, History, RotateCcw, ChevronDown } from 'lucide-react';

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
      <div className="header-left">
        <div className="brand-mark">
          <div className="brand-icon">
            <Layers size={13} strokeWidth={2} />
          </div>
          <span className="brand-name">LLD Studio</span>
        </div>
        <div className="header-separator" />
        <span className="status-tag">Engineering Mode</span>
      </div>

      <div className="header-center">
        <div className="command-selector">
          <ChevronDown size={12} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
          <select
            id="problem-select"
            value={selectedProblemId}
            onChange={(e) => onSelectProblem(e.target.value)}
          >
            {problems.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <span className="kbd">⌘K</span>
        </div>
      </div>

      <div className="header-right">
        {currentVersion > 0 && (
          <div className="header-chip accent">
            v{currentVersion}
          </div>
        )}

        {hasMultipleVersions && (
          <button
            id="compare-attempts-btn"
            className="header-btn"
            onClick={onOpenComparison}
            title="Compare attempts"
          >
            <History size={13} /> Compare
          </button>
        )}

        <button
          id="reset-template-btn"
          className="header-btn"
          onClick={onReset}
          title="Reset to starter template"
        >
          <RotateCcw size={13} /> Reset
        </button>
      </div>
    </header>
  );
};
