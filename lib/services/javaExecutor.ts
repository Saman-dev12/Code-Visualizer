import { exec } from "child_process";
import Docker from "dockerode";
import {
  JavaExecutionRequest,
  JavaExecutionResponse,
  ExecutionStep,
} from "@/types/execution";

export class JavaExecutorService {
  private docker: Docker;

  constructor() {
    this.docker = new Docker();
  }

  async executeJava(
    request: JavaExecutionRequest
  ): Promise<JavaExecutionResponse> {
    try {
      // Create a Docker container for Java execution
      const container = await this.docker.createContainer({
        Image: "java-executor",
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        OpenStdin: true,
        StdinOnce: true,
      });

      await container.start();

      // Execute the Java code
      const execInstance = await container.exec({
        Cmd: ["java", "JavaExecutor"],
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
      });

      const stream = await execInstance.start({ hijack: true });

      stream.on("error", (error) => {
        console.error("Stream error:", error);
      });

      let output = "";
      stream.on("data", (chunk) => {
        output += chunk.toString();
      });

      if (request.code) {
        stream.write(request.code);
      }
      stream.end();

      await new Promise((resolve) => stream.on("end", resolve));

      const steps = this.parseExecutionOutput(output);

      await container.stop();
      await container.remove();

      return {
        success: true,
        steps,
      };
    } catch (error: any) {
      console.error("Java execution error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private parseExecutionOutput(output: string): ExecutionStep[] {
    const steps: ExecutionStep[] = [];

    // Split output into lines and parse each line as JSON
    output.split("\n").forEach((line) => {
      try {
        if (line.trim()) {
          const parsedStep: ExecutionStep = JSON.parse(line);
          steps.push(parsedStep);
        }
      } catch (error) {
        console.error(`Failed to parse line as JSON: ${line}`, error);
      }
    });

    return steps;
  }
}
