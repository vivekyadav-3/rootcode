"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

import { universalExecute } from "@/lib/execution";

export async function executeCode(code: string, languageId: string, stdin: string = "") {
  const user = await currentUser();

  if (user) {
    await prisma.user.upsert({
      where: { clerkId: user.id },
      update: {
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName} ${user.lastName}`,
        imageUrl: user.imageUrl,
      },
      create: {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName} ${user.lastName}`,
        imageUrl: user.imageUrl,
      },
    });
  }

  console.log("Executing playground code...");
  
  try {
    const result = await universalExecute(code, languageId, stdin);
    console.log("Execution Result:", result);

    return {
      status: result.status?.description || "Unknown",
      stdout: result.stdout || "",
      stderr: result.stderr || result.compile_output || "",
      time: result.time,
      memory: result.memory,
    };
  } catch (error: any) {
    console.error("Execute Code Error:", error);
    return { 
      status: "Execution Failed", 
      stdout: "", 
      stderr: error.message || "Unknown error occurred" 
    };
  }
}
