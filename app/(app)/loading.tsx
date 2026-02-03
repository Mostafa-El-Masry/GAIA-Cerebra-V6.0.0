import { GLogoLoader } from "@/app/components/Loading";

/**
 * Shown by Next.js while (app) route segments are loading (e.g. navigation).
 * Uses your G logo on a dark background with a subtle pulse (eToro-style).
 */
export default function AppLoading() {
  return <GLogoLoader />;
}
