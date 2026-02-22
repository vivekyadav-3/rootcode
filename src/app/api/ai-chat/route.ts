import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// Initialize the new Google GenAI SDK client
const client = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("AI Chat Error: GEMINI_API_KEY is not set in environment variables");
      return NextResponse.json({ error: "AI Assistant is not configured. Please add your GEMINI_API_KEY to the .env file." }, { status: 500 });
    }
    
    const { messages, context } = await req.json();
    const { problemTitle, problemDescription, currentCode, language } = context;

    const systemPrompt = `
      You are an expert AI coding assistant on RootCode, a platform for developers to practice coding problems. 
      Your goal is to help the user solve the current coding problem.
      
      Problem Title: ${problemTitle || "Not specified"}
      Problem Description: ${problemDescription || "Not specified"}
      Current Language: ${language === "63" ? "JavaScript" : language === "71" ? "Python" : language === "54" ? "C++" : language === "62" ? "Java" : "Not specified"}
      Current Code: 
      \`\`\`
      ${currentCode || "No code provided yet."}
      \`\`\`

      Rules:
      1. DO NOT give the full solution immediately unless explicitly asked for a complete fix after many attempts.
      2. Provide hints, explain the logic, and point out bugs in the current code.
      3. Use markdown for code blocks.
      4. Be concise and encouraging.
      5. If the user asks general questions, answer them in the context of coding.
    `;

    // 1. Prepare history for the new @google/genai SDK
    // Syntax: [{ role: 'user' | 'model', parts: [{ text: '...' }] }]
    const history: any[] = [
      {
        role: "user",
        parts: [{ text: `CONTEXT:\n${systemPrompt}\n\nInstructions: Acknowledge the context and wait for user questions.` }],
      },
      {
        role: "model",
        parts: [{ text: "Understood. I have the problem context and your current code. I'm ready to help you with hints, logic checks, or debugging. What can I help you with?" }],
      },
    ];

    // Filter welcome message and map to new role names
    const chatHistory = messages
      .filter((m: any) => m.content !== "Hi! I'm your AI coding assistant. Stuck on a problem? Ask me for a hint, explanation, or help with debugging!")
      .slice(0, -1)
      .map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const lastMessage = messages[messages.length - 1].content;
    console.log("AI Chat: Sending message to Gemini using new SDK...");
    
    // 2. Call the new generateContent method
    const response = await client.models.generateContent({
      model: "gemini-2.0-flash-lite", // Using lite for faster, more reliable responses
      contents: [...history, ...chatHistory, { role: "user", parts: [{ text: lastMessage }] }]
    });

    // Check if response and text property exist (Safe for TypeScript)
    const text = response.text || "I apologize, but I couldn't generate a response at this moment. Please try again.";
    
    console.log("AI Chat: Gemini response success");
    return NextResponse.json({ message: text });
  } catch (error: any) {
    console.error("AI Chat Error Details:", error);
    return NextResponse.json({ error: "Failed to process request: " + error.message }, { status: 500 });
  }
}
