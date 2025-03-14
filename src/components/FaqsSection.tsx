"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { IMAGES, EXTERNAL_LINKS } from "@/lib/constants";

const FaqsSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });

  const characterVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 60,
        duration: 0.6,
      }
    },
  };

  const faqItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2 + (i * 0.1),
        duration: 0.5,
      },
    }),
  };

  const linkHoverVariants = {
    hover: {
      scale: 1.02,
      color: "#FFFF00",
      textShadow: "0px 0px 8px rgba(255,255,0,0.5)"
    },
  };

  return (
    <section id="faqs" className="relative bg-pups-blue py-20 overflow-hidden" ref={sectionRef}>
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-start">
        {/* Left side: Character */}
        <motion.div
          className="w-full md:w-1/3 mb-10 md:mb-0 flex justify-center md:justify-start"
          variants={characterVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.div
            className="relative"
            animate={{
              rotate: [-3, 3, -3],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut"
            }}
          >
            <Image
              src={IMAGES.FAQ_CHARACTER}
              alt="PUPS Character"
              width={220}
              height={300}
            />
          </motion.div>
        </motion.div>

        {/* Right side: FAQs */}
        <div className="w-full md:w-2/3">
          <motion.h2
            className="text-5xl md:text-6xl font-dion text-white mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            FAQs
          </motion.h2>

          <div className="space-y-6">
            <motion.div
              custom={0}
              variants={faqItemVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              <h3 className="text-xl font-poppins font-semibold text-white mb-2">
                1. If you have BRC-20 on Bitcoin
              </h3>
              <p className="text-white">
                <motion.span variants={linkHoverVariants} whileHover="hover">
                  <Link
                    href={EXTERNAL_LINKS.ORDKIT}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-300 hover:underline"
                  >
                    {EXTERNAL_LINKS.ORDKIT}
                  </Link>
                </motion.span> to convert to Pups World Peace
              </p>
            </motion.div>

            <motion.div
              custom={1}
              variants={faqItemVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              <h3 className="text-xl font-poppins font-semibold text-white mb-2">
                2. If you have BRC-20 on Solana
              </h3>
              <p className="text-white">
                <motion.span variants={linkHoverVariants} whileHover="hover">
                  <Link
                    href={EXTERNAL_LINKS.RUNEMINE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-300 hover:underline"
                  >
                    {EXTERNAL_LINKS.RUNEMINE}
                  </Link>
                </motion.span> to convert to Pups World Peace on SOL
              </p>
            </motion.div>

            <motion.div
              custom={2}
              variants={faqItemVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              <h3 className="text-xl font-poppins font-semibold text-white mb-2">
                3. If you want to bridge Pups World Peace from Solana &lt;&gt; Bitcoin
              </h3>
              <p className="text-white">
                <motion.span variants={linkHoverVariants} whileHover="hover">
                  <Link
                    href={EXTERNAL_LINKS.BRIDGE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-300 hover:underline"
                  >
                    {EXTERNAL_LINKS.BRIDGE}
                  </Link>
                </motion.span>
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Wavy divider at bottom */}
      <div className="absolute bottom-0 left-0 w-full">
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 100"
          className="w-full"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <path
            fill="#24ab3b"
            fillOpacity="1"
            d="M0,32L60,42.7C120,53,240,75,360,74.7C480,75,600,53,720,48C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"
          ></path>
        </motion.svg>
      </div>
    </section>
  );
};

export default FaqsSection;
