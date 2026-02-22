
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
    const pistonUrl = process.env.PISTON_API_URL ? process.env.PISTON_API_URL.replace(/\/$/, "") : "";
    const usePiston = !!pistonUrl;
    const pistonConfig = pistonLanguages[languageId];

    // 1. Attempt Piston
    if (usePiston && pistonConfig) {
        try {
            const response = await fetch(`${pistonUrl}/execute`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    language: pistonConfig.language,
                    version: pistonConfig.version,
                    files: [{ content: wrappedCode }],
                    stdin: stdin,
                }),
            });

            if (response.ok) {
                const data = await response.json();
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
        } catch (err) {
            console.error("[Execution] Piston Failed:", err);
        }
    }

    // 2. Attempt CodeX Fallback
    const codexLang = { "63": "js", "71": "py", "62": "java", "54": "cpp" }[languageId];
    if (codexLang) {
        try {
            const params = new URLSearchParams();
            params.append("code", wrappedCode);
            params.append("language", codexLang);
            params.append("input", stdin);

            const response = await fetch("https://api.codex.jaagrav.in", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: params
            });

            if (response.ok) {
                const data = await response.json();
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
        } catch (e) {
            console.error("[Execution] CodeX Failed:", e);
        }
    }

    // 3. Last Resort: Judge0 (RapidAPI or Local)
    try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
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
                stdin: stdin,
            }),
        });

        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.error("[Execution] Judge0 Failed:", e);
    }

    throw new Error("All execution services failed. Please check your API configuration.");
}
