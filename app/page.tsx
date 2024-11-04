"use client";
import React, { useState } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ExecutionState } from "@/types/execution";
import { ModeToggle } from "@/components/ui/theme-button";

interface CodeVisualizerProps {
  initialCode?: string;
}

const CodeVisualizer: React.FC<CodeVisualizerProps> = ({
  initialCode = `public class Main {
    public static void main(String[] args) {
        int x = 5;
        int y = 10;
        int result = x + y;
        System.out.println(result);
    }
}`,
}) => {
  const [code, setCode] = useState<string>(initialCode);
  const [executionState, setExecutionState] = useState<ExecutionState>({
    steps: [],
    currentStep: 0,
    totalSteps: 0,
    status: "idle",
  });
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleEditorChange = (value: string | undefined) => {
    if (value) {
      setCode(value);
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    try {
      const response = await axios.post<ExecutionState>("/api/execute/java", {
        code,
      });

      console.log(response.data);

      setExecutionState({
        ...response.data,
        status: "completed",
        currentStep: 0,
      });

      toast.success("Code executed successfully!");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error || "Failed to execute code";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred");
      }
      console.error("Error executing code:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleStepChange = (direction: "next" | "prev") => {
    setExecutionState((prev) => ({
      ...prev,
      currentStep:
        direction === "next"
          ? Math.min(prev.currentStep + 1, prev.totalSteps - 1)
          : Math.max(prev.currentStep - 1, 0),
    }));
  };

  const currentStep = executionState.steps[executionState.currentStep];

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="h-[600px]">
          <CardHeader>
            <div className="flex items-center justify-between border-b pb-2">
              <CardTitle className="text-xl font-normal">Java Editor</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Editor
              height="400px"
              defaultLanguage="java"
              value={code}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                readOnly: isRunning,
              }}
            />
            <div className="mt-4 flex gap-2">
              <Button onClick={runCode} disabled={isRunning} className="w-24">
                {isRunning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Run Code"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStepChange("prev")}
                disabled={executionState.currentStep === 0 || isRunning}
              >
                Previous Step
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStepChange("next")}
                disabled={
                  executionState.currentStep ===
                    executionState.totalSteps - 1 || isRunning
                }
              >
                Next Step
              </Button>
              <ModeToggle />
            </div>
          </CardContent>
        </Card>

        <Card className="h-[600px]">
          <CardHeader>
            <CardTitle>Execution Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">Variables</h3>
                {currentStep?.variables.length > 0 ? (
                  <div className="bg-gray-100 p-2 rounded overflow-auto max-h-[200px]">
                    {currentStep.variables.map((variable) => (
                      <div key={variable.name} className="mb-1">
                        <span className="font-mono text-blue-600">
                          {variable.type} {variable.name}:
                        </span>
                        <span className="font-mono ml-2">
                          {JSON.stringify(variable.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No variables to display
                  </p>
                )}
              </div>

              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">Output</h3>
                <div className="bg-gray-100 p-2 rounded overflow-auto max-h-[200px]">
                  {currentStep?.output.length > 0 ? (
                    currentStep.output.map((line, index) => (
                      <div key={index} className="font-mono">
                        {line}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No output</p>
                  )}
                </div>
              </div>

              <div className="text-sm text-gray-500">
                Step {executionState.currentStep + 1} of{" "}
                {executionState.totalSteps}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CodeVisualizer;
