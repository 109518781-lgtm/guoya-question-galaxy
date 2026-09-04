import { NextRequest } from "next/server";

export function isAdminRequest(request: NextRequest) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  const providedPassword = request.headers.get("x-admin-password");

  return Boolean(configuredPassword && providedPassword && providedPassword === configuredPassword);
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
