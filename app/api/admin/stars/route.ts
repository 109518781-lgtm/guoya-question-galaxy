import { NextRequest } from "next/server";
import { isAdminRequest, jsonError } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/server";
import type { StarSource } from "@/lib/types";

const allowedSources: StarSource[] = ["tablet", "xiaohongshu", "douyin", "wechat", "manual"];

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return jsonError("Unauthorized", 401);
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("stars")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return jsonError("Unable to load stars", 500);
  }

  return Response.json(data);
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return jsonError("Unauthorized", 401);
  }

  const body = (await request.json()) as { content?: string; source?: StarSource };
  const content = body.content?.trim();
  const source = body.source && allowedSources.includes(body.source) ? body.source : "manual";

  if (!content) {
    return jsonError("Content is required", 400);
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("stars")
    .insert({ content, source, status: "published" })
    .select("*")
    .single();

  if (error || !data) {
    return jsonError("Unable to add star", 500);
  }

  return Response.json(data, { status: 201 });
}
