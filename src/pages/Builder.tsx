import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Code, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const simulatedResponses = [
  "I'll create a modern React application for you. Let me start by setting up the project structure...",
  "Setting up the database schema with user authentication, profiles, and the core data models...",
  "Building the UI components: Navigation, Dashboard, and Settings pages with responsive design...",
  "Adding API routes and connecting the frontend to the backend. Almost done!",
  "✅ Your app is ready! I've built:\n- Authentication (login/signup)\n- Dashboard with analytics\n- Settings page\n- Responsive navigation\n\nYou can see the preview on the right.",
];

const Builder = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm Revliskit AI. Describe the app you want to build, and I'll generate it for you." },
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [responseIndex, setResponseIndex] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsGenerating(true);

    // Simulate AI response
    setTimeout(() => {
      const resp = simulatedResponses[responseIndex % simulatedResponses.length];
      setMessages((prev) => [...prev, { role: "assistant", content: resp }]);
      setResponseIndex((i) => i + 1);
      setIsGenerating(false);
    }, 2000 + Math.random() * 1500);
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-3rem)] overflow-hidden">
        {/* Chat Panel */}
        <div className="w-1/2 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-display font-semibold text-sm">AI Builder</h2>
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
                <div className={`glass px-4 py-3 max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "bg-primary/10 border-primary/20" : ""}`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            {isGenerating && (
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
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
          <div className="flex-1 bg-muted/30 flex items-center justify-center">
            {activeTab === "preview" ? (
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-primary/40" />
                </div>
                <p className="text-sm text-muted-foreground">Live preview will appear here</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Start by describing your app in the chat</p>
              </div>
            ) : (
              <div className="w-full h-full p-6 font-mono text-xs text-muted-foreground overflow-auto">
                <pre className="text-primary/60">{`// Generated code will appear here\n\nimport React from 'react';\n\nconst App = () => {\n  return (\n    <div>\n      <h1>Your App</h1>\n    </div>\n  );\n};\n\nexport default App;`}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Builder;
