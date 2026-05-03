"use client";

import { motion } from "framer-motion";

export default function Template({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, // High stiffness = Faster "Pop"
        damping: 18,    // Lower damping = A bit of "Bounce"
        mass: 0.8       // Lighter mass = Snappier movement
      }}
      className="min-h-screen w-full"
    >
      {children}
    </motion.div>
  );
}