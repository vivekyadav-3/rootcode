import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createProblem } from "@/app/actions/problem";

export default function CreateProblemPage() {
  return (
    <div className="container mx-auto py-10 max-w-2xl px-4 md:px-0">
      <h1 className="text-3xl font-bold mb-6">Create New Problem</h1>
      
      <form action={createProblem} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">Title</label>
          <Input id="title" name="title" required placeholder="Two Sum" />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">Description (Markdown)</label>
          <Textarea id="description" name="description" required placeholder="Problem description..." className="h-32" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">Category</label>
            <Input id="category" name="category" required placeholder="Array" />
          </div>

          <div className="space-y-2">
            <label htmlFor="difficulty" className="text-sm font-medium">Difficulty</label>
            <select 
              id="difficulty" 
              name="difficulty" 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
           <label htmlFor="order" className="text-sm font-medium">Order (Optional)</label>
           <Input id="order" name="order" type="number" placeholder="Auto-increment" />
        </div>

        <div className="space-y-2">
          <label htmlFor="starterCode" className="text-sm font-medium">Starter Code</label>
          <Textarea id="starterCode" name="starterCode" required placeholder="function solution() {}" className="font-mono h-32" />
        </div>

        <div className="space-y-2">
          <label htmlFor="solutionCode" className="text-sm font-medium">Solution Code (for reference)</label>
          <Textarea id="solutionCode" name="solutionCode" placeholder="function solution() { return ... }" className="font-mono h-32" />
        </div>

        <div className="border p-4 rounded-md space-y-4">
          <h3 className="font-semibold">Initial Test Case</h3>
          <div className="space-y-2">
            <label htmlFor="testInput" className="text-sm font-medium">Input</label>
            <Textarea id="testInput" name="testInput" placeholder="1 2" className="font-mono h-20" />
          </div>
          <div className="space-y-2">
            <label htmlFor="testOutput" className="text-sm font-medium">Expected Output</label>
            <Textarea id="testOutput" name="testOutput" placeholder="3" className="font-mono h-20" />
          </div>
        </div>

        <Button type="submit" className="w-full">Create Problem</Button>
      </form>
    </div>
  );
}
