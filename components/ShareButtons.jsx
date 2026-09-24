import { useEffect, useRef, useState } from "react";
import { FaRedditAlien, FaWhatsapp } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";
import { HiCheck, HiOutlineLink } from "react-icons/hi";
import { TfiFacebook, TfiLinkedin } from "react-icons/tfi";

// react-icons 4.8 predates the X mark, so it is drawn inline.
const XIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
  </svg>
);

const networks = (url, title) => {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return [
    { label: "X", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`, Icon: XIcon },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, Icon: TfiLinkedin },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, Icon: TfiFacebook },
    { label: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}`, Icon: FaWhatsapp },
    { label: "Reddit", href: `https://www.reddit.com/submit?url=${u}&title=${t}`, Icon: FaRedditAlien },
  ];
};

const buttonClass =
  "group grid h-10 w-10 place-items-center rounded-full border transition-colors duration-300 hover:border-accent focus-visible:border-accent";
const iconClass =
  "h-4 w-4 text-muted transition-colors duration-300 group-hover:text-accent group-focus-visible:text-accent";
const buttonStyle = { borderColor: "rgb(var(--line) / 0.14)" };

const ShareButtons = ({ url, title }) => {
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef();

  // Decided after mount so the server and first client render agree.
  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
    return () => clearTimeout(timer.current);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (insecure context, permissions); fail quietly.
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title, url });
    } catch {
      // The user dismissed the sheet.
    }
  };

  return (
    <ul className="flex flex-wrap items-center gap-3">
      {networks(url, title).map(({ label, href, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${label}`}
            title={`Share on ${label}`}
            className={buttonClass}
            style={buttonStyle}
          >
            <Icon className={iconClass} />
          </a>
        </li>
      ))}
      <li>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Link copied" : "Copy link"}
          title={copied ? "Link copied" : "Copy link"}
          className={buttonClass}
          style={buttonStyle}
        >
          {copied ? (
            <HiCheck className="h-4 w-4 text-accent" />
          ) : (
            <HiOutlineLink className={iconClass} />
          )}
        </button>
      </li>
      {canNativeShare && (
        <li>
          <button
            type="button"
            onClick={nativeShare}
            aria-label="More sharing options"
            title="More sharing options"
            className={buttonClass}
            style={buttonStyle}
          >
            <FiShare2 className={iconClass} />
          </button>
        </li>
      )}
      <li aria-live="polite" className="font-space text-xs text-faint">
        {copied ? "Link copied" : ""}
      </li>
    </ul>
  );
};

export default ShareButtons;
