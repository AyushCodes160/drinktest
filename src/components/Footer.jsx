import { Logo } from './Navbar';
import { BRAND, NAV_LINKS } from '../config';

const legal = ['Privacy', 'Terms', 'Contact'];
const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="relative z-20 border-t border-line bg-paper">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">Total sustenance. Pure velocity.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink/60">
          {[...NAV_LINKS, ...legal.map((l) => ({ label: l, href: '#' }))].map((l) => (
            <a key={l.label} href={l.href} className="transition-colors hover:text-ink">{l.label}</a>
          ))}
        </nav>
      </div>
      <div className="mx-auto max-w-7xl border-t border-line px-5 py-6 text-xs text-ink/40 md:px-8">
        <p>© {YEAR} {BRAND}. All rights reserved. These statements have not been evaluated by the FDA.</p>
      </div>
    </footer>
  );
}
