const Icon = ({ src, alt, className = "" }) => {
  return (
    <div
      className={`icon-wrapper ${className}`}
      style={{
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        backgroundColor: "currentColor",
        width: "16px",
        height: "16px",
        display: "inline-block",
      }}
      aria-label={alt}
    />
  );
};

export default Icon;
