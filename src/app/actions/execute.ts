"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const JUDGE0_URL = process.env.JUDGE0_URL || "http://localhost:2358";

export async function executeCode(code: string, languageId: string, stdin: string = "") {
  const user = await currentUser();

  // If user is logged in, ensure they exist in DB (just in case they use playground)
  // This is optional for playground but good for consistency
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
    const response = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_code: code,
        language_id: parseInt(languageId),
        stdin: stdin,
      }),
    });

    if (!response.ok) {
      if (response.status === 404 || response.status === 502 || response.status === 503) {
           throw new Error("Judge0 service is unreachable. Is it running on port 2358?");
      }
      const text = await response.text();
      console.error("Judge0 Error:", text);
      return { 
        status: "Internal Error", 
        stdout: "", 
        stderr: `Judge0 returned ${response.status}: ${text}` 
      };
    }

    const result = await response.json();
    console.log("Judge0 Result:", result);

    return {
      status: result.status?.description || "Unknown",
      stdout: result.stdout || "",
      stderr: result.stderr || result.compile_output || "",
      time: result.time,
      memory: result.memory,
    };
  } catch (error: any) {
    console.error("Execute Code Error:", error);
    if (error.cause?.code === 'ECONNREFUSED' || error.message.includes('fetch failed')) {
        return {
            status: "Execution Failed",
            stdout: "",
            stderr: "Judge0 execution service is unavailable. Please ensure it is running at http://localhost:2358. \n\nIf you do not have Judge0 installed locally, code execution will not work."
        }
    }
    return { 
      status: "Execution Failed", 
      stdout: "", 
      stderr: error.message || "Unknown error occurred" 
    };
  }
}
