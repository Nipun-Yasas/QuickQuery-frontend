"use client";

import { useEffect, useState } from "react";
import { Features } from "./components/landing/Features";
import { Stat } from "./components/landing/Stat";
import { Testimonial } from "./components/landing/Testimonial";
import { HowItWorks } from "./components/landing/HowItWorks";
import { Footer } from "./components/landing/Footer";
import { Navigation } from "./components/landing/Navigation";
import Antigravity from "./components/landing/Antigravity";
import QuickQuery from "./QuickQuery";
import { Show,UserAvatar } from '@clerk/nextjs'


export default function Home() {
  const [width, setWidth] = useState(1200);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = width < 768;

  return (
    <div className="">

      <Show when="signed-in">
        <QuickQuery/>
      </Show>

      <Show when="signed-out">
        <Navigation />
        <Antigravity
        count={isMobile ? 100 : 300}
        magnetRadius={6}
        ringRadius={isMobile ? 1 : 7}
        waveSpeed={0.4}
        waveAmplitude={1}
        particleSize={isMobile ? 1 : 1.5}
        lerpSpeed={0.05}
        color="#1659e9"
        autoAnimate
        particleVariance={1}
        rotationSpeed={0}
        depthFactor={1}
        pulseSpeed={3}
        particleShape="capsule"
        fieldStrength={10}
        className="flex items-center justify-center flex-col pt-24 sm:pt-24 md:pt-12 lg:pt-28 px-4 sm:px-6 md:px-12 lg:px-12 w-full max-w-7xl mx-auto"
      >
        <h2 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-4xl sm:text-5xl lg:text-7xl mb-4 py-4 sm:py-4 md:py-10 relative z-20 font-bold tracking-tight">
          Chat with Your <br /> Documents Instantly
        </h2>
        <p className="text-sm md:text-lg text-textPrimary text-center mb-8">
          Unlock insights from your PDFs with AI-powered search. Upload, ask,
          and get instant, context-aware answers from your own data.
        </p>
        <Stat />
      </Antigravity>
      <Features />
      <Testimonial />
      <HowItWorks />
      <Footer />
      </Show>

      
      
    </div>
  );
}
