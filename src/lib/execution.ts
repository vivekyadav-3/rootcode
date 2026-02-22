
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
    const errors: string[] = [];

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
            const errText = await response.text();
            errors.push(`Piston (${response.status}): ${errText.substring(0, 100)}`);
        } catch (err: any) {
            console.error("[Execution] Piston Attempt Failed:", err.message);
            errors.push(`Piston Error: ${err.message}`);
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
            const errText = await response.text();
            errors.push(`CodeX (${response.status}): ${errText.substring(0, 100)}`);
        } catch (e: any) {
            console.error("[Execution] CodeX Attempt Failed:", e.message);
            errors.push(`CodeX Error: ${e.message}`);
        }
    }

    // 3. Attempt Paiza.io (Public Fallback - No Key Required)
    const paizaLang = { "63": "javascript", "71": "python3", "62": "java", "54": "cpp" }[languageId];
    if (paizaLang) {
        try {
            console.log(`[Execution] Attempting Paiza.io for ${paizaLang}...`);
            const createRes = await fetch("https://api.paiza.io/runners/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    source_code: wrappedCode,
                    language: paizaLang,
                    input: stdin,
                    api_key: "guest"
                })
            });

            if (createRes.ok) {
                const { id } = await createRes.json();
                
                // Poll for results (max 10 seconds)
                let attempts = 0;
                while (attempts < 10) {
                    const statusRes = await fetch(`https://api.paiza.io/runners/get_details?id=${id}&api_key=guest`);
                    if (statusRes.ok) {
                        const data = await statusRes.json();
                        if (data.status === "completed") {
                            console.log("[Execution] Paiza.io success");
                            return {
                                stdout: data.stdout || "",
                                stderr: data.stderr || data.build_stderr || "",
                                compile_output: data.build_stderr || "",
                                time: data.time || "0.01",
                                memory: "0",
                                status: {
                                    id: data.result === "success" ? 3 : 6,
                                    description: data.result === "success" ? "Accepted" : "Runtime Error"
                                }
                            };
                        }
                    }
                    await new Promise(r => setTimeout(r, 1000));
                    attempts++;
                }
                errors.push("Paiza.io: Execution timed out (took too long)");
            } else {
                errors.push(`Paiza.io (${createRes.status}): Service unavailable`);
            }
        } catch (e: any) {
            console.error("[Execution] Paiza.io Attempt Failed:", e.message);
            errors.push(`Paiza.io Error: ${e.message}`);
        }
    }

    // 4. Last Resort: Judge0 (RapidAPI or Local)
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
        });

        if (response.ok) {
            const res = await response.json();
            console.log("[Execution] Judge0 success");
            return res;
        }
        const errText = await response.text();
        errors.push(`Judge0 (${response.status}): ${errText.substring(0, 100)}`);
    } catch (e: any) {
        console.error("[Execution] Judge0 Attempt Failed:", e.message);
        errors.push(`Judge0 Error: ${e.message}`);
    }

    const errorMsg = `Code execution failed.
    
NOTICE: As of Feb 15 2026, the public Piston API (EMKC) is Whitelist-only.
Current Failures:
${errors.map(err => `- ${err}`).join('\n')}

Recommended Solution:
1. Sign up for a free Judge0 account on RapidAPI.
2. Add your 'JUDGE0_API_KEY' to Vercel environment variables.`;

    throw new Error(errorMsg);
}
