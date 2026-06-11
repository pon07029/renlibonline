"use client";

import { useEffect, useState } from "react";
import { inflatePackedSequence } from "@/lib/compact-sequence";
import { sequenceDisplayName } from "@/lib/sequence-title";
import type { PackedSequence, Sequence, SequenceMeta } from "@/lib/types";
import { PracticeSession } from "./PracticeSession";

export function sequenceDataUrl(file: string, pathname: string = window.location.pathname): string {
  const escapedFile = encodeURIComponent(file);
  const prefixedPath = pathname.replace(/\/practice\/[^/]+\/?$/, `/sequences/${escapedFile}`);
  return prefixedPath === pathname ? `/sequences/${escapedFile}` : prefixedPath;
}

export function PracticeSessionLoader({ sequence }: { sequence: SequenceMeta }) {
  const [loaded, setLoaded] = useState<Sequence | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoaded(null);
    setError(null);

    const url = sequenceDataUrl(sequence.file);

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<PackedSequence>;
      })
      .then((packed) => {
        if (!cancelled) setLoaded(inflatePackedSequence(packed));
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (!cancelled) setError(`${url} (${err instanceof Error ? err.message : "unknown error"})`);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [sequence.file]);

  if (error) {
    return <p style={{ color: "#dc2626", fontWeight: 700 }}>수순 데이터를 불러오지 못했습니다: {error}</p>;
  }

  if (!loaded) {
    return <p style={{ color: "var(--muted)", fontWeight: 700 }}>{sequenceDisplayName(sequence)} 불러오는 중...</p>;
  }

  return <PracticeSession sequence={loaded} />;
}
