import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Code2, Globe, Zap } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const problemCount = await prisma.problem.count();

  return (
    <div className="relative min-h-screen">
      {/* Background Glow */}
      <div className="absolute top-0 -z-10 h-full w-full bg-white dark:bg-zinc-950">
        <div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-[rgba(255,165,0,0.1)] opacity-50 blur-[80px] dark:bg-[rgba(255,165,0,0.05)]"></div>
      </div>

      <main className="container mx-auto px-4 pt-20 pb-16 text-center lg:pt-32">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
            <span className="text-zinc-900 dark:text-zinc-50">A New Way to </span>
            <span className="text-orange-500 underline decoration-orange-500/30 underline-offset-8">Learn </span> 
            <span className="text-zinc-900 dark:text-zinc-50">and </span>
            <span className="text-zinc-900 dark:text-zinc-50">Master</span> Algorithms
          </h1>
          
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400 sm:text-xl">
            Join thousands of developers leveling up their coding skills. Practice with real interview questions, compete in contests, and get hired.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/problems">
              <Button size="lg" className="h-12 bg-orange-500 px-8 text-base hover:bg-orange-600">
                Explore Problems <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/playground">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900">
                Try Playground
              </Button>
            </Link>
          </div>

          {/* Feature Grid */}
          <div className="mt-24 grid gap-8 sm:grid-cols-3">
            {[
              { icon: Code2, title: problemCount > 100 ? `${problemCount}+ Problems` : `${problemCount} Curated Problems`, desc: "From arrays to advanced dynamic programming." },
              { icon: Zap, title: "Real-time Execution", desc: "Run your code and see results in milliseconds." },
              { icon: Globe, title: "Global Community", desc: "Compare solutions and learn from top coders." },
            ].map((feature, i) => (
              <div key={i} className="group relative rounded-2xl border border-zinc-200 bg-white/50 p-6 text-left transition-all hover:border-orange-500/50 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900">
                <feature.icon className="h-10 w-10 text-orange-500" />
                <h3 className="mt-4 text-lg font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}