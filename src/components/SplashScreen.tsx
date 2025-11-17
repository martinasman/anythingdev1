"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  show?: boolean; // Optional prop to control visibility externally
  duration?: number; // Optional duration override
}

export default function SplashScreen({ show, duration = 6000 }: SplashScreenProps = {}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // If show prop is provided, use it for external control (navigation transitions)
    if (show !== undefined) {
      setIsVisible(show);
      return;
    }

    // Otherwise, use sessionStorage logic for initial load
    const hasShownSplash = sessionStorage.getItem("hasShownSplash");

    if (hasShownSplash) {
      // Don't show splash screen again this session
      setIsVisible(false);
      return;
    }

    // Show splash screen for specified duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("hasShownSplash", "true");
    }, duration);

    return () => clearTimeout(timer);
  }, [show, duration]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center"
        >
          {/* Logo */}
          <motion.img
            src="/anythingfullLogo.png"
            alt="Anything Logo"
            className="w-64 h-auto mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />

          {/* Loading Bar Container */}
          <div className="w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
            {/* Animated Loading Bar */}
            <motion.div
              className="h-full bg-gradient-to-r from-[#f1ff62] to-[#0192c6] rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3.5, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
