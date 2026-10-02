import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import Button from './ui/Button';
import { BRAND, NAV_LINKS } from '../config';

export function Logo() {
  return (
    <a href="#top" className="font-wide flex items-center gap-2.5 text-lg font-extrabold tracking-[0.22em] text-titanium">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M9 24 L16 8 L23 24" fill="none" stroke="var(--color-accent)" strokeWidth="3.2" strokeLinejoin="round" />
        <path d="M12.2 18.5h7.6" stroke="var(--color-titanium)" strokeWidth="2.4" />
      </svg>
      {BRAND}
    </a>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open ? 'border-b border-line bg-ink/75 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-18 md:px-8" aria-label="Main">
        <Logo />

        <ul className="hidden items-center gap-9 text-sm text-white/70 md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="transition-colors hover:text-white">{l.label}</a>
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          <Button href="#waitlist" className="px-5 py-2.5">Pre-order</Button>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-full border border-line md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-line px-5 pt-4 pb-6 md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-white/80 hover:bg-white/5">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <Button href="#waitlist" onClick={() => setOpen(false)} className="mt-4 w-full">Pre-order</Button>
        </div>
      )}
    </header>
  );
}
