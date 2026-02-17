import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Database, User as UserIcon } from "lucide-react";
import { ReadOnlyEditor } from "@/components/read-only-editor";

interface SubmissionPageProps {
  params: Promise<{ id: string }>;
}

export default async function SubmissionPage({ params }: SubmissionPageProps) {
  const { id } = await params;

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      user: true,
      problem: true,
    },
  });

  if (!submission) {
    notFound();
  }

  // Get distribution analytics (Accepted submissions only)
  const allSubmissions = await prisma.submission.findMany({
    where: {
      problemId: submission.problemId,
      status: "Accepted",
    },
    select: { runtime: true, memory: true },
  });

  const acceptedCount = allSubmissions.length;
  
  // Calculate percentile (simplified)
  let runtimePercentile = 100;
  if (submission.status === "Accepted" && submission.runtime != null) {
      const slowerCount = allSubmissions.filter(s => s.runtime != null && s.runtime > submission.runtime!).length;
      runtimePercentile = acceptedCount > 1 ? (slowerCount / (acceptedCount - 1)) * 100 : 100;
  }

  const getLanguageName = (id: string) => {
    switch (id) {
      case "63": return "JavaScript";
      case "71": return "Python";
      case "54": return "C++";
      case "62": return "Java";
      default: return "Unknown";
    }
  };

  const statusColor = submission.status === "Accepted" ? "text-emerald-500" : "text-destructive";

  return (
    <div className="container mx-auto py-10 px-4 md:px-0 max-w-6xl">
      <Link href={`/problems/${submission.problemId}`}>
        <Button variant="ghost" size="sm" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Problem
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Stats Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Submission Info
                <Badge variant={submission.status === "Accepted" ? "success" : "destructive"}>
                    {submission.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{submission.user.name || "Anonymous"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(submission.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Runtime: <strong className={statusColor}>{submission.runtime?.toFixed(3) || "N/A"}s</strong></span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span>Memory: <strong className={statusColor}>{submission.memory?.toFixed(1) || "N/A"} KB</strong></span>
              </div>
            </CardContent>
          </Card>

          {submission.status === "Accepted" && (
            <Card className="bg-emerald-500/5 border-emerald-500/10">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-emerald-500">Performance Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Runtime Beats</span>
                    <span className="font-bold text-emerald-500">{runtimePercentile.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-emerald-500 transition-all duration-1000" 
                        style={{ width: `${runtimePercentile}%` }} 
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your solution is faster than {runtimePercentile.toFixed(1)}% of all accepted submissions for this problem.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Problem Context</CardTitle>
            </CardHeader>
            <CardContent>
              <Link 
                href={`/problems/${submission.problemId}`}
                className="text-lg font-bold hover:text-primary transition-colors block mb-2"
              >
                {submission.problem.title}
              </Link>
              <div className="flex gap-2">
                <Badge variant="outline">{submission.problem.difficulty}</Badge>
                <Badge variant="outline">{submission.problem.category}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Code View */}
        <div className="lg:col-span-2 h-[600px] lg:h-[700px] flex flex-col border rounded-xl overflow-hidden bg-zinc-950">
          <div className="h-12 border-b bg-card/50 flex items-center px-4 justify-between">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {getLanguageName(submission.language)} Source Code
            </span>
          </div>
          <div className="flex-1">
            <ReadOnlyEditor 
              code={submission.code} 
              language={submission.language} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
