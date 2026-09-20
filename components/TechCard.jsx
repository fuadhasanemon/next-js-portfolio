import Image from "next/image";

const TechCard = ({ id, main, alt, active, changeId }) => (
  <button
    type="button"
    aria-label={alt}
    aria-pressed={active}
    onClick={() => changeId(id)}
    className="group relative aspect-square w-full rounded-xl border transition-all duration-300 ease-out hover:-translate-y-1"
    style={{
      borderColor: active
        ? "rgb(var(--accent) / 0.5)"
        : "rgb(var(--line) / 0.12)",
      background: active ? "rgb(var(--accent) / 0.08)" : "transparent",
    }}
  >
    <Image
      src={main}
      alt=""
      fill
      sizes="80px"
      className="select-none object-contain p-3 transition-transform duration-500 group-hover:scale-110 sm:p-3.5"
    />
  </button>
);

export default TechCard;
