import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the caller is a professor
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check caller is professor
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: callerProfile } = await adminClient
      .from("usuarios")
      .select("role")
      .eq("id", caller.id)
      .maybeSingle();

    if (!callerProfile || callerProfile.role !== "professor") {
      return new Response(JSON.stringify({ error: "Apenas professores podem cadastrar alunos" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { nome, email, senha, unidade_id } = await req.json();

    if (!nome || !email || !senha || !unidade_id) {
      return new Response(JSON.stringify({ error: "Preencha todos os campos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create user using admin client (won't affect caller's session)
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: { nome, role: "aluno", unidade_id },
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, user_id: data.user.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
