"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { IMAGES, EXTERNAL_LINKS } from "@/lib/constants";

const HeroSection = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Animation variants
  const cloudVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut",
      },
    },
  };

  const floatingCharacterVariants = {
    animate: {
      y: [0, -5, 0],
      rotate: [-2, 2, -2],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut",
      },
    },
  };

  const buttonHoverVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)",
      transition: {
        duration: 0.3,
      },
    },
  };

  const handleJoinWhitelist = () => {
    if (!inviteCode.trim()) {
      alert("Please enter your invite code");
      return;
    }
    window.open(`${EXTERNAL_LINKS.TELEGRAM_BOT}${inviteCode.trim()}`, "_blank");
  };

  return (
    <section className="relative min-h-[500px] md:min-h-[600px] pt-10 pb-16 bg-pups-blue overflow-hidden">
      {/* Clouds */}
      <motion.div
        className="absolute top-20 left-20 opacity-90"
        variants={cloudVariants}
        animate="animate"
        custom={0}
      >
        <Image
          src={IMAGES.CLOUD_1}
          alt="Cloud"
          width={200}
          height={120}
        />
      </motion.div>
      <motion.div
        className="absolute top-40 right-40 opacity-90"
        variants={cloudVariants}
        animate="animate"
        custom={1}
        style={{ animationDelay: "1s" }}
      >
        <Image
          src={IMAGES.CLOUD_2}
          alt="Cloud"
          width={150}
          height={90}
        />
      </motion.div>
      <motion.div
        className="absolute top-80 right-1/4 opacity-80"
        variants={cloudVariants}
        animate="animate"
        custom={2}
        style={{ animationDelay: "2s" }}
      >
        <Image
          src={IMAGES.CLOUD_3}
          alt="Cloud"
          width={120}
          height={70}
        />
      </motion.div>

      {/* Green hill at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-20 md:h-32 bg-primary rounded-t-[50%]"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between">
        {/* Left side: Pups Character */}
        <motion.div
          className="w-full md:w-1/2 flex justify-center md:justify-start mb-8 md:mb-0"
          initial={{ opacity: 0, x: -100 }}
          animate={isMounted ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="relative w-[280px] sm:w-[320px] md:w-[350px]"
            animate={{
              rotate: [0, 5, 0, -5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut"
            }}
          >
            <Image
              src={IMAGES.HERO_CHARACTER}
              alt="PUPS Character"
              width={350}
              height={350}
              className="w-full h-auto"
              priority
            />
          </motion.div>
        </motion.div>

        {/* Right side: Text and CTA */}
        <motion.div
          className="w-full md:w-1/2 text-center md:text-left px-4 sm:px-0"
          initial={{ opacity: 0, x: 100 }}
          animate={isMounted ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-dion mb-2 text-white"
            initial={{ y: 20 }}
            animate={isMounted ? { y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            pups bot
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl md:text-2xl mb-6 md:mb-8 text-white font-poppins"
            initial={{ opacity: 0 }}
            animate={isMounted ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            The first advanced TG trading bot for Runes
          </motion.p>

          <motion.div
            className="flex flex-col items-center md:items-start gap-3 md:gap-4 max-w-[320px] sm:max-w-[400px] mx-auto md:mx-0"
            initial={{ opacity: 0, y: 20 }}
            animate={isMounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter your invite code"
              className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-full bg-white/10 border-2 border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-all text-base sm:text-lg"
            />
            <motion.div variants={buttonHoverVariants} whileHover="hover" whileTap={{ scale: 0.95 }} className="w-full">
              <Button 
                onClick={handleJoinWhitelist}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold"
              >
                Join Whitelist
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating character in water */}
      <motion.div
        className="absolute bottom-0 right-20 hidden md:block"
        variants={floatingCharacterVariants}
        animate="animate"
      >
        <Image
          src={IMAGES.FLOATING_CHARACTER}
          alt="PUPS Character in water"
          width={80}
          height={80}
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;
