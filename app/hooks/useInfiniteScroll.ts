import { useCallback } from "react";

export const useInfiniteScroll = (callback: () => void, hasMore: boolean) => {
  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (!node || !hasMore) return;

      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          callback();
        }
      });

      observer.observe(node);

      return () => observer.disconnect();
    },
    [callback, hasMore],
  );

  return ref;
};
