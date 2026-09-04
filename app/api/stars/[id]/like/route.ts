import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: current, error: readError } = await supabase
    .from("stars")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .single();

  if (readError || !current) {
    return Response.json({ error: "Star not found" }, { status: 404, headers: corsHeaders });
  }

  const { data, error } = await supabase
    .from("stars")
    .update({ likes: current.likes + 1 })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    return Response.json({ error: "Unable to like star" }, { status: 500, headers: corsHeaders });
  }

  return Response.json(data, { headers: corsHeaders });
}
