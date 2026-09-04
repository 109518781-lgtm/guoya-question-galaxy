import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const allowedOrigins = "*";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": allowedOrigins,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("stars")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(180);

  if (error) {
    return Response.json({ error: "Unable to load stars" }, { status: 500, headers: corsHeaders() });
  }

  return Response.json(data ?? [], { headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { content?: string } | null;
  const content = body?.content?.trim();

  if (!content || content.length < 2 || content.length > 80) {
    return Response.json({ error: "Invalid content" }, { status: 400, headers: corsHeaders() });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("stars")
    .insert({ content, source: "tablet", status: "published" })
    .select("*")
    .single();

  if (error || !data) {
    return Response.json({ error: "Unable to add star" }, { status: 500, headers: corsHeaders() });
  }

  return Response.json(data, { status: 201, headers: corsHeaders() });
}
