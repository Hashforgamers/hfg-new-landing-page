import "server-only";
import { authOps } from "./auth";
import { bookingOps } from "./booking";
import { storeOps } from "./store";
import { accountOps } from "./account";
import { CLIENT_EVENTS, sanitizeProps } from "@/lib/server/analytics";
import { v } from "@/lib/server/validate";

const analyticsOps = {
  "analytics.track": {
    auth: "none",
    limit: { perIp: 60 },
    async run(ctx, args) {
      const events = Array.isArray(args.events) ? args.events.slice(0, 20) : [];
      for (const raw of events) {
        if (!raw || typeof raw !== "object" || !CLIENT_EVENTS.has(raw.name)) continue;
        const props = sanitizeProps(raw.props);
        if (typeof raw.path === "string") props.path = raw.path.slice(0, 120).replace(/[?#].*$/, "");
        ctx.track(raw.name, props, { fromClient: true });
      }
      if (args.utm && typeof args.utm === "object") {
        ctx.setAttribution(sanitizeProps(args.utm));
      }
      return { accepted: true };
    },
  },
};

export const OPS = { ...authOps, ...bookingOps, ...storeOps, ...accountOps, ...analyticsOps };

export function resolveOp(name) {
  const op = v.str(name, "op", { max: 40, pattern: /^[a-z]+(\.[a-zA-Z]+)+$/ });
  return Object.prototype.hasOwnProperty.call(OPS, op) ? [op, OPS[op]] : [op, null];
}
