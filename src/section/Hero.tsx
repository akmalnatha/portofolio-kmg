"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  animate,
} from "motion/react";
import MovingClouds from "./components/hero/MovingClouds";
import { useRouter } from "next/navigation";

interface HeroProps {
  reverse?: boolean;
  skipEntry?: boolean;
  onReverseComplete?: () => void;
  onScrollComplete?: () => void;
}

const Hero = ({
  reverse = false,
  skipEntry = false,
  onReverseComplete,
  onScrollComplete,
}: HeroProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const groundRef = useRef<HTMLDivElement>(null);
  const [isGroundOverflowing, setIsGroundOverflowing] = useState(false);
  const [groundHeightVh, setGroundHeightVh] = useState("45vh");
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  const router = useRouter();

  const smoothScrollToBottom = (durationMs = 2800) => {
    const startY = window.scrollY;
    const targetY = document.documentElement.scrollHeight - window.innerHeight;
    const distance = targetY - startY;
    let startTime: number | null = null;

    // Cubic ease-in-out easing for a natural feel
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const easeProgress = easeInOutCubic(progress);

      window.scrollTo(0, startY + distance * easeProgress);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  // 1. Scroll Setup
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // For reverse mode, use a programmatic motion value instead of scroll
  const reverseProgress = useMotionValue(reverse ? 1 : 0);

  useEffect(() => {
    if (reverse) {
      // Animate from 1 (underground) back to 0 (sky)
      const controls = animate(reverseProgress, 0, {
        duration: 5,
        ease: [0.25, 0.1, 0.25, 1],
        onComplete: () => {
          onReverseComplete?.();
        },
      });
      return () => controls.stop();
    }
  }, [reverse, reverseProgress, onReverseComplete]);

  useEffect(() => {
    if (reverse) return; // Don't redirect in reverse mode
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest >= 1) {
        if (onScrollComplete) {
          onScrollComplete();
        } else {
          // Redirect to the main site view
          // 'scroll: false' prevents the page from jumping before the content loads
          router.push("/?v=site", { scroll: false });
        }
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, router, reverse, onScrollComplete]);

  // In reverse mode, use the programmatic value; otherwise use scroll-driven spring
  const scrollBasedProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // When skipEntry, the spring hasn't synced with scrollYProgress yet on the first frame.
  // Jump it to 0 so layers don't flash at the underground position.
  useEffect(() => {
    if (skipEntry) {
      scrollBasedProgress.jump(0);
    }
  }, [skipEntry, scrollBasedProgress]);

  const smoothProgress = reverse ? reverseProgress : scrollBasedProgress;

  // ─── Ground overflow detection ─────────────────────────────────────────────
  // When the ground's min-height exceeds its vh threshold, push everything
  // below the sky down by 100vh so only sky is visible initially.
  useEffect(() => {
    const checkOverflow = () => {
      if (!groundRef.current) return;
      const groundHeight = Math.round(
        groundRef.current.getBoundingClientRect().height,
      );
      const vh = window.innerHeight;

      setIsLargeScreen(window.innerWidth >= 1024);
      const calculatedVh = (groundHeight / vh) * 100;
      setGroundHeightVh(`${calculatedVh}vh`);

      // Thresholds match Tailwind classes:
      //   mobile:  h-[40vh] with min-h-66  (264px)
      //   md:      h-[50vh] with min-h-94  (376px)
      //   lg:      h-[80vh] with min-h-151 (604px)
      let threshold: number;
      if (window.innerWidth >= 1024) {
        threshold = vh * 0.7;
      } else if (window.innerWidth >= 768) {
        threshold = vh * 0.5;
      } else {
        threshold = vh * 0.4;
      }

      setIsGroundOverflowing(groundHeight > threshold + 8);
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, []);

  const brightness = useTransform(smoothProgress, [0, 0.4], [1, 0.4]);

  const filterStyle = useTransform(
    brightness,
    (v) => `brightness(${v}) contrast(${1 + (1 - v) * 0.1})`,
  );

  const foregroundFilter = useTransform(smoothProgress, (progress) => {
    const isNight = progress >= 0.4;
    if (isNight) return `brightness(0.9) contrast(1.05)`;
    const dayBrightness = 1 - Math.min(progress, 0.25) * 2;
    const clampB = Math.max(dayBrightness, 0.45);
    return `brightness(${clampB}) contrast(${1 + (1 - clampB) * 0.1})`;
  });

  const dayOpacity = useTransform(smoothProgress, [0.39, 0.4], [1, 0]);
  const nightSkyOpacity = useTransform(smoothProgress, [0, 0.4], [0, 1]);
  const blackSkyOpacity = useTransform(smoothProgress, [0.4, 1], [0, 1]);

  // 2. Entry Animation Motion Values
  // In reverse mode, skip entry animations — start at final positions
  const birdsX = useTransform(smoothProgress, [0, 0.4], ["-10vw", "110vw"]);
  const birdsY = useTransform(smoothProgress, [0, 0.4], ["0px", "-300px"]);
  const entryMoon = useTransform(smoothProgress, [0.1, 0.3], [1000, 150]);
  const entryDragon = useTransform(smoothProgress, [0.25, 0.4], [1000, 200]);
  const noEntry = reverse || skipEntry;
  const entryButton = useMotionValue(noEntry ? 0 : 1000);
  const entryTitle = useMotionValue(noEntry ? 0 : 2000);
  const entryFace = useMotionValue(noEntry ? 0 : 1000);
  const entryMountain = useMotionValue(noEntry ? 0 : 1000);
  const entrySilhouette = useMotionValue(noEntry ? 0 : 1000);
  const entryLight = useMotionValue(noEntry ? 0 : 1000);
  const entryDark = useMotionValue(noEntry ? 0 : 1000);

  // 3. Parallax Transforms
  const celestialParallax = useTransform(smoothProgress, [0.45, 1], [0, 1100]);
  const buttonParallax = useTransform(
    smoothProgress,
    [0.45, 0.75],
    isGroundOverflowing ? ["0vh", "75vh"] : ["0vh", "0vh"],
  );
  const titleParallax = useTransform(smoothProgress, [0.45, 1], [0, 800]);
  const faceParallax = useTransform(
    smoothProgress,
    [0, 0.2, 0.4, 1],
    [0, 0, 1000, 1000],
  );
  const mountainParallax = useTransform(smoothProgress, [0.45, 1], [0, 1000]);
  const hillSilhouetteParallax = useTransform(
    smoothProgress,
    [0.45, 1],
    [0, 500],
  );
  const hillLightParallax = useTransform(smoothProgress, [0.45, 1], [0, 300]);
  const hillDarkParallax = useTransform(smoothProgress, [0.45, 1], [0, 400]);

  // 4. Combined Transforms
  const finalMoonY = useTransform(
    [entryMoon, celestialParallax],
    ([entry, parallax]) => (entry as number) + (parallax as number),
  );
  const finalDragonY = useTransform(
    [entryDragon, celestialParallax],
    ([entry, parallax]) => (entry as number) + (parallax as number),
  );
  const finalButtonY = entryButton;
  const finalTitleY = useTransform(
    [entryTitle, titleParallax],
    ([entry, parallax]) => (entry as number) + (parallax as number),
  );
  const finalFaceY = useTransform(
    [entryFace, faceParallax],
    ([entry, parallax]) => (entry as number) + (parallax as number),
  );
  const finalMountainY = useTransform(
    [entryMountain, mountainParallax],
    ([entry, parallax]) => (entry as number) + (parallax as number),
  );
  const finalSilhouetteY = useTransform(
    [entrySilhouette, hillSilhouetteParallax],
    ([entry, parallax]) => (entry as number) + (parallax as number),
  );
  const finalLightY = useTransform(
    [entryLight, hillLightParallax],
    ([entry, parallax]) => (entry as number) + (parallax as number),
  );
  const finalDarkY = useTransform(
    [entryDark, hillDarkParallax],
    ([entry, parallax]) => (entry as number) + (parallax as number),
  );

  const skyColor = useTransform(
    smoothProgress,
    [0, 0.4, 0.8, 0.9, 1],
    ["#87CEEB", "#1a1a2e", "#1a1a2e", "#000000", "#000000"],
  );

  // ─── Camera accounts for the 100vh offset when ground overflows ───────────
  // If everything is pushed down 100vh, camera must travel 100vh further
  // to reveal the scene, then continue into the underground.
  const cameraY = useTransform(
    smoothProgress,
    [0.45, 1],
    isGroundOverflowing ? ["0vh", "-295vh"] : ["0vh", "-220vh"],
  );
  // ──────────────────────────────────────────────────────────────────────────

  // 5. Trigger Entry Animations on Mount (skip in reverse/skipEntry mode)
  useEffect(() => {
    if (reverse || skipEntry) {
      entryButton.set(0);
      const controls = animate(entryButton, [0, -20, 0], {
        duration: 0.75,
        repeat: Infinity,
        ease: "easeInOut",
      });
      return () => controls.stop();
    }

    animate(entryButton, 0, {
      type: "tween",
      duration: 1.25,
      ease: "easeOut",
      delay: 3,
    }).then(() => {
      animate(entryButton, [0, -20, 0], {
        duration: 0.75,
        repeat: Infinity,
        ease: "easeInOut",
      });
    });
    animate(entryTitle, 0, {
      type: "tween",
      duration: 1.25,
      ease: "easeOut",
      delay: 2.25,
    });
    animate(entryFace, 0, {
      type: "tween",
      duration: 0.75,
      ease: "easeOut",
      delay: 1.75,
    });
    animate(entryMountain, 0, {
      type: "tween",
      duration: 0.75,
      ease: "easeOut",
      delay: 1.5,
    });
    animate(entrySilhouette, 0, {
      type: "tween",
      duration: 0.75,
      ease: "easeOut",
      delay: 1.25,
    });
    animate(entryLight, 0, {
      type: "tween",
      duration: 0.75,
      ease: "easeOut",
      delay: 0.75,
    });
    animate(entryDark, 0, {
      type: "tween",
      duration: 0.75,
      ease: "easeOut",
      delay: 1,
    });
  }, [
    reverse,
    skipEntry,
    entryButton,
    entryTitle,
    entryFace,
    entryMountain,
    entrySilhouette,
    entryLight,
    entryDark,
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative bg-black ${reverse ? "h-screen overflow-hidden" : "h-[800vh]"}`}
    >
      <motion.div className="fixed inset-0 h-screen w-full overflow-hidden">
        {/* Layer 1: Sunset — radial from face position, bottom-right */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 75% 85%, #e8f4ff 0%, #87ceeb 25%, #4a9fd4 50%, #1e6fa8 75%, #0d4a7a 100%)`,
          }}
        />

        {/* Layer 2: Night — radial from moon position, upper-center-right */}
        <motion.div
          className="absolute inset-0"
          style={{
            opacity: nightSkyOpacity,
            background: `radial-gradient(ellipse at 65% 20%, #2a1f4a 0%, #1a1a2e 30%, #0f0f1e 95%, #050508 100%)`,
          }}
        />

        {/* Layer 3: Black underground */}
        <motion.div
          className="absolute inset-0 bg-black"
          style={{ opacity: blackSkyOpacity }}
        />
        <motion.div style={{ y: cameraY }} className="absolute inset-0">
          <MovingClouds
            count={10}
            isLargeScreen={isLargeScreen}
            isGroundOverflowing={isGroundOverflowing}
          />
          {/* Birds */}
          <motion.div
            style={{
              x: birdsX,
              y: birdsY, // Simple diagonal Y since we don't need parallax
              left: 0,
              bottom: isLargeScreen
                ? !isGroundOverflowing
                  ? `calc(${groundHeightVh} + 10vh)`
                  : "40vh"
                : "50vh",
            }}
            className="absolute z-29 w-[12vw] min-w-32 pointer-events-none"
          >
            <Image
              src="/assets/birds.png"
              width={400}
              height={200}
              alt="Birds"
              className="w-full h-auto object-contain"
            />
          </motion.div>
          {/* Title */}
          <motion.div
            style={{
              left: "50%",
              x: "-50%",
              y: finalTitleY,
            }}
            className={`fixed z-5 flex w-[50%] min-w-75 max-w-200 pointer-events-none
              ${
                isGroundOverflowing
                  ? "translate-y-[50vh]"
                  : "top-[clamp(40px,20vh,750px)] lg:top-[clamp(60px,15vh,750px)]"
              }`}
          >
            <Image
              src="/assets/title.png"
              width={580}
              height={84}
              alt="Title"
              className="w-full h-auto object-contain"
            />
          </motion.div>

          {/* The Moon */}
          <motion.div
            style={{
              y: finalMoonY,
              translateY: isGroundOverflowing ? "50vh" : "0px",
              left: "50%",
              bottom:
                isLargeScreen && !isGroundOverflowing
                  ? window.innerWidth >= 1280
                    ? `calc(${groundHeightVh} + 4vw)`
                    : `calc(${groundHeightVh} + 164px)`
                  : undefined,
            }}
            className="
              absolute z-0 w-[34vw] min-w-xl
              flex items-end origin-bottom
              -translate-x-[50%] md:translate-x-[10%] lg:translate-x-[28%] xl:translate-x-[40%] 
              bottom-[calc(55vh+44px)] md:bottom-[calc(60vh-24px)]
              lg:bottom-[calc(70vh+24px)] xl:bottom-[calc(70vh+1vw)]
              pointer-events-none
            "
          >
            <Image
              src="/assets/moon.png"
              width={500}
              height={500}
              alt="Moon"
              className="w-full h-auto object-contain"
            />
          </motion.div>

          {/* The Dragon */}
          <motion.div
            style={{
              y: finalDragonY,
              translateY: isGroundOverflowing ? "50vh" : "0px",
              left: "50%", // Slightly offset from moon for better composition
              bottom:
                isLargeScreen && !isGroundOverflowing
                  ? window.innerWidth >= 1280
                    ? `calc(${groundHeightVh} + 14vw)`
                    : `calc(${groundHeightVh} + 344px)`
                  : undefined,
            }}
            className="
              absolute z-1 w-[13.89vw] min-w-50
              flex items-end origin-bottom
              -translate-x-[47.5%] md:translate-x-[125%] lg:translate-x-[175%] xl:translate-x-[185%] 
              bottom-[calc(65vh+100px)] md:bottom-[calc(65vh+80px)]
              lg:bottom-[calc(85vh+64px)] xl:bottom-[calc(85vh+2vw)]
              pointer-events-none
            "
          >
            <Image
              src="/assets/dragon.png"
              width={800}
              height={600}
              alt="Dragon"
              className="w-full h-auto object-contain"
            />
          </motion.div>

          {/* My Face */}
          <motion.div
            whileHover="hover"
            style={{
              left: "50%",
              y: finalFaceY,
              translateY: isGroundOverflowing ? "35vh" : "0px",
              filter: filterStyle,
              bottom:
                isLargeScreen && !isGroundOverflowing
                  ? window.innerWidth >= 1280
                    ? `calc(${groundHeightVh} - 2vw - 192px)`
                    : `calc(${groundHeightVh} - 168px)`
                  : undefined,
            }}
            className="
              absolute flex items-end origin-bottom
              -translate-x-[50%] md:translate-x-[20%] lg:translate-x-[52.5%] 
              bottom-[calc(35vh-28px)] md:bottom-[calc(40vh-48px)]
              lg:bottom-[calc(45vh-56px)] xl:bottom-[calc(45vh-5vw)]
              min-w-106 w-[29.44vw]
            "
          >
            <Image
              src="/assets/normal_photo.png"
              width={1920}
              height={1080}
              alt="Face"
              className="w-full object-contain"
            />
            <motion.div
              variants={{
                initial: { width: "100%" },
                hover: { width: "0%" },
              }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="absolute inset-0 overflow-hidden"
            >
              <div className="w-[29.44vw] min-w-106 h-full">
                <Image
                  src="/assets/pixel_photo_new.png"
                  width={1920}
                  height={1080}
                  alt="Face Pixel"
                  className="w-full h-auto object-contain"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Mountain Silhouette */}
          <motion.div
            style={{
              right: "50%",
              y: finalMountainY,
              translateY: isGroundOverflowing ? "50vh" : "0px",
              filter: filterStyle,
              bottom:
                isLargeScreen && !isGroundOverflowing
                  ? window.innerWidth > 1280
                    ? `calc(${groundHeightVh} - 12vw - 192px)`
                    : `calc(${groundHeightVh} - 284px)`
                  : undefined,
            }}
            className="
              absolute z-10 flex items-end origin-bottom scale-x-[-1]
              translate-x-[10%] md:translate-x-[15%] lg:translate-x-[10%] 
              bottom-[calc(35vh-144px)] md:bottom-[calc(40vh-180px)] 
              lg:bottom-[calc(45vh-240px)] xl:bottom-[calc(45vh-16vw)] 
              w-266 md:w-308 lg:min-w-353 lg:w-[98vw]
              pointer-events-none
            "
          >
            <Image
              src="/assets/mountain_silhouette.png"
              width={1920}
              height={1080}
              alt="Mountain"
              className="w-full object-contain"
            />
          </motion.div>

          {/* Hill Silhouette */}
          <motion.div
            style={{
              right: "50%",
              y: finalSilhouetteY,
              translateY: isGroundOverflowing ? "75vh" : "0px",
              filter: filterStyle,
              bottom:
                isLargeScreen && !isGroundOverflowing
                  ? window.innerWidth > 1280
                    ? `calc(${groundHeightVh} - 12vw - 192px)`
                    : `calc(${groundHeightVh} - 284px)`
                  : undefined,
            }}
            className="
              absolute z-15 flex items-end origin-bottom
              translate-x-[40%] md:translate-x-[45%] lg:translate-x-[50%] 
              bottom-[calc(35vh-144px)] md:bottom-[calc(40vh-180px)] 
              lg:bottom-[calc(45vh-200px)] xl:bottom-[calc(45vh-12vw)] 
              w-137 md:w-159 lg:min-w-182 lg:w-[50.55vw]
              pointer-events-none
            "
          >
            <Image
              src="/assets/hill_silhouette.png"
              width={1920}
              height={1080}
              alt="Hill Silhouette"
              className="w-full object-contain"
            />
          </motion.div>

          {/* Hill Layer 1 (Light) */}
          <motion.div
            style={{
              left: "50%",
              y: finalLightY,
              translateY: isGroundOverflowing ? "75vh" : "0px",
              filter: filterStyle,
              bottom:
                isLargeScreen && !isGroundOverflowing
                  ? window.innerWidth > 1280
                    ? `calc(${groundHeightVh} - 13vw - 192px)`
                    : `calc(${groundHeightVh} - 318px)`
                  : undefined,
            }}
            className="
              absolute z-20 flex items-end origin-bottom
              -translate-x-[15%] md:-translate-x-[10%] lg:translate-x-[3%] 
              bottom-[calc(35vh-136px)] md:bottom-[calc(40vh-172px)] 
              lg:bottom-[calc(45vh-164px)] xl:bottom-[calc(45vh-13vw)]
              w-155 md:w-180 lg:min-w-206.5 lg:w-[57.75vw]
              pointer-events-none
            "
          >
            <Image
              src="/assets/hill_light.png"
              width={826}
              height={452}
              alt="Hill"
              className="w-full object-contain blur-[1px]"
            />
          </motion.div>

          {/* Hill Layer 2 (Dark) */}
          <motion.div
            style={{
              right: "50%",
              y: finalDarkY,
              translateY: isGroundOverflowing ? "75vh" : "0px",
              filter: filterStyle,
              bottom:
                isLargeScreen && !isGroundOverflowing
                  ? window.innerWidth > 1280
                    ? `calc(${groundHeightVh} - 16.67vw - 192px)`
                    : `calc(${groundHeightVh} - 400px)`
                  : undefined,
            }}
            className="
              absolute z-25 flex items-end origin-bottom
              translate-x-[9%] md:translate-x-[10%] lg:translate-x-[5%] 
              bottom-[calc(35vh-148px)] md:bottom-[calc(40vh-196px)] 
              lg:bottom-[calc(40vh-252px)] xl:bottom-[calc(45vh-16.67vw)] 
              w-155 md:w-193 lg:min-w-257 lg:w-[71.38vw]
              pointer-events-none
            "
          >
            <Image
              src="/assets/hill_dark.png"
              width={1028}
              height={560}
              alt="Hill Cave"
              className="w-full object-contain"
            />
          </motion.div>

          {/* Foreground Plain */}
          <div className="absolute bottom-0 left-0 w-full flex justify-center z-30">
            {/* Button */}
            <motion.div
              style={{
                left: "50%", // Start at the horizontal middle
                x: "-50%",
                y: finalButtonY,
                translateY: buttonParallax,
              }}
              className="
                  absolute z-50 flex justify-center
                  bottom-[5vh]
                  w-45 md:w-56 lg:w-64
                "
              onClick={() => {
                // Scroll smoothly to trigger transition automatically
                smoothScrollToBottom(2200);
              }}
            >
              <Image
                src="/assets/button.png"
                width={1028}
                height={560}
                alt="Hill Cave"
                className="w-full object-contain hover:scale-110 active:scale-90 transition-transform duration-200"
              />
            </motion.div>
            <motion.div
              ref={groundRef}
              className="
                absolute left-1/2 -translate-x-1/2
                w-full min-h-71 h-[35vh] md:min-h-97 md:h-[40vh] lg:min-h-0 lg:h-auto lg:aspect-1280/440
                -bottom-[5vh] md:-bottom-[7.5vh] lg:-bottom-16 xl:-bottom-28
                z-30
              "
              animate={{
                scale: [3, 1],
                transition: { type: "tween", duration: 1, ease: "easeInOut" },
              }}
              style={{
                filter: foregroundFilter,
                translateY: isGroundOverflowing ? "75vh" : "0px",
              }}
            >
              {/* Day Foreground */}
              <motion.div
                style={{ opacity: dayOpacity }}
                className="absolute z-1 inset-0"
              >
                <Image
                  src="/assets/grass_plain_day.png"
                  alt="Day Plain"
                  fill
                  className="object-cover lg:object-contain object-bottom"
                  priority
                />
              </motion.div>

              {/* Night Foreground */}
              <motion.div className="absolute inset-0">
                <Image
                  src="/assets/grass_plain_night.png"
                  alt="Night Plain"
                  fill
                  className="object-cover lg:object-contain object-bottom"
                  priority
                />
              </motion.div>
            </motion.div>

            {/* Underground Entrance Section */}
            <div
              className="
              absolute left-0 w-full top-[5vh] md:top-[7.5vh] lg:top-16 xl:top-28 z-20
              h-[51vh] md:h-[58vh] lg:h-auto lg:aspect-2760/1385
              min-h-103 md:min-h-141 lg:min-h-0 
            "
              style={{
                // Underground also gets pushed by the same offset
                transform: isGroundOverflowing
                  ? "translateY(75vh)"
                  : "translateY(0px)",
              }}
            >
              <Image
                src="/assets/tunnel.png"
                alt="Underground"
                fill
                className="object-cover lg:object-contain object-top brightness-80"
              />
              {/* Inner shadow overlay — fades the tunnel's bottom edge into the black void */}
              <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 12%, rgba(0,0,0,0) 30%)",
                }}
              />
            </div>

            {/* Black Void — sits directly below the tunnel, covers all layers behind it.
                Positioning mirrors the tunnel: tunnel top = 5vh/7.5vh/top-16/top-28,
                tunnel height = 51vh/58vh/aspect-2760/1385, so void top = their sum. */}
            <div
              className="
                absolute left-0 w-screen min-h-[300vh] z-40 bg-black
                top-[max(calc(5vh+51vh),calc(5vh+412px))]
                md:top-[max(calc(7.5vh+58vh),calc(7.5vh+564px))]
                lg:top-[calc(4rem+50.18vw)] xl:top-[calc(7rem+50.18vw)]
              "
              style={{
                transform: isGroundOverflowing
                  ? "translateY(75vh)"
                  : "translateY(0px)",
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Hero;
