
-- Add user_id to projects table
ALTER TABLE public.projects ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to project_versions table  
ALTER TABLE public.project_versions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow all access to projects" ON public.projects;
DROP POLICY IF EXISTS "Allow all access to project_versions" ON public.project_versions;

-- Identity-based RLS for projects
CREATE POLICY "Users can view own projects"
ON public.projects FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
ON public.projects FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
ON public.projects FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
ON public.projects FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Identity-based RLS for project_versions
CREATE POLICY "Users can view own versions"
ON public.project_versions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own versions"
ON public.project_versions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own versions"
ON public.project_versions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own versions"
ON public.project_versions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
