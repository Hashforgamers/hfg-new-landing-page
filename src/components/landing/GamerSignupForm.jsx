'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { track } from '@/lib/analytics';
import { SITE_EMAIL, SITE_URL } from '@/lib/site';

const inputClass =
  'w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-[#ff3d8b] focus:bg-white/[0.09]';
const labelClass = 'font-tech mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/60';

export default function GamerSignupForm() {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('signup_submitted') !== '1') return;

    setSubmitted(true);
    params.delete('signup_submitted');
    const query = params.toString();
    const cleanUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
    window.history.replaceState(window.history.state, '', cleanUrl);
  }, []);

  if (submitted) {
    return (
      <div className="rounded-2xl border border-white/15 bg-black/70 p-8 text-center shadow-[0_40px_120px_rgba(255,61,139,0.2)] sm:p-10" role="status">
        <CheckCircle2 className="mx-auto text-[#16ff7a]" size={52} aria-hidden="true" />
        <h3 className="mt-5 font-display text-4xl uppercase text-white">You&apos;re on the list</h3>
        <p className="mt-3 text-sm leading-6 text-white/70">Thanks for signing up. We&apos;ll be in touch with Hash updates.</p>
      </div>
    );
  }

  return (
    <form
      action={`https://formsubmit.co/${SITE_EMAIL}`}
      method="POST"
      onSubmit={(event) => {
        if (!event.currentTarget.reportValidity()) {
          event.preventDefault();
          return;
        }
        track('gamer_signup_submit');
      }}
      className="rounded-2xl border border-white/15 bg-black/70 p-6 shadow-[0_40px_120px_rgba(255,61,139,0.2)] backdrop-blur-xl sm:p-8"
    >
      <input type="hidden" name="_subject" value="New Hash gamer signup" />
      <input type="hidden" name="_template" value="table" />
      <input type="hidden" name="_captcha" value="false" />
      <input type="hidden" name="_next" value={`${SITE_URL}/?signup_submitted=1`} />
      <input type="hidden" name="signup_type" value="gamer" />
      <input type="text" name="_honey" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div>
        <p className={labelClass}>Join the community</p>
        <h3 className="font-display text-4xl uppercase leading-none text-white">Get in the game</h3>
        <p className="mt-2 text-sm text-white/60">Get updates on tournaments, rewards and gaming cafes near you.</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="gamer-name" className={labelClass}>Your name</label>
          <input id="gamer-name" name="name" required autoComplete="name" maxLength={100} placeholder="Full name" className={inputClass} />
        </div>
        <div>
          <label htmlFor="gamer-city" className={labelClass}>City</label>
          <input id="gamer-city" name="city" required autoComplete="address-level2" maxLength={80} placeholder="e.g. Mumbai" className={inputClass} />
        </div>
        <div>
          <label htmlFor="gamer-email" className={labelClass}>Email</label>
          <input id="gamer-email" name="email" type="email" required autoComplete="email" maxLength={254} placeholder="you@example.com" className={inputClass} />
        </div>
        <div>
          <label htmlFor="gamer-interest" className={labelClass}>I&apos;m most interested in</label>
          <select id="gamer-interest" name="interest" defaultValue="Tournaments" className={`${inputClass} [color-scheme:dark]`}>
            <option>Tournaments</option>
            <option>Gaming cafe bookings</option>
            <option>Squads and community</option>
            <option>Rewards</option>
          </select>
        </div>
      </div>

      <button type="submit" className="mt-6 w-full rounded-full bg-white py-4 font-display text-2xl uppercase tracking-wide text-black transition hover:bg-[#ff3d8b] hover:text-white">
        Sign me up
      </button>
      <p className="mt-3 text-center text-xs leading-5 text-white/45">By signing up, you agree that Hash may contact you about the app and gaming events. You can opt out anytime.</p>
    </form>
  );
}
