import { Submission, ISubmissionContent } from './Submission.ts';
import { EvaluationResult } from './Feedback.ts';

export class Attempt {
  private readonly _submissions: Submission[] = [];
  private readonly _evaluations: Map<number, EvaluationResult> = new Map();

  constructor(
    public readonly id: string,
    public readonly problemId: string,
    public readonly startedAt: Date = new Date(),
    public currentVersion: number = 0
  ) {}

  public get submissions(): ReadonlyArray<Submission> {
    return this._submissions;
  }

  public get evaluations(): ReadonlyMap<number, EvaluationResult> {
    return this._evaluations;
  }

  /**
   * Safe creation of the next submission version.
   * Enforces sequential versioning and stores before evaluation begins.
   */
  public createNextSubmission(content: ISubmissionContent, idempotencyKey: string): Submission {
    this.currentVersion += 1;
    const submission = new Submission(
      `sub-${this.id}-${this.currentVersion}`,
      this.id,
      this.currentVersion,
      content,
      idempotencyKey,
      new Date(),
      'SUBMITTED'
    );
    this._submissions.push(submission);
    return submission;
  }

  /**
   * Records evaluation result and marks the submission as COMPLETED.
   */
  public recordEvaluation(version: number, result: EvaluationResult): void {
    const submission = this._submissions.find((s) => s.version === version);
    if (!submission) {
      throw new Error(`Cannot record evaluation: Submission version ${version} not found in attempt ${this.id}`);
    }

    submission.markCompleted();
    this._evaluations.set(version, result);
  }

  /**
   * Records an evaluation failure and marks submission as FAILED.
   */
  public recordFailure(version: number, errorDiagnostic: string): void {
    const submission = this._submissions.find((s) => s.version === version);
    if (submission) {
      submission.markFailed(errorDiagnostic);
    }
  }

  public getLatestSubmission(): Submission | undefined {
    return this._submissions[this._submissions.length - 1];
  }

  public getLatestEvaluation(): EvaluationResult | undefined {
    return this._evaluations.get(this.currentVersion);
  }

  public getEvaluation(version: number): EvaluationResult | undefined {
    return this._evaluations.get(version);
  }
}
