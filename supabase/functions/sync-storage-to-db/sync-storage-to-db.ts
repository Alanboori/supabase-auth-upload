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
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed, use POST" }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    // List all files in your storage bucket (default: "public")
    const { data: files, error } = await supabase.storage
      .from("public")
      .list("", { recursive: true });

    if (error) {
      return new Response(
        JSON.stringify({ error: "Failed to list storage files: " + error.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({ message: "No files found in storage." }),
        { status: 200, headers: corsHeaders }
      );
    }

    // For each file, check if it exists in user_files table; if not, insert it
    for (const file of files) {
      // Check if file already exists in user_files table by name
      const { data: existingFiles, error: selectError } = await supabase
        .from("user_files")
        .select("*")
        .eq("name", file.name);

      if (selectError) {
        return new Response(
          JSON.stringify({ error: "Failed to query user_files: " + selectError.message }),
          { status: 500, headers: corsHeaders }
        );
      }

      if (existingFiles && existingFiles.length === 0) {
        // Insert new record for the file
        const { error: insertError } = await supabase.from("user_files").insert([
          {
            name: file.name,
            created_at: file.created_at,
            metadata: file.metadata ?? null,
          },
        ]);
        if (insertError) {
          return new Response(
            JSON.stringify({ error: "Failed to insert user_files: " + insertError.message }),
            { status: 500, headers: corsHeaders }
          );
        }
      }
    }

    return new Response(
      JSON.stringify({ message: "Storage files synced successfully." }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
