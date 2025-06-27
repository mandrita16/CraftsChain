"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/dist/ScrollTrigger"
import Navbar from "@/components/navbar"
import HeroSection from "@/components/hero-section"
import ArtisanJourney from "@/components/artisan-journey"
import ProductShowcase from "@/components/product-showcase"
import BlockchainFlow from "@/components/blockchain-flow"
import NFTMintSection from "@/components/nft-mint-section"
import Footer from "@/components/footer"
import InkRevealSection from "@/components/ink-reveal-section"
import MeetOurArtisans from "@/components/meet-our-artisans"
import BengalDao from "@/components/bengal-dao"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export default function Home() {
  const mainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize smooth scrolling
    const ctx = gsap.context(() => {
      // Set up any global animations here
      ScrollTrigger.refresh()
    }, mainRef)

    return () => ctx.revert() // Clean up animations on unmount
  }, [])

  return (
    <div ref={mainRef} className="bg-[#0a0a0a] text-white overflow-hidden">
      <Navbar />
      <HeroSection />
      <InkRevealSection />
      <ArtisanJourney />
      <ProductShowcase />
      <BlockchainFlow />
      <BengalDao />
      <MeetOurArtisans />
      <NFTMintSection />
      <Footer />
    </div>
  )
}
