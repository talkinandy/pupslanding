"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { IMAGES, SOCIAL_LINKS } from "@/lib/constants";

const Footer = () => {
  const footerRef = useRef(null);
  const isInView = useInView(footerRef, { once: false, amount: 0.3 });

  return (
    <footer className="bg-primary text-white pt-8 pb-6 px-4" ref={footerRef}>
      <div className="container mx-auto">
        <div className="flex flex-col items-center">
          <motion.p
            className="text-center mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            © 2023 by PUPS. All rights reserved!
          </motion.p>

          <motion.div
            className="max-w-3xl text-sm text-center opacity-80"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 0.8 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p>
              Legal Disclaimer: $PUPS is a meme coin with no intrinsic value or expectation of financial return.
              $PUPS is completely useless and for entertainment purposes only.
              When you purchase $PUPS, you are agreeing that you have seen this disclaimer.
            </p>
          </motion.div>

          {/* Social media links */}
          <motion.div
            className="mt-6 mb-4 flex justify-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.a
              href={SOCIAL_LINKS.TWITTER}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="bg-white rounded-full p-2 flex items-center justify-center"
            >
              <Image
                src={IMAGES.TWITTER_ICON}
                alt="Twitter"
                width={20}
                height={20}
              />
            </motion.a>

            <motion.a
              href={SOCIAL_LINKS.TELEGRAM}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              className="bg-white rounded-full p-2 flex items-center justify-center"
            >
              <Image
                src={IMAGES.TELEGRAM_ICON}
                alt="Telegram"
                width={20}
                height={20}
              />
            </motion.a>

            <motion.a
              href={SOCIAL_LINKS.DISCORD}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="bg-white rounded-full p-2 flex items-center justify-center"
            >
              <Image
                src={IMAGES.DISCORD_ICON}
                alt="Discord"
                width={20}
                height={20}
              />
            </motion.a>

            <motion.a
              href={SOCIAL_LINKS.GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              className="bg-white rounded-full p-2 flex items-center justify-center"
            >
              <Image
                src={IMAGES.GITHUB_ICON}
                alt="GitHub"
                width={20}
                height={20}
              />
            </motion.a>
          </motion.div>

          {/* Random PUPS world elements */}
          <motion.div
            className="mt-6 flex justify-center gap-8"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <motion.div
              className="transform rotate-12"
              animate={{
                rotate: [12, 5, 12, 20, 12],
                y: [0, -5, 0, -5, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut"
              }}
            >
              <Image
                src={IMAGES.LOGO}
                alt="PUPS Element"
                width={30}
                height={30}
              />
            </motion.div>
            <motion.div
              className="transform -rotate-6"
              animate={{
                rotate: [-6, -12, -6, 0, -6],
                y: [0, -7, 0, -7, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              <Image
                src={IMAGES.TWITTER_ICON}
                alt="PUPS Element"
                width={30}
                height={30}
              />
            </motion.div>
            <motion.div
              className="transform rotate-6"
              animate={{
                rotate: [6, 15, 6, -3, 6],
                y: [0, -9, 0, -9, 0]
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
                delay: 1
              }}
            >
              <Image
                src={IMAGES.TELEGRAM_ICON}
                alt="PUPS Element"
                width={30}
                height={30}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
