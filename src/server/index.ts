import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { InMemoryProblemRepository } from '../core/repositories/InMemoryProblemRepository.ts';
import { InMemoryAttemptRepository } from '../core/repositories/InMemoryAttemptRepository.ts';
import { PracticeService } from '../core/services/PracticeService.ts';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize repositories and core practice service
const problemRepo = new InMemoryProblemRepository();
const attemptRepo = new InMemoryAttemptRepository();
const practiceService = new PracticeService(problemRepo, attemptRepo);

/**
 * GET /api/problems - List all available LLD practice problems
 */
app.get('/api/problems', async (_req: Request, res: Response) => {
  try {
    const problems = await practiceService.listProblems();
    res.json({
      success: true,
      data: problems.map((p) => ({
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
        description: p.description,
        requiredEntities: p.requiredEntities,
        keyExpectations: p.keyExpectations,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/problems/:id - Fetch full problem details with starter templates and rubric
 */
app.get('/api/problems/:id', async (req: Request, res: Response) => {
  try {
    const problem = await practiceService.getProblem(req.params.id as string);
    res.json({ success: true, data: problem });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/attempts - Start a new attempt for a problem
 */
app.post('/api/attempts', async (req: Request, res: Response) => {
  try {
    const { problemId } = req.body;
    if (!problemId) {
      res.status(400).json({ success: false, error: 'problemId is required' });
      return;
    }

    const attempt = await practiceService.startAttempt(problemId);
    res.json({
      success: true,
      data: {
        id: attempt.id,
        problemId: attempt.problemId,
        startedAt: attempt.startedAt,
        currentVersion: attempt.currentVersion,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/attempts/:id - Get attempt status, submissions, and evaluations
 */
app.get('/api/attempts/:id', async (req: Request, res: Response) => {
  try {
    const attempt = await practiceService.getAttempt(req.params.id as string);
    const submissions = attempt.submissions.map((s) => ({
      id: s.id,
      version: s.version,
      status: s.status,
      submittedAt: s.submittedAt,
      idempotencyKey: s.idempotencyKey,
      classSkeleton: s.content.getClassSkeleton(),
      designRationale: s.content.getRationale(),
      diagramMermaid: s.content.getDiagramMermaid(),
      errorDiagnostic: s.errorDiagnostic,
      evaluation: attempt.getEvaluation(s.version),
    }));

    res.json({
      success: true,
      data: {
        id: attempt.id,
        problemId: attempt.problemId,
        currentVersion: attempt.currentVersion,
        submissions,
      },
    });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/attempts/:id/submit - Submit a design iteration for evaluation
 */
app.post('/api/attempts/:id/submit', async (req: Request, res: Response) => {
  try {
    const { classSkeleton, designRationale, diagramMermaid, idempotencyKey } = req.body;

    if (!classSkeleton || !designRationale) {
      res.status(400).json({
        success: false,
        error: 'Both classSkeleton and designRationale are required for a meaningful LLD submission',
      });
      return;
    }

    const result = await practiceService.submitAttempt(req.params.id as string, {
      classSkeleton,
      designRationale,
      diagramMermaid,
      idempotencyKey,
    });

    res.json({
      success: true,
      data: {
        submissionId: result.submission.id,
        version: result.submission.version,
        status: result.submission.status,
        evaluation: result.evaluation,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/attempts/:id/retry - Retry a failed evaluation version
 */
app.post('/api/attempts/:id/retry', async (req: Request, res: Response) => {
  try {
    const { version } = req.body;
    const result = await practiceService.retryEvaluation(req.params.id as string, Number(version));
    res.json({
      success: true,
      data: {
        version: result.submission.version,
        status: result.submission.status,
        evaluation: result.evaluation,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/attempts/:id/compare - Compare two attempt versions
 */
app.get('/api/attempts/:id/compare', async (req: Request, res: Response) => {
  try {
    const versionA = parseInt(req.query.versionA as string, 10);
    const versionB = parseInt(req.query.versionB as string, 10);

    if (isNaN(versionA) || isNaN(versionB)) {
      res.status(400).json({ success: false, error: 'versionA and versionB query parameters are required' });
      return;
    }

    const report = await practiceService.compareAttemptVersions(req.params.id as string, versionA, versionB);
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 LLD Practice Platform API server running at http://localhost:${port}`);
});
