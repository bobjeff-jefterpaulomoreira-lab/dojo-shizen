import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const rochedoId = "b57714cc-f053-49e0-9636-30fd54db3210";

  // Create professor
  const { data: prof, error: profErr } = await supabaseAdmin.auth.admin.createUser({
    email: "sensei@dojo.com",
    password: "sensei123",
    email_confirm: true,
    user_metadata: {
      nome: "Sensei Tanaka",
      role: "professor",
      unidade_id: rochedoId,
    },
  });

  // Create aluno
  const { data: aluno, error: alunoErr } = await supabaseAdmin.auth.admin.createUser({
    email: "aluno@dojo.com",
    password: "aluno123",
    email_confirm: true,
    user_metadata: {
      nome: "Carlos Silva",
      role: "aluno",
      unidade_id: rochedoId,
    },
  });

  return new Response(
    JSON.stringify({
      professor: prof?.user?.id || profErr?.message,
      aluno: aluno?.user?.id || alunoErr?.message,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
