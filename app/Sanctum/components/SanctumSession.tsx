"use client";

import { useCallback, useEffect, useState } from "react";
import { MAX_CHARACTERS_PER_SESSION, canWrite, mustExit } from "../rules";

export default function SanctumSession() {
  const [text, setText] = useState("");
  const [locked, setLocked] = useState(false);

  const submit = useCallback(() => {
    if (locked) return;
    setLocked(true);
  }, [locked]);

  useEffect(() => {
    if (text.length >= MAX_CHARACTERS_PER_SESSION) {
      submit();
    }
  }, [text.length, submit]);

  useEffect(() => {
    if (mustExit()) {
      setLocked(true);
    }
  }, []);

  if (locked) {
    return null;
  }

  if (!canWrite()) {
    return null;
  }

  const remaining = MAX_CHARACTERS_PER_SESSION - text.length;

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => {
          const next = e.target.value;
          if (next.length <= MAX_CHARACTERS_PER_SESSION) {
            setText(next);
          }
        }}
        maxLength={MAX_CHARACTERS_PER_SESSION}
        disabled={locked}
      />
      <p>{text.length} / {MAX_CHARACTERS_PER_SESSION}</p>
    </div>
  );
}
