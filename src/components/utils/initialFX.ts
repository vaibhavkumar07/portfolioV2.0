import gsap from "gsap";

export function initialFX() {
  document.body.style.overflow = "auto";

  const main = document.querySelector("main");
  if (main) main.classList.add("main-active");

  gsap.to("body", { backgroundColor: "#080c14", duration: 0.6 });
  gsap.from(".landing-intro span", { opacity: 0, y: 40, duration: 0.8, stagger: 0.04, ease: "power3.inOut", delay: 0.1 });
  gsap.from(".landing-name span", { opacity: 0, y: 60, duration: 0.9, stagger: 0.12, ease: "power3.inOut", delay: 0.2 });
  gsap.from(".role-line", { opacity: 0, x: -20, duration: 0.7, stagger: 0.1, ease: "power2.out", delay: 0.5 });
  gsap.from("header", { opacity: 0, y: -20, duration: 0.8, delay: 0.3 });
}
