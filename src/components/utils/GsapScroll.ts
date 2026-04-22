import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function setAllTimeline() {
  const careerSection = document.querySelector<HTMLElement>(".career-section");
  if (!careerSection) return;

  const timeline = careerSection.querySelector<HTMLElement>(".career-timeline");
  const boxes = careerSection.querySelectorAll<HTMLElement>(".career-info-box");

  if (timeline) {
    gsap.fromTo(
      timeline,
      { maxHeight: "10%" },
      {
        maxHeight: "100%",
        scrollTrigger: {
          trigger: careerSection,
          start: "top 70%",
          end: "bottom 80%",
          scrub: 1,
        },
      }
    );
  }

  if (boxes.length) {
    boxes.forEach((box, i) => {
      gsap.fromTo(
        box,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          scrollTrigger: {
            trigger: box,
            start: "top 85%",
            toggleActions: "play pause resume reverse",
          },
          delay: i * 0.1,
        }
      );
    });
  }
}
