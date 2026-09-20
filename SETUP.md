# CMS setup — one time, ~10 minutes

Everything below is on a free tier.

## 1. Database — Neon (free)

1. Create a project at <https://neon.tech>.
2. Copy both connection strings from the dashboard:
   - **Pooled** (host contains `-pooler`) → `DATABASE_URL`
   - **Direct** (no `-pooler`) → `DIRECT_URL`

## 2. Images — Cloudinary (free)

You already use Cloudinary for the OG image. From
<https://console.cloudinary.com> → Settings → API Keys, copy the cloud name,
API key and API secret.

## 3. Local `.env`

Copy `.env.example` to `.env` and fill it in.

```bash
# AUTH_SECRET — 32+ random characters
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"

# ADMIN_PASSWORD_HASH — prints the correctly escaped .env line
npm run hash:password -- "your-strong-password"
```

### Warning: bcrypt hashes must be escaped in .env

Next.js pipes `.env` through **dotenv-expand**, which treats the `$` segments
of a bcrypt hash as variable references and silently deletes them. The hash
then arrives truncated and every login fails with a misleading
**"Incorrect password"**.

In `.env` the value must be double-quoted with every `$` written as `\$`:

```ini
# correct — note the backslashes
ADMIN_PASSWORD_HASH="\$2b\$12\$abcdefg..."

# all three of these silently break the hash
ADMIN_PASSWORD_HASH=$2b$12$abcdefg...
ADMIN_PASSWORD_HASH="$2b$12$abcdefg..."
ADMIN_PASSWORD_HASH='$2b$12$abcdefg...'
```

`npm run hash:password` prints the escaped line ready to paste.

**On Vercel, paste the UNESCAPED hash** — the dashboard stores values literally
and never runs dotenv.

If login ever fails, check the server console. The login API logs the precise
cause (missing hash, malformed hash, or short `AUTH_SECRET`) instead of letting
a configuration problem masquerade as a wrong password.

### Restarting after .env changes

`.env` is read **once at process start**. Next.js does not hot-reload it, so
after any edit you must stop the dev server (Ctrl+C) and run `npm run dev`
again. Editing a page will not pick up the new value.

## 4. Create the tables and import existing projects

```bash
npm run db:push   # creates the Project and Post tables
npm run seed      # imports the 27 projects that were hardcoded before
```

`seed` is safe to re-run — it skips slugs that already exist.

## 5. Run it

```bash
npm run dev
```

Open <http://localhost:3000/admin> and sign in with the password you hashed.

## 6. Deploy to Vercel

Add the same seven variables in **Project → Settings → Environment Variables**
(unescaped), then deploy. `npm run build` already runs `prisma generate`.

After the first deploy, submit `https://fuadhasanemon.vercel.app/sitemap.xml`
in Google Search Console.

---

## How it fits together

| Concern    | Choice                        | Why                                      |
| ---------- | ----------------------------- | ---------------------------------------- |
| Database   | Neon Postgres + Prisma 5      | Free, serverless, scales to zero         |
| Images     | Cloudinary                    | Already a dependency and your OG host    |
| Auth       | bcrypt + JWT cookie (`jose`)  | One admin, no extra service              |
| Editor     | Markdown → HTML on the server | No markdown JS ships to the public site  |
| Metadata   | `next/head` via `<Seo>`       | This app is Pages Router, not App Router |

### Routes

- Public: `/`, `/work`, `/work/[slug]`, `/blog`, `/blog/[slug]`, `/about`, `/tech`, `/timeline`
- Generated: `/sitemap.xml`, `/robots.txt`
- Private: `/admin`, `/admin/projects`, `/admin/posts`, `/admin/settings`

Public pages are statically generated and revalidate hourly. Saving in the
admin calls `res.revalidate()` on the affected paths, so changes appear within
seconds rather than waiting an hour.

### Notes

- `/admin` is blocked in `robots.txt`, sends `X-Robots-Tag: noindex`, and is
  gated by `middleware.js`.
- Unpublished projects and posts 404 publicly and never enter the sitemap.
- If the database is unreachable, public pages render empty instead of failing
  the build, and retry after 60s.
