import { MotionConfig } from 'framer-motion';
import Navbar from './components/Navbar';
import ScrollProgress from './components/ScrollProgress';
import StoryLayer from './components/StoryLayer';
import Hero from './components/Hero';
import ScrollBand from './components/ScrollBand';
import NutritionBento from './components/NutritionBento';
import Ingredients from './components/Ingredients';
import Reviews from './components/Reviews';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import useSmoothScroll from './hooks/useSmoothScroll';

export default function App() {
  useSmoothScroll();

  return (
    // "user" respects the OS reduced-motion setting for every Framer Motion animation.
    <MotionConfig reducedMotion="user">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <StoryLayer />
      <ScrollProgress />
      <Navbar />
      <main id="main">
        <div id="top" />
        <Hero />
        <ScrollBand words={['Complete nutrition', 'Zero friction']} />
        <NutritionBento />
        <Ingredients />
        <ScrollBand words={['One bottle', 'Every nutrient']} />
        <Reviews />
        <FinalCTA />
      </main>
      <Footer />
    </MotionConfig>
  );
}
