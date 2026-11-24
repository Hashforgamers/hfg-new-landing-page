import { handleHandshake } from "@/lib/secure/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function POST(request) {
  return handleHandshake(request);
}
