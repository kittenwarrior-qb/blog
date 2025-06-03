import gsap from "gsap";

export function AnimationWrapper({
  children,
  fromOpacity = 0,
  toOpacity = 1,
  fromY = 50,
  toY = 0,
  duration = 1,
  delay = 0,
  stagger = 0.1,
  targetClass = "animate-item", 
}: {
  children: string;
  fromOpacity?: number;
  toOpacity?: number;
  fromY?: number;
  toY?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  targetClass?: string;
}): string {
  const wrapperId = `animation-wrapper-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  setTimeout(() => {
    const wrapper = document.getElementById(wrapperId);
    if (wrapper) {
      const items = wrapper.querySelectorAll(`.${targetClass}`);
      if (items.length > 0) {
        gsap.fromTo(
          items,
          { opacity: fromOpacity, y: fromY },
          {
            opacity: toOpacity,
            y: toY,
            duration,
            delay,
            stagger, 
            ease: "power2.out",
          }
        );
      } else {
        // Nếu không có item cụ thể, animate toàn wrapper
        gsap.fromTo(
          wrapper,
          { opacity: fromOpacity, y: fromY },
          {
            opacity: toOpacity,
            y: toY,
            duration,
            delay,
          }
        );
      }
    }
  }, 0);

  return `<div id="${wrapperId}">${children}</div>`;
}
