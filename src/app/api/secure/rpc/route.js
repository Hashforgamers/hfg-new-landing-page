import { handleRpc } from "@/lib/secure/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export function POST(request) {
  return handleRpc(request);
}
