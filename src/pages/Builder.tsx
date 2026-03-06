import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, Bot, User, Code, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import ReactMarkdown from "react-markdown";
import LivePreview from "@/components/builder/LivePreview";
import { useProject } from "@/hooks/useProject";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are Revliskit AI, a world-class app generation assistant. When a user describes an app, you generate clean, production-ready React + TypeScript code with Tailwind CSS. 

Format your responses using markdown:
- Use code blocks with language tags for code snippets
- Use headings to organize sections
- Use bullet points for lists of features or steps
- Explain what you're building before showing code

IMPORTANT: When generating a component, always name the main component "App" so it can be rendered in the live preview. Use only React, no imports (React is available globally). Use Tailwind CSS classes for styling. Example:
\`\`\`tsx
function App() {
  const [count, setCount] = React.useState(0);
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Hello</h1>
    </div>
  );
}
\`\`\`

Always respond as if you are actively building the app step by step.`;

const Builder = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("project") || undefined;
  const { project, createProject, saveVersion } = useProject(projectId);

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm **Revliskit AI**. Describe the app you want to build, and I'll generate it for you. 🚀" },
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [generatedCode, setGeneratedCode] = useState("");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const extractAndSaveCode = useCallback(
    async (content: string, currentProjectId?: string) => {
      const codeMatch = content.match(/```(?:tsx?|jsx?|typescript|javascript)\n([\s\S]*?)```/);
      if (codeMatch) {
        const code = codeMatch[1];
        setGeneratedCode(code);
        await saveVersion(code, currentProjectId);
      }
    },
    [saveVersion]
  );

  const streamChat = useCallback(async (allMessages: Message[], currentProjectId?: string) => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-chat`;

    const apiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...allMessages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: apiMessages }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Request failed" }));
      throw new Error(err.error || `HTTP ${resp.status}`);
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIdx: number;
      while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIdx);
        buffer = buffer.slice(newlineIdx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantContent += content;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && prev.length > 1) {
                return prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });

            // Live-update the preview with latest code
            const codeMatch = assistantContent.match(/```(?:tsx?|jsx?|typescript|javascript)\n([\s\S]*?)```/);
            if (codeMatch) setGeneratedCode(codeMatch[1]);
          }
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }

    // Save the final version after streaming completes
    await extractAndSaveCode(assistantContent, currentProjectId);
  }, [extractAndSaveCode]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;
    const userMsg = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setIsGenerating(true);

    try {
      // Auto-create project on first message if none exists
      let pid = project?.id;
      if (!pid) {
        const newProject = await createProject(userMsg.slice(0, 50));
        pid = newProject.id;
      }
      await streamChat(newMessages, pid);
    } catch (e) {
      console.error("Chat error:", e);
      const errorMsg = e instanceof Error ? e.message : "Something went wrong";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ **Error:** ${errorMsg}` },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-3rem)] overflow-hidden">
        {/* Chat Panel */}
        <div className="w-1/2 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-display font-semibold text-sm">AI Builder</h2>
            {project && (
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                {project.name}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${msg.role === "assistant" ? "bg-primary/20" : "bg-secondary/20"}`}>
                  {msg.role === "assistant" ? <Bot className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-secondary" />}
                </div>
                <div className={`glass px-4 py-3 max-w-[80%] text-sm leading-relaxed ${msg.role === "user" ? "bg-primary/10 border-primary/20" : ""}`}>
                  <ReactMarkdown
                    components={{
                      code({ className, children, ...props }) {
                        const isInline = !className;
                        return isInline ? (
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                            {children}
                          </code>
                        ) : (
                          <pre className="bg-background/80 border border-border rounded-lg p-3 my-2 overflow-x-auto">
                            <code className="text-xs font-mono text-foreground" {...props}>
                              {children}
                            </code>
                          </pre>
                        );
                      },
                      p({ children }) {
                        return <p className="mb-2 last:mb-0">{children}</p>;
                      },
                      h1({ children }) {
                        return <h1 className="text-lg font-bold mb-2">{children}</h1>;
                      },
                      h2({ children }) {
                        return <h2 className="text-base font-semibold mb-2">{children}</h2>;
                      },
                      h3({ children }) {
                        return <h3 className="text-sm font-semibold mb-1">{children}</h3>;
                      },
                      ul({ children }) {
                        return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>;
                      },
                      ol({ children }) {
                        return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>;
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </motion.div>
            ))}
            {isGenerating && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="glass px-4 py-3">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-primary"
                        animate={{ scale: [0, 1, 0] }}
                        transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.16 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2 glass rounded-xl p-1.5">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Describe what you want to build..."
                className="flex-1 bg-transparent border-none outline-none text-sm px-3 py-2 placeholder:text-muted-foreground/60"
              />
              <Button size="sm" onClick={handleSend} disabled={isGenerating} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground">
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="w-1/2 flex flex-col">
          <div className="p-4 border-b border-border flex items-center gap-1">
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${activeTab === "preview" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${activeTab === "code" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Code className="w-3.5 h-3.5" /> Code
            </button>
          </div>
          <div className="flex-1 bg-muted/30 flex items-center justify-center overflow-hidden">
            {activeTab === "preview" ? (
              <LivePreview code={generatedCode} />
            ) : (
              <div className="w-full h-full p-6 font-mono text-xs text-foreground/80 overflow-auto">
                <pre className="whitespace-pre-wrap">
                  {generatedCode || `// Generated code will appear here\n// Send a message to start building your app`}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Builder;
