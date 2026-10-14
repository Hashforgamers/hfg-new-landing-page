'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { animate, motion, useReducedMotion } from 'framer-motion';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import {
  CITY_TIERS,
  DEFAULT_PRICES,
  DEFAULTS,
  INTERIORS,
  ITEMS,
  PC_TIERS,
  PRICES_CHECKED,
  calculate,
  inr,
  inrShort,
} from '@/lib/calculator';
import { SITE_ONBOARD_URL } from '@/lib/site';
import { track } from '@/lib/analytics';

const COLORS = ['#ff3d8b', '#ff9a3d', '#ffd23d', '#16ff7a', '#38bdf8', '#a78bfa', '#f472b6', '#94a3b8', '#64748b'];

// Counts smoothly from the previous value to the new one whenever `value` changes.
function AnimatedNumber({ value, format = inr, className = '' }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    if (reduce) {
      setShown(value);
      from.current = value;
      return;
    }
    const controls = animate(from.current, value, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setShown(v),
    });
    from.current = value;
    return () => controls.stop();
  }, [value, reduce]);

  return <span className={`tabular-nums ${className}`}>{format(shown)}</span>;
}

function Stepper({ label, hint, value, onChange, max = 60 }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 py-4">
      <div>
        <p className="font-display text-2xl uppercase leading-none text-white">{label}</p>
        {hint && <p className="mt-1 text-xs text-white/50">{hint}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Fewer ${label}`}
          onClick={() => onChange(Math.max(0, value - 1))}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white transition hover:bg-white hover:text-black"
        >
          <Minus size={16} />
        </button>
        <span className="w-8 text-center font-display text-3xl text-white tabular-nums" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          aria-label={`More ${label}`}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition hover:bg-[#ff3d8b] hover:text-white"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

function Segmented({ label, options, value, onChange }) {
  return (
    <fieldset className="border-b border-white/10 py-4">
      <legend className="font-tech mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={value === o.id}
            onClick={() => onChange(o.id)}
            className={`rounded-full px-4 py-2 font-display text-lg uppercase tracking-wide transition ${
              value === o.id ? 'bg-[#ff3d8b] text-white' : 'border border-white/20 text-white/70 hover:text-white'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Slider({ label, value, onChange, min, max, step = 1, suffix = '', prefix = '' }) {
  const id = `calc-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <div className="border-b border-white/10 py-4">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="font-tech text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">
          {label}
        </label>
        <span className="font-display text-2xl text-white tabular-nums">
          {prefix}
          {value}
          {suffix}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-[#ff3d8b]"
      />
    </div>
  );
}

function Breakdown({ rows, total }) {
  const visible = rows.filter((r) => r.amount > 0);
  return (
    <div>
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-white/10" aria-hidden="true">
        {rows.map((r, i) => (
          <motion.div
            key={r.id}
            style={{ backgroundColor: COLORS[i % COLORS.length] }}
            animate={{ width: `${total ? (r.amount / total) * 100 : 0}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </div>
      <ul className="mt-5 space-y-2.5">
        {visible.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2.5 text-white/75">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: COLORS[rows.indexOf(r) % COLORS.length] }}
                aria-hidden="true"
              />
              {r.label}
            </span>
            <AnimatedNumber value={r.amount} className="font-semibold text-white" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Floor({ s }) {
  const seats = [
    ...Array(s.pcs).fill('#ff3d8b'),
    ...Array(s.ps5 + s.xbox).fill('#38bdf8'),
    ...Array(s.vr).fill('#a78bfa'),
    ...Array(s.rigs).fill('#ffd23d'),
  ];
  return (
    <div>
      <div className="flex min-h-[44px] flex-wrap gap-1.5">
        {seats.map((c, i) => (
          <motion.span
            key={i}
            layout
            className="h-5 w-5 rounded-[4px]"
            style={{ backgroundColor: c }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          />
        ))}
        {!seats.length && <p className="text-sm text-white/40">Add a station to start.</p>}
      </div>
      <p className="font-tech mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] uppercase tracking-[0.2em] text-white/45">
        <span><i className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-[#ff3d8b]" />PC</span>
        <span><i className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-[#38bdf8]" />Console</span>
        <span><i className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-[#a78bfa]" />VR</span>
        <span><i className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-[#ffd23d]" />Racing</span>
      </p>
    </div>
  );
}

export default function CafeCalculator() {
  const [s, setS] = useState(DEFAULTS);
  const [prices, setPrices] = useState(DEFAULT_PRICES);
  const set = (k) => (v) => setS((prev) => ({ ...prev, [k]: v }));
  const r = useMemo(() => calculate(s, prices), [s, prices]);
  const profitable = r.profit > 0;

  // Report the visitor's setup once they stop adjusting for 2s (skips the initial render).
  const touched = useRef(false);
  useEffect(() => {
    if (!touched.current) {
      touched.current = true;
      return;
    }
    const t = setTimeout(() => {
      track('calculator_used', {
        stations: r.stations,
        pcs: s.pcs,
        consoles: s.ps5 + s.xbox,
        city_tier: s.city,
        setup_cost: Math.round(r.setupTotal),
        break_even_months: r.breakEven ?? -1,
      });
    }, 2000);
    return () => clearTimeout(t);
  }, [s, prices]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        {/* Inputs */}
        <div>
          <h2 className="font-display text-4xl uppercase text-white">1. Your stations</h2>
          <Stepper label="Gaming PCs" hint="PC, monitor, keyboard, mouse, headset" value={s.pcs} onChange={set('pcs')} />
          <Segmented label="PC spec" options={PC_TIERS} value={s.pcTier} onChange={set('pcTier')} />
          <Stepper label="PlayStation 5" hint="Console, 43-inch TV, extra controller" value={s.ps5} onChange={set('ps5')} max={20} />
          <Stepper label="Xbox Series X" hint="Console, 43-inch TV, extra controller" value={s.xbox} onChange={set('xbox')} max={20} />
          <Stepper label="VR stations" hint="Standalone headset" value={s.vr} onChange={set('vr')} max={10} />
          <Stepper label="Racing rigs" hint="Wheel, cockpit, mid PC and monitor" value={s.rigs} onChange={set('rigs')} max={10} />

          <h2 className="mt-12 font-display text-4xl uppercase text-white">2. Your space</h2>
          <Segmented label="City" options={CITY_TIERS} value={s.city} onChange={set('city')} />
          <Segmented label="Interiors" options={INTERIORS} value={s.interiors} onChange={set('interiors')} />
          <Stepper label="Staff" hint="At about ₹15,000 a month each" value={s.staff} onChange={set('staff')} max={12} />

          <h2 className="mt-12 font-display text-4xl uppercase text-white">3. Your pricing</h2>
          <Slider label="PC rate per hour" value={s.rate} onChange={set('rate')} min={30} max={200} step={5} prefix="₹" />
          <Slider label="Hours open per day" value={s.hours} onChange={set('hours')} min={6} max={24} suffix=" hrs" />
          <Slider label="Seats filled on average" value={s.occupancy} onChange={set('occupancy')} min={10} max={90} step={5} suffix="%" />

          <button
            type="button"
            onClick={() => {
              setS(DEFAULTS);
              setPrices(DEFAULT_PRICES);
            }}
            className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/50 transition hover:text-white"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>

        {/* Results */}
        <div id="calc-results" className="scroll-mt-28 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-6 backdrop-blur-md sm:p-8">
            <p className="font-tech text-[11px] font-semibold uppercase tracking-[0.3em] text-[#ff9a3d]">Estimated setup cost</p>
            <p className="mt-1 bg-gradient-to-r from-[#ff3d8b] via-[#ff9a3d] to-[#ffd23d] bg-clip-text font-display text-[clamp(3rem,8vw,5.5rem)] leading-[0.95] text-transparent">
              <AnimatedNumber value={r.setupTotal} format={inrShort} />
            </p>
            <p className="mt-1 text-sm text-white/60">
              <AnimatedNumber value={r.setupTotal} /> · {r.stations} stations · about {r.sqft.toLocaleString('en-IN')} sq ft ·{' '}
              {r.acs} AC{r.acs === 1 ? '' : 's'}
            </p>

            <div className="mt-6">
              <Floor s={s} />
            </div>

            <div className="mt-8">
              <Breakdown rows={r.setup} total={r.setupTotal} />
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 border-t border-white/10 pt-6">
              <div className="rounded-xl bg-black/40 p-4">
                <p className="font-tech text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50">Monthly costs</p>
                <p className="mt-1 font-display text-3xl text-white">
                  <AnimatedNumber value={r.monthlyTotal} format={inrShort} />
                </p>
              </div>
              <div className="rounded-xl bg-black/40 p-4">
                <p className="font-tech text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50">Monthly earnings</p>
                <p className="mt-1 font-display text-3xl text-white">
                  <AnimatedNumber value={r.revenue} format={inrShort} />
                </p>
              </div>
              <div className="rounded-xl bg-black/40 p-4">
                <p className="font-tech text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50">Monthly profit</p>
                <p className={`mt-1 font-display text-3xl ${profitable ? 'text-[#16ff7a]' : 'text-[#ff6b6b]'}`}>
                  <AnimatedNumber value={r.profit} format={inrShort} />
                </p>
              </div>
              <div className="rounded-xl bg-black/40 p-4">
                <p className="font-tech text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50">Break-even</p>
                <p className="mt-1 font-display text-3xl text-white">
                  {r.breakEven ? `${r.breakEven} months` : 'Not yet'}
                </p>
              </div>
            </div>
            {!profitable && r.stations > 0 && (
              <p className="mt-4 text-sm leading-6 text-[#ff9a9a]">
                At these numbers the cafe runs at a loss. Try a higher rate, longer hours or fuller seats.
              </p>
            )}

            <a
              href={SITE_ONBOARD_URL}
              data-track="calculator_cta_click"
              data-track-cta="onboard"
              className="mt-8 block rounded-full bg-white px-8 py-3.5 text-center font-display text-xl uppercase tracking-wide text-black transition hover:bg-[#ff3d8b] hover:text-white"
            >
              Fill these seats with Hash
            </a>
            <a
              href="#franchise"
              data-track="franchise_section_click"
              data-track-placement="calculator_results"
              className="mt-3 block rounded-full bg-gradient-to-r from-[#ff3d8b] via-[#ff9a3d] to-[#ffd23d] px-8 py-3.5 text-center font-display text-xl uppercase tracking-wide text-black transition hover:brightness-110"
            >
              Get Hash franchise
            </a>
            <p className="mt-4 text-[11px] leading-5 text-white/40">
              Estimates only, not financial advice. Rent, salaries, power tariffs and demand vary a lot by location.
            </p>
          </div>
        </div>
      </div>

      {/* Phone-only running total, since the results card sits below the controls on small screens */}
      <a
        href="#calc-results"
        className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-3 rounded-full border border-white/15 bg-black/90 px-5 py-3 backdrop-blur-md lg:hidden"
      >
        <span className="font-tech text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">Setup cost</span>
        <span className="font-display text-2xl text-white">
          <AnimatedNumber value={r.setupTotal} format={inrShort} />
        </span>
        <span className={`font-display text-lg ${profitable ? 'text-[#16ff7a]' : 'text-[#ff6b6b]'}`}>
          {r.breakEven ? `${r.breakEven} mo` : 'Loss'}
        </span>
      </a>

      {/* Editable price list */}
      <section className="mt-20" aria-labelledby="prices-title">
        <h2 id="prices-title" className="font-display text-4xl uppercase text-white sm:text-5xl">
          Equipment prices
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
          Typical prices in India, last checked {PRICES_CHECKED}. Console prices in particular change often, so check
          today&apos;s price and type it in. The totals above update instantly.
        </p>
        <ul className="mt-8 grid gap-px bg-white/10 sm:grid-cols-2">
          {Object.entries(ITEMS).map(([key, item]) => (
            <li key={key} className="flex flex-wrap items-center justify-between gap-3 bg-black p-4">
              <div className="min-w-0">
                <p className="font-semibold text-white">{item.label}</p>
                <p className="text-xs text-white/50">{item.note}</p>
                <p className="font-tech mt-1.5 flex gap-3 text-[11px] font-semibold uppercase tracking-[0.15em]">
                  <a href={item.amazon} target="_blank" rel="noopener nofollow" data-track="price_check_click" data-track-retailer="amazon" data-track-item={key} className="text-[#ff9a3d] hover:text-white">
                    Amazon ↗
                  </a>
                  <a href={item.flipkart} target="_blank" rel="noopener nofollow" data-track="price_check_click" data-track-retailer="flipkart" data-track-item={key} className="text-[#38bdf8] hover:text-white">
                    Flipkart ↗
                  </a>
                </p>
              </div>
              <label className="flex items-center gap-1 rounded-lg border border-white/20 px-3 py-2 focus-within:border-[#ff3d8b]">
                <span className="text-white/50">₹</span>
                <span className="sr-only">{item.label} price in rupees</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={500}
                  value={prices[key]}
                  onChange={(e) => setPrices((p) => ({ ...p, [key]: Math.max(0, Number(e.target.value) || 0) }))}
                  className="w-24 bg-transparent text-right font-semibold text-white outline-none tabular-nums"
                />
              </label>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
