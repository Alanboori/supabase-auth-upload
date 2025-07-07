import { serve } from "https://deno.land/std@0.178.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed, use POST" }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders() } }
    );
  }

  try {
    const { token, new_password } = await req.json();

    if (!token || !new_password) {
      return new Response(
        JSON.stringify({ error: "Token and new password are required." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders() } }
      );
    }

    const resetRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "apikey": SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ password: new_password }),
    });

    const resetData = await resetRes.json();

    if (!resetRes.ok) {
      return new Response(
        JSON.stringify({ error: resetData.msg || resetData.error || "Password reset failed." }),
        { status: resetRes.status, headers: { "Content-Type": "application/json", ...corsHeaders() } }
      );
    }

    return new Response(
      JSON.stringify({ message: "Password reset successful!" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders() } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders() } }
    );
  }
});
