import { useEffect } from 'react';
import { story } from '../three/story';

// Maps the page's scroll position onto the 3D storyline. Each element marked
// data-story="N" is a waypoint: story.s reaches N when that section arrives on screen,
// and moves smoothly in between. Waypoints are re-measured whenever the layout changes,
// so the timing stays right on every screen size.
export default function useStoryTracker() {
  useEffect(() => {
    let marks = [0];

    const update = () => {
      const y = window.scrollY;
      let s = 0;
      for (let i = 0; i < marks.length - 1; i++) {
        if (y >= marks[i]) s = i + Math.min(1, (y - marks[i]) / Math.max(1, marks[i + 1] - marks[i]));
      }
      story.s = s;
    };

    const measure = () => {
      const vh = window.innerHeight;
      const maxScroll = document.documentElement.scrollHeight - vh;
      const els = [...document.querySelectorAll('[data-story]')].sort((a, b) => a.dataset.story - b.dataset.story);
      marks = els.map((el, i) => {
        const r = el.getBoundingClientRect();
        const top = r.top + window.scrollY;
        if (i === 0) return 0;
        // The last waypoint is reached when its section is centered (or the page ends).
        if (i === els.length - 1) return Math.min(maxScroll, top + r.height / 2 - vh / 2);
        // Others kick in as the section rises into the lower part of the screen.
        return Math.min(maxScroll, top - vh * 0.3);
      });
      update();
    };

    const onPointer = (e) => {
      story.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      story.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };

    const resize = new ResizeObserver(measure);
    resize.observe(document.body);
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    measure();

    return () => {
      resize.disconnect();
      window.removeEventListener('scroll', update);
      window.removeEventListener('pointermove', onPointer);
    };
  }, []);
}
