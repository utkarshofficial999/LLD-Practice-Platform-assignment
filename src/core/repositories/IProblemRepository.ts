import { Problem } from '../domain/Problem.ts';

export interface IProblemRepository {
  getAll(): Promise<Problem[]>;
  getById(id: string): Promise<Problem | null>;
  save(problem: Problem): Promise<void>;
}
