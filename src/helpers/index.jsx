import gsap from "gsap";

const renderText = (text, className, baseWeight = 400) => {
  return [...text].map((char, index) => (
    <span
      key={index}
      className={className}
      style={{ fontVariationSettings: `'wght' ${baseWeight}` }}
    >
      {char === " " ? "\u00A0" : char}
    </span>
  ));
};

const setupTextHover = (container, type, selector = "span", fontWeights) => {
  if (!container) return;

  const letters = container.querySelectorAll(selector);

  const { min, max, default: baseWeight } = fontWeights[type];

  const animateLetter = (letter, weight, duration = 0.25) => {
    gsap.to(letter, {
      fontVariationSettings: `'wght' ${weight}`,
      duration,
      ease: "power2.out",
    });
  };

  const handleMouseMove = (e) => {
    const { left } = container.getBoundingClientRect();
    const mouseX = e.clientX - left;

    letters.forEach((letter) => {
      const { left: l, width: w } = letter.getBoundingClientRect();
      const distance = Math.abs(mouseX - (l - left + w / 2));
      const intensity = Math.exp(-(distance ** 2) / 20000);

      animateLetter(letter, min + (max - min) * intensity);
    });
  };

  const handleMouseLeave = () =>
    letters.forEach((letter) => animateLetter(letter, baseWeight, 0.3));

  container.addEventListener("mousemove", handleMouseMove);

  container.addEventListener("mouseleave", handleMouseLeave);

  return () => {
    container.removeEventListener("mousemove", handleMouseMove);
    container.removeEventListener("mouseleave", handleMouseLeave);
  };
};

export { renderText, setupTextHover };
