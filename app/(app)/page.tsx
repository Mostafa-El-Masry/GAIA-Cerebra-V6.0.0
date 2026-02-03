"use client";

import NoScroll from "./home/components/NoScroll";
import HomeView from "./home/components/HomeView";

export default function HomePage() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <NoScroll />
      <HomeView />
    </main>
  );
}
