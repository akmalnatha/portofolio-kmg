import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
};

// Pixel art brick pattern:
// Each "row" alternates the brick offset so every other row is shifted by half a brick.
// A brick is 2 cols wide × 1 col tall in our grid.
// We paint the mortar lines by styling cells that sit on left/bottom borders of a brick.

const COLS = 20; // number of brick-width columns
const ROWS = 14; // number of rows
const TOTAL = COLS * ROWS;

const BRICK_COLORS_LIGHT = [
  "#d5dbda",
  "#ccd3d2",
  "#c3cac9",
  "#dce2e1",
  "#bac2c1",
];

const BRICK_COLORS_DARK = [
  "#595959",
  "#656565",
  "#717071",
  "#7c7c7c",
  "#4d4d4d",
];

const BASE_COLOR_DARK = "#18181b";
const BASE_COLOR_LIGHT = "#fcfbfc";

function getBrickColor(brickId: string, isDark: boolean): string {
  const colors = isDark ? BRICK_COLORS_DARK : BRICK_COLORS_LIGHT;
  let hash = 0;
  for (let i = 0; i < brickId.length; i++) {
    hash = brickId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export const MainBackground = ({ children }: Props) => {
  const [hoveredBrick, setHoveredBrick] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(true);
  const themeChanging = useRef(false);

  useEffect(() => {
    let isInit = true;
    const updateTheme = () => {
      if (!isInit) themeChanging.current = true;
      isInit = false;
      setIsDark(document.documentElement.classList.contains("dark"));
      // Reset after a frame so hover animations still work normally
      requestAnimationFrame(() => {
        themeChanging.current = false;
      });
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const baseColor = isDark ? BASE_COLOR_DARK : BASE_COLOR_LIGHT;
  const mortarColor = isDark ? "#000000" : "#D3D5CE";

  return (
    <main
      className="relative w-full min-h-screen text-zinc-50"
      style={{ backgroundColor: baseColor }}
    >
      {/* Pixel Brick Grid */}
      <div
        className="fixed h-screen w-screen inset-0 z-0"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        }}
      >
        {Array.from({ length: TOTAL }).map((_, index) => {
          const col = index % COLS;
          const row = Math.floor(index / COLS);

          const offset = row % 2 === 0 ? 0 : 1;
          const brickColIndex = Math.floor((col - offset) / 2);
          const brickId = `r${row}-c${brickColIndex}`;

          const isRightMortar = (col - offset + COLS) % 2 === 1;
          const isBottomMortar = true; // every row has a bottom mortar line
          const brickColor = getBrickColor(brickId, isDark);
          const isHovered = hoveredBrick === brickId;

          return (
            <motion.div
              key={index}
              onMouseEnter={() => setHoveredBrick(brickId)}
              onMouseLeave={() => setHoveredBrick(null)}
              initial={{ backgroundColor: baseColor }}
              animate={{
                backgroundColor: isHovered ? brickColor : baseColor,
              }}
              transition={{
                backgroundColor: {
                  type: "tween",
                  ease: "circOut",
                  duration: themeChanging.current ? 0 : isHovered ? 0.75 : 1.5,
                  damping: 100,
                  stiffness: 200,
                },
              }}
              style={{
                // Mortar gaps via border (mortar color = dark grout)
                borderRight: isRightMortar
                  ? `2px solid ${mortarColor}`
                  : "none",
                borderBottom: isBottomMortar
                  ? `2px solid ${mortarColor}`
                  : "none",
                borderTop: "none",
                borderLeft: "none",
                imageRendering: "pixelated",
                position: "relative",
              }}
            >
              {!isRightMortar && (
                <div
                  style={{
                    position: "absolute",
                    top: 1,
                    left: 2,
                    width: "30%",
                    height: 2,
                    backgroundColor: "rgba(255,255,255,0.08)",
                    pointerEvents: "none",
                    imageRendering: "pixelated",
                  }}
                />
              )}

              {isHovered && (
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Scanline overlay for pixel art depth */}
      <div
        className="fixed w-screen h-screen inset-0 z-1 pointer-events-none"
        style={{
          background: isDark
            ? "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 4px)"
            : "repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 4px)",
        }}
      />

      {/* Vignette */}
      <div
        className="fixed w-screen h-screen inset-0 z-2 pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(ellipse at center, transparent 70%, rgba(0,0,0,0.75) 100%)"
            : "radial-gradient(ellipse at center, transparent 70%, rgba(255,255,255,0.75) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full min-h-screen pointer-events-none">
        {children}
      </div>
    </main>
  );
};
