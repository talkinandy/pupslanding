"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FEATURES } from "@/lib/constants";
import Image from "next/image";
import { useState, useEffect } from "react";
import { EXTERNAL_LINKS } from "@/lib/constants";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const cloudVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 0.8, 
    scale: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

const featureVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

// Components
const Header = ({ onMenuClick }: { onMenuClick: () => void }) => (
  <header className="sticky top-0 z-50 bg-primary w-full h-16 flex items-center justify-between px-4 md:px-60">
    <div className="flex items-center">
      <Link href="/" className="flex items-center">
        <div className="w-12 h-12 mr-2 relative logo-container">
          <Image
            src="/images/pups.jpeg"
            alt="PUPS Logo"
            fill
            className="object-cover rounded-full"
            priority
          />
        </div>
        <span className="text-3xl font-dion text-white">
          pups bot
        </span>
      </Link>
    </div>

    {/* Mobile Menu Button */}
    <button 
      onClick={onMenuClick}
      className="md:hidden p-2 text-white hover:bg-white/10 rounded-xl border-2 border-white/20"
      aria-label="Menu"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={2} 
        stroke="currentColor" 
        className="w-6 h-6"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" 
        />
      </svg>
    </button>

    <nav className="hidden md:flex items-center space-x-8">
      <Link
        href="/#features"
        className="text-white hover:text-gray-200 transition nav-link font-poppins"
      >
        Features
      </Link>
    </nav>
  </header>
);

const SidePanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <>
    {/* Overlay */}
    {isOpen && (
      <div 
        className="fixed inset-0 bg-black/50 z-50 md:hidden backdrop-blur-sm"
        onClick={onClose}
      />
    )}
    
    {/* Side Panel */}
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: isOpen ? 0 : '100%' }}
      transition={{ type: "spring", damping: 20 }}
      className="fixed top-0 right-0 h-full w-72 bg-[#0574f9] z-50 md:hidden border-l-4 border-white/20"
      style={{
        boxShadow: "-8px 0 20px rgba(0,0,0,0.2)"
      }}
    >
      <div className="p-4">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-xl border-2 border-white/20"
          aria-label="Close menu"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2} 
            stroke="currentColor" 
            className="w-6 h-6"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>

        {/* Menu Items */}
        <div className="mt-16 space-y-6">
          <Link
            href="/#features"
            className="block text-xl text-white hover:text-gray-200 transition nav-link font-poppins p-4 rounded-xl hover:bg-white/10 border-2 border-white/20"
            onClick={onClose}
          >
            Features
          </Link>
        
        </div>
      </div>
    </motion.div>
  </>
);

const ScrollIndicator = ({ show }: { show: boolean }) => {
  if (!show) return null;
  
  return (
    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 hidden md:block">
      <div className="flex flex-col items-center scroll-indicator">
        <span className="text-white text-sm mb-2 ">Scroll Down</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 text-white" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 14l-7 7m0 0l-7-7m7 7V3" 
          />
        </svg>
      </div>
    </div>
  );
};

const MobileForm = ({ inviteCode, setInviteCode, onSubmit }: {
  inviteCode: string;
  setInviteCode: (code: string) => void;
  onSubmit: () => void;
}) => (
  <div className="fixed bottom-0 left-0 right-0 bg-[#0574f9]/95 backdrop-blur-md p-4 shadow-lg md:hidden z-50 transition-all duration-300">
    <div className="flex flex-col gap-3 max-w-md mx-auto">
      <div className="relative">
        <input
          type="text"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="Enter your invite code"
          className="w-full px-4 py-3 rounded-full bg-white/80 placeholder-black box-shadow-[0_0_10px_rgba(0,0,0,0.1)] border-[1.5px] border-[#222] text-white placeholder-white/50 focus:outline-none focus:border-[#222]/80 transition-all font-poppins transform hover:-translate-y-1"
          style={{
            boxShadow: "0 6px 0 rgba(255,255,255,0.1)",
          }}
        />
      </div>
      <div className="relative">
        <Button 
          onClick={onSubmit}
          className="w-full bg-[#da57c7] hover:bg-[#c44eb3] text-white px-4 py-3 rounded-full text-base font-poppins font-semibold border-[1.5px] border-[#222] hover:border-[#222]/80 transform hover:-translate-y-1 transition-all duration-300 btn-pulse"
          style={{
            boxShadow: "0 6px 0 rgba(0,0,0,0.1), 0 0 0 2px rgba(0,0,0,0.1)",
          }}
        >
          Join Whitelist
        </Button>
      </div>
    </div>
  </div>
);

const FeatureCard = ({ title, description }: { title: string; description: string }) => {
  const emojis: Record<string, string> = {
    "Instant Rune Trading": "⚡",
    "Portfolio Tracking": "📊",
    "Market Analysis": "📈",
    "Automated Trading": "🤖",
    "Instant Deposit & Withdrawal": "💰",
    "Runes Data Insights": "🔍"
  };

  // Map each feature to a specific color
  const bgColors: Record<string, string> = {
    "Instant Rune Trading": 'bg-[#FF3D9A]', // Hot Pink
    "Portfolio Tracking": 'bg-[#00E1FF]',    // Cyan
    "Market Analysis": 'bg-[#FF9B3D]',       // Orange
    "Automated Trading": 'bg-[#FFD600]',     // Yellow
    "Instant Deposit & Withdrawal": 'bg-[#B14EFF]', // Purple
    "Runes Data Insights": 'bg-[#FF5C5C]'    // Coral
  };

  return (
    <motion.div 
      variants={featureVariants}
      viewport={{ once: true, margin: "-100px" }}
      className={`${bgColors[title]} rounded-3xl p-6 2xl:p-10 border-[6px] border-white transition-all duration-300 feature-card transform hover:-translate-y-2 hover:scale-105`}
      style={{
        boxShadow: "12px 12px 0 rgba(0,0,0,0.2)",
      }}
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 2xl:w-28 2xl:h-28 mb-6 2xl:mb-8 relative flex items-center justify-center">
          <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center relative border-[6px] border-[#222] transform transition-transform duration-300 hover:rotate-6 hover:scale-110">
            <span className="text-4xl 2xl:text-6xl emoji-hover transform transition-transform duration-300 hover:scale-110 hover:rotate-12" role="img" aria-label={title}>
              {emojis[title]}
            </span>
          </div>
        </div>
        <h3 className="text-xl 2xl:text-3xl text-white mb-3 2xl:mb-5 feature-title font-poppins font-black tracking-wide">
          {title}
        </h3>
        <p className="text-white/90 2xl:text-xl feature-description font-poppins font-medium">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default function Home() {
  const [inviteCode, setInviteCode] = useState("");
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollIndicator(window.scrollY <= 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleJoinWhitelist = () => {
    if (!inviteCode.trim()) {
      toast.error("Please enter your invite code");
      return;
    }
    const encodedInviteCode = encodeURIComponent(` ${inviteCode.trim()}`);
    window.open(`${EXTERNAL_LINKS.TELEGRAM_BOT}${encodedInviteCode}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-primary">
      <Header onMenuClick={() => setIsSidePanelOpen(true)} />
      <SidePanel 
        isOpen={isSidePanelOpen} 
        onClose={() => setIsSidePanelOpen(false)} 
      />
      
      {/* Hero Section */}
      <section className="relative min-h-[600px] md:min-h-[700px] 2xl:min-h-[900px] pt-10 pb-16 2xl:pt-20 2xl:pb-32 bg-[#0574f9] overflow-hidden">
        {/* Decorative Clouds */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Cloud Group 1 - Top Left */}
          <motion.div variants={cloudVariants} className="absolute top-4 left-6 md:top-14 md:left-20 2xl:top-32 2xl:left-60">
            <Image 
              src="/images/cloud-1.png" 
              alt="Cloud" 
              width={200}
              height={200}
              className="w-[120px] md:w-[180px] 2xl:w-[240px] h-auto animate-float"
            />
          </motion.div>

          {/* Cloud Group 2 - Top Right */}
          <motion.div variants={cloudVariants} className="absolute top-16 right-4 md:top-32 md:right-32 2xl:top-60 2xl:right-80">
            <Image 
              src="/images/cloud-4.png" 
              alt="Cloud" 
              width={120}
              height={80}
              className="w-[70px] md:w-[120px] 2xl:w-[180px] h-auto animate-float"
              style={{ animationDelay: '1s' }}
            />
          </motion.div>

          {/* Cloud Group 3 - Middle Left */}
          <motion.div variants={cloudVariants} className="absolute top-32 left-12 md:top-20 md:left-1/4 2xl:top-80">
            <Image 
              src="/images/cloud-3.png" 
              alt="Cloud" 
              width={100}
              height={100}
              className="w-[100px] md:w-[150px] 2xl:w-[200px] h-auto animate-float"
              style={{ animationDelay: '1.5s' }}
            />
          </motion.div>

          {/* Cloud Group 4 - Middle Right */}
          <motion.div variants={cloudVariants} className="absolute top-48 right-6 md:top-30 md:right-1/4 2xl:top-96">
            <Image 
              src="/images/cloud-3.png" 
              alt="Cloud" 
              width={120}
              height={80}
              className="w-[75px] md:w-[90px] 2xl:w-[140px] h-auto animate-float"
              style={{ animationDelay: '0.5s' }}
            />
          </motion.div>

          {/* Cloud Group 5 - Bottom Left */}
          <motion.div variants={cloudVariants} className="absolute top-64 left-8 md:top-50 md:left-1/3 2xl:top-[350px]">
            <Image 
              src="/images/cloud-4.png" 
              alt="Cloud" 
              width={100}
              height={60}
              className="w-[85px] md:w-[110px] 2xl:w-[160px] h-auto animate-float"
              style={{ animationDelay: '2s' }}
            />
          </motion.div>

          {/* Cloud Group 6 - Bottom Right */}
          <motion.div variants={cloudVariants} className="absolute top-72 right-8 md:top-50 md:right-1/3 2xl:top-[400px]">
            <Image 
              src="/images/cloud-1.png" 
              alt="Cloud" 
              width={100}
              height={50}
              className="w-[60px] md:w-[100px] 2xl:w-[150px] h-auto animate-float"
              style={{ animationDelay: '2.5s' }}
            />
          </motion.div>

          <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 2xl:h-36 bg-primary rounded-t-[50%] transform translate-y-1"></div>
        </motion.div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 2xl:max-w-[1800px] relative z-10 flex flex-col md:flex-row items-center justify-between pt-6 md:pt-10 2xl:pt-20">
          {/* Left Column */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full md:w-1/2 flex justify-center md:justify-start mb-6 md:mb-0"
          >
            <div className="relative w-[250px] h-[250px] md:w-[400px] md:h-[400px] 2xl:w-[600px] 2xl:h-[600px]">
              <Image 
                src="/images/image.png" 
                alt="PUPS Character" 
                fill
                className="object-contain transform hover:scale-105 transition-transform duration-300 mix-blend-color-dodge"
                priority
              />
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="w-full md:w-1/2 text-center md:text-left z-10"
          >
            <h1 className="text-5xl md:text-7xl 2xl:text-9xl font-dion mb-3 md:mb-4 2xl:mb-8 text-white font-outline-1">
              pups bot
            </h1>
            <p className="text-lg md:text-2xl 2xl:text-4xl mb-8 md:mb-10 2xl:mb-16 text-white font-dion hero-text">
              The first advanced Runes Telegram trading bot for Odin!
            </p>

            {/* Desktop Form */}
            <div className="hidden md:flex flex-col items-center md:items-start gap-4 md:gap-6 2xl:gap-8">
              <div className="w-full max-w-md 2xl:max-w-2xl relative">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Enter your invite code"
                  className="w-full px-6 py-4 2xl:px-8 2xl:py-6 rounded-2xl bg-white/80 placeholder-black box-shadow-[0_0_10px_rgba(0,0,0,0.1)] border-[1.5px] border-[#222] text-white placeholder-white/50 focus:outline-none focus:border-[#222]/80 transition-all 2xl:text-2xl font-poppins transform hover:-translate-y-1"
                  style={{
                    boxShadow: "0 8px 0 rgba(255,255,255,0.1)",
                  }}
                />
              </div>
              <div className="w-full max-w-md 2xl:max-w-2xl relative">
                <Button 
                  onClick={handleJoinWhitelist}
                  className="w-full bg-[#da57c7] hover:bg-[#c44eb3] text-white px-6 py-6 2xl:px-8 2xl:py-8 rounded-2xl text-lg 2xl:text-2xl font-poppins font-semibold border-[1.5px] border-[#222] hover:border-[#222]/80 transform hover:-translate-y-1 transition-all duration-300 btn-pulse"
                  style={{
                    boxShadow: "0 8px 0 rgba(255,255,255,0.1)",
                  }}
                >
                  Join Whitelist
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Character */}
        <div className="absolute -bottom-0 2xl:-bottom-[150px] left-0 right-0 hidden md:block overflow-hidden pointer-events-none">
          <div className="relative w-full h-[400px] 2xl:h-[600px]">
            <Image
              src="/images/floating-character.svg"
              alt="Floating Character"
              fill
              className="object-contain object-bottom animate-float opacity-90"
              priority
            />
          </div>
        </div>
        
        <ScrollIndicator show={showScrollIndicator} />
      </section>
      
      <MobileForm 
        inviteCode={inviteCode}
        setInviteCode={setInviteCode}
        onSubmit={handleJoinWhitelist}
      />
      
      {/* Features Section */}
      <section id="features" className="relative bg-primary py-20 2xl:py-32 overflow-hidden">
        <div className="container mx-auto px-4 2xl:max-w-[1800px]">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl 2xl:text-8xl font-dion text-white mb-16 2xl:mb-24 text-center text-shadow-lg"
          >
            features
          </motion.h2>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 2xl:gap-12"
          >
            {FEATURES.map((feature) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Wave Divider */}
      <div className="w-full">
        <svg 
          viewBox="0 0 1440 140" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-auto -mb-1"
        >
          <path 
            fill="#0574f9"
            fillOpacity="1"
            d="M0,128L48,122.7C96,117,192,107,288,85.3C384,64,480,32,576,37.3C672,43,768,85,864,96C960,107,1056,85,1152,80C1248,75,1344,85,1392,90.7L1440,96L1440,140L1392,140C1344,140,1248,140,1152,140C1056,140,960,140,864,140C768,140,672,140,576,140C480,140,384,140,288,140C192,140,96,140,48,140L0,140Z"
          ></path>
        </svg>
      </div>

      {/* Footer */}
      <footer className="bg-primary py-8 pb-36 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <span className="text-white/70 text-sm md:text-base">Powered by</span>
              <Image 
                src="/images/lokalabs_logo.png"
                alt="Loka Labs Logo"
                width={100}
                height={30}
                className="h-6 md:h-8 w-auto"
              />
            </div>
            <p className="text-white/50 text-xs md:text-sm text-center">
              © {new Date().getFullYear()} PUPS & Loka Labs. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
