'use client';

import { useEffect, useState } from "react";
import { waitForUserStorage } from "@/lib/user-storage";
import Unlock from "./Unlock";
import Vault from "./Vault";
import type { EleuVault } from "../types";

export default function EleuthiaClient() {
  const [storageReady, setStorageReady] = useState(false);
  const [k, setK] = useState<CryptoKey | null>(null);
  const [v, setV] = useState<EleuVault | null>(null);

  useEffect(() => {
    waitForUserStorage().then(() => setStorageReady(true));
  }, []);

  if (!storageReady) {
    return (
      <div className="py-10 text-center text-sm text-gray-500">
        Loading…
      </div>
    );
  }

  if (!k || !v) {
    return (
      <div className="py-10">
        <Unlock onUnlock={(key, vault) => { setK(key); setV(vault); }} />
      </div>
    );
  }

  return (
    <div className="py-6">
      <Vault cryptoKey={k} initial={v} onLock={() => { setK(null); setV(null); }} />
    </div>
  );
}
