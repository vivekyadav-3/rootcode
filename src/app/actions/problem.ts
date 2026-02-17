"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export async function createProblem(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Basic validation (can use zod for better parsing)
  const difficulty = formData.get("difficulty") as "EASY" | "MEDIUM" | "HARD";
  const manualOrder = formData.get("order") as string;
  const testInput = formData.get("testInput") as string;
  const testOutput = formData.get("testOutput") as string;

  let order: number;
  if (manualOrder && !isNaN(parseInt(manualOrder))) {
    order = parseInt(manualOrder);
  } else {
    // If order is not provided, get the max order + 1
    const lastProblem = await prisma.problem.findFirst({
      orderBy: { order: "desc" },
    });
    order = (lastProblem?.order ?? 0) + 1;
  }

  // Ensure difficulty matches enum
  if (!["EASY", "MEDIUM", "HARD"].includes(difficulty)) {
     throw new Error("Invalid difficulty");
  }

  const problem = await prisma.problem.create({
    data: {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      difficulty: difficulty,
      order: order,
      starterCode: formData.get("starterCode") as string,
      solutionCode: formData.get("solutionCode") as string,
      testCases: {
        create: testInput && testOutput ? [
          {
            input: testInput,
            expectedOutput: testOutput,
          },
        ] : [],
      },
    },
  });

  revalidatePath("/problems");
  redirect(`/problems/${problem.id}`);
}
