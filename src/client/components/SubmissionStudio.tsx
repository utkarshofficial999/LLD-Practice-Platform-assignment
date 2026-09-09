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

  return (
    <div className="pane" id="studio-pane" style={{ borderRight: '1px solid var(--border-color)' }}>
      <div className="pane-header">
        <div className="studio-tabs">
          <button
            id="tab-code-btn"
            className={`studio-tab-btn ${activeTab === 'code' ? 'active' : ''}`}
            onClick={() => setActiveTab('code')}
          >
            <Code size={14} /> Class Skeleton
          </button>
          <button
            id="tab-diagram-btn"
            className={`studio-tab-btn ${activeTab === 'diagram' ? 'active' : ''}`}
            onClick={() => setActiveTab('diagram')}
          >
            <GitFork size={14} /> Live UML Diagram
          </button>
          <button
            id="tab-rationale-btn"
            className={`studio-tab-btn ${activeTab === 'rationale' ? 'active' : ''}`}
            onClick={() => setActiveTab('rationale')}
          >
            <MessageSquare size={14} /> Architectural Rationale
          </button>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
          TypeScript / UML
        </div>
      </div>

      <div className="pane-content" style={{ display: 'flex', flexDirection: 'column', padding: '12px' }}>
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
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '12px', height: '100%' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '8px' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              💡 Explain your design decisions: <strong>Assumptions</strong>, <strong>Chosen Patterns</strong>, 
              <strong> Trade-offs considered</strong>, and <strong>Concurrency handling</strong>.
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
        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          {activeTab === 'code' && `${classSkeleton.split('\n').length} lines of code`}
          {activeTab === 'diagram' && 'Live Mermaid rendering'}
          {activeTab === 'rationale' && `${designRationale.trim().split(/\s+/).filter(Boolean).length} words`}
        </div>

        <button
          id="submit-design-btn"
          className="header-btn primary"
          onClick={onSubmit}
          disabled={isEvaluating}
          style={{ opacity: isEvaluating ? 0.7 : 1, cursor: isEvaluating ? 'not-allowed' : 'pointer' }}
        >
          {isEvaluating ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Evaluating Design...
            </>
          ) : (
            <>
              <Send size={16} /> Submit for Evaluation
            </>
          )}
        </button>
      </div>
    </div>
  );
};
