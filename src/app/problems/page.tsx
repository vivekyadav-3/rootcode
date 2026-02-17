import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, CheckCircle2, Flame, CalendarDays, Code2, Boxes, Sigma, Layers, Zap, Hash, Repeat } from "lucide-react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Difficulty } from "@prisma/client";

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes("array")) return <Layers className="h-4 w-4 text-blue-500" />;
  if (cat.includes("string")) return <Code2 className="h-4 w-4 text-emerald-500" />;
  if (cat.includes("math")) return <Sigma className="h-4 w-4 text-amber-500" />;
  if (cat.includes("dynamic")) return <Boxes className="h-4 w-4 text-purple-500" />;
  if (cat.includes("bit")) return <Zap className="h-4 w-4 text-yellow-500" />;
  if (cat.includes("binary")) return <Hash className="h-4 w-4 text-orange-500" />;
  if (cat.includes("two pointers") || cat.includes("sliding")) return <Repeat className="h-4 w-4 text-pink-500" />;
  return <Filter className="h-4 w-4 text-zinc-500" />;
};

interface ProblemsPageProps {
  searchParams: Promise<{
    search?: string;
    difficulty?: string;
    category?: string;
  }>;
}

export default async function ProblemsPage({ searchParams }: ProblemsPageProps) {
  const { search, difficulty, category } = await searchParams;
  const user = await currentUser();

  // Build filters logic
  const where: any = {};
  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }
  if (difficulty && difficulty !== "ALL") {
    where.difficulty = difficulty as Difficulty;
  }
  if (category && category !== "ALL") {
    where.category = { contains: category, mode: "insensitive" };
  }

  // 1. Parallelize data fetching
  const [dbUser, problems, allProblemData] = await Promise.all([
    user ? prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { 
        submissions: {
          where: { status: "Accepted" },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true, problemId: true }
        }
      }
    }) : null,
    prisma.problem.findMany({
      where,
      orderBy: { order: "asc" },
    }),
    prisma.problem.findMany({ 
      select: { id: true, category: true } 
    })
  ]);

  let solvedProblemIds = new Set<string>();
  let streak = 0;

  if (dbUser) {
    // Collect unique solved problem IDs from user submissions
    dbUser.submissions.forEach(s => solvedProblemIds.add(s.problemId));

    // Calculate streak from unique submission dates
    if (dbUser.submissions.length > 0) {
      const uniqueDates = new Set(dbUser.submissions.map(s => 
        new Date(s.createdAt).toDateString()
      ));
      
      let current = new Date();
      while (uniqueDates.has(current.toDateString())) {
        streak++;
        current.setDate(current.getDate() - 1);
      }
    }
  }

  const categories = Array.from(new Set(allProblemData.map(p => p.category)));

  // Daily Challenge logic
  const today = new Date();
  const dailyProblemIndex = Math.floor((today as any) / (1000 * 60 * 60 * 24)) % allProblemData.length;
  const dailyProblemId = allProblemData[dailyProblemIndex]?.id;
  
  let dailyProblem = null;
  if (dailyProblemId) {
      // Small optimization: if the daily problem is already in the loaded 'problems' list, reuse it
      dailyProblem = problems.find(p => p.id === dailyProblemId) || 
                     await prisma.problem.findUnique({ where: { id: dailyProblemId } });
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Problems
            </h1>
            {streak > 0 && (
              <Badge variant="outline" className="h-8 border-orange-500/20 bg-orange-500/5 text-orange-600 font-bold gap-2 animate-in fade-in slide-in-from-left-4">
                <Flame className="h-4 w-4 fill-orange-500" />
                {streak} Day Streak
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {problems.length} problems available to sharpen your skills.
          </p>
        </div>

        {/* Filters Section */}
        <form className="flex flex-wrap gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              name="search"
              placeholder="Search problems..."
              className="pl-9"
              defaultValue={search}
            />
          </div>

          <Select name="difficulty" defaultValue={difficulty || "ALL"}>
            <SelectTrigger className="w-full md:w-36">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Difficulties</SelectItem>
              <SelectItem value="EASY">Easy</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HARD">Hard</SelectItem>
            </SelectContent>
          </Select>

          <Select name="category" defaultValue={category || "ALL"}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button type="submit" variant="secondary">
            Apply Filters
          </Button>
          
          <Link href={`/problems/${allProblemData[Math.floor(Math.random() * allProblemData.length)]?.id}`}>
            <Button type="button" variant="outline" className="gap-2 border-orange-500/20 text-orange-600 hover:bg-orange-500/10">
              <Flame className="h-4 w-4" /> Pick One
            </Button>
          </Link>

          {(search || (difficulty && difficulty !== "ALL") || (category && category !== "ALL")) && (
            <Link href="/problems">
              <Button type="button" variant="ghost">Reset</Button>
            </Link>
          )}
        </form>
      </div>

      {dailyProblem && (
        <div className="mb-8">
            <Card className="bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-background border-orange-500/20">
                <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex gap-4 items-center">
                        <div className="p-3 bg-orange-500 rounded-lg text-white shadow-lg shadow-orange-500/20">
                            <CalendarDays className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">Daily Challenge</span>
                                <Flame className="h-4 w-4 text-orange-500 fill-orange-500 animate-pulse" />
                            </div>
                            <h2 className="text-xl font-bold">{dailyProblem.title}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant={
                                  dailyProblem.difficulty === "EASY" ? "success" : 
                                  dailyProblem.difficulty === "MEDIUM" ? "warning" : "destructive"
                                } className="text-xs">
                                  {dailyProblem.difficulty}
                                </Badge>
                                <span className="text-sm text-muted-foreground">{dailyProblem.category}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Link href={`/problems/${dailyProblem.id}`}>
                            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white shadow-md">
                                Solve Now
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
      )}

      <div className="border rounded-xl bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[80px]">Order</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {problems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No problems match your criteria. Try adjusting your filters.
                </TableCell>
              </TableRow>
            ) : (
              problems.map((problem: any) => (
                <TableRow key={problem.id} className="hover:bg-accent/30 transition-colors">
                  <TableCell>
                    {solvedProblemIds.has(problem.id) ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/20" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    #{problem.order}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/problems/${problem.id}`}
                      className="font-medium hover:text-primary transition-colors hover:underline underline-offset-4"
                    >
                      {problem.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal capitalize bg-muted/50 gap-2">
                      {getCategoryIcon(problem.category)}
                      {problem.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      problem.difficulty === "EASY" ? "success" : 
                      problem.difficulty === "MEDIUM" ? "warning" : "destructive"
                    } className="font-bold">
                      {problem.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/problems/${problem.id}`}>
                      <Button size="sm" variant={solvedProblemIds.has(problem.id) ? "outline" : "default"}>
                        {solvedProblemIds.has(problem.id) ? "Practice" : "Solve"}
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
