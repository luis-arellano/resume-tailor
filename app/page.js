import { Suspense } from 'react'
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import FeaturesAccordion from "@/components/FeaturesAccordion";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import VideoDemo from "@/components/VideoDemo";

export default function Home() {
  return (
    <>
    <div className='dotted-grid'>
      <Suspense>
        <Header />
      </Suspense>
      <main >
        <Hero />
        <Problem />
        <VideoDemo />
        <Pricing />
        {/* <FeaturesAccordion /> */}
        {/* <Pricing />
        <FAQ />
        <CTA /> */}
      </main>
      <Footer />
    </div>
    </>
  );
}
