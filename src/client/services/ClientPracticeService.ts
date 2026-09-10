import { InMemoryProblemRepository } from '../../core/repositories/InMemoryProblemRepository.ts';
import { InMemoryAttemptRepository } from '../../core/repositories/InMemoryAttemptRepository.ts';
import { PracticeService } from '../../core/services/PracticeService.ts';

class ClientPracticeServiceSingleton {
  private problemRepo = new InMemoryProblemRepository();
  private attemptRepo = new InMemoryAttemptRepository();
  private practiceService = new PracticeService(this.problemRepo, this.attemptRepo);

  public async getProblems() {
    try {
      const res = await fetch('/api/problems');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Network fetch for /api/problems failed, using in-memory fallback:', err);
    }
    const local = await this.practiceService.listProblems();
    return local.map((p) => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      description: p.description,
      requiredEntities: p.requiredEntities,
      keyExpectations: p.keyExpectations,
    }));
  }

  public async getProblem(id: string) {
    try {
      const res = await fetch(`/api/problems/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn(`Network fetch for /api/problems/${id} failed, using in-memory fallback:`, err);
    }
    return this.practiceService.getProblem(id);
  }

  public async startAttempt(problemId: string) {
    try {
      const res = await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Network attempt start failed, using in-memory fallback:', err);
    }
    const attempt = await this.practiceService.startAttempt(problemId);
    return {
      id: attempt.id,
      problemId: attempt.problemId,
      startedAt: attempt.startedAt,
      currentVersion: attempt.currentVersion,
    };
  }

  public async submitAttempt(
    attemptId: string,
    payload: {
      classSkeleton: string;
      designRationale: string;
      diagramMermaid?: string;
      idempotencyKey?: string;
    }
  ) {
    try {
      const res = await fetch(`/api/attempts/${attemptId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return { success: true, data: json.data };
        }
      }
    } catch (err) {
      console.warn('Network submission failed, evaluating locally in browser:', err);
    }

    try {
      // Ensure attempt exists locally
      let attempt = await this.practiceService.getAttempt(attemptId).catch(() => null);
      if (!attempt) {
        // Find problem by heuristic or first problem
        const problems = await this.practiceService.listProblems();
        attempt = await this.practiceService.startAttempt(problems[0].id);
      }

      const result = await this.practiceService.submitAttempt(attempt.id, payload);
      return {
        success: true,
        data: {
          submissionId: result.submission.id,
          version: result.submission.version,
          status: result.submission.status,
          evaluation: result.evaluation,
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async retryEvaluation(attemptId: string, version: number) {
    try {
      const res = await fetch(`/api/attempts/${attemptId}/retry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return { success: true, data: json.data };
        }
      }
    } catch (err) {
      console.warn('Network retry failed, running locally:', err);
    }

    try {
      const result = await this.practiceService.retryEvaluation(attemptId, version);
      return {
        success: true,
        data: {
          version: result.submission.version,
          status: result.submission.status,
          evaluation: result.evaluation,
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async compareVersions(attemptId: string, versionA: number, versionB: number) {
    try {
      const res = await fetch(`/api/attempts/${attemptId}/compare?versionA=${versionA}&versionB=${versionB}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return { success: true, data: json.data };
        }
      }
    } catch (err) {
      console.warn('Network comparison failed, running locally:', err);
    }

    try {
      const report = await this.practiceService.compareAttemptVersions(attemptId, versionA, versionB);
      return { success: true, data: report };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}

export const clientPracticeService = new ClientPracticeServiceSingleton();
