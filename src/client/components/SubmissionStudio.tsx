import React, { useState } from 'react';
import { Code, GitFork, MessageSquare, Send, Loader2, Braces } from 'lucide-react';
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
    <div className="pane" id="studio-pane">
      <div className="pane-header">
        <div className="studio-tabs">
          <button
            id="tab-code-btn"
            className={`studio-tab-btn ${activeTab === 'code' ? 'active' : ''}`}
            onClick={() => setActiveTab('code')}
          >
            <Code size={13} /> Code
          </button>
          <button
            id="tab-diagram-btn"
            className={`studio-tab-btn ${activeTab === 'diagram' ? 'active' : ''}`}
            onClick={() => setActiveTab('diagram')}
          >
            <GitFork size={13} /> UML Diagram
          </button>
          <button
            id="tab-rationale-btn"
            className={`studio-tab-btn ${activeTab === 'rationale' ? 'active' : ''}`}
            onClick={() => setActiveTab('rationale')}
          >
            <MessageSquare size={13} /> Rationale
          </button>
        </div>

        <div style={{
          fontSize: '0.72rem',
          color: 'var(--text-dim)',
          fontFamily: 'var(--font-mono)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Braces size={12} /> TypeScript / UML
        </div>
      </div>

      <div className="pane-content" style={{ display: 'flex', flexDirection: 'column', padding: '14px' }}>
        {activeTab === 'code' && (
          <textarea
            id="skeleton-textarea"
            className="editor-textarea"
            value={classSkeleton}
            onChange={(e) => onChangeSkeleton(e.target.value)}
            placeholder="// Model your classes, interfaces, and methods here..."
            spellCheck={false}
          />
        )}

        {activeTab === 'diagram' && (
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '10px', height: '100%' }}>
            <textarea
              id="diagram-textarea"
              className="editor-textarea"
              value={diagramMermaid}
              onChange={(e) => onChangeDiagram(e.target.value)}
              placeholder="classDiagram&#10;  ParkingLotController --> IPaymentStrategy"
              spellCheck={false}
            />
            <div className="diagram-preview-card">
              <MermaidViewer chart={diagramMermaid} />
            </div>
          </div>
        )}

        {activeTab === 'rationale' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
            <div style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              padding: '10px 14px',
              background: 'rgba(99, 102, 241, 0.05)',
              border: '1px solid rgba(99, 102, 241, 0.15)',
              borderRadius: 'var(--radius-sm)',
              lineHeight: 1.55,
            }}>
              💡 Explain: <strong>Assumptions</strong>, <strong>Chosen Patterns</strong>,
              <strong> Trade-offs</strong>, and <strong>Concurrency handling</strong>.
            </div>
            <textarea
              id="rationale-textarea"
              className="editor-textarea"
              value={designRationale}
              onChange={(e) => onChangeRationale(e.target.value)}
              placeholder="Explain your trade-offs, pattern choices, and assumptions..."
              spellCheck={false}
            />
          </div>
        )}
      </div>

      <div className="studio-footer">
        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', display: 'flex', gap: '16px' }}>
          {activeTab === 'code' && <span>{codeLines} lines</span>}
          {activeTab === 'diagram' && <span>Live preview</span>}
          {activeTab === 'rationale' && <span>{wordCount} words</span>}
        </div>

        <button
          id="submit-design-btn"
          className="header-btn primary"
          onClick={onSubmit}
          disabled={isEvaluating}
          style={{
            opacity: isEvaluating ? 0.7 : 1,
            cursor: isEvaluating ? 'not-allowed' : 'pointer',
            minWidth: 180,
            justifyContent: 'center',
          }}
        >
          {isEvaluating ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Evaluating...
            </>
          ) : (
            <>
              <Send size={15} /> Submit for Evaluation
            </>
          )}
        </button>
      </div>
    </div>
  );
};
