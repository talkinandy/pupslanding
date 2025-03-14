"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FEATURES } from "@/lib/constants";
import Image from "next/image";
import { useState } from "react";
import { EXTERNAL_LINKS } from "@/lib/constants";

export default function Home() {
  const [inviteCode, setInviteCode] = useState("");

  const handleJoinWhitelist = () => {
    if (!inviteCode.trim()) {
      alert("Please enter your invite code");
      return;
    }
    window.open(`${EXTERNAL_LINKS.TELEGRAM_BOT}${inviteCode.trim()}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary w-full h-16 flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-2">
              <span className="text-primary text-xl font-bold">P</span>
            </div>
            <span className="text-3xl font-dion text-white">
              pups bot
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/#features"
            className="text-white hover:text-gray-200 transition font-poppins"
          >
            Features
          </Link>
        </nav>
      </header>
      
      {/* Hero Section with direct image */}
      <section className="relative min-h-[600px] md:min-h-[700px] pt-10 pb-16 bg-[#0574f9] overflow-hidden">
        {/* Clouds */}
        <div className="absolute top-20 left-20 opacity-90">
          <Image
            src="/images/cloud-1.svg"
            alt="Cloud"
            width={200}
            height={120}
            className="opacity-80"
          />
        </div>
        <div className="absolute top-40 right-40 opacity-90">
          <Image
            src="/images/cloud-2.svg"
            alt="Cloud"
            width={150}
            height={90}
            className="opacity-80"
          />
        </div>
        <div className="absolute top-80 right-1/4 opacity-80">
          <Image
            src="/images/cloud-3.svg"
            alt="Cloud"
            width={120}
            height={70}
            className="opacity-80"
          />
        </div>

        {/* Green hill at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 md:h-36 bg-primary rounded-t-[50%] transform translate-y-1"></div>

        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between pt-10">
          {/* Left side: Pups Character */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-start mb-10 md:mb-0">
            <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px]">
              <Image 
                src="/images/image.png" 
                alt="PUPS Character" 
                fill
                className="object-contain transform hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
          </div>

          {/* Right side: Text and CTA */}
          <div className="w-full md:w-1/2 text-center md:text-left z-10">
            <h1 className="text-6xl md:text-7xl font-dion mb-4 text-white drop-shadow-lg">
              pups bot
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-white font-poppins drop-shadow">
              The first advanced Runes Telegram trading bot for Odin!
            </p>

            {/* Desktop form */}
            <div className="hidden md:flex flex-col items-center md:items-start gap-6">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter your invite code"
                className="w-full max-w-md px-6 py-4 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-all shadow-lg"
              />
              <div className="w-full max-w-md">
                <Button 
                  onClick={handleJoinWhitelist}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-6 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Join Whitelist
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating character in water */}
        <div className="absolute bottom-0 left-0 right-0 hidden md:block">
          <Image
            src="/images/floating-character.svg"
            alt="Floating Character"
            width={1440}
            height={200}
            className="transform -translate-y-12 animate-float opacity-90 hover:scale-105 transition-transform duration-300"
            style={{ objectFit: 'contain' }}
          />
        </div>
      </section>
      
      {/* Mobile Sticky Form */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0574f9]/95 backdrop-blur-md p-4 shadow-lg md:hidden z-50">
        <div className="flex flex-col gap-3 max-w-md mx-auto">
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="Enter your invite code"
            className="w-full px-4 py-3 rounded-full bg-white/10 border-2 border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-all shadow-lg"
          />
          <Button 
            onClick={handleJoinWhitelist}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-full text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Join Whitelist
          </Button>
        </div>
      </div>
      
      {/* Features Section */}
      <section id="features" className="relative bg-primary py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl md:text-6xl font-dion text-white mb-16 text-center">
            features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => {
              // Define emojis for each feature
              const emojis: Record<string, string> = {
                "Instant Rune Trading": "⚡",
                "Portfolio Tracking": "📊",
                "Market Analysis": "📈",
                "Automated Trading": "🤖",
                "Instant Deposit & Withdrawal": "💰",
                "Runes Data Insights": "🔍"
              };
              
              return (
                <div
                  key={feature.title}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 mb-4 relative flex items-center justify-center">
                      <div className="w-full h-full bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-4xl" role="img" aria-label={feature.title}>
                          {emojis[feature.title]}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2 font-poppins">
                      {feature.title}
                    </h3>
                    <p className="text-white/80 font-poppins">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add padding at the bottom to account for sticky form on mobile */}
        <div className="h-32 md:h-0"></div>

        {/* Wavy divider at bottom */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="w-full">
            <path
              fill="#0574f9"
              fillOpacity="1"
              d="M0,32L60,42.7C120,53,240,75,360,74.7C480,75,600,53,720,48C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"
            ></path>
          </svg>
        </div>
      </section>
    </main>
  );
}
