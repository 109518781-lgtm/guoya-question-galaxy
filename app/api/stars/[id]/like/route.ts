import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/admin";

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
    return jsonError("Star not found", 404);
  }

  const { data, error } = await supabase
    .from("stars")
    .update({ likes: current.likes + 1 })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    return jsonError("Unable to like star", 500);
  }

  return Response.json(data);
}
