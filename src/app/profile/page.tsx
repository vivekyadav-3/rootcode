import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock, Calendar } from "lucide-react";
import { SubmissionHeatmap } from "@/components/submission-heatmap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function ProfilePage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect("/");
  }

  // Optimize: Split huge query into smaller parallel queries
  const userExistsPromise = prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true } 
  });

  const statsPromise = prisma.submission.groupBy({
      by: ['problemId'],
      where: { 
          user: { clerkId: userId },
          status: 'Accepted'
      },
      // Unfortunately we can't select difficulty here easily without join
  });
  
  // Use a targeted query for stats breakdown
  const acceptedProblemsPromise = prisma.submission.findMany({
      where: { 
          user: { clerkId: userId },
          status: 'Accepted'
      },
      distinct: ['problemId'],
      select: {
          problem: {
              select: { difficulty: true }
          }
      }
  });

  const recentSubmissionsPromise = prisma.submission.findMany({
      where: { user: { clerkId: userId } },
      orderBy: { createdAt: "desc" },
      take: 20, // Limit to 20 recent
      include: { problem: true }
  });

  const heatmapDataPromise = prisma.submission.findMany({
      where: { user: { clerkId: userId } },
      select: { createdAt: true, status: true, problemId: true }
  });

  const [dbUserCheck, acceptedProblems, recentSubmissions, allSubmissionsForHeatmap] = await Promise.all([
      userExistsPromise,
      acceptedProblemsPromise,
      recentSubmissionsPromise,
      heatmapDataPromise
  ]);

  if (!dbUserCheck) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Profile not found</h1>
          <p className="text-muted-foreground">Please try logging out and back in.</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalSubmissions = allSubmissionsForHeatmap.length;
  const totalSolved = acceptedProblems.length;
  
  const easySolved = acceptedProblems.filter(s => s.problem.difficulty === "EASY").length;
  const mediumSolved = acceptedProblems.filter(s => s.problem.difficulty === "MEDIUM").length;
  const hardSolved = acceptedProblems.filter(s => s.problem.difficulty === "HARD").length;

  // Mock dbUser object structure for compatibility with existing UI code below
  const dbUser = {
      submissions: recentSubmissions
  };

  return (
    <div className="container mx-auto py-10 px-4 md:px-6 max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left Sidebar: User Profile */}
        <div className="md:col-span-1 space-y-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={user.imageUrl} 
                alt={user.firstName || "User"} 
                className="h-48 w-48 rounded-full border-4 border-background shadow-lg group-hover:shadow-xl transition-shadow duration-300"
              />
              <div className="absolute bottom-2 right-2 bg-emerald-500 w-6 h-6 rounded-full border-4 border-background" title="Online"></div>
            </div>
            
            <div className="mt-4 space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight">{user.firstName} {user.lastName}</h1>
              <p className="text-lg text-muted-foreground">@{user.username || "user"}</p>
            </div>

            <div className="mt-6 w-full space-y-3">
              <Button className="w-full font-semibold" variant="outline">Edit Profile</Button>
              <div className="flex items-center gap-2 text-muted-foreground text-sm justify-center md:justify-start">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString([], { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Community Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <div className="p-2 bg-blue-500/10 rounded-md">
                     <CheckCircle2 className="w-4 h-4 text-blue-500" />
                   </div>
                   <span className="font-medium">Total Solved</span>
                 </div>
                 <span className="text-xl font-bold">{totalSolved}</span>
               </div>
               
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <div className="p-2 bg-purple-500/10 rounded-md">
                      <Clock className="w-4 h-4 text-purple-500" />
                   </div>
                   <span className="font-medium">Submissions</span>
                 </div>
                 <span className="text-xl font-bold">{totalSubmissions}</span>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Content: Tabs & Details */}
        <div className="md:col-span-3 space-y-8">
            
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 gap-6">
                    <TabsTrigger 
                        value="overview" 
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 font-semibold"
                    >
                        Overview
                    </TabsTrigger>
                    <TabsTrigger 
                        value="submissions" 
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 font-semibold"
                    >
                        Submissions
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Solved Problems Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent border-emerald-500/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-emerald-500 font-bold">Easy</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-black">{easySolved}</div>
                                <p className="text-xs text-muted-foreground mt-1">problems solved</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-amber-500/10 via-transparent to-transparent border-amber-500/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-amber-500 font-bold">Medium</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-black">{mediumSolved}</div>
                                <p className="text-xs text-muted-foreground mt-1">problems solved</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-red-500/10 via-transparent to-transparent border-red-500/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-red-500 font-bold">Hard</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-black">{hardSolved}</div>
                                <p className="text-xs text-muted-foreground mt-1">problems solved</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Submission Heatmap */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold">1 Year Activity</h3>
                        <Card>
                            <CardContent className="p-4 overflow-x-auto">
                                <SubmissionHeatmap submissions={allSubmissionsForHeatmap as any} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="submissions" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Submissions</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {dbUser.submissions.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No recent activity. Start solving problems to see them here!</p>
                                    <Link href="/problems">
                                        <Button variant="link" className="mt-2 text-primary">Browse Problems</Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {dbUser.submissions.map((sub) => (
                                        <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-full ${sub.status === "Accepted" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                                                    {sub.status === "Accepted" ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <Link href={`/problems/${sub.problem.id}`} className="font-semibold hover:underline decoration-primary underline-offset-4">
                                                        {sub.problem.title}
                                                    </Link>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                        <span>{new Date(sub.createdAt).toLocaleDateString()} {new Date(sub.createdAt).toLocaleTimeString()}</span>
                                                        <span>•</span>
                                                        <span className="font-mono">{sub.language === "71" ? "Python" : sub.language === "62" ? "Java" : "JavaScript"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant={sub.status === "Accepted" ? "success" : "destructive"} className="mb-1">
                                                    {sub.status}
                                                </Badge>
                                                <br/>
                                                <Link href={`/submissions/${sub.id}`}>
                                                    <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity h-6 text-xs">
                                                        View Code
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
      </div>
    </div>
  );
}
