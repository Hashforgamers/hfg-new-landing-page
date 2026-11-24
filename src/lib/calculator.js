// Data and maths for the gaming cafe cost calculator.
// Prices are typical Indian street prices in rupees, last checked on PRICES_CHECKED. They move
// often (consoles especially), so the UI lets visitors edit every one and links to live searches.

export const PRICES_CHECKED = "October 2026";

const links = (q) => ({
  amazon: `https://www.amazon.in/s?k=${encodeURIComponent(q)}`,
  flipkart: `https://www.flipkart.com/search?q=${encodeURIComponent(q)}`,
});

export const ITEMS = {
  pcBudget: { label: "Gaming PC, budget", note: "Ryzen 5 / i5, RTX 3050-class", price: 55000, ...links("gaming pc rtx 3050") },
  pcMid: { label: "Gaming PC, mid", note: "Ryzen 5 / i5, RTX 4060-class", price: 90000, ...links("gaming pc rtx 4060") },
  pcHigh: { label: "Gaming PC, high-end", note: "Ryzen 7 / i7, RTX 4070 Super-class", price: 150000, ...links("gaming pc rtx 4070 super") },
  monitor: { label: "Monitor", note: '24" 165Hz', price: 12000, ...links("24 inch 165hz gaming monitor") },
  peripherals: { label: "Keyboard, mouse, headset", note: "Per PC", price: 5000, ...links("gaming keyboard mouse headset combo") },
  chair: { label: "Gaming chair", note: "Per seat", price: 8000, ...links("gaming chair") },
  desk: { label: "Gaming desk", note: "Per PC", price: 5000, ...links("gaming desk") },
  ps5: { label: "PlayStation 5", note: "Slim, disc edition", price: 69990, ...links("playstation 5 slim disc console") },
  xbox: { label: "Xbox Series X", note: "1TB", price: 59990, ...links("xbox series x console") },
  tv: { label: "TV for consoles", note: '43" 4K', price: 24000, ...links("43 inch 4k tv") },
  controller: { label: "Extra controller", note: "Per console", price: 6000, ...links("dualsense wireless controller") },
  vr: { label: "VR headset", note: "Standalone, Quest 3S-class", price: 35000, ...links("meta quest 3s") },
  wheel: { label: "Racing wheel and pedals", note: "Logitech G29-class", price: 33000, ...links("logitech g29 racing wheel") },
  cockpit: { label: "Racing cockpit seat", note: "Per rig", price: 20000, ...links("racing simulator cockpit") },
};

export const DEFAULT_PRICES = Object.fromEntries(Object.entries(ITEMS).map(([k, v]) => [k, v.price]));

export const PC_TIERS = [
  { id: "pcBudget", label: "Budget" },
  { id: "pcMid", label: "Mid" },
  { id: "pcHigh", label: "High-end" },
];

// Monthly commercial rent per sq ft.
export const CITY_TIERS = [
  { id: "metro", label: "Metro", rent: 120 },
  { id: "tier2", label: "Tier 2", rent: 70 },
  { id: "tier3", label: "Tier 3", rent: 40 },
];

// One-time fit-out cost per sq ft (flooring, lighting, wiring, paint, signage).
export const INTERIORS = [
  { id: "basic", label: "Basic", perSqft: 600 },
  { id: "standard", label: "Standard", perSqft: 1200 },
  { id: "premium", label: "Premium", perSqft: 2000 },
];

export const DEFAULTS = {
  pcs: 10,
  pcTier: "pcMid",
  ps5: 2,
  xbox: 0,
  vr: 0,
  rigs: 0,
  city: "tier2",
  interiors: "standard",
  rate: 70,
  hours: 14,
  occupancy: 45,
  staff: 2,
};

const SQFT_PER_STATION = { pc: 30, console: 50, vr: 60, rig: 40 };
const COMMON_SQFT = 150; // counter, walkway, washroom
const AC_PRICE = 42000; // 1.5 ton split, installed
const SQFT_PER_AC = 180;
const STAFF_SALARY = 15000;
const POWER_RATE = 10; // rupees per unit, commercial
const KW = { pc: 0.4, console: 0.3, vr: 0.05, rig: 0.45, ac: 1.5 };
const DAYS = 30;

export function calculate(s, p) {
  const consoles = s.ps5 + s.xbox;
  const stations = s.pcs + consoles + s.vr + s.rigs;
  const sqft =
    s.pcs * SQFT_PER_STATION.pc +
    consoles * SQFT_PER_STATION.console +
    s.vr * SQFT_PER_STATION.vr +
    s.rigs * SQFT_PER_STATION.rig +
    (stations ? COMMON_SQFT : 0);
  const acs = stations ? Math.max(1, Math.ceil(sqft / SQFT_PER_AC)) : 0;
  const city = CITY_TIERS.find((c) => c.id === s.city);
  const fitout = INTERIORS.find((i) => i.id === s.interiors);

  const setup = [
    { id: "pcs", label: "Gaming PCs", amount: s.pcs * (p[s.pcTier] + p.monitor + p.peripherals) },
    {
      id: "consoles",
      label: "Consoles and TVs",
      amount: s.ps5 * p.ps5 + s.xbox * p.xbox + consoles * (p.tv + p.controller),
    },
    { id: "special", label: "VR and racing rigs", amount: s.vr * p.vr + s.rigs * (p.wheel + p.cockpit + p.pcMid + p.monitor) },
    { id: "furniture", label: "Chairs and desks", amount: (s.pcs + consoles) * p.chair + s.pcs * p.desk },
    { id: "interiors", label: "Interiors and wiring", amount: sqft * fitout.perSqft },
    { id: "ac", label: "Air conditioning", amount: acs * AC_PRICE },
    { id: "network", label: "Network and UPS", amount: stations ? 30000 + stations * 2500 : 0 },
    { id: "deposit", label: "Rent deposit (3 months)", amount: sqft * city.rent * 3 },
    { id: "licences", label: "Licences and registration", amount: stations ? 30000 : 0 },
  ];
  const setupTotal = setup.reduce((a, b) => a + b.amount, 0);

  const util = s.occupancy / 100;
  const stationKw = s.pcs * KW.pc + consoles * KW.console + s.vr * KW.vr + s.rigs * KW.rig;
  const units = (stationKw * util + acs * KW.ac * 0.6) * s.hours * DAYS;
  const monthly = [
    { id: "rent", label: "Rent", amount: sqft * city.rent },
    { id: "staff", label: "Staff", amount: s.staff * STAFF_SALARY },
    { id: "power", label: "Electricity", amount: Math.round(units * POWER_RATE) },
    { id: "net", label: "Internet and software", amount: stations ? 4000 + stations * 150 : 0 },
    { id: "upkeep", label: "Repairs and misc", amount: Math.round(setupTotal * 0.004) },
  ];
  const monthlyTotal = monthly.reduce((a, b) => a + b.amount, 0);

  // Consoles and rigs are usually billed above the PC rate.
  const hourly = s.pcs * s.rate + consoles * s.rate * 1.5 + s.vr * s.rate * 3 + s.rigs * s.rate * 2.5;
  const revenue = Math.round(hourly * s.hours * util * DAYS);
  const profit = revenue - monthlyTotal;
  const breakEven = profit > 0 ? Math.ceil(setupTotal / profit) : null;

  return { stations, sqft, acs, setup, setupTotal, monthly, monthlyTotal, revenue, profit, breakEven };
}

export function inr(n) {
  const v = Math.round(n);
  return `${v < 0 ? "-" : ""}₹${Math.abs(v).toLocaleString("en-IN")}`;
}

// 1250000 -> "₹12.5 lakh"; 12500000 -> "₹1.25 crore"
export function inrShort(n) {
  const v = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (v >= 1e7) return `${sign}₹${(v / 1e7).toFixed(2).replace(/\.?0+$/, "")} crore`;
  if (v >= 1e5) return `${sign}₹${(v / 1e5).toFixed(1).replace(/\.0$/, "")} lakh`;
  return `${sign}${inr(v)}`;
}
