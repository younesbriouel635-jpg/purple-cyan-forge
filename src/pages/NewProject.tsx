import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, ArrowLeft, Sparkles, Rocket, AlertTriangle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import AppLayout from "@/components/AppLayout";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const techStacks = [
  { id: "react", label: "React", desc: "Modern UI with component architecture" },
  { id: "nextjs", label: "Next.js", desc: "Full-stack React framework with SSR" },
  { id: "html-css", label: "HTML / CSS", desc: "Classic static site structure" },
];

const generationSteps = [
  "Analyzing requirements",
  "Generating Schema",
  "Building UI Components",
  "Finalizing project",
];

const NewProject = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialIdea = searchParams.get("idea") || "";

  const { user } = useAuth();
  const { subscription, loading: subLoading, canCreateProject, appLimit } = useSubscription();

  // Form state
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState(initialIdea);
  const [selectedStack, setSelectedStack] = useState<string | null>(null);

  // Limit modal
  const [limitModalOpen, setLimitModalOpen] = useState(false);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genStepIndex, setGenStepIndex] = useState(0);

  // Project count
  const [projectCount, setProjectCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .then(({ count }) => setProjectCount(count ?? 0));
  }, [user]);

  // Check limits once data is loaded
  useEffect(() => {
    if (subLoading || projectCount === null) return;
    if (!canCreateProject(projectCount)) {
      setLimitModalOpen(true);
    }
  }, [subLoading, projectCount, canCreateProject]);

  const handleCreate = async () => {
    if (!user || !projectName.trim() || !selectedStack) return;

    // Re-check limit
    if (projectCount !== null && !canCreateProject(projectCount)) {
      setLimitModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setGenProgress(0);
    setGenStepIndex(0);

    // Simulate AI generation progress
    const totalDuration = 4000;
    const stepDuration = totalDuration / generationSteps.length;
    const interval = 50;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      const progress = Math.min((elapsed / totalDuration) * 100, 100);
      setGenProgress(progress);
      setGenStepIndex(Math.min(Math.floor(elapsed / stepDuration), generationSteps.length - 1));

      if (elapsed >= totalDuration) {
        clearInterval(timer);
      }
    }, interval);

    // Create project + generation record
    try {
      const { data: project, error: projError } = await supabase
        .from("projects")
        .insert({ name: projectName, user_id: user.id })
        .select("id")
        .single();

      if (projError) throw projError;

      await supabase.from("app_generations").insert({
        user_id: user.id,
        project_id: project.id,
        prompt: `${description}\n\nTech Stack: ${selectedStack}`,
      });

      // Wait for animation to finish
      await new Promise((r) => setTimeout(r, Math.max(0, totalDuration - 500)));
      clearInterval(timer);
      setGenProgress(100);
      await new Promise((r) => setTimeout(r, 600));

      navigate(`/builder?project=${project.id}`);
    } catch (err) {
      console.error("Failed to create project:", err);
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full mx-auto px-6 text-center"
        >
          <div className="relative w-20 h-20 mx-auto mb-8">
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/20"
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-full glass">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
          </div>

          <h2 className="font-display text-2xl font-bold mb-2">Building your app</h2>
          <p className="text-muted-foreground text-sm mb-8">{generationSteps[genStepIndex]}...</p>

          <Progress value={genProgress} className="h-2 mb-4" />
          <p className="text-xs text-muted-foreground">{Math.round(genProgress)}%</p>
        </motion.div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
              <Rocket className="w-6 h-6 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold">Create New Project</h1>
            <p className="text-sm text-muted-foreground mt-1">Step {step} of 2</p>
          </div>

          <div className="glass p-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  <div>
                    <label className="text-sm font-medium mb-2 block">Project Name</label>
                    <Input
                      placeholder="My Awesome App"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="bg-muted/50 border-border/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Short Description</label>
                    <Textarea
                      placeholder="Describe what your app does..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="bg-muted/50 border-border/50 resize-none"
                    />
                  </div>
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!projectName.trim()}
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div>
                    <label className="text-sm font-medium mb-3 block">Choose Tech Stack</label>
                    <div className="space-y-3">
                      {techStacks.map((stack) => (
                        <button
                          key={stack.id}
                          onClick={() => setSelectedStack(stack.id)}
                          className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                            selectedStack === stack.id
                              ? "border-primary bg-primary/10"
                              : "border-border/50 bg-muted/30 hover:border-border"
                          }`}
                        >
                          <span className="font-medium text-sm">{stack.label}</span>
                          <p className="text-xs text-muted-foreground mt-0.5">{stack.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={handleCreate}
                      disabled={!selectedStack}
                      className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Create
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Limit Reached Modal */}
      <Dialog open={limitModalOpen} onOpenChange={setLimitModalOpen}>
        <DialogContent className="glass-strong border-border/50 max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <AlertTriangle className="w-7 h-7 text-destructive" />
            </div>
            <DialogTitle className="font-display text-xl">Project Limit Reached</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              You've used all {appLimit} project slots on your{" "}
              <span className="text-foreground font-medium">{subscription?.tier || "Basic"}</span> plan.
              Upgrade to unlock more.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <Button
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground"
              onClick={() => navigate("/#pricing")}
            >
              Upgrade Plan
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default NewProject;
