import { useRef, useState, useEffect, type ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  /** How far before the element enters viewport to start rendering (px) */
  rootMargin?: string;
  /** Minimum height placeholder to prevent layout shift */
  minHeight?: string;
  className?: string;
}

/**
 * Renders children only when the section scrolls near the viewport.
 * Uses IntersectionObserver with a generous margin plus a fallback
 * timer so fast-scrolling never leaves sections permanently empty.
 */
const LazySection = ({
  children,
  rootMargin = "800px",
  minHeight = "100px",
  className,
}: LazySectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);

    // Fallback: if the section is scrolled past (fast scroll / jump)
    // and never intersects, force-render after 3 seconds.
    const fallback = setTimeout(() => {
      setVisible(true);
      observer.disconnect();
    }, 3000);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, [rootMargin]);

  return (
    <div ref={ref} className={["market-lazy", className].filter(Boolean).join(" ")} style={visible ? undefined : { minHeight }}>
      {visible ? children : null}
    </div>
  );
};

export default LazySection;
