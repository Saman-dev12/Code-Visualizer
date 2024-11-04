import { JavaExecutorService } from "@/lib/services/javaExecutor";
import { JavaExecutionRequest } from "@/types/execution";

const javaExecutor = new JavaExecutorService();

export async function POST(req: Request) {
  try {
    const body: JavaExecutionRequest = await req.json();

    if (!body.code) {
      return Response.json({ error: "No code provided" }, { status: 400 });
    }

    const result = await javaExecutor.executeJava(body);

    if (!result.success) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json(result);
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
