"use client";

import React, { useState } from "react";
import InstagramHeader from "../components/InstagramHeader";
import { PexelsImageGrid } from "../components/PexelsImageGrid";
import { useInstagramData } from "../hooks/useInstagramData";

const ExplorePage: React.FC = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const { items } = useInstagramData({ fixedShuffleSeed: "explore_seed" });

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  return (
    <main>
      <InstagramHeader />
      <div>
        <h1>Explore</h1>
        <PexelsImageGrid items={items} />
      </div>
    </main>
  );
};

export default ExplorePage;
