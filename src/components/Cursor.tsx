import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./styles/Cursor.css";

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const hoverRef = useRef(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const onMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };

      const el = document.elementFromPoint(e.clientX, e.clientY);
      const target = el?.closest("[data-cursor]") as HTMLElement | null;

      if (target) {
        const type = target.dataset.cursor;
        if (type === "icons") {
          hoverRef.current = true;
          const rect = target.getBoundingClientRect();
          const h = getComputedStyle(target).getPropertyValue("--cursorH") || "60px";
          gsap.to(cursor, {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            width: rect.width,
            height: h,
            duration: 0.3,
          });
          cursor.classList.add("cursor-hover");
        } else if (type === "disable") {
          cursor.classList.add("cursor-disabled");
        }
      } else {
        hoverRef.current = false;
        cursor.classList.remove("cursor-hover", "cursor-disabled");
      }
    };

    const animate = () => {
      if (!hoverRef.current) {
        posRef.current.x += (targetRef.current.x - posRef.current.x) / 6;
        posRef.current.y += (targetRef.current.y - posRef.current.y) / 6;
        gsap.set(cursor, { x: posRef.current.x, y: posRef.current.y });
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return <div ref={cursorRef} className="custom-cursor" />;
};

export default Cursor;
