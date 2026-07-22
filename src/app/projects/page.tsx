"use client";

import { useState } from "react";
import { ProjectCard, ProjectGrid } from "@/components/molecule/project-card";
import { TooltipPointer } from "@/components/ui/tooltip-pointer";
import { AnimatedList } from "@/components/animation/animated-list";
import { AnimatePresence } from "motion/react";

// 1. Removed all hardcoded 'index' properties
const PROJECTS_DATA = [
  {
    title: "PASTI Kemenkum Superapp",
    description:
      "A unified national-level SuperApp consolidating fragmented ministry services, such as LLC Registration, Trademark/Brand, Copyright, Trade Secrets, etc. into a single cohesive web and mobile platform.",
    techStacks: ["Laravel", "Three.js", "Vue", "TailwindCSS"],
    liveUrl: "https://prima.itb.ac.id",
    displayType: "responsive" as const,
    previewContent: (
      <div className="w-70 h-37.5 border border-white/10 rounded-lg overflow-hidden shadow-xl">
        <img
          src={"/assets/projects/superapp_splash.png"}
          alt={""}
          className="object-cover relative"
        />
      </div>
    ),
    desktopContent: (
      <div className="relative bg-[#f5f5f5] w-full">
        <img
          src={"/assets/projects/superapp_home.png"}
          alt={""}
          className="w-full object-cover block"
        />
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={"/assets/projects/superapp_sidebar.png"}
            alt={""}
            className="sticky top-px left-px w-[20%] object-cover z-1 pointer-events-auto"
          />
        </div>
      </div>
    ),
    mobileContent: (
      <div className="flex flex-col w-full relative">
        <img
          src={"/assets/projects/superapp_mobile.png"}
          alt={""}
          className="object-cover w-full"
        />
        <div className="sticky bottom-0 w-full h-0 z-1">
          <img
            src={"/assets/projects/superapp_mobile_navbar.png"}
            alt={""}
            className="absolute bottom-0 w-full object-cover"
          />
        </div>
      </div>
    ),
  },
  {
    title: "Raung Kost",
    description:
      "Responsive internal micro-frontend system engineered using modern layout metrics and canvas viewport trackers.",
    techStacks: ["ReactJS", "Webpack", "TailwindCSS", "Lucide"],
    repoUrl: "https://github.com/akmal/octobiz",
    liveUrl: "https://example.com",
    displayType: "responsive" as const,
    previewContent: (
      <div className="w-70 h-37.5 border border-white/10 rounded-lg overflow-hidden shadow-xl">
        <img
          src={"/assets/projects/raung_kost_home.png"}
          alt={""}
          className="object-cover relative -top-6"
        />
      </div>
    ),
    desktopContent: (
      <div className="flex flex-col w-full relative">
        <div className="sticky top-0 w-full h-0 z-1">
          <img
            src={"/assets/projects/raung_kost_header.png"}
            alt={""}
            className="smart-header absolute w-full object-cover"
          />
        </div>
        <img
          src={"/assets/projects/raung_kost_home.png"}
          alt={""}
          className="object-cover"
        />
      </div>
    ),
    mobileContent: (
      <div className="flex flex-col w-full relative overflow-clip">
        <div className="sticky top-0 w-full h-0 z-1">
          <img
            src={"/assets/projects/raung_kost_header_mobile.png"}
            alt={""}
            className="smart-header absolute w-full object-cover"
          />
        </div>
        <img
          src={"/assets/projects/raung_kost_book.png"}
          alt={""}
          className="object-cover"
        />
        <div className="sticky bottom-0 w-full h-0 z-1">
          <img
            src={"/assets/projects/raung_kost_bottom_nav_mobile.png"}
            alt={""}
            className="smart-bottom-nav absolute bottom-0 w-full object-cover"
          />
        </div>
      </div>
      // <div className="flex flex-col w-full relative overflow-hidden">
      //   {/* Header - Stays relative to viewport */}
      //   <div className="absolute top-0 w-full z-1">
      //     <img
      //       src={"/assets/projects/raung_kost_header_mobile.png"}
      //       className="smart-header w-full object-cover"
      //     />
      //   </div>

      //   {/* Scrollable Content: Wrap only the content */}
      //   <div className="w-full h-full overflow-y-auto">
      //     <img
      //       src={"/assets/projects/raung_kost_book.png"}
      //       className="object-cover w-full"
      //     />
      //   </div>

      //   {/* Bottom Nav: Absolute positioned outside the scrollable area */}
      //   <div className="absolute bottom-0 w-full z-1">
      //     <img
      //       src={"/assets/projects/raung_kost_bottom_nav_mobile.png"}
      //       className="smart-bottom-nav w-full object-cover"
      //     />
      //   </div>
      // </div>
    ),
  },
  {
    title: "OctoBiz Platform Module",
    description:
      "Responsive internal micro-frontend system engineered using modern layout metrics and canvas viewport trackers.",
    techStacks: ["ReactJS", "Webpack", "TailwindCSS", "Lucide"],
    repoUrl: "https://github.com/akmal/octobiz",
    liveUrl: "https://example.com",
    displayType: "responsive" as const,
    previewContent: (
      <div className="w-70 h-37.5 border border-white/10 rounded-lg overflow-hidden shadow-xl">
        <img
          src={"/assets/projects/OSKM_ITB_Home.png"}
          alt={""}
          className="object-cover relative"
        />
      </div>
    ),
    desktopContent: (
      <div className="flex flex-col w-full relative">
        <div className="sticky top-px w-full h-0 z-1">
          <img
            src={"/assets/projects/OSKM_ITB_Nav.png"}
            alt={""}
            className="absolute px-[5.5%] w-full object-cover"
          />
        </div>
        <img
          src={"/assets/projects/OSKM_ITB_Home.png"}
          alt={""}
          className="object-cover"
        />
      </div>
    ),
    mobileContent: (
      <div className="flex flex-col w-full relative">
        <div className="sticky top-px w-full h-0 z-1">
          <img
            src={"/assets/projects/OSKM_ITB_Nav_Mobile.png"}
            alt={""}
            className="absolute w-full object-cover"
          />
        </div>
        <img
          src={"/assets/projects/OSKM_ITB_About.png"}
          alt={""}
          className="object-cover"
        />
      </div>
    ),
  },
  {
    title: "PRIMA ITB 2023",
    description:
      "Virtual exhibition platform for ITB's research, innovation, and community service fair — featuring a 3D walkthrough and digital gallery.",
    techStacks: ["Laravel", "Threejs", "Vue", "TailwindCSS"],
    liveUrl: "https://prima.itb.ac.id",
    displayType: "responsive" as const,
    previewContent: (
      <div className="w-70 h-37.5 border border-white/10 rounded-lg overflow-hidden shadow-xl">
        <img
          src={"/assets/projects/superapp_splash.png"}
          alt={""}
          className="object-cover relative"
        />
      </div>
    ),
    desktopContent: (
      <div className="relative bg-[#f5f5f5] w-full">
        <img
          src={"/assets/projects/superapp_home.png"}
          alt={""}
          className="w-full object-cover block"
        />
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={"/assets/projects/superapp_sidebar.png"}
            alt={""}
            className="sticky top-1 left-1 w-[20%] object-cover z-1 pointer-events-auto"
          />
        </div>
      </div>
    ),
    mobileContent: (
      <div className="flex flex-col w-full relative">
        <img
          src={"/assets/projects/superapp_mobile.png"}
          alt={""}
          className="object-cover w-full"
        />
        <div className="sticky bottom-0 w-full h-0 z-1">
          <img
            src={"/assets/projects/superapp_mobile_navbar.png"}
            alt={""}
            className="absolute bottom-0 w-full object-cover"
          />
        </div>
      </div>
    ),
  },
  {
    title: "DevFlow CLI",
    description:
      "A scriptable command-line toolkit for automating release workflows — changelog generation, semver bumping, and GitHub Release publishing.",
    techStacks: ["Node.js", "TypeScript", "GitHub API", "Commander"],
    repoUrl: "https://github.com/akmal/devflow",
    displayType: "double-desktop" as const,
    previewContent: (
      <div className="w-[280px] h-[150px] bg-[#0d1117] flex flex-col justify-center border border-white/10 rounded-lg p-4 font-geist-mono text-[10px] text-green-400 shadow-xl">
        <p>$ devflow release</p>
        <p className="text-slate-500">✓ Release published</p>
      </div>
    ),
    desktopContent: (
      <div className="bg-[#0d1117] text-green-400 p-5 font-geist-mono text-xs min-h-[400px] space-y-1">
        <p>
          <span className="text-slate-500">$</span> devflow release --bump minor
        </p>
        <p className="text-slate-500">→ Bumping version 1.3.0 → 1.4.0</p>
        <p className="text-green-400">✓ Release published</p>
      </div>
    ),
  },
];

export default function WorkHistoryView() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [openIndices, setOpenIndices] = useState<number[]>([]);

  // 2. Direct array lookup is faster and cleaner than .find()
  const currentHoveredProject =
    hoveredIndex !== null ? PROJECTS_DATA[hoveredIndex] : null;

  const toggleProjectOpen = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
    setHoveredIndex(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-24 pointer-events-auto relative min-h-screen">
      <h2 className="text-white/40 font-geist-mono text-xs uppercase tracking-widest mb-8">
        // Selected Production Work
      </h2>

      {/* Floating Pointer View Synchronizer */}
      <AnimatePresence>
        {hoveredIndex !== null &&
          !openIndices.includes(hoveredIndex) &&
          currentHoveredProject && (
            <TooltipPointer isVisible={hoveredIndex !== null}>
              {currentHoveredProject.previewContent}
            </TooltipPointer>
          )}
      </AnimatePresence>

      {/* Entry animation wrapper giving the entire grid its classic rotational jitter style entry */}
      {/* <AnimatedEntry> */}
      <ProjectGrid>
        <AnimatedList className="flex flex-col w-full gap-0">
          {/* 3. Using the native array index mapIndex */}
          {PROJECTS_DATA.map((project, mapIndex) => {
            const isProjectOpen = openIndices.includes(mapIndex);

            return (
              <ProjectCard
                // Using title as key is safer than index for static data
                key={project.title}
                // Pass mapIndex + 1 so it still renders as 01, 02, 03...
                index={mapIndex + 1}
                title={project.title}
                description={project.description}
                techStacks={project.techStacks}
                repoUrl={project.repoUrl}
                liveUrl={project.liveUrl}
                displayType={project.displayType}
                isOpen={isProjectOpen}
                // Pass mapIndex directly to your state handlers
                onOpen={() => toggleProjectOpen(mapIndex)}
                onClose={() => toggleProjectOpen(mapIndex)}
                onHoverStart={() => !isProjectOpen && setHoveredIndex(mapIndex)}
                onHoverEnd={() => setHoveredIndex(null)}
                mobileChildren={project.mobileContent}
              >
                {project.desktopContent}
              </ProjectCard>
            );
          })}
        </AnimatedList>
      </ProjectGrid>
      {/* </AnimatedEntry> */}
    </div>
  );
}
