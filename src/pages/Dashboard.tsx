import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, MoreHorizontal, Globe, FileCode, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";

const projects = [
  { id: 1, name: "E-Commerce Platform", status: "Deployed", updated: "2 hours ago", tech: "React + Node.js" },
  { id: 2, name: "SaaS Dashboard", status: "Draft", updated: "1 day ago", tech: "Next.js + Postgres" },
  { id: 3, name: "Portfolio Site", status: "Deployed", updated: "3 days ago", tech: "React + Tailwind" },
  { id: 4, name: "Task Manager API", status: "Building", updated: "Just now", tech: "Express + MongoDB" },
  { id: 5, name: "Social Media Clone", status: "Draft", updated: "1 week ago", tech: "React + Firebase" },
  { id: 6, name: "AI Chat Assistant", status: "Deployed", updated: "5 hours ago", tech: "Next.js + OpenAI" },
];

const statusColor: Record<string, string> = {
  Deployed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Draft: "bg-muted text-muted-foreground border-border",
  Building: "bg-primary/20 text-primary border-primary/30",
};

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold">My Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">{projects.length} projects</p>
          </div>
          <Button
            onClick={() => navigate("/builder")}
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate("/builder")}
              className="glass p-5 cursor-pointer hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="aspect-video rounded-lg bg-muted/50 mb-4 flex items-center justify-center overflow-hidden">
                <FileCode className="w-8 h-8 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-semibold text-sm">{p.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.tech}</p>
                </div>
                <button className="text-muted-foreground hover:text-foreground p-1">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor[p.status]}`}>
                  {p.status}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {p.updated}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
