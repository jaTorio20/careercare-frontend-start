import { useEffect } from "react";

export function useHeaderHeight(headerId = "app-header") {
  useEffect(() => {
    // Only run on the client
    if (typeof window === 'undefined') return;
    
    const header = document.getElementById(headerId);
    if (!header) return;

    const update = () => {
      const height = header.offsetHeight;
      document.documentElement.style.setProperty(
        "--header-h",
        `${height}px`
      );
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(header);

    return () => observer.disconnect();
  }, [headerId]);
}
