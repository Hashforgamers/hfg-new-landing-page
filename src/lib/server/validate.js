import "server-only";

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

const fail = (msg) => {
  throw new ValidationError(msg);
};

export const v = {
  int(value, name, { min = 1, max = 2_147_483_647 } = {}) {
    const n = typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value;
    if (!Number.isInteger(n) || n < min || n > max) fail(`${name} is invalid`);
    return n;
  },
  intList(value, name, { maxItems = 20 } = {}) {
    if (!Array.isArray(value) || value.length === 0 || value.length > maxItems) fail(`${name} is invalid`);
    const out = value.map((item) => v.int(item, name));
    if (new Set(out).size !== out.length) fail(`${name} has duplicates`);
    return out;
  },
  str(value, name, { min = 1, max = 200, pattern } = {}) {
    if (typeof value !== "string") fail(`${name} is required`);
    const s = value.trim();
    if (s.length < min || s.length > max) fail(`${name} length is invalid`);
    if (pattern && !pattern.test(s)) fail(`${name} format is invalid`);
    return s;
  },
  optStr(value, name, opts = {}) {
    if (value === undefined || value === null || value === "") return "";
    return v.str(value, name, { min: 0, ...opts });
  },
  bool(value, name) {
    if (typeof value !== "boolean") fail(`${name} must be true or false`);
    return value;
  },
  oneOf(value, name, allowed) {
    if (!allowed.includes(value)) fail(`${name} is invalid`);
    return value;
  },
  /** YYYY-MM-DD within [today-1, today+maxDays] in IST. */
  bookDate(value, { maxDays = 30 } = {}) {
    const s = v.str(value, "date", { pattern: /^\d{4}-\d{2}-\d{2}$/ });
    const d = new Date(`${s}T00:00:00+05:30`);
    if (Number.isNaN(d.getTime())) fail("date is invalid");
    const today = new Date(`${istToday()}T00:00:00+05:30`);
    const diffDays = Math.round((d - today) / 86400000);
    if (diffDays < 0 || diffDays > maxDays) fail("Pick a date within the next 30 days");
    return s;
  },
  mongoLikeId(value, name, prefix) {
    return v.str(value, name, { max: 80, pattern: new RegExp(`^${prefix}_[A-Za-z0-9]+$`) });
  },
  phone(value) {
    return v.str(value, "phone", { min: 8, max: 16, pattern: /^\+?[0-9]{8,15}$/ });
  },
  email(value, name = "email") {
    return v.str(value, name, { max: 120, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/ });
  },
  object(value, name) {
    if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${name} is invalid`);
    return value;
  },
};

export function istToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

/** Strips control characters that could break logs or emails downstream. */
export function clean(value) {
  return String(value || "").replace(/[\u0000-\u001f\u007f<>]/g, "").trim();
}
