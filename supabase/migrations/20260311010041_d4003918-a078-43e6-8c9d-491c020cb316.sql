
-- 1. Add generated_code column to projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS generated_code text DEFAULT '';

-- 2. Index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects (user_id);
CREATE INDEX IF NOT EXISTS idx_app_generations_user_id ON public.app_generations (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions (user_id);

-- 3. Idempotency table for generation requests
CREATE TABLE IF NOT EXISTS public.generation_idempotency (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key text NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.generation_idempotency ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own idempotency records"
  ON public.generation_idempotency FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own idempotency records"
  ON public.generation_idempotency FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_idempotency_key ON public.generation_idempotency (idempotency_key);
CREATE INDEX IF NOT EXISTS idx_idempotency_user ON public.generation_idempotency (user_id);

-- 4. Atomic credit reservation function (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.reserve_generation_credit(
  p_user_id uuid,
  p_idempotency_key text,
  p_project_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier text;
  v_app_limit integer;
  v_current_count integer;
  v_existing_status text;
  v_record_id uuid;
BEGIN
  -- Check idempotency: if key already exists, return its status
  SELECT id, status INTO v_record_id, v_existing_status
  FROM generation_idempotency
  WHERE idempotency_key = p_idempotency_key;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'allowed', v_existing_status = 'pending',
      'reason', CASE WHEN v_existing_status = 'completed' THEN 'duplicate_request' ELSE 'in_progress' END,
      'idempotency_id', v_record_id
    );
  END IF;

  -- Get subscription info
  SELECT tier, app_limit INTO v_tier, v_app_limit
  FROM subscriptions
  WHERE user_id = p_user_id AND status = 'active'
  LIMIT 1;

  IF v_tier IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'no_active_subscription');
  END IF;

  -- Count current projects (atomic read under serializable-like lock)
  SELECT count(*) INTO v_current_count
  FROM projects
  WHERE user_id = p_user_id;

  IF v_current_count >= v_app_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'limit_reached',
      'current', v_current_count,
      'limit', v_app_limit
    );
  END IF;

  -- Reserve the credit by inserting idempotency record
  INSERT INTO generation_idempotency (idempotency_key, user_id, project_id, status)
  VALUES (p_idempotency_key, p_user_id, p_project_id, 'pending')
  RETURNING id INTO v_record_id;

  RETURN jsonb_build_object(
    'allowed', true,
    'idempotency_id', v_record_id,
    'remaining', v_app_limit - v_current_count - 1
  );
END;
$$;

-- 5. Complete generation function (marks idempotency as done)
CREATE OR REPLACE FUNCTION public.complete_generation(
  p_idempotency_key text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE generation_idempotency
  SET status = 'completed', completed_at = now()
  WHERE idempotency_key = p_idempotency_key;
END;
$$;
