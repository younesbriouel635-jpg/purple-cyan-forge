import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, idempotency_key, project_id } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!idempotency_key || typeof idempotency_key !== "string") {
      return new Response(
        JSON.stringify({ error: "idempotency_key is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract user from JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Verify user via their JWT
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for atomic credit check (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // ATOMIC CREDIT CHECK with idempotency
    const { data: creditResult, error: creditError } = await supabaseAdmin.rpc(
      "reserve_generation_credit",
      {
        p_user_id: user.id,
        p_idempotency_key: idempotency_key,
        p_project_id: project_id || null,
      }
    );

    if (creditError) {
      console.error("Credit check error:", creditError);
      return new Response(
        JSON.stringify({ error: "Credit verification failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!creditResult?.allowed) {
      const reason = creditResult?.reason || "unknown";
      const statusCode = reason === "duplicate_request" ? 409 : 403;
      return new Response(
        JSON.stringify({
          error: reason === "limit_reached"
            ? "Project limit reached. Please upgrade your plan."
            : reason === "no_active_subscription"
            ? "No active subscription found."
            : reason === "duplicate_request"
            ? "This request has already been processed."
            : "Generation not allowed.",
          reason,
          current: creditResult?.current,
          limit: creditResult?.limit,
        }),
        { status: statusCode, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // System prompt (server-side only — never sent from client)
    const systemPrompt = `You are Revliks AI, a world-class app generation assistant. When a user describes an app, you generate clean, production-ready React + TypeScript code with Tailwind CSS. 

Format your responses using markdown:
- Use code blocks with language tags for code snippets
- Use headings to organize sections
- Use bullet points for lists of features or steps
- Explain what you're building before showing code

IMPORTANT: When generating a component, always name the main component "App" so it can be rendered in the live preview. Use only React, no imports (React is available globally). Use Tailwind CSS classes for styling. When updating existing code, provide the FULL updated component — do not use partial diffs. Example:
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

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.filter((m: { role: string }) => m.role !== "system"),
    ];

    // Call Lovable AI Gateway (API key never exposed to frontend)
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: apiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      // Mark idempotency as failed so user can retry
      await supabaseAdmin.rpc("complete_generation", { p_idempotency_key: idempotency_key });

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI generation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream through, then mark complete on finish
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } catch (e) {
          console.error("Stream error:", e);
        } finally {
          // Mark generation as completed
          await supabaseAdmin.rpc("complete_generation", {
            p_idempotency_key: idempotency_key,
          });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-generate error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
