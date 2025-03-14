"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IMAGES, SOCIAL_LINKS } from "@/lib/constants";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.header
      className="sticky top-0 z-50 bg-primary w-full h-16 flex items-center justify-between px-4 md:px-8"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Image
              src={IMAGES.LOGO}
              alt="PUPS Logo"
              width={48}
              height={48}
              className="mr-2"
            />
          </motion.div>
          <motion.span
            className="text-3xl font-dion text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            pups
          </motion.span>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-8">
        {["Home", "About", "Tokenomics", "FAQs"].map((item, i) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            whileHover={{ scale: 1.1 }}
          >
            <Link
              href={item === "Home" ? "/" : `/#${item.toLowerCase()}`}
              className="text-white hover:text-gray-200 transition font-poppins"
            >
              {item}
            </Link>
          </motion.div>
        ))}
      </nav>

      {/* Social Media Links */}
      <div className="hidden md:flex items-center space-x-4">
        <motion.div
          whileHover={{ scale: 1.2, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <Link
            href={SOCIAL_LINKS.TWITTER}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition"
          >
            <Image
              src={IMAGES.TWITTER_ICON}
              alt="Twitter"
              width={24}
              height={24}
            />
          </Link>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.2, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
        >
          <Link
            href={SOCIAL_LINKS.TELEGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center bg-white rounded-full w-8 h-8 hover:opacity-80 transition"
          >
            <Image
              src={IMAGES.TELEGRAM_ICON}
              alt="Telegram"
              width={20}
              height={20}
            />
          </Link>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.2, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <Link
            href={SOCIAL_LINKS.DISCORD}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center bg-white rounded-full w-8 h-8 hover:opacity-80 transition"
          >
            <Image
              src={IMAGES.DISCORD_ICON}
              alt="Discord"
              width={20}
              height={20}
            />
          </Link>
        </motion.div>
      </div>

      {/* Mobile Menu Button */}
      <motion.button
        className="md:hidden text-white"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        whileTap={{ scale: 0.9 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6"
        >
          {isMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </motion.button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="absolute top-16 left-0 right-0 bg-primary p-4 md:hidden flex flex-col space-y-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {["Home", "About", "Tokenomics", "FAQs"].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <Link
                  href={item === "Home" ? "/" : `/#${item.toLowerCase()}`}
                  className="text-white hover:text-gray-200 transition font-poppins"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </Link>
              </motion.div>
            ))}
            <motion.div
              className="flex space-x-4 pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                <Link
                  href={SOCIAL_LINKS.TWITTER}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition"
                >
                  <Image
                    src={IMAGES.TWITTER_ICON}
                    alt="Twitter"
                    width={24}
                    height={24}
                  />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                <Link
                  href={SOCIAL_LINKS.TELEGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center bg-white rounded-full w-8 h-8 hover:opacity-80 transition"
                >
                  <Image
                    src={IMAGES.TELEGRAM_ICON}
                    alt="Telegram"
                    width={20}
                    height={20}
                  />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                <Link
                  href={SOCIAL_LINKS.DISCORD}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center bg-white rounded-full w-8 h-8 hover:opacity-80 transition"
                >
                  <Image
                    src={IMAGES.DISCORD_ICON}
                    alt="Discord"
                    width={20}
                    height={20}
                  />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
