
import { wrapCode } from "./code-execution";

const JUDGE0_URL = process.env.JUDGE0_URL || "http://localhost:2358";

const pistonLanguages: Record<string, { language: string, version: string }> = {
    "63": { language: "javascript", version: "18.15.0" },
    "71": { language: "python", version: "3.10.0" },
    "62": { language: "java", version: "15.0.2" },
    "54": { language: "c++", version: "10.2.0" },
};

export async function universalExecute(code: string, languageId: string, stdin: string, problemTitle?: string) {
    const wrappedCode = problemTitle ? wrapCode(code, languageId, problemTitle) : code;
    
    // Default to public Piston API if env var is missing
    const pistonUrl = (process.env.PISTON_API_URL || "https://emkc.org/api/v2/piston").replace(/\/$/, "");
    const pistonConfig = pistonLanguages[languageId];

    console.log(`[Execution] Starting execution for: ${problemTitle || "Playground"}`);

    // 1. Attempt Piston
    if (pistonConfig) {
        try {
            console.log(`[Execution] Attempting Piston at ${pistonUrl}...`);
            const response = await fetch(`${pistonUrl}/execute`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    language: pistonConfig.language,
                    version: pistonConfig.version,
                    files: [{ content: wrappedCode }],
                    stdin: stdin,
                }),
                signal: AbortSignal.timeout(10000), // 10s timeout
            });

            if (response.ok) {
                const data = await response.json();
                console.log("[Execution] Piston success");
                return {
                    stdout: data.run.stdout,
                    stderr: data.run.stderr,
                    compile_output: data.compile?.stderr || "",
                    time: "0.01",
                    memory: "0",
                    status: {
                        id: data.run.code === 0 ? 3 : 6,
                        description: data.run.code === 0 ? "Accepted" : "Runtime Error"
                    }
                };
            }
            console.warn(`[Execution] Piston returned non-OK: ${response.status}`);
        } catch (err: any) {
            console.error("[Execution] Piston Attempt Failed:", err.message);
        }
    }

    // 2. Attempt CodeX Fallback
    const codexLang = { "63": "js", "71": "py", "62": "java", "54": "cpp" }[languageId];
    if (codexLang) {
        try {
            console.log("[Execution] Attempting CodeX Fallback...");
            const params = new URLSearchParams();
            params.append("code", wrappedCode);
            params.append("language", codexLang);
            params.append("input", stdin);

            const response = await fetch("https://api.codex.jaagrav.in", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: params,
                signal: AbortSignal.timeout(10000),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("[Execution] CodeX success");
                return {
                    stdout: data.output || "",
                    stderr: data.error || "",
                    compile_output: "",
                    time: "0.01",
                    memory: "0",
                    status: {
                        id: (data.error) ? 6 : 3,
                        description: (data.error) ? "Runtime Error" : "Accepted"
                    }
                };
            }
            console.warn(`[Execution] CodeX returned non-OK: ${response.status}`);
        } catch (e: any) {
            console.error("[Execution] CodeX Attempt Failed:", e.message);
        }
    }

    // 3. Last Resort: Judge0
    const judge0_url = process.env.JUDGE0_URL || "http://localhost:2358";
    try {
        console.log(`[Execution] Attempting Judge0 at ${judge0_url}...`);
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (process.env.JUDGE0_API_KEY) {
            headers["X-RapidAPI-Key"] = process.env.JUDGE0_API_KEY;
            headers["X-RapidAPI-Host"] = process.env.JUDGE0_API_HOST || "judge0-ce.p.rapidapi.com";
        }

        const response = await fetch(`${judge0_url}/submissions?wait=true`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                source_code: wrappedCode,
                language_id: parseInt(languageId),
                stdin: stdin,
            }),
            signal: AbortSignal.timeout(15000),
        });

        if (response.ok) {
            const res = await response.json();
            console.log("[Execution] Judge0 success");
            return res;
        }
    } catch (e: any) {
        console.error("[Execution] Judge0 Attempt Failed:", e.message);
    }

    throw new Error("All execution services failed. Ensure PISTON_API_URL or JUDGE0_API_KEY are configured in Vercel.");
}
