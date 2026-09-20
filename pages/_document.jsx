import { Head, Html, Main, NextScript } from "next/document";

/**
 * Document holds only what is genuinely global. Every title, description,
 * canonical, Open Graph and Twitter tag is owned by <Seo> so a page can never
 * end up with two competing canonicals.
 */
export default function Document() {
  return (
    <Html lang="en" prefix="https://ogp.me/ns/website#">
      <Head>
        <meta name="theme-color" content="#08080b" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#fbfbfd" media="(prefers-color-scheme: light)" />

        {/* Two families carry the whole system: Outfit for UI, Space Mono for
            labels. Homemade Apple is the single decorative accent. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&family=Homemade+Apple&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="overflow-x-hidden">
        {/* Reveal animations only arm when scripting is available, so the page
            is never left invisible if JS fails to load. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
