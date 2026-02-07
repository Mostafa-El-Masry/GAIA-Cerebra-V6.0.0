"use client";

import { canEnterSanctum } from "../rules";
import SanctumSession from "./SanctumSession";

export default function SanctumGate() {
  if (canEnterSanctum() === false) {
    return null;
  }
  return <SanctumSession />;
}
