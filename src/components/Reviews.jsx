import { Star } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { REVIEWS } from '../config';

function ReviewCard({ review }) {
  const initials = review.name.split(' ').map((p) => p[0]).join('');
  return (
    <figure className="w-[300px] shrink-0 rounded-2xl border border-ink/10 bg-white/70 p-6 sm:w-[360px] sm:bg-white/70">
      <div className="flex gap-0.5 text-accent" aria-label="5 out of 5 stars">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} size={15} fill="currentColor" strokeWidth={0} />
        ))}
      </div>
      <blockquote className="mt-4 text-[15px] leading-relaxed text-ink/90">“{review.text}”</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-accent to-caramel text-xs font-bold text-paper">
          {initials}
        </span>
        <span>
          <span className="block text-sm font-semibold">{review.name}</span>
          <span className="block text-xs text-muted">{review.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

function MarqueeRow({ items, reverse = false, duration = '50s' }) {
  // The list is rendered twice so translating by -50% loops seamlessly.
  return (
    <div className="group flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      <div
        className={`flex w-max gap-5 pr-5 group-hover:[animation-play-state:paused] ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}
        style={{ '--marquee-duration': duration }}
      >
        {[...items, ...items].map((r, i) => (
          <div key={i} aria-hidden={i >= items.length}>
            <ReviewCard review={r} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Reviews() {
  const half = Math.ceil(REVIEWS.length / 2);
  return (
    <section id="reviews" className="scroll-mt-20 overflow-hidden py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Early testers"
          title="Fewer decisions. Better fuel."
          subtitle="What our beta group said after four weeks of replacing one meal a day with ALXR."
        />
        <div className="mt-8 flex items-center justify-center gap-3 text-sm text-muted">
          <span className="flex gap-0.5 text-accent">
            {Array.from({ length: 5 }, (_, i) => <Star key={i} size={16} fill="currentColor" strokeWidth={0} />)}
          </span>
          <span><strong className="text-ink">4.9 / 5</strong> average from beta testers</span>
        </div>
      </div>

      <div className="mt-14 space-y-5">
        <MarqueeRow items={REVIEWS.slice(0, half)} duration="55s" />
        <MarqueeRow items={REVIEWS.slice(half)} reverse duration="60s" />
      </div>
    </section>
  );
}
