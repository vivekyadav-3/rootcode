"use server";

import { wrapCode } from "@/lib/code-execution";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const JUDGE0_URL = process.env.JUDGE0_URL || "http://localhost:2358";

export async function submitCode(formData: FormData) {
  try {
    const user = await currentUser();
    
    if (!user) throw new Error("Unauthorized");

    // Ensure user exists in our DB
    const dbUser = await prisma.user.upsert({
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

    const problemId = formData.get("problemId") as string;
    const code = formData.get("code") as string;
    const languageId = formData.get("languageId") as string; // Judge0 language ID

    console.log(`🚀 Submitting problem ${problemId} in language ${languageId}`);

    // Map Judge0 IDs to Piston languages
    const pistonLanguages: Record<string, { language: string, version: string }> = {
        "63": { language: "javascript", version: "18.15.0" },
        "71": { language: "python", version: "3.10.0" },
        "62": { language: "java", version: "15.0.2" },
        "54": { language: "c++", version: "10.2.0" },
    };

    // 1. Get problem and test cases
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: { testCases: true },
    });

    if (!problem) throw new Error("Problem not found");

    let overallStatus = "Accepted";
    let totalRuntime = 0;
    let totalMemory = 0;
    
    // Check if we are using Piston (Vercel) or Judge0 (Local)
    const usePiston = !!process.env.PISTON_API_URL;
    const pistonConfig = pistonLanguages[languageId];

    // 3. Run test cases
    for (const testCase of problem.testCases) {
       // Wrap user code in a complete program
        const wrappedCode = wrapCode(code, languageId, problem.title);
        
        let result: any = {};

        if (usePiston && pistonConfig) {
             // Execute with Piston (Free)
             const response = await fetch(`${process.env.PISTON_API_URL}/execute`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    language: pistonConfig.language,
                    version: pistonConfig.version,
                    files: [
                        {
                            content: wrappedCode
                        }
                    ],
                    stdin: testCase.input,
                }),
             });

             if (!response.ok) {
                 throw new Error(`Piston API Error: ${response.status} ${await response.text()}`);
             }

             const data = await response.json();
             // Map Piston response to Judge0-like format for compatibility
             result = {
                 stdout: data.run.stdout,
                 stderr: data.run.stderr,
                 compile_output: data.compile?.stderr || "",
                 time: "0.01", // Piston doesn't always return precise time in free tier
                 memory: "0",
                 status: {
                     id: data.run.code === 0 ? 3 : 6, // 3=Accepted, 6=Error
                     description: data.run.code === 0 ? "Accepted" : "Runtime Error"
                 }
             };

        } else {
            // Execute with Judge0 (Local/RapidAPI) - Fallback
            const headers: any = { 
            "Content-Type": "application/json" 
            };
            
            if (process.env.JUDGE0_API_KEY) {
                headers["X-RapidAPI-Key"] = process.env.JUDGE0_API_KEY;
                headers["X-RapidAPI-Host"] = process.env.JUDGE0_API_HOST || "judge0-ce.p.rapidapi.com";
            }

            const response = await fetch(`${JUDGE0_URL}/submissions?wait=true`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                source_code: wrappedCode,
                language_id: parseInt(languageId),
                stdin: testCase.input,
            }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Judge0 API Error: ${response.status} ${errorText}`);
            }

            result = await response.json();
        }

        // Check for runtime/compilation errors first (Status ID >= 6)
        if (result.status.id >= 6) {
           overallStatus = result.status.description;
           // Save failed submission and return early
           const submission = await prisma.submission.create({
            data: {
              userId: dbUser.id,
              problemId: problem.id,
              code,
              status: overallStatus, // e.g., Compilation Error
              language: languageId,
              runtime: totalRuntime,
              memory: totalMemory,
            },
          });
          console.log(`❌ Submission failed (Error): ${overallStatus}`);
          return {
            ...submission,
            failureDetails: {
              input: testCase.input,
              expected: testCase.expectedOutput,
              actual: result.stdout || "",
              stderr: result.stderr || result.compile_output || ""
            }
          };
        }

        // Manual validation: Trim both outputs to ignore trailing newlines/spaces
        const actualOutput = (result.stdout || "").trim();
        const expectedOutput = (testCase.expectedOutput || "").trim();

        let isCorrect = false;

        // 1. Try JSON comparison first (handles [1, 2] vs [1,2] whitespace differences)
        try {
            const actualJson = JSON.parse(actualOutput);
            const expectedJson = JSON.parse(expectedOutput);
            // Re-serialize to normalize spacing
            const normalizedActual = JSON.stringify(actualJson);
            const normalizedExpected = JSON.stringify(expectedJson);
            
            isCorrect = normalizedActual === normalizedExpected;
        } catch (e) {
            // 2. Fallback to strict string comparison if not valid JSON
            isCorrect = actualOutput === expectedOutput;
        }

        if (!isCorrect) {
          overallStatus = "Wrong Answer";
          
          const submission = await prisma.submission.create({
            data: {
              userId: dbUser.id,
              problemId: problem.id,
              code,
              status: overallStatus,
              language: languageId,
              runtime: totalRuntime,
              memory: totalMemory,
            },
          });

          console.log(`❌ Submission failed (Wrong Answer): Expected '${expectedOutput}', got '${actualOutput}'`);
          return {
            ...submission,
            failureDetails: {
              input: testCase.input,
              expected: expectedOutput,
              actual: actualOutput,
              stderr: result.stderr || ""
            }
          };
        }

        totalRuntime += parseFloat(result.time || "0");
        totalMemory += parseFloat(result.memory || "0");
    }

    // 4. Save successful submission
    const submission = await prisma.submission.create({
      data: {
        userId: dbUser.id,
        problemId: problem.id,
        code,
        status: overallStatus,
        language: languageId,
        runtime: problem.testCases.length > 0 ? totalRuntime / problem.testCases.length : 0,
        memory: problem.testCases.length > 0 ? totalMemory / problem.testCases.length : 0,
      },
    });

    console.log(`✅ Submission accepted!`);
    revalidatePath(`/problems/${problemId}`);
    return {
      ...submission,
      failureDetails: null
    };

  } catch (error: any) {
    console.error("🔥 Error in submitCode action:", error);
    let errorMessage = error.message || "An unexpected error occurred";
    
    if (errorMessage.includes('fetch failed')) {
       errorMessage = "Code execution service is unavailable. Please check your internet connection and API configuration.";
    }

    // Return a structured error object that the frontend can display
    return {
      status: "Runtime Error", // or "Internal Error"
      runtime: 0,
      memory: 0,
      failureDetails: {
        input: "",
        expected: "",
        actual: errorMessage,
        stderr: error.stack || ""
      }
    };
  }
}
