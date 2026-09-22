import Footer from "@/components/Footer";
import Header from "@/components/Header";

/**
 * Chrome for every public page. Admin routes deliberately bypass this and
 * render their own shell, so the two never share navigation.
 */
const PublicLayout = ({ children }) => (
  <>
    <a
      href="#content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:text-onAccent"
    >
      Skip to content
    </a>
    <div className="grain flex min-h-screen flex-col">
      <Header />
      <main id="content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  </>
);

export default PublicLayout;
