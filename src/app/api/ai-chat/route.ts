import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    // Construct history for Gemini
    // Gemini history MUST alternate between 'user' and 'model' roles, starting with 'user'.
    
    // 1. Start with the system prompt (User) and Gemini's acknowledgement (Model)
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

    // 2. Add the actual conversation history, ensuring we alternate
    // Filter out the initial welcome message from the client to avoid starting with 'model' 
    // since we already have our own model acknowledgement.
    const userAndModelMessages = messages.filter((m: any) => m.content !== "Hi! I'm your AI coding assistant. Stuck on a problem? Ask me for a hint, explanation, or help with debugging!");
    
    // Add existing pairs
    const chatHistory = userAndModelMessages.slice(0, -1).map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Start chat with combined history
    const chat = model.startChat({
      history: [...history, ...chatHistory]
    });

    const lastMessage = messages[messages.length - 1].content;
    console.log("AI Chat: Sending message to Gemini...");
    
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();
    
    console.log("AI Chat: Gemini response success");
    return NextResponse.json({ message: text });
  } catch (error: any) {
    console.error("AI Chat Error Details:", error);
    return NextResponse.json({ error: "Failed to process request: " + error.message }, { status: 500 });
  }
}
