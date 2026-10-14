import { SITE_APP_STORE_URL, SITE_PLAY_STORE_URL } from '@/lib/site';

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" aria-hidden="true">
      <path fill="currentColor" d="M3.6 1.8 13.8 12 3.6 22.2c-.4-.2-.6-.6-.6-1.1V2.9c0-.5.2-.9.6-1.1Zm11.3 11.3 2.4 2.4-11 6.3 8.6-8.7Zm3.6-3.6 2.8 1.6c.8.5.8 1.3 0 1.8l-2.8 1.6-2.6-2.5 2.6-2.5ZM6.3 2.2l11 6.3-2.4 2.4-8.6-8.7Z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" aria-hidden="true">
      <path fill="currentColor" d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.7-1-2.7-4.1ZM13.9 5c.7-.9 1.2-2 1.1-3.2-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.1 1.1.1 2.3-.6 3-1.5Z" />
    </svg>
  );
}

const base =
  'group inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-3 py-2.5 transition duration-300 sm:flex-none sm:justify-start sm:gap-3 sm:px-6 sm:py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white';

export default function StoreButtons({ className = '', placement = 'unknown' }) {
  return (
    <div className={`flex max-w-md gap-2 sm:max-w-none sm:gap-3 ${className}`}>
      <a
        href={SITE_PLAY_STORE_URL}
        data-track="app_download_click"
        data-track-store="google_play"
        data-track-placement={placement}
        target="_blank"
        rel="noopener"
        className={`${base} bg-white text-black hover:bg-[#ff3d8b] hover:text-white`}
        aria-label="Get Hash For Gamers on Google Play"
      >
        <PlayIcon />
        <span className="flex flex-col leading-none">
          <span className="whitespace-nowrap text-[8px] font-semibold uppercase tracking-[0.12em] opacity-70 sm:text-[10px] sm:tracking-[0.2em]">Get it on</span>
          <span className="whitespace-nowrap font-display text-base uppercase tracking-wide sm:text-xl">Google Play</span>
        </span>
      </a>
      <a
        href={SITE_APP_STORE_URL}
        data-track="app_download_click"
        data-track-store="app_store"
        data-track-placement={placement}
        target="_blank"
        rel="noopener"
        className={`${base} border border-white/40 text-white hover:border-white hover:bg-white hover:text-black`}
        aria-label="Get Hash For Gamers on the App Store"
      >
        <AppleIcon />
        <span className="flex flex-col leading-none">
          <span className="whitespace-nowrap text-[8px] font-semibold uppercase tracking-[0.12em] opacity-70 sm:text-[10px] sm:tracking-[0.2em]">Get it on</span>
          <span className="whitespace-nowrap font-display text-base uppercase tracking-wide sm:text-xl">App Store</span>
        </span>
      </a>
    </div>
  );
}
