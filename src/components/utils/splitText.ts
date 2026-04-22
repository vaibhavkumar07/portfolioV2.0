import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function setSplitText() {
  if (window.innerWidth < 900) return;

  const paras = document.querySelectorAll<HTMLElement>(".para");
  paras.forEach((el) => {
    if (el.dataset.split) return;
    el.dataset.split = "1";
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play pause resume reverse" },
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: "power3.out",
    });
  });

  const titles = document.querySelectorAll<HTMLElement>(".title");
  titles.forEach((el) => {
    if (el.dataset.split) return;
    el.dataset.split = "1";
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play pause resume reverse" },
      opacity: 0,
      y: 30,
      duration: 0.7,
      ease: "power2.inOut",
    });
  });
}
