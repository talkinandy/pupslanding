"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { IMAGES } from "@/lib/constants";

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
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
