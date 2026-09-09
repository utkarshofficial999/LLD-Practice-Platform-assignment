import { Attempt } from '../domain/Attempt.ts';

export interface IAttemptRepository {
  getById(id: string): Promise<Attempt | null>;
  getByProblemId(problemId: string): Promise<Attempt[]>;
  save(attempt: Attempt): Promise<void>;
}
