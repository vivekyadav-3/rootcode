"use server";

import { wrapCode } from "@/lib/code-execution";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

import { universalExecute } from "@/lib/execution";

export async function testProblem(problemId: string, code: string, languageId: string, input: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
  });

  if (!problem) throw new Error("Problem not found");

  try {
    const result = await universalExecute(code, languageId, input, problem.title);
    
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
