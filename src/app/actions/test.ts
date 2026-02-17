"use server";

import { wrapCode } from "@/lib/code-execution";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

const JUDGE0_URL = process.env.JUDGE0_URL || "http://localhost:2358";

export async function testProblem(problemId: string, code: string, languageId: string, input: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
  });

  if (!problem) throw new Error("Problem not found");

  const wrappedCode = wrapCode(code, languageId, problem.title);

  try {
    const response = await fetch(`${JUDGE0_URL}/submissions?wait=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_code: wrappedCode,
        language_id: parseInt(languageId),
        stdin: input, // Use user provided input
      }),
    });

    if (!response.ok) {
        if (response.status === 404 || response.status === 502 || response.status === 503 || response.status === 500) {
           // Fallback or specific validatoin
        }
    }

    const result = await response.json();
    return {
      status: result.status?.description || "Unknown",
      stdout: result.stdout || "",
      stderr: result.stderr || result.compile_output || "",
      time: result.time,
      memory: result.memory,
    };
  } catch (error: any) {
    console.error("Test execution failed", error);
    return {
        status: "Error",
        stderr: error.message || "Failed to execute code"
    };
  }
}
