import { useRef } from "react";
import { dockApps } from "@constants";
import { Tooltip } from "react-tooltip";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import useWindowStore from "@store/window";

const Dock = () => {
  const { openWindow, closeWindow, windows } = useWindowStore();
  const dockRef = useRef(null);
  const dockSectionRef = useRef(null);

  useGSAP(() => {
    const dock = dockRef.current;
    const dockSection = dockSectionRef.current;
    if (!dock || !dockSection) return;

    const icons = dock.querySelectorAll(".dock-icon");
    const iconScales = new Map();
    const iconBaseSizes = new Map();

    // Constants
    const CONFIG = {
      maxScale: 1.8,
      baseScale: 1,
      maxDistance: 150,
      revealDistance: 100,
      dockHiddenY: 150,
      dockVisibleY: 0,
      gap: 6,
      padding: 6,
      animDuration: 0.3,
      revealDuration: 0.4,
      ease: "power2.out",
    };

    // Initialize icons
    let baseIconHeight = 0;
    icons.forEach((icon) => {
      const { width, height } = icon.getBoundingClientRect();
      iconBaseSizes.set(icon, { width, height });
      iconScales.set(icon, CONFIG.baseScale);
      baseIconHeight = Math.max(baseIconHeight, height);
      gsap.set(icon.parentElement, { width });
    });

    // Set fixed height
    const fixedHeight = baseIconHeight + CONFIG.padding * 2;
    gsap.set(dock, {
      height: fixedHeight,
      maxHeight: fixedHeight,
      minHeight: fixedHeight,
    });

    // Helper functions
    const getIconData = (icon) => ({
      baseSize: iconBaseSizes.get(icon),
      wrapperDiv: icon.parentElement,
      scale: iconScales.get(icon) || CONFIG.baseScale,
    });

    const animateIcon = (icon, scale, width) => {
      const { wrapperDiv } = getIconData(icon);
      iconScales.set(icon, scale);
      const animProps = { duration: CONFIG.animDuration, ease: CONFIG.ease };
      if (wrapperDiv) gsap.to(wrapperDiv, { width, ...animProps });
      gsap.to(icon, { scale, ...animProps });
    };

    const calculateScale = (distance) => {
      const intensity = Math.exp(
        -(Math.min(distance / CONFIG.maxDistance, 1) ** 2 * 3)
      );
      return (
        CONFIG.baseScale + (CONFIG.maxScale - CONFIG.baseScale) * intensity
      );
    };

    const calculateDockWidth = () => {
      let total = CONFIG.padding * 2;
      Array.from(icons).forEach((icon, index) => {
        const { baseSize, scale } = getIconData(icon);
        if (baseSize) {
          total +=
            baseSize.width * scale +
            (index < icons.length - 1 ? CONFIG.gap : 0);
        }
      });
      return total;
    };

    const animateDockSize = () => {
      gsap.to(dock, {
        width: calculateDockWidth(),
        duration: CONFIG.animDuration,
        ease: CONFIG.ease,
      });
    };

    const revealDock = () =>
      gsap.to(dockSection, {
        y: CONFIG.dockVisibleY,
        duration: CONFIG.revealDuration,
        ease: CONFIG.ease,
      });
    const hideDock = () =>
      gsap.to(dockSection, {
        y: CONFIG.dockHiddenY,
        duration: CONFIG.revealDuration,
        ease: CONFIG.ease,
      });

    // Icon animation
    const animateIcons = (mouseX) => {
      const { left } = dock.getBoundingClientRect();
      icons.forEach((icon) => {
        const { left: iconLeft, width: iconWidth } =
          icon.getBoundingClientRect();
        const distance = Math.abs(mouseX - (iconLeft - left + iconWidth / 2));
        const scale = calculateScale(distance);
        const { baseSize } = getIconData(icon);
        if (baseSize) animateIcon(icon, scale, baseSize.width * scale);
      });
      animateDockSize();
    };

    // Event handlers
    const handleMouseMove = (e) => {
      animateIcons(e.clientX - dock.getBoundingClientRect().left);
      revealDock();
    };

    const handleMouseLeave = () => {
      icons.forEach((icon) => {
        const { baseSize } = getIconData(icon);
        if (baseSize) animateIcon(icon, CONFIG.baseScale, baseSize.width);
      });
      animateDockSize();
    };

    const handleGlobalMouseMove = (e) => {
      const dockRect = dockSection.getBoundingClientRect();
      const isOverDock =
        e.clientX >= dockRect.left &&
        e.clientX <= dockRect.right &&
        e.clientY >= dockRect.top &&
        e.clientY <= dockRect.bottom;

      if (
        isOverDock ||
        window.innerHeight - e.clientY <= CONFIG.revealDistance
      ) {
        revealDock();
      } else {
        hideDock();
      }
    };

    // Initialize and setup
    gsap.set(dockSection, { y: CONFIG.dockHiddenY });
    dock.addEventListener("mousemove", handleMouseMove);
    dock.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mousemove", handleGlobalMouseMove);

    return () => {
      dock.removeEventListener("mousemove", handleMouseMove);
      dock.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  });

  const toggleApp = (app) => {
    if (!app.canOpen) return;

    const appWindow = windows[app.id];
    if (!appWindow) return;

    if (appWindow.isOpen) {
      closeWindow(app.id);
    } else {
      openWindow(app.id);
    }
  };

  return (
    <section id="dock" ref={dockSectionRef}>
      <div ref={dockRef} className="dock-container">
        {dockApps.map(({ id, name, icon, canOpen }) => (
          <div key={id} className="relative flex justify-center">
            <button
              type="button"
              className="dock-icon"
              aria-label={name}
              data-tooltip-id="dock-tooltip"
              data-tooltip-content={name}
              data-tooltip-delay-show={150}
              disabled={!canOpen}
              onClick={() => toggleApp({ id, canOpen })}
            >
              <img
                src={`/images/${icon}`}
                alt={name}
                loading="lazy"
                className={canOpen ? "" : "opacity-50"}
              />
            </button>
          </div>
        ))}

        <Tooltip id="dock-tooltip" place="top" className="tooltip" />
      </div>
    </section>
  );
};

export default Dock;
