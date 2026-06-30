"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";

// ─── Shared pixel design tokens ───────────────────────────────────────────────

const PIXEL_CLIP =
  "polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)";

const PHONE_PIXEL_CLIP =
  "polygon(6px 0%, calc(100% - 6px) 0%, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0% calc(100% - 6px), 0% 6px)";

// ─── Shared Auto-Scroll Hook ────────────────────────────────────────────────
// Replaces CSS transforms with native scrolling + requestAnimationFrame.
// It automatically pauses if the user manually scrolls (wheel or touch).

function useAutoScroll() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const rAF = useRef<number>(0);
  const userInteracted = useRef(false);

  // Easing functions to match your original CSS cubic-bezier curves
  const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const easeInOutQuad = (t: number) =>
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  const animateScroll = (
    target: number,
    duration: number,
    easing: (t: number) => number,
  ) => {
    const el = viewportRef.current;
    if (!el) return;

    const start = el.scrollTop;
    const change = target - start;
    const startTime = performance.now();

    const animate = (time: number) => {
      // Abort animation immediately if user takes control
      if (userInteracted.current) return;

      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);

      el.scrollTop = start + change * easing(progress);

      if (progress < 1) {
        rAF.current = requestAnimationFrame(animate);
      }
    };

    cancelAnimationFrame(rAF.current);
    rAF.current = requestAnimationFrame(animate);
  };

  const onEnter = () => {
    userInteracted.current = false;
    const el = viewportRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll > 0) {
      const duration = Math.max(1000, maxScroll * 5);
      animateScroll(maxScroll, duration, easeInOutQuad);
    }
  };

  const onLeave = () => {
    // Return to top on leave (matches original behavior)
    userInteracted.current = false;
    animateScroll(0, 2800, easeInOutCubic);
  };

  const onInteract = () => {
    // Flag interaction and kill the current animation frame
    userInteracted.current = true;
    cancelAnimationFrame(rAF.current);
  };

  return { viewportRef, onEnter, onLeave, onInteract };
}

// ─── WindowFrame ─────────────────────────────────────────────────────────────

interface WindowFrameProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  contentClassName?: string;
}

const WindowFrame = ({
  children,
  title = "untitled",
  className,
  contentClassName,
}: WindowFrameProps) => {
  const { viewportRef, onEnter, onLeave, onInteract } = useAutoScroll();

  return (
    <div
      className={cn(
        "flex flex-col w-full select-none transition-colors duration-200",
        "bg-[#f0f0f0] border-neutral-300 text-neutral-800",
        "dark:bg-[#121212] dark:text-neutral-200",
        className,
      )}
      style={{
        clipPath: PIXEL_CLIP,
        boxShadow: `
          0 0 0 2px var(--pixel-outer, currentColor),
          0 0 0 4px var(--pixel-mid, currentColor),
          0 2px 0 4px #000000,
          0 4px 32px 4px rgba(0,0,0,0.15)
        `,
      }}
    >
      <style jsx global>{`
        :root {
          --pixel-outer: #d4d4d4;
          --pixel-mid: #e5e5e5;
          --scanline: rgba(0, 0, 0, 0.06);
          --title-gradient: linear-gradient(180deg, #ffffff 0%, #eaeaea 100%);
        }
        .dark {
          --pixel-outer: #1e1e1e;
          --pixel-mid: #2a2a2a;
          --scanline: rgba(0, 0, 0, 0.4);
          --title-gradient: linear-gradient(180deg, #242424 0%, #1a1a1a 100%);
        }
      `}</style>

      {/* ── Titlebar ── */}
      <div
        className="flex items-center gap-3 px-3 shrink-0 border-b-2 border-neutral-300 dark:border-neutral-800"
        style={{
          height: 34,
          background: `repeating-linear-gradient(to bottom, var(--scanline) 0px, var(--scanline) 1px, transparent 1px, transparent 4px), var(--title-gradient)`,
        }}
      >
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className="w-3 h-3 bg-[#e54e62]"
            style={{
              boxShadow:
                "inset -1px -1px 0 rgba(0,0,0,0.4), inset 1px 1px 0 rgba(255,255,255,0.15)",
            }}
          />
          <div
            className="w-3 h-3 bg-[#f1c40f]"
            style={{
              boxShadow:
                "inset -1px -1px 0 rgba(0,0,0,0.4), inset 1px 1px 0 rgba(255,255,255,0.15)",
            }}
          />
          <div
            className="w-3 h-3 bg-[#2ecc71]"
            style={{
              boxShadow:
                "inset -1px -1px 0 rgba(0,0,0,0.4), inset 1px 1px 0 rgba(255,255,255,0.15)",
            }}
          />
        </div>

        <div className="flex-1 flex justify-center">
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 max-w-[220px] w-full bg-white border border-neutral-300 dark:bg-[#0a0a0a] dark:border-neutral-800"
            style={{
              boxShadow:
                "inset 1px 1px 0 rgba(0,0,0,0.08), inset -1px -1px 0 rgba(255,255,255,0.03)",
            }}
          >
            <div className="w-1.5 h-1.5 bg-[#2ecc71] shrink-0 opacity-70" />
            <span
              className="text-[9px] text-neutral-400 dark:text-neutral-600 truncate font-mono"
              style={{ letterSpacing: "0.04em" }}
            >
              {title}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-[3px] shrink-0 opacity-30 dark:opacity-20">
          <div className="w-4 h-[2px] bg-neutral-800 dark:bg-white" />
          <div className="w-3 h-[2px] bg-neutral-800 dark:bg-white" />
          <div className="w-4 h-[2px] bg-neutral-800 dark:bg-white" />
        </div>
      </div>

      <div className="shrink-0 h-[2px] bg-gradient-to-r from-neutral-300 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900" />

      {/* ── Viewport ── */}
      <div
        className="flex-1 relative bg-[#fafafa] dark:bg-[#080808]"
        style={{ aspectRatio: "1280 / 832" }}
      >
        <div
          ref={viewportRef}
          className="absolute inset-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onWheel={onInteract}
          onTouchMove={onInteract}
        >
          <div className={cn("w-full", contentClassName)}>{children}</div>
        </div>
      </div>
    </div>
  );
};

// ─── PhoneFrame ───────────────────────────────────────────────────────────────

interface PhoneFrameProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  width?: string | number;
}

const PhoneFrame = ({
  children,
  className,
  contentClassName,
  width = 240,
}: PhoneFrameProps) => {
  const { viewportRef, onEnter, onLeave, onInteract } = useAutoScroll();

  return (
    <div
      className={cn(
        "flex flex-col shrink-0 select-none transition-colors duration-200",
        "bg-[#f0f0f0] border-neutral-300 text-neutral-800",
        "dark:bg-[#121212] dark:text-neutral-200",
        className,
      )}
      style={{
        width,
        clipPath: PHONE_PIXEL_CLIP,
        boxShadow: `
          0 0 0 2px var(--pixel-outer, currentColor),
          0 0 0 4px var(--pixel-mid, currentColor),
          0 2px 0 4px #000000,
          0 4px 32px 4px rgba(0,0,0,0.15)
        `,
      }}
    >
      {/* ── Status bar ── */}
      <div
        className="shrink-0 flex items-center justify-between px-3 border-b-2 border-neutral-300 dark:border-neutral-800"
        style={{
          height: 24,
          background: `repeating-linear-gradient(to bottom, var(--scanline) 0px, var(--scanline) 1px, transparent 1px, transparent 4px), var(--title-gradient)`,
        }}
      >
        <span
          className="text-[8px] font-mono text-neutral-500 dark:text-neutral-400"
          style={{ letterSpacing: "0.08em" }}
        >
          {new Date().getHours().toString().padStart(2, "0")}:
          {new Date().getMinutes().toString().padStart(2, "0")}
        </span>

        <div className="shrink-0 flex justify-center items-center h-[18px]">
          <div className="w-[52px] h-2 bg-white border border-neutral-300 dark:bg-[#0a0a0a] dark:border-neutral-800 flex items-center justify-between px-1.5">
            <div className="w-1 h-1 bg-neutral-300 dark:bg-neutral-800" />
            <div className="w-[3px] h-[3px] bg-[#2ecc71] opacity-70" />
          </div>
        </div>

        <div className="flex items-end gap-[2px]">
          {[3, 5, 7, 9].map((h, i) => (
            <div
              key={i}
              className={cn(
                "w-[3px]",
                i < 3
                  ? "bg-neutral-700 dark:bg-neutral-300"
                  : "bg-neutral-300 dark:bg-neutral-800",
              )}
              style={{ height: h }}
            />
          ))}
          <div className="ml-1 flex items-center gap-0">
            <div className="w-3.5 h-[7px] border border-neutral-400 dark:border-neutral-600 relative bg-white dark:bg-[#0a0a0a]">
              <div className="absolute inset-[1px] right-[3px] bg-neutral-700 dark:bg-neutral-300" />
            </div>
            <div className="w-[2px] h-[3px] bg-neutral-400 dark:bg-neutral-600" />
          </div>
        </div>
      </div>

      {/* ── Screen viewport ── */}
      <div
        className="flex-1 relative bg-[#fafafa] dark:bg-[#080808]"
        style={{ aspectRatio: "399 / 844" }}
      >
        <div
          ref={viewportRef}
          className="absolute inset-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onWheel={onInteract}
          onTouchMove={onInteract}
        >
          <div className={cn("w-full", contentClassName)}>{children}</div>
        </div>

        {/* ── Modern Pixelated Home Bar (Overlay) ── */}
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center gap-[3px] pointer-events-none"
          style={{ width: "60px", height: "6px" }}
        >
          <div className="w-2.5 h-[3px] bg-neutral-300 dark:bg-neutral-700" />
          <div className="w-10 h-[3px] bg-neutral-400 dark:bg-neutral-500" />
          <div className="w-2.5 h-[3px] bg-neutral-300 dark:bg-neutral-700" />
        </div>
      </div>
    </div>
  );
};

export { WindowFrame, PhoneFrame };
