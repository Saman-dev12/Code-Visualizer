export interface JavaVariable {
  name: string;
  type: string;
  value: any;
  reference?: string;
}

export interface ExecutionStep {
  lineNumber: number;
  variables: JavaVariable[];
  output: string[];
  error?: string;
}

export interface ExecutionState {
  steps: ExecutionStep[];
  currentStep: number;
  totalSteps: number;
  status: "idle" | "running" | "completed" | "error";
  error?: string;
}

// types/java.ts
export interface JavaExecutionRequest {
  code: string;
  breakpoints?: number[];
}

export interface JavaExecutionResponse {
  success: boolean;
  steps?: ExecutionStep[];
  error?: string;
}
