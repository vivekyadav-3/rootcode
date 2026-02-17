"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { submitCode } from "@/app/actions/submission";
import { executeCode } from "@/app/actions/execute";
import { Loader2, Stars, Settings, History, RotateCcw, Clock, Database } from "lucide-react";
import dynamic from "next/dynamic";
const Editor = dynamic(() => import("@monaco-editor/react"), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-zinc-900 animate-pulse rounded-lg flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-zinc-700" /></div>
});
import type { OnMount } from "@monaco-editor/react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { AIChat } from "./ai-chat";
import { Progress } from "@/components/ui/progress";
import { getProblemSubmissions } from "@/app/actions/get-submissions";
import Link from "next/link";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";

interface EditorProps {
  problemId?: string;
  starterCode: string;
  problemTitle?: string;
  problemDescription?: string;
  defaultTestInput?: string;
}

export function CodeEditor({ problemId, starterCode, problemTitle, problemDescription, defaultTestInput }: EditorProps) {
  const [code, setCode] = useState(starterCode);
  const [languageId, setLanguageId] = useState("63");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ 
    status: string; 
    runtime?: number; 
    memory?: number; 
    stdout?: string; 
    stderr?: string;
    failureDetails?: {
      input: string;
      expected: string;
      actual: string;
      stderr?: string;
    } | null;
  } | null>(null);

  const beatsRuntime = useMemo(() => Math.floor(Math.random() * (99 - 70) + 70), [result]);
  const beatsMemory = useMemo(() => Math.floor(Math.random() * (99 - 60) + 60), [result]);

  // Testcase state
  const [activeTab, setActiveTab] = useState<"code" | "testcase" | "result" | "ai" | "submissions">("code");
  const [testInput, setTestInput] = useState(defaultTestInput || "");
  const [testResult, setTestResult] = useState<{ status: string; stdout?: string; stderr?: string } | null>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);

  // Editor settings
  const [fontSize, setFontSize] = useState(14);
  const [lineWrap, setLineWrap] = useState(true);

  // Submissions state
  const [userSubmissions, setUserSubmissions] = useState<Array<{
    id: string;
    status: string;
    runtime?: number | null;
    memory?: number | null;
    createdAt: string;
  }>>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);

  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const fireConfetti = () => {
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const random = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const fetchSubmissions = async () => {
    if (!problemId) return;
    setIsLoadingSubmissions(true);
    try {
      const subs = await getProblemSubmissions(problemId);
      setUserSubmissions(subs || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const handleRunTest = async () => {
    if (!problemId) {
        await handleSubmit();
        return;
    }
    setIsRunningTest(true);
    setTestResult(null);
    setActiveTab("testcase");

    try {
      const { testProblem } = await import("@/app/actions/test");
      const res = await testProblem(problemId, code, languageId, testInput);
      setTestResult({
        status: res.status,
        stdout: res.stdout,
        stderr: res.stderr,
      });
      if (res.status === "Accepted") {
        toast.success("Test passed!");
      } else {
        toast.error(`Test failed: ${res.status}`);
      }
    } catch (error: any) {
      setTestResult({ status: "Error", stderr: error.message, stdout: "" });
      toast.error("An error occurred while running the test.");
    } finally {
      setIsRunningTest(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setResult(null);

    if (problemId) {
      const formData = new FormData();
      formData.append("problemId", problemId);
      formData.append("code", code);
      formData.append("languageId", languageId);

      try {
        const sub = await submitCode(formData);
        setResult({
          status: sub.status,
          runtime: sub.runtime ?? undefined,
          memory: sub.memory ?? undefined,
          failureDetails: sub.failureDetails as any
        });

        setActiveTab("result");
        fetchSubmissions(); // Always refresh history after a submission

        if (sub.status === "Accepted") {
            fireConfetti();
            toast.success("Solution Accepted!", {
                description: `Runtime: ${sub.runtime}s | Memory: ${sub.memory}KB`,
            });
        } else if (sub.status === "Runtime Error" || sub.status === "Internal Error") {
            // Handle returned errors (caught in server action)
            setResult({
                status: sub.status,
                failureDetails: sub.failureDetails as any
            });
            toast.error(sub.status, {
                description: sub.failureDetails?.actual || "An error occurred during execution."
            });
        } else {
            toast.error(`Solution ${sub.status}`, {
                description: "Check your logic and try again.",
            });
        }
      } catch (error: any) {
        setResult({ status: error.message || "Error submitting code" });
        toast.error("Failed to submit code.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      try {
        const exec = await executeCode(code, languageId, testInput);
        setResult({
          status: exec.status,
          runtime: typeof exec.time === 'string' ? parseFloat(exec.time) : (exec.time ?? undefined),
          memory: typeof exec.memory === 'string' ? parseFloat(exec.memory) : (exec.memory ?? undefined),
          stdout: exec.stdout,
          stderr: exec.stderr,
        });
        setActiveTab("result");
      } catch (error: any) {
        setResult({ status: error.message || "Execution Failed" });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    if (problemId) {
      fetchSubmissions();
    } else if (activeTab === "submissions") {
      setActiveTab("code");
    }
  }, [problemId, activeTab]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex justify-between items-center bg-card p-2 rounded-t-lg border border-b-0">
        <Select value={languageId} onValueChange={setLanguageId}>
          <SelectTrigger className="w-[180px] h-8 text-xs bg-zinc-900 border-zinc-800">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="63">JavaScript (Node.js)</SelectItem>
            <SelectItem value="71">Python (3.8.1)</SelectItem>
            <SelectItem value="54">C++ (GCC 9.2.0)</SelectItem>
            <SelectItem value="62">Java (OpenJDK 13.0.1)</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                        <Settings className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-zinc-950 border-zinc-800 text-zinc-100">
                    <DropdownMenuLabel>Editor Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <div className="p-2 space-y-4">
                        <div className="space-y-1">
                            <span className="text-xs text-zinc-500">Font Size: {fontSize}px</span>
                            <div className="flex gap-2">
                                {[12, 14, 16, 18, 20].map(size => (
                                    <button 
                                        key={size}
                                        onClick={() => setFontSize(size)}
                                        className={`flex-1 h-8 rounded border text-xs ${fontSize === size ? "bg-primary border-primary text-primary-foreground" : "border-zinc-800 text-zinc-400 hover:border-zinc-700"}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <DropdownMenuCheckboxItem
                            checked={lineWrap}
                            onCheckedChange={setLineWrap}
                            className="text-xs"
                        >
                            Line Wrapping
                        </DropdownMenuCheckboxItem>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-zinc-400 hover:text-white"
                onClick={() => setCode(starterCode)}
                title="Reset Code"
            >
                <RotateCcw className="h-4 w-4" />
            </Button>
        </div>
      </div>

      <div className="flex-1 relative border rounded-b-lg overflow-hidden bg-zinc-950 ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 flex flex-col">
        {activeTab === "code" ? (
             <Editor
               height="100%"
               language={languageId === "63" ? "javascript" : languageId === "71" ? "python" : languageId === "54" ? "cpp" : "java"}
               theme="vs-dark"
               value={code}
               onChange={(value) => setCode(value || "")}
               onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: false },
                  fontSize: fontSize,
                  wordWrap: lineWrap ? "on" : "off",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  fontFamily: "var(--font-geist-mono)",
                  lineHeight: 1.6,
                  padding: { top: 10, bottom: 10 },
                }}
              />
        ) : activeTab === "testcase" ? (
            <div className="p-4 h-full overflow-y-auto bg-zinc-900 text-zinc-100 flex flex-col gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-zinc-500">Input</label>
                    <textarea 
                        className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-md p-2 font-mono text-sm resize-none focus:outline-none focus:border-zinc-700"
                        value={testInput}
                        onChange={(e) => setTestInput(e.target.value)}
                        placeholder="Enter test case input..."
                    />
                </div>
                {testResult && (
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-zinc-500">Output ({testResult.status})</label>
                         <div className="bg-zinc-950 border border-zinc-800 rounded-md p-3 font-mono text-sm">
                            {testResult.stdout && (
                                <div className="mb-2">
                                    <span className="text-zinc-500">$ stdout:</span>
                                    <pre className="whitespace-pre-wrap mt-1 text-zinc-300">{testResult.stdout}</pre>
                                </div>
                            )}
                            {testResult.stderr && (
                                <div>
                                    <span className="text-red-500">$ stderr:</span>
                                    <pre className="whitespace-pre-wrap mt-1 text-red-400">{testResult.stderr}</pre>
                                </div>
                            )}
                         </div>
                    </div>
                )}
            </div>
        ) : activeTab === "ai" ? (
            <div className="h-full bg-zinc-900 border-l border-zinc-800 overflow-hidden">
                <AIChat 
                  problemTitle={problemTitle} 
                  problemDescription={problemDescription} 
                  currentCode={code} 
                  language={languageId} 
                />
            </div>
        ) : activeTab === "submissions" ? (
            <div className="p-0 h-full overflow-y-auto bg-zinc-900 text-zinc-100">
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 sticky top-0 backdrop-blur-md">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                        <History className="h-4 w-4 text-zinc-500" />
                        Submission History
                    </h3>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-xs text-zinc-400 hover:text-white"
                        onClick={fetchSubmissions}
                        disabled={isLoadingSubmissions}
                    >
                        {isLoadingSubmissions ? <Loader2 className="h-3 w-3 animate-spin" /> : "Refresh"}
                    </Button>
                </div>
                <div className="divide-y divide-zinc-800">
                    {userSubmissions.length === 0 && !isLoadingSubmissions ? (
                        <div className="p-12 text-center text-zinc-500 text-sm">No submissions found.</div>
                    ) : (
                        userSubmissions.map((sub) => (
                            <Link key={sub.id} href={`/submissions/${sub.id}`} className="block p-4 hover:bg-zinc-800/50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-sm font-bold ${sub.status === "Accepted" ? "text-emerald-500" : "text-destructive"}`}>{sub.status}</span>
                                    <span className="text-xs text-zinc-500">{new Date(sub.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex gap-4 text-xs text-zinc-400">
                                    <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{sub.runtime ? `${(sub.runtime * 1000).toFixed(0)}ms` : "N/A"}</div>
                                    <div className="flex items-center gap-1"><Database className="h-3 w-3" />{sub.memory ? `${sub.memory.toFixed(1)}KB` : "N/A"}</div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        ) : (
            <div className="p-6 h-full overflow-y-auto bg-zinc-900 text-zinc-100 flex flex-col gap-6">
                {result ? (
                    <div className={`p-4 rounded-lg border ${result.status === "Accepted" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-destructive/10 border-destructive/20"}`}>
                        <h2 className={`text-2xl font-bold mb-4 ${result.status === "Accepted" ? "text-emerald-500" : "text-destructive"}`}>{result.status}</h2>
                        {result.status === "Accepted" && (
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-zinc-950 p-4 rounded-md border border-zinc-800 space-y-3">
                                    <div>
                                        <div className="text-sm text-zinc-400 mb-1">Runtime</div>
                                        <div className="text-xl font-bold text-white">{(result.runtime || 0) * 1000} ms</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-zinc-500">Beats</span>
                                            <span className="text-emerald-500 font-bold">{beatsRuntime}%</span>
                                        </div>
                                        <Progress value={beatsRuntime} className="h-1.5 bg-zinc-800" />
                                    </div>
                                </div>
                                <div className="bg-zinc-950 p-4 rounded-md border border-zinc-800 space-y-3">
                                    <div>
                                        <div className="text-sm text-zinc-400 mb-1">Memory</div>
                                        <div className="text-xl font-bold text-white">{result.memory?.toFixed(1)} KB</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-zinc-500">Beats</span>
                                            <span className="text-emerald-500 font-bold">{beatsMemory}%</span>
                                        </div>
                                        <Progress value={beatsMemory} className="h-1.5 bg-zinc-800" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {result.failureDetails ? (
                            <div className="space-y-4">
                                <div className="space-y-1.5 font-mono">
                                    <label className="text-xs font-bold text-zinc-500">Input</label>
                                    <pre className="bg-zinc-950 p-3 rounded border border-zinc-800 text-sm overflow-x-auto">{result.failureDetails.input}</pre>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-emerald-500/60">Expected</label>
                                        <pre className="bg-emerald-500/5 p-3 rounded border border-emerald-500/20 text-sm text-emerald-400">{result.failureDetails.expected}</pre>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-red-500/60">Actual</label>
                                        <pre className="bg-red-500/5 p-3 rounded border border-red-500/20 text-sm text-red-400">{result.failureDetails.actual || "No Output"}</pre>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-zinc-950 p-3 rounded font-mono text-sm">
                                {result.stdout && (
                                    <div className="mb-2">
                                        <span className="text-zinc-500 block mb-1">Standard Output:</span>
                                        <pre className="text-zinc-300 whitespace-pre-wrap">{result.stdout}</pre>
                                    </div>
                                )}
                                {result.stderr && (
                                    <div>
                                        <span className="text-red-500 block mb-1 text-xs">Standard Error:</span>
                                        <pre className="text-red-400 whitespace-pre-wrap mt-2">{result.stderr}</pre>
                                    </div>
                                )}
                                {!result.stdout && !result.stderr && result.status === "Accepted" && (
                                    <span className="text-zinc-500 italic">No output produced.</span>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                        <History className="h-12 w-12 mb-4 opacity-10" />
                        <p>Submit your solution to see results</p>
                    </div>
                )}
            </div>
        )}
      </div>
      
      <div className="flex items-center justify-between">
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-md">
              <button 
                  onClick={() => setActiveTab("code")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all ${activeTab === "code" ? "bg-white dark:bg-zinc-700 shadow-sm" : "text-zinc-500"}`}
              >Code</button>
              <button 
                  onClick={() => setActiveTab("testcase")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all ${activeTab === "testcase" ? "bg-white dark:bg-zinc-700 shadow-sm" : "text-zinc-500"}`}
              >Testcase</button>
              {result && (
                  <button 
                      onClick={() => setActiveTab("result")}
                      className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all ${activeTab === "result" ? "bg-white dark:bg-zinc-700 shadow-sm text-emerald-600" : "text-zinc-500"}`}
                  >Result</button>
              )}
              {problemId && (
                  <button 
                      onClick={() => { setActiveTab("submissions"); fetchSubmissions(); }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all flex items-center gap-1.5 ${activeTab === "submissions" ? "bg-white dark:bg-zinc-700 shadow-sm text-primary" : "text-zinc-500"}`}
                  >
                      <History className="h-3 w-3" /> Submissions
                  </button>
              )}
              <button 
                  onClick={() => setActiveTab("ai")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all flex items-center gap-1 ${activeTab === "ai" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 shadow-sm" : "text-purple-500/70"}`}
              >
                  <Stars className="h-3 w-3" /> AI Help
              </button>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleRunTest} disabled={isSubmitting || isRunningTest} variant="secondary" size="lg" className="font-bold">
                {isRunningTest ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running...</> : (problemId ? "Run" : "Run")}
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || isRunningTest} size="lg" className="bg-emerald-600 hover:bg-emerald-700 font-bold min-w-[140px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {problemId ? "Submitting..." : "Running..."}
                </>
              ) : (
                problemId ? "Submit" : "Run Code"
              )}
            </Button>
          </div>
      </div>
    </div>
  );
}
