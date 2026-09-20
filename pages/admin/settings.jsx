import AdminShell from "@/components/admin/AdminShell";
import { Panel } from "@/components/admin/Fields";
import { SITE_URL } from "@/lib/site";

const Row = ({ label, value, ok }) => (
  <div
    className="flex items-center justify-between gap-4 border-b py-2.5 last:border-0"
    style={{ borderColor: "rgb(var(--line) / 0.1)" }}
  >
    <span className="font-space text-xs text-muted">{label}</span>
    <span className={`text-xs ${ok === false ? "text-red-500" : "text-ink"}`}>
      {value}
    </span>
  </div>
);

export default function Settings({ env, siteUrl }) {
  return (
    <AdminShell title="Settings">
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Environment" description="Values are never shown — only whether they are set.">
          <div>
            {Object.entries(env).map(([key, set]) => (
              <Row key={key} label={key} value={set ? "configured" : "missing"} ok={set} />
            ))}
          </div>
        </Panel>

        <Panel title="Site" description="Used for canonical URLs, sitemap and structured data.">
          <div>
            <Row label="Canonical origin" value={siteUrl} />
            <Row label="Sitemap" value="/sitemap.xml" />
            <Row label="Robots" value="/robots.txt" />
          </div>
          <p className="pt-2 text-xs text-faint">
            Change the origin with the NEXT_PUBLIC_SITE_URL environment variable.
            Rotate the admin password by generating a new bcrypt hash
            (<code className="font-space">npm run hash:password</code>) and updating
            ADMIN_PASSWORD_HASH.
          </p>
        </Panel>
      </div>
    </AdminShell>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      siteUrl: SITE_URL,
      env: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        AUTH_SECRET: !!process.env.AUTH_SECRET,
        ADMIN_PASSWORD_HASH: !!process.env.ADMIN_PASSWORD_HASH,
        CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
        NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
      },
    },
  };
}
