import React, { useEffect, useState, useMemo } from 'react';
import { Header } from './components/Header.tsx';
import { ProblemViewer } from './components/ProblemViewer.tsx';
import { SubmissionStudio } from './components/SubmissionStudio.tsx';
import { FeedbackPanel } from './components/FeedbackPanel.tsx';
import { ComparisonModal } from './components/ComparisonModal.tsx';

interface ProblemSummary {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  requiredEntities: string[];
  keyExpectations: string[];
}

interface FullProblem extends ProblemSummary {
  rubric: { id: string; name: string; description: string; weight: number }[];
  starterTemplate: {
    skeleton: string;
    rationale: string;
    diagramMermaid: string;
  };
}

export const App: React.FC = () => {
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [selectedProblemId, setSelectedProblemId] = useState<string>('');
  const [problemDetail, setProblemDetail] = useState<FullProblem | null>(null);

  const [attemptId, setAttemptId] = useState<string>('');
  const [currentVersion, setCurrentVersion] = useState<number>(0);
  const [versionsList, setVersionsList] = useState<number[]>([]);

  const [classSkeleton, setClassSkeleton] = useState<string>('');
  const [designRationale, setDesignRationale] = useState<string>('');
  const [diagramMermaid, setDiagramMermaid] = useState<string>('');

  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [submissionStatus, setSubmissionStatus] = useState<
    'SUBMITTED' | 'EVALUATING' | 'COMPLETED' | 'FAILED' | null
  >(null);
  const [errorDiagnostic, setErrorDiagnostic] = useState<string | undefined>(undefined);
  const [evaluation, setEvaluation] = useState<any | null>(null);

  // Comparison modal state
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);
  const [versionA, setVersionA] = useState<number>(1);
  const [versionB, setVersionB] = useState<number>(2);
  const [comparisonReport, setComparisonReport] = useState<any | null>(null);

  // Theme state: 'dark' or 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('lld-studio-theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lld-studio-theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 1. Fetch Problem Catalog
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await fetch('/api/problems');
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setProblems(json.data);
          setSelectedProblemId(json.data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch problems:', err);
      }
    };
    fetchProblems();
  }, []);

  // 2. Fetch Selected Problem Details & Initialize Attempt
  useEffect(() => {
    if (!selectedProblemId) return;

    const loadProblem = async () => {
      try {
        const probRes = await fetch(`/api/problems/${selectedProblemId}`);
        const probJson = await probRes.json();

        if (probJson.success) {
          const p: FullProblem = probJson.data;
          setProblemDetail(p);
          setClassSkeleton(p.starterTemplate.skeleton);
          setDesignRationale(p.starterTemplate.rationale);
          setDiagramMermaid(p.starterTemplate.diagramMermaid || '');
          setEvaluation(null);
          setSubmissionStatus(null);
          setCurrentVersion(0);
          setVersionsList([]);

          // Start a new attempt session
          const attRes = await fetch('/api/attempts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ problemId: p.id }),
          });
          const attJson = await attRes.json();
          if (attJson.success) {
            setAttemptId(attJson.data.id);
          }
        }
      } catch (err) {
        console.error('Failed to load problem:', err);
      }
    };

    loadProblem();
  }, [selectedProblemId]);

  // Real-time Static Entity Detection from current class skeleton
  const detectedEntities = useMemo(() => {
    const names: string[] = [];
    const classRegex = /(?:export\s+)?(?:abstract\s+)?class\s+([A-Za-z0-9_]+)/g;
    let match: RegExpExecArray | null;
    while ((match = classRegex.exec(classSkeleton)) !== null) {
      names.push(match[1]);
    }
    const ifaceRegex = /(?:export\s+)?interface\s+([A-Za-z0-9_]+)/g;
    while ((match = ifaceRegex.exec(classSkeleton)) !== null) {
      names.push(match[1]);
    }
    return names;
  }, [classSkeleton]);

  // Submit current attempt
  const handleSubmit = async () => {
    if (!attemptId) return;

    setIsEvaluating(true);
    setSubmissionStatus('EVALUATING');
    setErrorDiagnostic(undefined);

    try {
      const res = await fetch(`/api/attempts/${attemptId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classSkeleton,
          designRationale,
          diagramMermaid,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setCurrentVersion(json.data.version);
        setVersionsList((prev) => Array.from(new Set([...prev, json.data.version])));
        setSubmissionStatus(json.data.status);
        setEvaluation(json.data.evaluation || null);

        // Update default comparison versions
        if (json.data.version > 1) {
          setVersionA(json.data.version - 1);
          setVersionB(json.data.version);
        }
      } else {
        setSubmissionStatus('FAILED');
        setErrorDiagnostic(json.error || 'Evaluation failed');
      }
    } catch (err: any) {
      setSubmissionStatus('FAILED');
      setErrorDiagnostic(err?.message || 'Network error');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Retry evaluation
  const handleRetry = async () => {
    if (!attemptId || currentVersion === 0) return;
    setIsEvaluating(true);
    try {
      const res = await fetch(`/api/attempts/${attemptId}/retry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: currentVersion }),
      });
      const json = await res.json();
      if (json.success) {
        setSubmissionStatus(json.data.status);
        setEvaluation(json.data.evaluation);
      }
    } catch (err) {
      console.error('Retry error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // "Try Again" - Prepare next attempt
  const handleTryAgain = () => {
    // Keep the current skeleton and rationale for editing, reset evaluation view
    setEvaluation(null);
    setSubmissionStatus(null);
  };

  // Reset to clean starter template
  const handleResetTemplate = () => {
    if (problemDetail) {
      setClassSkeleton(problemDetail.starterTemplate.skeleton);
      setDesignRationale(problemDetail.starterTemplate.rationale);
      setDiagramMermaid(problemDetail.starterTemplate.diagramMermaid);
      setEvaluation(null);
      setSubmissionStatus(null);
    }
  };

  // Fetch comparison report
  const handleOpenComparison = async () => {
    if (!attemptId || versionsList.length < 2) return;
    setIsComparisonOpen(true);
    fetchComparison(versionA, versionB);
  };

  const fetchComparison = async (vA: number, vB: number) => {
    try {
      const res = await fetch(`/api/attempts/${attemptId}/compare?versionA=${vA}&versionB=${vB}`);
      const json = await res.json();
      if (json.success) {
        setComparisonReport(json.data);
      }
    } catch (err) {
      console.error('Comparison error:', err);
    }
  };

  return (
    <div className="app-container">
      <Header
        problems={problems}
        selectedProblemId={selectedProblemId}
        onSelectProblem={setSelectedProblemId}
        currentVersion={currentVersion}
        hasMultipleVersions={versionsList.length >= 2}
        onOpenComparison={handleOpenComparison}
        onReset={handleResetTemplate}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="workspace-grid">
        <ProblemViewer problem={problemDetail} detectedEntities={detectedEntities} />

        <SubmissionStudio
          classSkeleton={classSkeleton}
          onChangeSkeleton={setClassSkeleton}
          designRationale={designRationale}
          onChangeRationale={setDesignRationale}
          diagramMermaid={diagramMermaid}
          onChangeDiagram={setDiagramMermaid}
          onSubmit={handleSubmit}
          isEvaluating={isEvaluating}
        />

        <FeedbackPanel
          evaluation={evaluation}
          isEvaluating={isEvaluating}
          onTryAgain={handleTryAgain}
          submissionStatus={submissionStatus}
          errorDiagnostic={errorDiagnostic}
          onRetry={handleRetry}
        />
      </main>

      <ComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        report={comparisonReport}
        versions={versionsList}
        versionA={versionA}
        versionB={versionB}
        onChangeVersionA={(v) => {
          setVersionA(v);
          fetchComparison(v, versionB);
        }}
        onChangeVersionB={(v) => {
          setVersionB(v);
          fetchComparison(versionA, v);
        }}
      />
    </div>
  );
};
