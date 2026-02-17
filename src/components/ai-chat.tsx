"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Bot, User, Stars } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatProps {
  problemTitle?: string;
  problemDescription?: string;
  currentCode: string;
  language: string;
}

export function AIChat({ problemTitle, problemDescription, currentCode, language }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your AI coding assistant. Stuck on a problem? Ask me for a hint, explanation, or help with debugging!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: {
            problemTitle,
            problemDescription,
            currentCode,
            language
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }
 
      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, { role: "assistant", content: `Sorry, I encountered an error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-l border-zinc-800">
      <div className="p-4 border-b border-zinc-800 flex items-center gap-2 bg-zinc-900/50">
        <div className="p-2 bg-purple-500/20 rounded-lg">
            <Stars className="h-5 w-5 text-purple-400" />
        </div>
        <div>
            <h3 className="font-bold text-sm text-zinc-100">AI Assistant</h3>
            <p className="text-xs text-zinc-400">Powered by Gemini</p>
        </div>
        <Badge variant="outline" className="ml-auto border-purple-500/30 text-purple-400 bg-purple-500/10 text-[10px]">BETA</Badge>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 pb-4">
            {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${
                    m.role === "assistant" ? "bg-gradient-to-br from-purple-500 to-indigo-600" : "bg-zinc-800"
                }`}>
                    {m.role === "assistant" ? <Bot className="h-4 w-4 text-white" /> : <User className="h-4 w-4 text-zinc-400" />}
                </div>
                <div className={`rounded-2xl p-4 text-sm max-w-[85%] shadow-sm transition-all ${
                    m.role === "assistant" 
                        ? "bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-tl-none" 
                        : "bg-purple-600 text-white rounded-tr-none"
                }`}>
                    <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown
                            components={{
                            code({node, className, children, ...props}: any) {
                                const match = /language-(\w+)/.exec(className || '')
                                // Remove 'node' from props to avoid React warnings when spreading onto DOM elements
                                const { node: _, ...rest } = props;
                                return match ? (
                                <SyntaxHighlighter
                                    {...rest}
                                    style={vscDarkPlus}
                                    language={match[1]}
                                    PreTag="div"
                                    className="rounded-xl my-3 !bg-black/40 !p-4 text-[11px] border border-white/5"
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                                ) : (
                                <code {...rest} className={`${className} bg-white/10 rounded px-1.5 py-0.5 font-mono text-purple-300`}>
                                    {children}
                                </code>
                                )
                            }
                            }}
                        >
                            {m.content}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
            ))}
            {isLoading && (
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg animate-pulse">
                        <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none p-4 flex items-center gap-3 shadow-sm">
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></span>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Assistant is thinking</span>
                    </div>
                </div>
            )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
        <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
        >
            <input 
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 text-zinc-100 placeholder:text-zinc-600"
                placeholder="Ask about your code..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="shrink-0 bg-purple-600 hover:bg-purple-700">
                <Send className="h-4 w-4" />
            </Button>
        </form>
      </div>
    </div>
  );
}
