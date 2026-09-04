import { NextRequest } from "next/server";
import { isAdminRequest, jsonError } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(request)) {
    return jsonError("Unauthorized", 401);
  }

  const { id } = await params;
  const body = (await request.json()) as { status?: "published" | "hidden"; featured?: boolean };
  const patch: { status?: "published" | "hidden"; featured?: boolean } = {};

  if (body.status === "published" || body.status === "hidden") {
    patch.status = body.status;
  }

  if (typeof body.featured === "boolean") {
    patch.featured = body.featured;
  }

  if (!Object.keys(patch).length) {
    return jsonError("No valid fields", 400);
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.from("stars").update(patch).eq("id", id).select("*").single();

  if (error || !data) {
    return jsonError("Unable to update star", 500);
  }

  return Response.json(data);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(request)) {
    return jsonError("Unauthorized", 401);
  }

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("stars").delete().eq("id", id);

  if (error) {
    return jsonError("Unable to delete star", 500);
  }

  return Response.json({ ok: true });
}
