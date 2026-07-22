"use client";
import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useState,
} from "react";
import { MainBackground } from "./main-background";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Intro from "@/section/Intro";
import Outro from "@/section/Outro";
import Hero from "@/section/Hero";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Sidebar } from "./sidebar";

// Module-level flag survives React re-mounts during the session
let hasEnteredSite = false;

// Context to allow children (like the sidebar) to trigger site exit
const ExitSiteContext = createContext<(() => void) | null>(null);

export function useExitSite() {
  const ctx = useContext(ExitSiteContext);
  if (!ctx) throw new Error("useExitSite must be used within MainWrapper");
  return ctx;
}

function SiteContent({
  children,
  onExitSite,
}: {
  children: React.ReactNode;
  onExitSite: () => void;
}) {
  return (
    <ExitSiteContext.Provider value={onExitSite}>
      <MainBackground>
        <SidebarProvider>
          <Sidebar />
          <div className="w-full min-h-screen">
            <SidebarTrigger className="pointer-events-auto md:hidden fixed top-2 left-2 z-20 border border-sidebar border-l-0" />
            {children}
          </div>
        </SidebarProvider>
      </MainBackground>
    </ExitSiteContext.Provider>
  );
}

function RootRouteHandler({
  children,
  onEnterSite,
  onExitSite,
}: {
  children: React.ReactNode;
  onEnterSite: () => void;
  onExitSite: () => void;
}) {
  const searchParams = useSearchParams();
  const isSiteView = searchParams.get("v") === "site";
  const [introDone, setIntroDone] = useState(false);

  const handleIntroComplete = useCallback(() => {
    setIntroDone(true);
    onEnterSite();
  }, [onEnterSite]);

  const showHero = !isSiteView;
  const showIntro = isSiteView && !introDone;

  return (
    <>
      {showIntro && <Intro onComplete={handleIntroComplete} />}
      {showHero ? (
        <Hero />
      ) : (
        <SiteContent onExitSite={onExitSite}>{children}</SiteContent>
      )}
    </>
  );
}

export default function MainWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isRoot = pathname === "/";
  const [, forceUpdate] = useState(0);
  // "none" → "outro" (text sequence) → "reverse-hero" (parallax rewind) → "hero" (scrollable hero) → "intro" (re-enter intro)
  const [exitStage, setExitStage] = useState<"none" | "outro" | "reverse-hero" | "hero" | "intro">("none");

  // If user navigates to any non-root page, they've entered the site
  if (!isRoot && !hasEnteredSite) {
    hasEnteredSite = true;
  }

  const handleEnterSite = useCallback(() => {
    hasEnteredSite = true;
    setExitStage("none");
    forceUpdate((n) => n + 1);
  }, []);

  const handleExitSite = useCallback(() => {
    setExitStage("outro");
  }, []);

  const handleOutroComplete = useCallback(() => {
    setExitStage("reverse-hero");
  }, []);

  const handleReverseHeroComplete = useCallback(() => {
    hasEnteredSite = false;
    window.scrollTo(0, 0);
    setExitStage("hero");
    router.replace("/", { scroll: false });
  }, [router]);

  const handleHeroScrollComplete = useCallback(() => {
    setExitStage("intro");
  }, []);

  // Stage 1: Show outro text overlay
  if (exitStage === "outro") {
    return (
      <>
        <SiteContent onExitSite={handleExitSite}>{children}</SiteContent>
        <Outro onComplete={handleOutroComplete} />
      </>
    );
  }

  // Stage 2: Show hero in reverse parallax
  if (exitStage === "reverse-hero") {
    return <Hero reverse onReverseComplete={handleReverseHeroComplete} />;
  }

  // Stage 3: Hero landed — show normal scrollable hero without entry animations
  if (exitStage === "hero") {
    return <Hero skipEntry onScrollComplete={handleHeroScrollComplete} />;
  }

  // Stage 4: Play intro over site content — when intro wipes away, site is visible behind it
  if (exitStage === "intro") {
    return (
      <>
        <SiteContent onExitSite={handleExitSite}>{children}</SiteContent>
        <Intro onComplete={handleEnterSite} />
      </>
    );
  }

  // Once the user has entered the site, always show SiteContent
  if (hasEnteredSite) {
    return (
      <SiteContent onExitSite={handleExitSite}>{children}</SiteContent>
    );
  }

  // First visit to root — check search params for intro/hero flow
  return (
    <Suspense fallback={<div className="bg-black h-screen" />}>
      <RootRouteHandler
        onEnterSite={handleEnterSite}
        onExitSite={handleExitSite}
      >
        {children}
      </RootRouteHandler>
    </Suspense>
  );
}
