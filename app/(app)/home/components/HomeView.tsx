"use client";

import Link from "next/link";
import { HOME_NAV_LINKS, HOME_CIRCLE_RADIUS } from "../data/links";

export default function HomeView() {
  const radius = HOME_CIRCLE_RADIUS;
  const links = HOME_NAV_LINKS;

  return (
    <div className="relative w-full max-w-6xl">
      <div className="flex flex-col items-center justify-center gap-4 py-8 md:hidden">
        <img src="/gaia-intro-1.png" alt="GAIA" className="h-48 w-auto" />
        <p className="text-sm text-gray-500">Open the menu above to explore.</p>
      </div>
      <div className="relative hidden h-[640px] sm:h-[720px] lg:h-[800px] md:block">
        <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <img src="/gaia-intro-1.png" alt="GAIA" className="h-96 w-auto" />
        </div>
        {links.map((link, i) => {
          const angle = i * (360 / links.length) * (Math.PI / 180);
          const rawX = radius * Math.cos(angle);
          const rawY = radius * Math.sin(angle);
          const x = rawX.toFixed(3);
          const y = rawY.toFixed(3);
          const style = {
            transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
          };
          return (
            <Link
              key={link.href}
              href={link.href}
              className="gaia-glass octagon-link absolute left-1/2 top-1/2 flex items-center justify-center w-32 px-6 py-3 text-center text-lg font-medium backdrop-blur transition whitespace-nowrap"
              style={style}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
