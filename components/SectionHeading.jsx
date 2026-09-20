import Reveal from "@/components/Reveal";

/**
 * One heading treatment for every section and page header, so the vertical
 * rhythm and the eyebrow/title/lead hierarchy never drift between routes.
 */
const SectionHeading = ({
  eyebrow,
  title,
  lead,
  align = "center",
  as: Tag = "h2",
  className = "",
}) => {
  const centered = align === "center";

  return (
    <header
      className={`flex flex-col gap-4 ${
        centered ? "items-center text-center" : "items-start text-left"
      } ${className}`}
    >
      {eyebrow && (
        <Reveal as="p" className="eyebrow" y={12} blur={3}>
          {eyebrow}
        </Reveal>
      )}

      <Reveal
        as={Tag}
        delay={60}
        y={18}
        className="text-fluid-h2 font-semibold text-ink"
      >
        {title}
      </Reveal>

      {lead && (
        <Reveal
          as="p"
          delay={140}
          y={16}
          className={`max-w-prose text-fluid-base text-muted ${
            centered ? "mx-auto" : ""
          }`}
        >
          {lead}
        </Reveal>
      )}

      <Reveal
        delay={200}
        y={0}
        blur={0}
        className={`mt-2 h-px w-24 origin-left ${centered ? "mx-auto" : ""}`}
        style={{
          background:
            "linear-gradient(90deg, rgb(var(--accent)), transparent)",
        }}
      />
    </header>
  );
};

export default SectionHeading;
