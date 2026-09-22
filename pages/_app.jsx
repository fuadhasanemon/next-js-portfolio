import { Homemade_Apple, Outfit, Space_Mono } from "next/font/google";
import { useRouter } from "next/router";
import { ThemeProvider } from "next-themes";

import RouteProgress from "@/components/RouteProgress";
import PublicLayout from "@/components/layouts/PublicLayout";
import "@/styles/globals.css";

/**
 * Self-hosted through next/font: the files are served from our own origin and
 * Next generates a metric-matched fallback, so there is no render-blocking
 * request to Google and no reflow when the real face arrives.
 *
 * Outfit is a variable font — omitting `weight` ships one file covering the
 * whole 300-700 range the design uses. Space Mono and Homemade Apple are
 * static, so their weights are listed explicitly.
 *
 * Each `variable` is the CSS custom property the Tailwind font families read.
 */
const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-space-mono",
});

const homemadeApple = Homemade_Apple({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-homemade-apple",
});

// The element carrying the variables must also apply the base family, since
// `body` sits above it and cannot resolve them.
const fontRoot = `${outfit.variable} ${spaceMono.variable} ${homemadeApple.variable} font-out`;

export default function App({ Component, pageProps }) {
  const router = useRouter();

  /**
   * Admin renders its own shell (AdminShell), so anything under /admin is
   * resolved to a bare layout. Keying off the route rather than a per-page
   * opt-in means a new admin page cannot accidentally inherit the public
   * navbar. A page may still export `getLayout` to override either default.
   */
  const isAdmin = router.pathname.startsWith("/admin");
  const getLayout =
    Component.getLayout ??
    (isAdmin
      ? (page) => page
      : (page) => <PublicLayout>{page}</PublicLayout>);

  return (
    <ThemeProvider attribute="class" enableSystem defaultTheme="system">
      <div className={fontRoot}>
        <RouteProgress />
        {getLayout(<Component {...pageProps} />)}
      </div>
    </ThemeProvider>
  );
}
