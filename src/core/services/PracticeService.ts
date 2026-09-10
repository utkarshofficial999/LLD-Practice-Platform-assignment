import { IProblemRepository } from '../repositories/IProblemRepository.ts';
import { IAttemptRepository } from '../repositories/IAttemptRepository.ts';
import { CompositeEvaluator } from '../evaluation/CompositeEvaluator.ts';
import { AttemptProgressionEngine, ProgressionReport } from '../evaluation/AttemptProgressionEngine.ts';
import { Attempt } from '../domain/Attempt.ts';
import { Problem } from '../domain/Problem.ts';
import { ISubmissionContent, Submission, StructuredSubmissionContent } from '../domain/Submission.ts';
import { EvaluationResult } from '../domain/Feedback.ts';

export interface SubmitPayload {
  classSkeleton: string;
  designRationale: string;
  diagramMermaid?: string;
  idempotencyKey?: string;
}

export class PracticeService {
  constructor(
    private readonly problemRepo: IProblemRepository,
    private readonly attemptRepo: IAttemptRepository,
    private readonly evaluator: CompositeEvaluator = new CompositeEvaluator()
  ) {}

  public async listProblems(): Promise<Problem[]> {
    return this.problemRepo.getAll();
  }

  public async getProblem(id: string): Promise<Problem> {
    const problem = await this.problemRepo.getById(id);
    if (!problem) {
      throw new Error(`Problem with ID '${id}' not found`);
    }
    return problem;
  }

  public async startAttempt(problemId: string): Promise<Attempt> {
    const problem = await this.getProblem(problemId);
    const attemptId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const attempt = new Attempt(attemptId, problem.id);
    await this.attemptRepo.save(attempt);
    return attempt;
  }

  public async getAttempt(attemptId: string): Promise<Attempt> {
    const attempt = await this.attemptRepo.getById(attemptId);
    if (!attempt) {
      throw new Error(`Attempt with ID '${attemptId}' not found`);
    }
    return attempt;
  }

  public async submitAttempt(
    attemptId: string,
    payload: SubmitPayload
  ): Promise<{ submission: Submission; evaluation?: EvaluationResult }> {
    const attempt = await this.getAttempt(attemptId);
    const problem = await this.getProblem(attempt.problemId);

    const rawContent = `${payload.classSkeleton}::${payload.designRationale}`;
    const idempotencyKey = payload.idempotencyKey || Buffer.from(rawContent).toString('base64').slice(0, 32);

    const latestSub = attempt.getLatestSubmission();
    if (latestSub && latestSub.idempotencyKey === idempotencyKey && latestSub.status === 'COMPLETED') {
      const existingEval = attempt.getEvaluation(latestSub.version);
      return { submission: latestSub, evaluation: existingEval };
    }

    const submissionContent: ISubmissionContent = new StructuredSubmissionContent(
      payload.classSkeleton,
      payload.designRationale,
      payload.diagramMermaid || ''
    );

    const submission = attempt.createNextSubmission(submissionContent, idempotencyKey);
    await this.attemptRepo.save(attempt);

    submission.markEvaluating();
    await this.attemptRepo.save(attempt);

    try {
      const evaluationResult = await this.evaluator.evaluate(submission, problem);
      attempt.recordEvaluation(submission.version, evaluationResult);
      await this.attemptRepo.save(attempt);

      return {
        submission,
        evaluation: evaluationResult,
      };
    } catch (evalError: any) {
      console.error(`Evaluation failed for submission ${submission.id}:`, evalError);
      attempt.recordFailure(submission.version, evalError?.message || 'Unknown evaluation error');
      await this.attemptRepo.save(attempt);

      return {
        submission,
      };
    }
  }

  public async retryEvaluation(
    attemptId: string,
    version: number
  ): Promise<{ submission: Submission; evaluation?: EvaluationResult }> {
    const attempt = await this.getAttempt(attemptId);
    const problem = await this.getProblem(attempt.problemId);

    const submission = attempt.submissions.find((s) => s.version === version);
    if (!submission) {
      throw new Error(`Submission version ${version} not found in attempt ${attemptId}`);
    }

    submission.markEvaluating();
    await this.attemptRepo.save(attempt);

    try {
      const evaluationResult = await this.evaluator.evaluate(submission, problem);
      attempt.recordEvaluation(submission.version, evaluationResult);
      await this.attemptRepo.save(attempt);

      return {
        submission,
        evaluation: evaluationResult,
      };
    } catch (err: any) {
      attempt.recordFailure(submission.version, err?.message || 'Retry failed');
      await this.attemptRepo.save(attempt);
      return { submission };
    }
  }

  public async compareAttemptVersions(
    attemptId: string,
    versionA: number,
    versionB: number
  ): Promise<ProgressionReport> {
    const attempt = await this.getAttempt(attemptId);

    const evalA = attempt.getEvaluation(versionA);
    const evalB = attempt.getEvaluation(versionB);

    if (!evalA || !evalB) {
      throw new Error(`Cannot compare: missing evaluation for version ${!evalA ? versionA : versionB}`);
    }

    return AttemptProgressionEngine.compare(evalA, evalB);
  }
}
