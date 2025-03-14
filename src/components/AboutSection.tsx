"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { IMAGES } from "@/lib/constants";

const AboutSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * i,
        duration: 0.5,
      },
    }),
  };

  const charactersVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: 0.3,
      }
    },
  };

  const swimmingAnimation = {
    x: [0, 10, 0, -10, 0],
    y: [0, -5, 0, -5, 0],
    transition: {
      duration: 8,
      repeat: Infinity,
      repeatType: "loop" as const,
      ease: "easeInOut",
    },
  };

  return (
    <section id="about" className="relative bg-primary py-20 overflow-hidden" ref={sectionRef}>
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-5xl md:text-6xl font-dion text-white mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          about
        </motion.h2>

        <div className="max-w-3xl mx-auto">
          <motion.p
            className="text-lg text-white mb-6 font-poppins"
            custom={1}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={textVariants}
          >
            Pups was born in the shed by the O.P.I.U.M holder community which pre-dated the iconic 10,001 collection we now know as Bitcoin Puppets!
            Launched on the first token standard on Bitcoin in April 2023 as a BRC20 and has migrated to the current standard, Runes.
          </motion.p>
          <motion.p
            className="text-lg text-white font-poppins"
            custom={2}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={textVariants}
          >
            Pups is a community driven memecoin started by the Bitcoin Puppets community members, and continues to be community led and managed.
          </motion.p>
        </div>
      </div>

      {/* Characters image group */}
      <div className="mt-16 relative">
        <motion.div
          className="absolute right-4 md:right-1/4 -top-20"
          variants={charactersVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <Image
            src={IMAGES.ABOUT_CHARACTERS}
            alt="PUPS Characters"
            width={500}
            height={250}
          />
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

      {/* Swimming characters in the wave */}
      <motion.div
        className="absolute bottom-8 left-16 z-10"
        animate={swimmingAnimation}
      >
        <Image
          src={IMAGES.SWIMMING_CHARACTERS}
          alt="Swimming PUPS Characters"
          width={150}
          height={80}
        />
      </motion.div>
    </section>
  );
};

export default AboutSection;
