'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { track } from '@/lib/analytics';
import { SITE_EMAIL, SITE_URL } from '@/lib/site';

const CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Surat',
  'Jaipur', 'Lucknow', 'Indore', 'Nagpur', 'Chandigarh', 'Noida', 'Gurugram', 'Kochi', 'Bhopal',
  'Vadodara', 'Nashik', 'Thane', 'Navi Mumbai', 'Coimbatore', 'Visakhapatnam', 'Patna', 'Guwahati',
];

const STATUSES = [
  { id: 'running', label: 'Already running' },
  { id: 'opening', label: 'Opening soon' },
  { id: 'franchise', label: 'Want a franchise' },
];

const field =
  'w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-[#ff3d8b] focus:bg-white/[0.09]';
const label = 'font-tech mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/60';

// Lead form for cafe owners. Posts to FormSubmit, which emails the onboarding inbox and then
// redirects back here with ?submitted=1 to show the thank-you state.
export default function CafeLeadForm() {
  const [status, setStatus] = useState('running');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('submitted') === '1') setDone(true);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/70 p-6 shadow-[0_40px_120px_rgba(255,61,139,0.25)] backdrop-blur-xl sm:p-8">
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-10 text-center"
            role="status"
          >
            <CheckCircle2 className="mx-auto text-[#16ff7a]" size={56} aria-hidden="true" />
            <h2 className="mt-5 font-display text-4xl uppercase text-white">Request received</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/70">
              The Hash onboarding team will contact you shortly. Questions in the meantime? Write to{' '}
              <a href={`mailto:${SITE_EMAIL}`} className="text-[#ff9a3d] underline underline-offset-4">
                {SITE_EMAIL}
              </a>
              .
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            action={`https://formsubmit.co/${SITE_EMAIL}`}
            method="POST"
            onSubmit={() => track('cafe_lead_submit', { status })}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            <div>
              <h2 className="font-display text-4xl uppercase leading-none text-white">Request a callback</h2>
              <p className="mt-2 text-sm text-white/60">Two minutes. We&apos;ll call you to get your cafe live.</p>
            </div>

            <input type="hidden" name="_subject" value="New cafe listing request" />
            <input type="hidden" name="_template" value="table" />
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_next" value={`${SITE_URL}/list-cafe?submitted=1`} />
            <input type="hidden" name="cafe_status" value={STATUSES.find((s) => s.id === status).label} />
            {/* Honeypot for bots; real visitors never see or fill it */}
            <input type="text" name="_honey" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

            <fieldset>
              <legend className={label}>Your cafe is</legend>
              <div className="grid grid-cols-3 gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={status === s.id}
                    onClick={() => setStatus(s.id)}
                    className={`rounded-xl px-2 py-2.5 text-center text-xs font-semibold transition sm:text-sm ${
                      status === s.id
                        ? 'bg-gradient-to-r from-[#ff3d8b] to-[#ff9a3d] text-black'
                        : 'border border-white/15 text-white/70 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="cafeName" className={label}>Cafe name</label>
                <input id="cafeName" name="cafe_name" required autoComplete="organization" placeholder="e.g. Respawn Arena" className={field} />
              </div>
              <div>
                <label htmlFor="city" className={label}>City</label>
                <input id="city" name="city" required list="cafe-cities" autoComplete="address-level2" placeholder="Start typing" className={field} />
                <datalist id="cafe-cities">
                  {CITIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div>
                <label htmlFor="ownerName" className={label}>Your name</label>
                <input id="ownerName" name="owner_name" required autoComplete="name" placeholder="Full name" className={field} />
              </div>
              <div>
                <label htmlFor="phone" className={label}>Phone (WhatsApp)</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  pattern="^(\+91[\s-]?)?[6-9]\d{9}$"
                  title="10-digit Indian mobile number"
                  placeholder="98765 43210"
                  className={field}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="email" className={label}>Email</label>
                <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@yourcafe.com" className={field} />
              </div>
              <div>
                <label htmlFor="pcs" className={label}>Gaming PCs</label>
                <input id="pcs" name="pcs" type="number" min="0" max="500" inputMode="numeric" placeholder="0" className={field} />
              </div>
              <div>
                <label htmlFor="consoles" className={label}>Consoles</label>
                <input id="consoles" name="consoles" type="number" min="0" max="200" inputMode="numeric" placeholder="0" className={field} />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-white py-4 font-display text-2xl uppercase tracking-wide text-black transition hover:bg-[#ff3d8b] hover:text-white"
            >
              Get my cafe on Hash
            </button>
            <p className="text-center text-xs leading-5 text-white/45">
              We only use these details to contact you about listing your cafe.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
