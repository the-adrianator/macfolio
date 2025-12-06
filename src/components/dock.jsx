import { useRef } from "react";
import { dockApps } from "@constants";
import { Tooltip } from "react-tooltip";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const Dock = () => {
  const dockRef = useRef(null);
  const dockSectionRef = useRef(null);

  useGSAP(() => {
    const dock = dockRef.current;
    const dockSection = dockSectionRef.current;
    if (!dock || !dockSection) return;

    const icons = dock.querySelectorAll(".dock-icon");

    // Animation parameters - matching macOS dock behavior
    const maxScale = 1.8; // Maximum scale for icons
    const baseScale = 1; // Base scale (normal size)
    const scaleRange = maxScale - baseScale;
    const maxDistance = 150; // Distance at which scaling effect stops

    // Dock reveal parameters
    const revealDistance = 100; // Distance from bottom to start revealing dock
    const dockHiddenY = 150; // How far down the dock is hidden (in pixels)
    const dockVisibleY = 0; // Dock visible position

    // Store current icon scales and base sizes to calculate dock size
    const iconScales = new Map();
    const iconBaseSizes = new Map();

    // Initialize icon base sizes and scales
    let baseIconHeight = 0;
    icons.forEach((icon) => {
      const { width, height } = icon.getBoundingClientRect();
      iconBaseSizes.set(icon, { width, height });
      iconScales.set(icon, baseScale);
      // Store the maximum base icon height
      baseIconHeight = Math.max(baseIconHeight, height);

      // Initialize wrapper div width to base icon width
      const wrapperDiv = icon.parentElement;
      if (wrapperDiv) {
        gsap.set(wrapperDiv, { width: width });
      }
    });

    // Set fixed height for dock container (base icon height + padding)
    const padding = 6; // p-1.5 = 6px
    const fixedHeight = baseIconHeight + padding * 2;
    // Lock the height so it never changes - only width should animate
    gsap.set(dock, {
      height: fixedHeight,
      maxHeight: fixedHeight,
      minHeight: fixedHeight,
    });

    const calculateDockWidth = () => {
      const gap = 6; // gap-1.5 = 6px - uniform spacing between icons
      const padding = 6; // p-1.5 = 6px

      // Calculate width based on scaled visual sizes to prevent overlap
      // We need to ensure each icon's scaled width + gap doesn't cause overlap
      let totalWidth = 0;

      icons.forEach((icon, index) => {
        const scale = iconScales.get(icon) || baseScale;
        const baseSize = iconBaseSizes.get(icon);

        if (baseSize) {
          // Use scaled width to ensure no overlap
          const scaledWidth = baseSize.width * scale;
          totalWidth += scaledWidth;

          // Add gap after each icon except the last one
          if (index < icons.length - 1) {
            totalWidth += gap;
          }
        }
      });

      // Add padding on both sides
      totalWidth += padding * 2;

      return totalWidth;
    };

    const animateDockSize = () => {
      const width = calculateDockWidth();
      gsap.to(dock, {
        width: width,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const animateIcons = (mouseX) => {
      const { left } = dock.getBoundingClientRect();

      icons.forEach((icon) => {
        const { left: iconLeft, width: iconWidth } =
          icon.getBoundingClientRect();
        const iconCenter = iconLeft - left + iconWidth / 2;
        const distance = Math.abs(mouseX - iconCenter);

        // Calculate scale based on distance (exponential decay)
        // Closer icons scale more, farther icons scale less
        const normalizedDistance = Math.min(distance / maxDistance, 1);
        const intensity = Math.exp(-(normalizedDistance ** 2) * 3); // Exponential decay curve
        const scale = baseScale + scaleRange * intensity;

        // Store the scale for dock size calculation
        iconScales.set(icon, scale);

        // Get the wrapper div (parent of the icon button)
        const wrapperDiv = icon.parentElement;
        const baseSize = iconBaseSizes.get(icon);

        if (baseSize && wrapperDiv) {
          // Calculate scaled width for the wrapper div to prevent overlap
          const scaledWidth = baseSize.width * scale;

          // Animate wrapper div width to accommodate scaled icon
          gsap.to(wrapperDiv, {
            width: scaledWidth,
            duration: 0.3,
            ease: "power2.out",
          });
        }

        // Animate the icon scale with smooth easing
        gsap.to(icon, {
          scale: scale,
          duration: 0.3,
          ease: "power2.out",
        });
      });

      // Animate dock size to accommodate scaled icons
      animateDockSize();
    };

    const handleMouseMove = (e) => {
      const { left } = dock.getBoundingClientRect();
      const mouseX = e.clientX - left;
      animateIcons(mouseX);

      // Keep dock visible when hovering over it
      gsap.to(dockSection, {
        y: dockVisibleY,
        duration: 0.4,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      // Reset all icons to base scale when mouse leaves
      icons.forEach((icon) => {
        iconScales.set(icon, baseScale);
        const wrapperDiv = icon.parentElement;
        const baseSize = iconBaseSizes.get(icon);

        // Reset wrapper div width to base size
        if (baseSize && wrapperDiv) {
          gsap.to(wrapperDiv, {
            width: baseSize.width,
            duration: 0.3,
            ease: "power2.out",
          });
        }

        gsap.to(icon, {
          scale: baseScale,
          duration: 0.3,
          ease: "power2.out",
        });
      });

      // Reset dock size
      animateDockSize();
      // Note: Global mouse handler will manage dock visibility
    };

    // Initialize dock as hidden
    gsap.set(dockSection, { y: dockHiddenY });

    // Add event listeners
    dock.addEventListener("mousemove", handleMouseMove);
    dock.addEventListener("mouseleave", handleMouseLeave);

    // Global mouse move to detect cursor near bottom of screen
    const handleGlobalMouseMove = (e) => {
      // Check if mouse is over the dock - if so, keep it visible
      const dockRect = dockSection.getBoundingClientRect();
      const isOverDock =
        e.clientX >= dockRect.left &&
        e.clientX <= dockRect.right &&
        e.clientY >= dockRect.top &&
        e.clientY <= dockRect.bottom;

      if (isOverDock) {
        gsap.to(dockSection, {
          y: dockVisibleY,
          duration: 0.4,
          ease: "power2.out",
        });
        return;
      }

      // Check if cursor is near bottom of screen to reveal dock
      const distanceFromBottom = window.innerHeight - e.clientY;
      if (distanceFromBottom <= revealDistance) {
        // Reveal dock by sliding it up
        gsap.to(dockSection, {
          y: dockVisibleY,
          duration: 0.4,
          ease: "power2.out",
        });
      } else {
        // Hide dock by sliding it down
        gsap.to(dockSection, {
          y: dockHiddenY,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);

    // Cleanup function
    return () => {
      dock.removeEventListener("mousemove", handleMouseMove);
      dock.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  });

  // eslint-disable-next-line no-unused-vars
  const toggleApp = (app) => {};
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
