import Image from "next/image";
import Link from "next/link";
import { BsArrowUpRight } from "react-icons/bs";

import Reveal from "@/components/Reveal";

/**
 * Presentational grid. Ordering and contents come from the admin-managed
 * database, so this component never owns project data.
 */
const ProjectCard = ({ projects = [] }) => {
  if (projects.length === 0) {
    return (
      <p className="text-center text-fluid-base text-muted">
        Projects are on their way — check back shortly.
      </p>
    );
  }

  return (
    <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, i) => (
        <Reveal
          as="li"
          key={project.id}
          delay={(i % 3) * 110}
          y={28}
          className="group"
        >
          <Link href={`/work/${project.slug}`} className="block">
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-xl border"
              style={{ borderColor: "rgb(var(--line) / 0.12)" }}
            >
              {project.coverImage ? (
                <Image
                  fill
                  loading={i < 3 ? "eager" : "lazy"}
                  src={project.coverImage}
                  alt={project.coverAlt || `${project.title} — project screenshot`}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-top transition-[object-position,transform] duration-[3500ms] ease-inout group-hover:scale-[1.02] group-hover:object-bottom motion-reduce:transition-none"
                />
              ) : (
                <div
                  className="grid h-full w-full place-items-center font-space text-xs text-faint"
                  style={{ background: "rgb(var(--line) / 0.04)" }}
                >
                  {project.title}
                </div>
              )}

              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 55%, rgb(0 0 0 / 0.45))",
                }}
              />
              <span className="pointer-events-none absolute bottom-3 right-3 grid h-8 w-8 translate-y-2 place-items-center rounded-full bg-white/90 text-black opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                <BsArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-base font-medium text-ink transition-colors duration-300 group-hover:text-accent">
                {project.title}
              </h3>
              {project.shortDescription && (
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {project.shortDescription}
                </p>
              )}
              {project.technologies?.length > 0 && (
                <p className="mt-2 font-space text-[0.7rem] text-faint">
                  {project.technologies.slice(0, 4).join(" · ")}
                </p>
              )}
            </div>
          </Link>
        </Reveal>
      ))}
    </ul>
  );
};

export default ProjectCard;
