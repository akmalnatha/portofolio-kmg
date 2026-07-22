"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

const words = [
  "",
  "Hello",
  "I'm Akmal",
  "Software Engineer",
  "You'll Learn About Me More Here",
  "Please Enjoy!",
];

const Intro = ({ onComplete }: { onComplete: () => void }) => {
  const [index, setIndex] = useState(0);
  const [isWiping, setIsWiping] = useState(false);

  useEffect(() => {
    if (index < words.length) {
      let displayDuration = 700; // Default

      if (index === 0) displayDuration = 300; // Delay before start
      if (index === 1) displayDuration = 1000; // "Hello" duration
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
          key="intro-container"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-100 flex items-center justify-center bg-black"
        >
          <AnimatePresence mode="wait">
            {index < words.length && words[index] !== "" && (
              <motion.h1
                key={words[index]}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
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

export default Intro;
