import { useRouter } from "next/router";
import { ThemeProvider } from "next-themes";

import RouteProgress from "@/components/RouteProgress";
import PublicLayout from "@/components/layouts/PublicLayout";
import "@/styles/globals.css";

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
      <RouteProgress />
      {getLayout(<Component {...pageProps} />)}
    </ThemeProvider>
  );
}
