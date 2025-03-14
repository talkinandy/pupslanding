"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { IMAGES } from "@/lib/constants";

const TokenomicsSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });

  const fishAnimation = {
    x: [0, 100, 0],
    transition: {
      duration: 20,
      repeat: Infinity,
      repeatType: "loop" as const,
      ease: "linear",
    },
  };

  const pieChartVariants = {
    hidden: { opacity: 0, rotate: -90, scale: 0.8 },
    visible: {
      opacity: 1,
      rotate: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 15,
        duration: 0.8,
      }
    },
  };

  return (
    <section id="tokenomics" className="relative bg-primary py-20 overflow-hidden" ref={sectionRef}>
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-5xl md:text-6xl font-dion text-white mb-16 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          tokenomics
        </motion.h2>

        <motion.div
          className="flex justify-center"
          variants={pieChartVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px]">
            <Image
              src={IMAGES.PIE_CHART}
              alt="Tokenomics Pie Chart"
              fill
              style={{ objectFit: "contain" }}
            />

            {/* Add hover effect to pie chart sections */}
            <motion.div
              className="absolute inset-0 bg-transparent z-10 rounded-full cursor-pointer"
              whileHover={{
                boxShadow: "0 0 20px rgba(255,255,255,0.3)",
                transition: { duration: 0.3 }
              }}
            />
          </div>
        </motion.div>
      </div>

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

      {/* Fish characters in the wave */}
      <motion.div
        className="absolute bottom-4 right-20 z-10"
        animate={fishAnimation}
      >
        <Image
          src={IMAGES.FISH_CHARACTER}
          alt="Fish PUPS Characters"
          width={200}
          height={50}
        />
      </motion.div>
    </section>
  );
};

export default TokenomicsSection;
