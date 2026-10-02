import { useEffect } from 'react';

// The scroll story always begins at the hero. Turn off the browser's scroll restoration
// (set as early as possible so a reload never jumps mid-page) and pin the page to the top on
// first mount and when the page comes back from the back/forward cache.
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

export default function useStartAtTop() {
  useEffect(() => {
    const toTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    toTop();
    const onPageShow = (e) => {
      if (e.persisted) toTop();
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);
}
