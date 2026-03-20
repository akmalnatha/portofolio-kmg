"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const CLOUD_VARIANTS = ["cloud1.png", "cloud2.png", "cloud3.png"];

export default function MovingClouds({
  count = 8,
  isLargeScreen,
  isGroundOverflowing,
}: {
  count?: number;
  isLargeScreen: boolean;
  isGroundOverflowing: boolean;
}) {
  const clouds = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      variant:
        CLOUD_VARIANTS[Math.floor(Math.random() * CLOUD_VARIANTS.length)],
      // Randomize initial position and speed
      initialX: Math.random() * 160 - 30,
      // On large screens without ground overflow, keep them high (above title)
      // Otherwise, keep them around the title height and above (top 0-40%)
      top:
        isLargeScreen && !isGroundOverflowing
          ? Math.random() * 25 // Stay very high
          : Math.random() * 60, // Spread lower around title area
      duration: 30 + Math.random() * 50, // Random speed (30s to 70s)
      scale: 0.5 + Math.random() * 1.0,
      opacity: 0.4 + Math.random() * 0.5,
    }));
  }, [count, isLargeScreen, isGroundOverflowing]);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 6 }}
    >
      {clouds.map((cloud) => (
        <motion.div
          key={cloud.id}
          initial={{ x: `${cloud.initialX}vw` }}
          animate={{ x: ["-40vw", "120vw"] }}
          transition={{
            duration: cloud.duration,
            repeat: Infinity,
            ease: "linear",
            // Stagger initial start based on their random initial position
            delay: -((cloud.initialX + 40) / 160) * cloud.duration,
          }}
          className="absolute"
          style={{
            top: `${cloud.top}%`,
            scale: cloud.scale,
            opacity: cloud.opacity,
          }}
        >
          <Image
            src={`/assets/${cloud.variant}`}
            width={450}
            height={225}
            alt="Cloud"
            className="w-auto h-auto object-contain"
          />
        </motion.div>
      ))}
    </div>
  );
}
