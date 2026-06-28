import { useCallback } from "react";
import { apiPost } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";
import type { ZODigest, ZODigestRequest } from "@/types";

export function useZODigest() {
  const setZODigest = useAppStore((s) => s.setZODigest);
  const setZODigestLoading = useAppStore((s) => s.setZODigestLoading);
  const digest = useAppStore((s) => s.zoDigest);
  const loading = useAppStore((s) => s.zoDigestLoading);

  const clearDigest = useCallback(() => {
    setZODigest(null);
  }, [setZODigest]);

  const parseEmails = useCallback(
    async (input: string | ZODigestRequest) => {
      const payload =
        typeof input === "string"
          ? { email_text: input }
          : input;
      const hasContent = Boolean(
        payload.email_text?.trim() ||
          payload.emails?.length ||
          payload.calendar_items?.length,
      );
      if (!hasContent) return;
      setZODigestLoading(true);
      setZODigest(null);
      try {
        const result = await apiPost<ZODigest>("/zo/parse", payload);
        setZODigest(result);
        return result;
      } catch (err) {
        console.error("ZO parse error:", err);
        throw err;
      } finally {
        setZODigestLoading(false);
      }
    },
    [setZODigest, setZODigestLoading],
  );

  return { parseEmails, clearDigest, digest, loading };
}
