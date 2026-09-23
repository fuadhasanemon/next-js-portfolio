import Link from "next/link";
import { BsArrowUpRight } from "react-icons/bs";

const SOCIALS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/fuadhasanemon/" },
  { label: "GitHub", href: "https://github.com/fuadhasanemon" },
  { label: "Instagram", href: "https://www.instagram.com/emonfuad/" },
  { label: "Email", href: "mailto:fuadhasanemon8@gmail.com" },
];

const PAGES = [
  { label: "Contact", href: "/#contact" },
  { label: "Timeline", href: "/timeline" },
  { label: "Work", href: "/work" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Tech", href: "/tech" },
];

const Footer = () => (
  <footer
    className="mt-auto border-t"
    style={{ borderColor: "rgb(var(--line) / 0.1)" }}
  >
    <div className="shell py-14 sm:py-16">
      <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
        <div className="max-w-xs">
          <p className="text-fluid-h3 font-semibold text-ink">
            Fuad Hasan Emon
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Software engineer building considered, fast interfaces for the web.
          </p>
        </div>

        <div className="flex gap-12 sm:gap-16">
          <nav aria-label="Pages">
            <p className="eyebrow">Pages</p>
            <ul className="mt-4 space-y-2.5">
              {PAGES.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="link-underline text-sm text-muted"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Elsewhere">
            <p className="eyebrow">Elsewhere</p>
            <ul className="mt-4 space-y-2.5">
              {SOCIALS.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target={item.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noreferrer"
                    className="link-underline inline-flex items-center gap-1 text-sm text-muted"
                  >
                    {item.label}
                    <BsArrowUpRight className="h-2.5 w-2.5" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div
        className="mt-12 flex flex-col gap-3 border-t pt-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between"
        style={{ borderColor: "rgb(var(--line) / 0.1)" }}
      >
        <p>© {new Date().getFullYear()} Fuad Hasan Emon</p>
        <p className="font-space">Built with Next.js · Tailwind · Three.js</p>
      </div>
    </div>
  </footer>
);

export default Footer;
