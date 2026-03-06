import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap, Shield, Globe, Code2, Layers, ArrowRight, Check } from "lucide-react";
import revliskitLogo from "@/assets/revliskit-logo.png";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ThinkingDots = () => (
  <div className="flex gap-1.5 items-center justify-center py-8">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-3 h-3 rounded-full bg-primary"
        animate={{ scale: [0, 1, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.16, ease: "easeInOut" }}
      />
    ))}
  </div>
);

const features = [
  { icon: Zap, title: "Instant Generation", desc: "Describe your app and watch it come to life in seconds with AI-powered code generation." },
  { icon: Code2, title: "Production-Ready Code", desc: "Clean, scalable TypeScript + React output that follows best practices out of the box." },
  { icon: Shield, title: "Built-in Auth & DB", desc: "Authentication, database, and API routes are generated automatically for your stack." },
  { icon: Globe, title: "One-Click Deploy", desc: "Ship to production instantly with our integrated hosting and CI/CD pipeline." },
  { icon: Layers, title: "Component Library", desc: "Access thousands of pre-built UI patterns and templates to accelerate development." },
  { icon: Sparkles, title: "AI Iteration", desc: "Refine your app with natural language. Just tell the AI what to change." },
];

const pricingTiers = [
  { name: "Free", price: "$0", period: "/forever", desc: "Perfect for trying things out", features: ["1 project", "Basic AI generation", "Community support", "Shared hosting"], cta: "Get Started", popular: false },
  { name: "Pro", price: "$29", period: "/month", desc: "For serious builders", features: ["Unlimited projects", "Advanced AI models", "Priority support", "Custom domains", "Team collaboration", "API access"], cta: "Start Pro Trial", popular: true },
  { name: "Agency", price: "$99", period: "/month", desc: "For teams at scale", features: ["Everything in Pro", "White-label builds", "Dedicated infra", "SLA guarantee", "Custom integrations", "Priority queue"], cta: "Contact Sales", popular: false },
];

const LandingPage = () => {
  const [idea, setIdea] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = () => {
    if (!idea.trim()) return;
    setIsThinking(true);
    setTimeout(() => {
      setIsThinking(false);
      navigate("/builder");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass-strong border-b border-border/30">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-2">
            <img src={revliskitLogo} alt="Revliskit logo" className="w-8 h-8 rounded-lg object-contain" />
            <span className="font-display text-xl font-bold tracking-tight">Revliskit</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>Sign in</Button>
            <Button size="sm" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground" onClick={() => navigate("/dashboard")}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-secondary/8 blur-[100px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-muted-foreground mb-8">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>AI-Powered App Generation</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              Build apps with
              <span className="gradient-text block">a single prompt.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
              Describe your idea, and Revliskit transforms it into a fully functional, production-ready application in seconds.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            {isThinking ? (
              <div className="glass glow-input rounded-2xl p-8 text-center">
                <p className="text-sm text-muted-foreground mb-2">Architecting your application...</p>
                <ThinkingDots />
                <p className="text-xs text-muted-foreground animate-pulse">Analyzing requirements · Generating schema · Building UI</p>
              </div>
            ) : (
              <div className="glass glow-input rounded-2xl p-2 animate-glow-pulse">
                <div className="flex items-center gap-2">
                  <input
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                    placeholder="What kind of app do you want to build today?"
                    className="flex-1 bg-transparent border-none outline-none text-foreground text-lg px-4 py-4 placeholder:text-muted-foreground/60"
                  />
                  <Button
                    onClick={handleGenerate}
                    size="lg"
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground px-8 shrink-0"
                  >
                    Generate
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Everything you need to <span className="gradient-text">ship fast</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">From idea to production in minutes, not months.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass p-6 hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Simple, transparent <span className="gradient-text">pricing</span>
            </h2>
            <p className="text-muted-foreground">Start free. Scale when you're ready.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingTiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`glass p-8 relative ${tier.popular ? "border-primary/50 glow-purple" : ""}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-xs font-medium text-primary-foreground">
                    Most Popular
                  </div>
                )}
                <h3 className="font-display text-xl font-semibold mb-1">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{tier.desc}</p>
                <div className="mb-6">
                  <span className="font-display text-4xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground text-sm">{tier.period}</span>
                </div>
                <Button
                  className={`w-full mb-6 ${tier.popular ? "bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground" : ""}`}
                  variant={tier.popular ? "default" : "outline"}
                >
                  {tier.cta}
                </Button>
                <ul className="space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-12">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2026 Revliskit. Build the future with AI.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
