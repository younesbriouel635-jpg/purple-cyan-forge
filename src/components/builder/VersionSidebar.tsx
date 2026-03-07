import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, ChevronRight, RotateCcw, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Version {
  id: string;
  version_number: number;
  code: string;
  created_at: string;
}

interface VersionSidebarProps {
  projectId: string | undefined;
  onRestore: (code: string, versionNumber: number) => void;
  currentVersion: number;
}

const VersionSidebar = ({ projectId, onRestore, currentVersion }: VersionSidebarProps) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId || !isOpen) return;
    setLoading(true);
    supabase
      .from("project_versions")
      .select("id, version_number, code, created_at")
      .eq("project_id", projectId)
      .order("version_number", { ascending: false })
      .then(({ data }) => {
        if (data) setVersions(data);
        setLoading(false);
      });
  }, [projectId, isOpen, currentVersion]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`absolute top-4 right-4 z-10 p-2 rounded-lg transition-colors ${
          isOpen ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        }`}
        title="Version History"
      >
        <History className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-l border-border bg-card/80 backdrop-blur-xl overflow-hidden flex flex-col shrink-0"
          >
            <div className="p-3 border-b border-border">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Version History
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loading ? (
                <div className="text-xs text-muted-foreground p-3 text-center">Loading...</div>
              ) : versions.length === 0 ? (
                <div className="text-xs text-muted-foreground p-3 text-center">No versions yet</div>
              ) : (
                versions.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => onRestore(v.code, v.version_number)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors group ${
                      currentVersion === v.version_number
                        ? "bg-primary/15 border border-primary/30 text-primary"
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">v{v.version_number}</span>
                      <RotateCcw className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                      <Clock className="w-2.5 h-2.5" />
                      {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VersionSidebar;
