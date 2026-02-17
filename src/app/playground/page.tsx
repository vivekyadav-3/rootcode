import { CodeEditor } from "@/components/editor";

export default function PlaygroundPage() {
  return (
    <div className="container mx-auto py-8 px-4 h-[calc(100vh-64px)] flex flex-col gap-6">
       <div className="flex flex-col gap-2">
         <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
           Playground
         </h1>
         <p className="text-muted-foreground">
           Write and run code in multiple languages. No problem constraints!
         </p>
       </div>
       
       <div className="flex-1 h-full">
         <CodeEditor 
            starterCode="// Write your code here..." 
         />
       </div>
    </div>
  );
}
