import { useCallback } from "react";

export const useScrollToElement = () => {
  const scrollToElement = useCallback((element: HTMLElement | null) => {
    element?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  return scrollToElement;
};
