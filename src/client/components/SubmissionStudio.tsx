import React, { useState } from 'react';
import { Code, GitFork, MessageSquare, Send, Loader2 } from 'lucide-react';
import { MermaidViewer } from './MermaidViewer.tsx';

interface SubmissionStudioProps {
  classSkeleton: string;
  onChangeSkeleton: (val: string) => void;
  designRationale: string;
  onChangeRationale: (val: string) => void;
  diagramMermaid: string;
  onChangeDiagram: (val: string) => void;
  onSubmit: () => void;
  isEvaluating: boolean;
}

export const SubmissionStudio: React.FC<SubmissionStudioProps> = ({
  classSkeleton,
  onChangeSkeleton,
  designRationale,
  onChangeRationale,
  diagramMermaid,
  onChangeDiagram,
  onSubmit,
  isEvaluating,
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'diagram' | 'rationale'>('code');

  const codeLines = classSkeleton.split('\n').length;
  const wordCount = designRationale.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="pane" id="studio-pane" style={{ borderRight: '1px solid var(--border)' }}>
      <div className="studio-toolbar">
        <div className="tab-group">
          <button
            id="tab-code-btn"
            className={`tab-btn ${activeTab === 'code' ? 'active' : ''}`}
            onClick={() => setActiveTab('code')}
          >
            <Code size={12} /> Code
          </button>
          <button
            id="tab-diagram-btn"
            className={`tab-btn ${activeTab === 'diagram' ? 'active' : ''}`}
            onClick={() => setActiveTab('diagram')}
          >
            <GitFork size={12} /> UML
          </button>
          <button
            id="tab-rationale-btn"
            className={`tab-btn ${activeTab === 'rationale' ? 'active' : ''}`}
            onClick={() => setActiveTab('rationale')}
          >
            <MessageSquare size={12} /> Rationale
          </button>
        </div>

        <div className="toolbar-meta">
          <div className="save-dot" />
          <span>Saved</span>
          <span style={{ color: 'var(--border)' }}>·</span>
          <span>TypeScript</span>
          <span style={{ color: 'var(--border)' }}>·</span>
          <span>{activeTab === 'code' ? `${codeLines} lines` : activeTab === 'rationale' ? `${wordCount} words` : 'Live preview'}</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeTab === 'code' && (
          <textarea
            id="skeleton-textarea"
            className="code-editor"
            value={classSkeleton}
            onChange={(e) => onChangeSkeleton(e.target.value)}
            placeholder="Model your classes, interfaces, and methods here..."
            spellCheck={false}
          />
        )}

        {activeTab === 'diagram' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <textarea
              id="diagram-textarea"
              className="code-editor"
              style={{ flex: '0 0 45%', borderBottom: '1px solid var(--border)' }}
              value={diagramMermaid}
              onChange={(e) => onChangeDiagram(e.target.value)}
              placeholder="classDiagram&#10;  ParkingLot --> ParkingFloor"
              spellCheck={false}
            />
            <div className="diagram-canvas" style={{ flex: 1 }}>
              <MermaidViewer chart={diagramMermaid} />
            </div>
          </div>
        )}

        {activeTab === 'rationale' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div style={{
              padding: '8px 16px',
              fontSize: '0.72rem',
              color: 'var(--text-dim)',
              borderBottom: '1px solid var(--border)',
              background: 'rgba(5,5,5,0.4)',
            }}>
              Explain: <strong style={{ color: 'var(--text-muted)' }}>Assumptions</strong> · <strong style={{ color: 'var(--text-muted)' }}>Patterns</strong> · <strong style={{ color: 'var(--text-muted)' }}>Trade-offs</strong> · <strong style={{ color: 'var(--text-muted)' }}>Concurrency</strong>
            </div>
            <textarea
              id="rationale-textarea"
              className="code-editor"
              style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', lineHeight: 1.65 }}
              value={designRationale}
              onChange={(e) => onChangeRationale(e.target.value)}
              placeholder="Explain your trade-offs, pattern choices, and assumptions..."
              spellCheck={false}
            />
          </div>
        )}
      </div>

      <div className="studio-action-bar">
        <div className="action-status">
          {isEvaluating ? (
            <>
              <Loader2 size={12} className="animate-spin" style={{ color: 'var(--accent)' }} />
              <span style={{ color: 'var(--accent)' }}>Running evaluation...</span>
            </>
          ) : (
            <span>Ready for evaluation</span>
          )}
        </div>

        <button
          id="submit-design-btn"
          className="action-btn-primary"
          onClick={onSubmit}
          disabled={isEvaluating}
        >
          {isEvaluating ? (
            <>
              <Loader2 size={13} className="animate-spin" /> Evaluating
            </>
          ) : (
            <>
              <Send size={13} /> Run Evaluation
              <span className="kbd">⌘↵</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
