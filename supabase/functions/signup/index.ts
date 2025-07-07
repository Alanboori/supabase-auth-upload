import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Use POST" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const { email, password, username, full_name } = await req.json();

    if (!email || !password || !username) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Create user with metadata
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { username, full_name },
      email_confirm: true,
    });

    if (error || !data?.user?.id) {
      return new Response(
        JSON.stringify({ error: error?.message || "User creation failed" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const userId = data.user.id;

    // Insert into profiles table using same ID as auth.users
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([{ id: userId, username, full_name }]);

    if (profileError) {
      return new Response(
        JSON.stringify({
          error: "User created but failed to create profile: " + profileError.message,
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        message: "User created successfully",
        user: { id: userId, email: data.user.email },
      }),
      { status: 201, headers: corsHeaders }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
