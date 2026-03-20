import Hero from "./section/Hero";
import MainContentWrapper from "./section/MainContentWrapper";

// This is now a Server Component
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { v } = await searchParams;

  // If we are not on the "site" view, show the Hero (Your Parallax logic)
  if (v !== "site") {
    return <Hero />;
  }

  return (
    <MainContentWrapper>
      {/* Everything here is still SSR'd. 
              The wrapper just handles the visual "Intro" overlay.
           */}
      <main className="p-10">
        <h1 className="text-white text-3xl">This is SSR Content</h1>
        <p>Akmal's Projects, Experience, etc.</p>
      </main>
    </MainContentWrapper>
  );
}
