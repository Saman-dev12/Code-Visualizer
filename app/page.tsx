"use client";
import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/theme-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CodeVisualizer = () => {
  const [code, setCode] = useState<string | undefined>(
    '# Enter your Python code here\nprint("Hello, World!")\nx = 5\ny = 10\nresult = x + y\nprint(result)'
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [variables, setVariables] = useState({});
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("java");

  const handleEditorChange = (value: string | undefined) => {
    setCode(value);
  };

  const runCode = async () => {
    setIsRunning(true);
    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      setVariables(data.variables);
      setOutput(data.output);
    } catch (error) {
      console.error("Error executing code:", error);
    }
    setIsRunning(false);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="h-[600px]">
          <CardHeader>
            <div className="flex items-center justify-between border-b pb-2">
              <CardTitle className="text-xl font-normal">Code Editor</CardTitle>
              <div className="flex items-center justify-center">
                <Select
                  value={currentLanguage}
                  onValueChange={(value) => setCurrentLanguage(value)}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Editor
              height="400px"
              defaultLanguage="python"
              value={code}
              onChange={(e) => {
                handleEditorChange(e);
              }}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 16,
              }}
              className="border rounded-lg overflow-hidden"
            />
            <div className="mt-4 flex gap-2">
              <Button onClick={runCode} disabled={isRunning}>
                {isRunning ? "Running..." : "Run Code"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
              >
                Previous Step
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                disabled={currentStep === output.length}
              >
                Next Step
              </Button>
              <ModeToggle />
            </div>
          </CardContent>
        </Card>

        <Card className="h-[600px]">
          <CardHeader>
            <CardTitle>Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">Variables</h3>
                <pre className="bg-gray-100 p-2 rounded text-black">
                  {JSON.stringify(variables, null, 2)}
                </pre>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">Output</h3>
                <pre className="bg-gray-100 p-2 rounded text-black">
                  {output.slice(0, currentStep + 1).join("\n")}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CodeVisualizer;
