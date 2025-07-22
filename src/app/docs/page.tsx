'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Menu, X, Search, Copy, Check, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { docsContent, commandsList, DocSection } from '@/lib/docs-content';
import { cn } from '@/lib/utils';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  // Check if desktop
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Get current section data
  const currentSection = docsContent.find(doc => doc.id === activeSection) || docsContent[0];

  // Filter sections based on search
  const filteredSections = docsContent.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Close mobile menu when section changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeSection]);

  return (
    <div className="min-h-screen bg-[#0A0B0D]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0B0D]/80 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Back to Home</span>
              </Link>
              <div className="h-8 w-px bg-white/20" />
              <h1 className="text-xl font-semibold text-white">Documentation</h1>
            </div>
            
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white/70 hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <AnimatePresence>
            {(mobileMenuOpen || isDesktop) && (
              <motion.aside
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                className={cn(
                  "fixed lg:sticky top-20 lg:top-24 left-0 z-40 h-[calc(100vh-5rem)] lg:h-[calc(100vh-8rem)]",
                  "w-72 overflow-y-auto bg-[#0A0B0D] lg:bg-transparent",
                  "border-r border-white/10 lg:border-0",
                  mobileMenuOpen ? "block" : "hidden lg:block"
                )}
              >
                <div className="p-4 lg:p-0">
                  {/* Search */}
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search docs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-lg bg-white/5 border border-white/10 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:border-[#0574f9] focus:outline-none"
                    />
                  </div>

                  {/* Navigation */}
                  <nav className="space-y-1">
                    {filteredSections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                          "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-all",
                          activeSection === section.id
                            ? "bg-[#0574f9]/20 text-[#0574f9] border border-[#0574f9]/30"
                            : "text-white/70 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <span className="text-xl">{section.icon}</span>
                        <span className="text-sm font-medium">{section.title}</span>
                      </button>
                    ))}
                  </nav>

                  {/* Commands List */}
                  <div className="mt-8 rounded-lg bg-white/5 border border-white/10 p-4">
                    <h3 className="mb-3 text-sm font-semibold text-white">Quick Commands</h3>
                    <div className="space-y-2">
                      {commandsList.map((cmd) => (
                        <div
                          key={cmd.command}
                          className="flex items-center justify-between text-xs"
                        >
                          <code className="text-[#0574f9]">{cmd.command}</code>
                          <span className="text-white/50">{cmd.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <main className="flex-1 max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Section Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-4xl">{currentSection.icon}</span>
                    <h1 className="text-3xl font-bold text-white">{currentSection.title}</h1>
                  </div>
                  <p className="text-lg text-white/70">{currentSection.description}</p>
                </div>

                {/* Overview */}
                {currentSection.content.overview && (
                  <div className="mb-8 rounded-xl bg-gradient-to-br from-[#0574f9]/10 to-[#0574f9]/5 border border-[#0574f9]/20 p-6">
                    <p className="text-white/90 leading-relaxed">
                      {currentSection.content.overview}
                    </p>
                  </div>
                )}

                {/* Features Grid */}
                {currentSection.content.features && (
                  <div className="mb-8">
                    <h2 className="mb-4 text-xl font-semibold text-white">Features</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      {currentSection.content.features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="rounded-lg bg-white/5 border border-white/10 p-4 hover:border-[#0574f9]/50 transition-colors"
                        >
                          <h3 className="mb-2 font-semibold text-white">{feature.title}</h3>
                          <p className="text-sm text-white/70">{feature.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Steps */}
                {currentSection.content.steps && (
                  <div className="mb-8">
                    <h2 className="mb-4 text-xl font-semibold text-white">How to Use</h2>
                    <div className="space-y-4">
                      {currentSection.content.steps.map((step, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex gap-4"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0574f9]/20 text-sm font-semibold text-[#0574f9]">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="mb-1 font-semibold text-white">{step.title}</h3>
                            <p className="text-sm text-white/70">{step.description}</p>
                            {step.note && (
                              <p className="mt-2 text-sm text-[#24a936] bg-[#24a936]/10 rounded-md px-3 py-2">
                                💡 {step.note}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Points */}
                {currentSection.content.keyPoints && (
                  <div className="mb-8">
                    <h2 className="mb-4 text-xl font-semibold text-white">Key Points</h2>
                    <div className="rounded-lg bg-white/5 border border-white/10 p-6">
                      <ul className="space-y-2">
                        {currentSection.content.keyPoints.map((point, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-start gap-3"
                          >
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0574f9]" />
                            <span className="text-sm text-white/80">{point}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Code Example */}
                {currentSection.content.codeExample && (
                  <div className="mb-8">
                    <h2 className="mb-4 text-xl font-semibold text-white">Example</h2>
                    <div className="relative rounded-lg bg-black/50 border border-white/10 p-4">
                      <button
                        onClick={() => copyToClipboard(currentSection.content.codeExample!)}
                        className="absolute right-2 top-2 p-2 text-white/50 hover:text-white transition-colors"
                        aria-label="Copy code"
                      >
                        {copiedCode === currentSection.content.codeExample ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                      <pre className="text-sm text-white/80 overflow-x-auto">
                        <code>{currentSection.content.codeExample}</code>
                      </pre>
                    </div>
                  </div>
                )}

                {/* Bot Link CTA */}
                <div className="mt-12 rounded-xl bg-gradient-to-r from-[#0574f9] to-[#0574f9]/80 p-8 text-center">
                  <h3 className="mb-2 text-2xl font-bold text-white">Ready to Start Trading?</h3>
                  <p className="mb-6 text-white/90">
                    Join thousands of traders using PupsBot for Rune trading on Odin
                  </p>
                  <Link
                    href="https://t.me/pupsodinbot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-[#0574f9] hover:bg-white/90 transition-colors"
                  >
                    Open PupsBot
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}