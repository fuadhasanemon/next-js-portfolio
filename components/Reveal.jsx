/**
 * Declarative wrapper around the `.reveal` utility. `delay` staggers siblings;
 * `y`, `scale` and `blur` tune the entrance without new CSS per use-site.
 */
const Reveal = ({
  as: Tag = "div",
  delay = 0,
  y = 22,
  scale = 1,
  blur = 6,
  className = "",
  style,
  children,
  ...rest
}) => (
  <Tag
    className={`reveal ${className}`}
    style={{
      "--reveal-delay": `${delay}ms`,
      "--reveal-y": `${y}px`,
      "--reveal-s": scale,
      "--reveal-blur": `${blur}px`,
      ...style,
    }}
    {...rest}
  >
    {children}
  </Tag>
);

export default Reveal;
