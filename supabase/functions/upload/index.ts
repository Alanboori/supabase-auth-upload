// upload/index.ts
import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MAX_BYTES = 524_288_000; // 500MB

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }

  const token = authHeader.split(" ")[1];
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return new Response(JSON.stringify({ error: "Invalid user" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return new Response(JSON.stringify({ error: "No file uploaded" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }

  const { data: existingFiles, error: listError } = await supabase.storage
    .from("user-files")
    .list(user.id, { limit: 100 });

  if (listError) {
    return new Response(JSON.stringify({ error: listError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }

  let total = 0;
  for (const file of existingFiles || []) {
    total += file.metadata?.size || 0;
  }

  if (total + file.size > MAX_BYTES) {
    return new Response(JSON.stringify({ error: "Storage quota exceeded (500MB limit)" }), {
      status: 403,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  const path = `${user.id}/${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("user-files")
    .upload(path, buffer, { upsert: true });

  if (uploadError) {
    return new Response(JSON.stringify({ error: uploadError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }

  return new Response(JSON.stringify({ message: "Uploaded!" }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
});
