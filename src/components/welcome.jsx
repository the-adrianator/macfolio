import { useRef } from "react";
import { WELCOME_TEXT } from "@constants";
import { useGSAP } from "@gsap/react";
import { renderText, setupTextHover } from "@helpers";

const FONT_WEIGHTS = {
  subtitle: { min: 100, max: 400, default: 100 },
  title: { min: 400, max: 900, default: 400 },
}

const Welcome = () => {
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

  const selector = "span";

  useGSAP(() => {
    const titleCleanup =  setupTextHover(titleRef.current, "title", selector, FONT_WEIGHTS);
    const subtitleCleanup = setupTextHover(subtitleRef.current, "subtitle", selector, FONT_WEIGHTS);

    return () => {
      titleCleanup?.();
      subtitleCleanup?.();
    }
  }, []);

  return (
    <section id="welcome">
      <p ref={subtitleRef}>
        {renderText(WELCOME_TEXT.subtitle_text, "text-3xl font-georama", 100)}
      </p>
      <h1 ref={titleRef} className="mt-7">
        {renderText(WELCOME_TEXT.title_text, "text-9xl italic font-georama")}
      </h1>

      <div className="small-screen">
        <p>This Portfolio is best viewed on desktop/tablet screens</p>
      </div>
    </section>
  );
};

export default Welcome;
