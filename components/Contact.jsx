import { BsArrowUpRight } from "react-icons/bs";
import { TfiFacebook, TfiLinkedin } from "react-icons/tfi";
import { HiOutlineMail } from "react-icons/hi";

import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";

const CHANNELS = [
  {
    label: "Email",
    value: "fuadhasanemon8@gmail.com",
    href: "mailto:fuadhasanemon8@gmail.com",
    Icon: HiOutlineMail,
  },
  {
    label: "LinkedIn",
    value: "fuadhasanemon",
    href: "https://www.linkedin.com/in/fuadhasanemon/",
    Icon: TfiLinkedin,
  },
  {
    label: "Facebook",
    value: "fuad.h.emon",
    href: "https://www.facebook.com/fuad.h.emon/",
    Icon: TfiFacebook,
  },
];

const Contact = () => (
  <Reveal
    as="section"
    y={30}
    className="relative isolate overflow-hidden rounded-3xl border px-6 py-14 sm:px-10 sm:py-16 lg:px-14"
    style={{
      borderColor: "rgb(var(--line) / 0.12)",
      background: "rgb(var(--surface) / 0.6)",
    }}
  >
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-20 blur-[90px] dark:opacity-30"
      style={{
        background:
          "radial-gradient(circle, rgb(var(--glow-a)), transparent 65%)",
      }}
    />

    <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
      <div>
        <p className="eyebrow">Contact</p>
        <h2 className="mt-4 text-fluid-h2 font-semibold text-ink">
          Let&apos;s build something
          <span className="gradient-text"> worth using</span>.
        </h2>
        <p className="mt-5 max-w-prose text-fluid-base text-muted">
          Have a project, a role, or a rough idea you want pressure-tested? I
          read everything and reply within a day or two.
        </p>

        <ul className="mt-8 flex flex-col divide-y" style={{ borderColor: "rgb(var(--line) / 0.1)" }}>
          {CHANNELS.map(({ label, value, href, Icon }) => (
            <li key={label} style={{ borderColor: "rgb(var(--line) / 0.1)" }}>
              <a
                href={href}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noreferrer"
                className="group flex items-center gap-4 py-4 transition-colors duration-300"
              >
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors duration-300 group-hover:border-accent"
                  style={{ borderColor: "rgb(var(--line) / 0.14)" }}
                >
                  <Icon className="h-4 w-4 text-muted transition-colors duration-300 group-hover:text-accent" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-faint">{label}</span>
                  <span className="block truncate text-sm text-ink">{value}</span>
                </span>
                <BsArrowUpRight className="h-3.5 w-3.5 shrink-0 text-faint transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <ContactForm />

        <p className="mt-5 text-xs text-faint">
          Prefer email? Write to{" "}
          <a
            href="mailto:fuadhasanemon8@gmail.com"
            className="link-underline text-muted"
          >
            fuadhasanemon8@gmail.com
          </a>
          .
        </p>
      </div>
    </div>
  </Reveal>
);

export default Contact;
