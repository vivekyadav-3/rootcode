import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { CodeEditor } from "@/components/editor";
import Markdown from "react-markdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Activity, BookOpen, Clock, Code2, MessageSquare, ThumbsUp } from "lucide-react";

interface ProblemPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProblemPage({ params }: ProblemPageProps) {
  const { id } = await params;
  
  // 1. Parallelize data fetching
  const [problem, acceptedCount] = await Promise.all([
    prisma.problem.findUnique({
      where: { id },
      include: {
        testCases: true,
        submissions: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { user: true },
        },
        _count: {
          select: { submissions: true }
        }
      },
    }),
    prisma.submission.count({
      where: {
        problemId: id,
        status: "Accepted"
      }
    })
  ]);

  if (!problem) {
    notFound();
  }

  // 2. Fetch similar problems secondary as they depend on the category
  const similarProblems = await prisma.problem.findMany({
    where: {
      category: problem.category,
      id: { not: id }
    },
    take: 5,
  });

  const totalSubmissions = problem._count.submissions;
  const acceptanceRate = totalSubmissions > 0 
    ? ((acceptedCount / totalSubmissions) * 100).toFixed(1) 
    : "0.0";

  return (
    <div className="container mx-auto py-4 px-2 md:px-4 h-[calc(100vh-64px)] flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row gap-4 h-full overflow-hidden">
        {/* Left Side: Tabs for Description, Stats, Submissions */}
        <div className="flex-1 lg:max-w-[45%] flex flex-col h-full bg-card border rounded-xl overflow-hidden shadow-sm">
            <Tabs defaultValue="description" className="flex flex-col h-full">
                <div className="px-4 py-2 border-b bg-muted/30">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="description" className="flex gap-2 items-center"><BookOpen className="w-4 h-4"/> Description</TabsTrigger>
                        <TabsTrigger value="stats" className="flex gap-2 items-center"><Activity className="w-4 h-4"/> Stats</TabsTrigger>
                        <TabsTrigger value="submissions" className="flex gap-2 items-center"><Clock className="w-4 h-4"/> Recent</TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
                    <TabsContent value="description" className="mt-0 space-y-6">
                        <div className="flex flex-col gap-4">
                           <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold flex items-center gap-3">
                                        {problem.order}. {problem.title}
                                    </h1>
                                    <div className="flex items-center gap-3 mt-2">
                                        <Badge variant={
                                            problem.difficulty === "EASY" ? "success" : 
                                            problem.difficulty === "MEDIUM" ? "warning" : "destructive"
                                        } className="capitalize">
                                            {problem.difficulty.toLowerCase()}
                                        </Badge>
                                        <Badge variant="outline" className="flex gap-1 items-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                            <ThumbsUp className="w-3 h-3" />
                                            {acceptanceRate}% Acceptance
                                        </Badge>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                                            {problem.category}
                                        </Badge>
                                    </div>
                                </div>
                           </div>

                           <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
                                <Markdown>{problem.description}</Markdown>
                           </div>

                           <div className="space-y-4 pt-4 border-t">
                                {problem.testCases.slice(0, 3).map((testCase: any, index: number) => (
                                    <div key={testCase.id} className="space-y-2">
                                        <p className="text-sm font-bold opacity-80">Example {index + 1}:</p>
                                        <div className="bg-zinc-50 dark:bg-zinc-900 border-l-4 border-zinc-300 dark:border-zinc-700 p-3 rounded-r-md font-mono text-xs space-y-2 shadow-sm">
                                            <div>
                                                <span className="text-muted-foreground select-none">Input: </span> 
                                                <span className="text-foreground">{testCase.input}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground select-none">Output: </span> 
                                                <span className="text-foreground">{testCase.expectedOutput}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                           </div>
                        </div>

                        {similarProblems.length > 0 && (
                             <div className="space-y-3 pt-6 border-t">
                                <h3 className="text-sm font-semibold flex items-center gap-2 text-zinc-500">
                                    <Code2 className="w-4 h-4" /> Similar Problems
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {similarProblems.map((p) => (
                                    <Link key={p.id} href={`/problems/${p.id}`}>
                                        <Badge variant="secondary" className="hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer py-1.5 px-3 flex gap-2 items-center transition-all">
                                        {p.title}
                                        <span className={`text-[10px] font-bold ${
                                            p.difficulty === "EASY" ? "text-emerald-500" : 
                                            p.difficulty === "MEDIUM" ? "text-amber-500" : "text-destructive"
                                        }`}>
                                            {p.difficulty[0]}
                                        </span>
                                        </Badge>
                                    </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-4 rounded-lg flex gap-3 text-sm text-amber-800 dark:text-amber-300 mt-4">
                            <MessageSquare className="w-5 h-5 shrink-0" />
                            <div>
                                <p className="font-semibold">Discussion & Solutions</p>
                                <p className="opacity-80 text-xs mt-1">Community solutions and editorial content coming soon!</p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="stats" className="mt-0 space-y-6 py-4">
                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Acceptance Rate</span>
                                    <span className="font-bold">{acceptanceRate}%</span>
                                </div>
                                <Progress value={parseFloat(acceptanceRate)} className="h-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Card className="bg-emerald-50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900">
                                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{acceptedCount}</div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Accepted</div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800">
                                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                        <div className="text-2xl font-bold">{totalSubmissions}</div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Submissions</div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="bg-card border rounded-lg p-6 text-center space-y-2">
                                <p className="text-muted-foreground text-sm">Difficulty</p>
                                <Badge variant={
                                    problem.difficulty === "EASY" ? "success" : 
                                    problem.difficulty === "MEDIUM" ? "warning" : "destructive"
                                } className="text-lg px-6 py-1">
                                    {problem.difficulty}
                                </Badge>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="submissions" className="mt-0 py-4">
                         <div className="space-y-1">
                            {problem.submissions.length === 0 ? (
                                <div className="text-center py-10 opacity-50">
                                    <Code2 className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                    <p>No submissions yet.</p>
                                </div>
                            ) : (
                                problem.submissions.map((sub: any) => (
                                    <Link 
                                        key={sub.id} 
                                        href={`/submissions/${sub.id}`}
                                        className="flex justify-between items-center text-sm p-3 hover:bg-muted/50 rounded-lg transition-colors border border-transparent hover:border-border"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${sub.status === "Accepted" ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-red-500 shadow-[0_0_8px_#ef4444]"}`}></div>
                                            <div className="flex flex-col">
                                                <span className={sub.status === "Accepted" ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-red-600 dark:text-red-400 font-bold"}>
                                                    {sub.status}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{new Date(sub.createdAt).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <Badge variant="outline" className="font-mono text-xs">
                                                {sub.runtime ? `${(sub.runtime * 1000).toFixed(0)} ms` : "N/A"}
                                            </Badge>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>

        {/* Right Side: Editor */}
        <div className="flex-1 flex flex-col h-full bg-card border rounded-xl overflow-hidden shadow-sm">
           <div className="flex-1 overflow-hidden relative">
             <CodeEditor 
                problemId={problem.id} 
                starterCode={problem.starterCode} 
                problemTitle={problem.title}
                problemDescription={problem.description}
                defaultTestInput={problem.testCases[0]?.input || ""}
             />
           </div>
        </div>
      </div>
    </div>
  );
}
