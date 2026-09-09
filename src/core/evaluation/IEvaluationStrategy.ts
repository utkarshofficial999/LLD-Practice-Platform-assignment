import { Submission } from '../domain/Submission.ts';
import { Problem } from '../domain/Problem.ts';
import { DeterministicFindings, RubricAssessment } from '../domain/Feedback.ts';

export interface StageEvaluationResult {
  stageName: string;
  success: boolean;
  deterministicFindings?: DeterministicFindings;
  rubricAssessments?: RubricAssessment[];
  error?: string;
}

/**
 * Strategy contract for all evaluation steps.
 * Directly solves Change Test B: Adding rule-based evaluators, LLMs,
 * or Human Reviewers is accomplished by implementing this interface
 * without modifying the practice flow.
 */
export interface IEvaluationStrategy {
  readonly name: string;
  evaluate(submission: Submission, problem: Problem): Promise<StageEvaluationResult>;
}
