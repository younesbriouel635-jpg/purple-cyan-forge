import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: string;
  name: string;
}

export function useProject(projectId?: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [versionCount, setVersionCount] = useState(0);

  useEffect(() => {
    if (projectId) {
      supabase
        .from("projects")
        .select("id, name")
        .eq("id", projectId)
        .single()
        .then(({ data }) => {
          if (data) setProject(data);
        });

      // Load latest version count
      supabase
        .from("project_versions")
        .select("version_number")
        .eq("project_id", projectId)
        .order("version_number", { ascending: false })
        .limit(1)
        .then(({ data }) => {
          if (data?.[0]) setVersionCount(data[0].version_number);
        });
    }
  }, [projectId]);

  const createProject = useCallback(async (name: string = "Untitled Project") => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("projects")
      .insert({ name, user_id: user.id })
      .select("id, name")
      .single();
    if (error) throw error;
    setProject(data);
    return data;
  }, []);

  const saveVersion = useCallback(
    async (code: string, currentProjectId?: string) => {
      const pid = currentProjectId || project?.id;
      if (!pid || !code.trim()) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const nextVersion = versionCount + 1;
      const { error } = await supabase.from("project_versions").insert({
        project_id: pid,
        code,
        version_number: nextVersion,
        user_id: user.id,
      });
      if (error) {
        console.error("Failed to save version:", error);
        return;
      }
      setVersionCount(nextVersion);

      await supabase
        .from("projects")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", pid);
    },
    [project?.id, versionCount]
  );

  return { project, createProject, saveVersion, versionCount };
}
