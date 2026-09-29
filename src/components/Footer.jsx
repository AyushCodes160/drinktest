import { Logo } from './Navbar';
import { BRAND, NAV_LINKS } from '../config';

const legal = ['Privacy', 'Terms', 'Contact'];
const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="border-t border-line bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">Complete nutrition. Zero friction.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/60">
          {[...NAV_LINKS, ...legal.map((l) => ({ label: l, href: '#' }))].map((l) => (
            <a key={l.label} href={l.href} className="transition-colors hover:text-white">{l.label}</a>
          ))}
        </nav>
      </div>
      <div className="mx-auto max-w-7xl border-t border-line px-5 py-6 text-xs text-white/40 md:px-8">
        <p>© {YEAR} {BRAND}. All rights reserved. These statements have not been evaluated by the FDA.</p>
      </div>
    </footer>
  );
}
