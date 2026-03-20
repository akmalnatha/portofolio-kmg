"use client";
import { useState } from "react";
import Intro from "./Intro";

export default function MainContentWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [introDone, setIntroDone] = useState(false);

  return (
    <>
      {!introDone && <Intro onComplete={() => setIntroDone(true)} />}
      <div>
        {children}
      </div>
    </>
  );
}
