import { MotionConfig } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import NutritionBento from './components/NutritionBento';
import Ingredients from './components/Ingredients';
import Reviews from './components/Reviews';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';

export default function App() {
  return (
    // "user" respects the OS reduced-motion setting for every Framer Motion animation.
    <MotionConfig reducedMotion="user">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <div id="top" />
        <Hero />
        <NutritionBento />
        <Ingredients />
        <Reviews />
        <FinalCTA />
      </main>
      <Footer />
    </MotionConfig>
  );
}
