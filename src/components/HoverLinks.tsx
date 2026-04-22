import { useRef, type MouseEvent } from "react";
import gsap from "gsap";

interface Props {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const HoverLinks = ({ children, className = "", onClick }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  const onEnter = (e: MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(ref.current, { x: x * 0.3, y: y * 0.3, duration: 0.3 });
  };

  const onLeave = () => {
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.4)" });
  };

  return (
    <div
      ref={ref}
      className={`hover-link ${className}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default HoverLinks;
