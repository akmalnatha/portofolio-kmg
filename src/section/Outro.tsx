"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

const words = [
  "",
  "Thank You!",
  "Hope You Enjoyed",
  "See You Again",
  "Goodbye",
];

const Outro = ({ onComplete }: { onComplete: () => void }) => {
  const [index, setIndex] = useState(0);
  const [isWiping, setIsWiping] = useState(false);

  useEffect(() => {
    if (index < words.length) {
      let displayDuration = 700;

      if (index === 0) displayDuration = 300;
      if (index === words.length - 1) displayDuration = 1000;
      const timer = setTimeout(() => {
        setIndex((prev) => prev + 1);
      }, displayDuration);
      return () => clearTimeout(timer);
    } else {
      setIsWiping(true);
    }
  }, [index]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isWiping ? null : (
        <motion.div
          key="outro-container"
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-100 flex items-center justify-center bg-black"
        >
          <AnimatePresence mode="wait">
            {index < words.length && words[index] !== "" && (
              <motion.h1
                key={words[index]}
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.3, ease: [0.25, 0, 0.2, 1] }}
                className="text-4xl md:text-6xl font-handjet font-medium text-white tracking-tight px-6 text-center"
              >
                {words[index]}
              </motion.h1>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Outro;
