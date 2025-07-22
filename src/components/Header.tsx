"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IMAGES } from "@/lib/constants";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
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

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-white"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 right-0 bg-primary shadow-lg md:hidden"
          >
            <nav className="flex flex-col p-4">
                <Link
                href="/#features"
                className="text-white py-2 hover:text-gray-200 transition font-poppins"
                  onClick={() => setIsMenuOpen(false)}
                >
                Features
                </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
