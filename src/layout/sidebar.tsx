"use client";

import {
  Sidebar as RadixSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FolderKanban,
  BookOpen,
  Briefcase,
  Mail,
  LogOut,
  User,
} from "lucide-react";

import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useExitSite } from "./main-wrapper";
import { useState, useRef, useEffect, useCallback } from "react";
import { flushSync } from "react-dom";
import { getIconConfig } from "@/lib/utils";

const navMain = [
  { title: "Home", url: "/", icon: LayoutDashboard },
  { title: "Experiences", url: "/experiences", icon: Briefcase },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Blog", url: "/blog", icon: BookOpen },
  { title: "About", url: "/about", icon: User },
  { title: "Contact", url: "/contact", icon: Mail },
];

function TornPaperBg() {
  return (
    <>
      <svg className="absolute size-0" aria-hidden="true">
        <filter id="torn-paper">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.035"
            numOctaves="5"
            seed="3"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="10"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      <div
        className="absolute inset-0 -inset-x-0.5 z-0 rounded-md bg-sidebar-accent"
        style={{
          filter: "url(#torn-paper)",
        }}
      />
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const exitSite = useExitSite();
  const [isDark, setIsDark] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { icon: IconLit } = getIconConfig("lit");
  const { icon: IconUnlit } = getIconConfig("unlit");

  let duration = 400;

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    const { top, left, width, height } = button.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const maxRadius = Math.hypot(
      Math.max(x, viewportWidth - x),
      Math.max(y, viewportHeight - y),
    );

    const applyTheme = () => {
      const newTheme = !isDark;
      setIsDark(newTheme);
      document.documentElement.classList.toggle("dark");
      localStorage.setItem("theme", newTheme ? "dark" : "light");
    };

    if (typeof document.startViewTransition !== "function") {
      applyTheme();
      return;
    }

    const transition = document.startViewTransition(() => {
      flushSync(applyTheme);
    });

    const ready = transition?.ready;
    if (ready && typeof ready.then === "function") {
      ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      });
    }
  }, [isDark, duration]);
  return (
    <RadixSidebar
      variant="floating"
      collapsible="icon"
      className="pointer-events-auto"
    >
      <SidebarHeader className="px-4 py-4 overflow-hidden">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold tracking-wide text-sidebar-foreground truncate">
            Akmal
          </span>
          <span className="text-xs text-sidebar-foreground/50 truncate">
            Portfolio
          </span>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => {
                const isActive =
                  item.url === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title} className="relative">
                    <AnimatePresence>
                      {isActive && (
                        <>
                          <motion.div
                            key={`paper-${item.url}`}
                            className="absolute inset-0"
                            initial={{ rotate: 0, scale: 0.95 }}
                            animate={{
                              rotate: [0, -1.5, 1.5, -0.75, 0.75, 0],
                              scale: 1,
                            }}
                            transition={{
                              rotate: { duration: 0.3, ease: "easeOut" },
                              scale: { duration: 0.2, ease: "easeOut" },
                            }}
                          >
                            <TornPaperBg />
                          </motion.div>
                          <motion.div
                            key={`tack-${item.url}`}
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 15,
                              delay: 0.15,
                            }}
                            className="absolute -top-2 -right-1.25 z-10 pointer-events-none origin-center"
                          >
                            <Image
                              src="/assets/bulletin_tack.png"
                              alt=""
                              width={12}
                              height={12}
                            />
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      size={"lg"}
                      className={
                        isActive
                          ? "bg-transparent! text-sidebar-accent-foreground relative z-10"
                          : ""
                      }
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="px-2.5 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton ref={buttonRef} onClick={toggleTheme}>
              {!isDark ? (
                <IconLit className="size-full" />
              ) : (
                <IconUnlit className="size-full" />
              )}
              <span>{!isDark ? "Light Mode" : "Dark Mode"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={exitSite}>
              <LogOut />
              <span>Exit</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />

      <SidebarTrigger className="hidden md:flex absolute -right-6 bg-sidebar top-1.75 z-10 rounded-l-none border border-sidebar-border border-l-0" />
    </RadixSidebar>
  );
}
