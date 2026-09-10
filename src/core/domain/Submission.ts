export type SubmissionStatus = 'SUBMITTED' | 'EVALUATING' | 'COMPLETED' | 'FAILED';

export interface StructuralModel {
  classes: string[];
  interfaces: string[];
  relationships: { from: string; to: string; type: 'inheritance' | 'implements' | 'composition' }[];
  methodsByClass: Record<string, string[]>;
}

export interface ISubmissionContent {
  readonly formatType: string;
  getRawContent(): string;
  getClassSkeleton(): string;
  getRationale(): string;
  getDiagramMermaid(): string;
  extractStructuralModel(): StructuralModel;
}

export class StructuredSubmissionContent implements ISubmissionContent {
  public readonly formatType = 'structured-code-and-rationale';

  constructor(
    private readonly classSkeleton: string,
    private readonly designRationale: string,
    private readonly diagramMermaid: string = ''
  ) {}

  public getRawContent(): string {
    return `${this.classSkeleton}\n\n--- RATIONALE ---\n${this.designRationale}\n\n--- DIAGRAM ---\n${this.diagramMermaid}`;
  }

  public getClassSkeleton(): string {
    return this.classSkeleton;
  }

  public getRationale(): string {
    return this.designRationale;
  }

  public getDiagramMermaid(): string {
    return this.diagramMermaid;
  }

  public extractStructuralModel(): StructuralModel {
    const classes: string[] = [];
    const interfaces: string[] = [];
    const relationships: StructuralModel['relationships'] = [];
    const methodsByClass: Record<string, string[]> = {};

    const code = this.classSkeleton;

    const classRegex = /(?:export\s+)?(?:abstract\s+)?class\s+([A-Za-z0-9_]+)(?:\s+extends\s+([A-Za-z0-9_]+))?(?:\s+implements\s+([A-Za-z0-9_,\s]+))?/g;
    let match: RegExpExecArray | null;

    while ((match = classRegex.exec(code)) !== null) {
      const className = match[1];
      classes.push(className);
      methodsByClass[className] = [];

      if (match[2]) {
        relationships.push({ from: className, to: match[2].trim(), type: 'inheritance' });
      }
      if (match[3]) {
        const impls = match[3].split(',').map((s) => s.trim());
        for (const impl of impls) {
          if (impl) {
            relationships.push({ from: className, to: impl, type: 'implements' });
          }
        }
      }
    }

    const interfaceRegex = /(?:export\s+)?interface\s+([A-Za-z0-9_]+)(?:\s+extends\s+([A-Za-z0-9_,\s]+))?/g;
    while ((match = interfaceRegex.exec(code)) !== null) {
      const ifaceName = match[1];
      interfaces.push(ifaceName);
      methodsByClass[ifaceName] = [];

      if (match[2]) {
        const parents = match[2].split(',').map((s) => s.trim());
        for (const p of parents) {
          if (p) {
            relationships.push({ from: ifaceName, to: p, type: 'inheritance' });
          }
        }
      }
    }

    const methodRegex = /(?:public|private|protected|async)?\s*([a-zA-Z0-9_]+)\s*\([^)]*\)\s*:\s*([a-zA-Z0-9_<>[\]]+)/g;
    while ((match = methodRegex.exec(code)) !== null) {
      const methodName = match[1];
      if (!['if', 'for', 'while', 'switch', 'catch', 'function', 'constructor'].includes(methodName)) {
        const lastClass = classes[classes.length - 1] || interfaces[interfaces.length - 1];
        if (lastClass && methodsByClass[lastClass]) {
          methodsByClass[lastClass].push(methodName);
        }
      }
    }

    return { classes, interfaces, relationships, methodsByClass };
  }
}

export class Submission {
  constructor(
    public readonly id: string,
    public readonly attemptId: string,
    public readonly version: number,
    public readonly content: ISubmissionContent,
    public readonly idempotencyKey: string,
    public readonly submittedAt: Date = new Date(),
    public status: SubmissionStatus = 'SUBMITTED',
    public errorDiagnostic?: string
  ) {}

  public markEvaluating(): void {
    this.status = 'EVALUATING';
  }

  public markCompleted(): void {
    this.status = 'COMPLETED';
    this.errorDiagnostic = undefined;
  }

  public markFailed(errorDiagnostic: string): void {
    this.status = 'FAILED';
    this.errorDiagnostic = errorDiagnostic;
  }
}
