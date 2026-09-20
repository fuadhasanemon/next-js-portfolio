import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import { Button, Field, Input } from "@/components/admin/Fields";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      const next = typeof router.query.next === "string" ? router.query.next : "/admin";
      router.replace(next);
      return;
    }

    setError((await res.json()).error || "Login failed");
    setBusy(false);
  };

  return (
    <>
      <Head>
        <title>Sign in · Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="grid min-h-screen place-items-center bg-bg px-5">
        <form
          onSubmit={submit}
          className="w-full max-w-sm rounded-2xl border p-7"
          style={{ borderColor: "rgb(var(--line) / 0.14)" }}
        >
          <p className="eyebrow">Private</p>
          <h1 className="mt-3 text-fluid-h3 font-semibold text-ink">Admin sign in</h1>

          <div className="mt-6">
            <Field label="Password">
              <Input
                type="password"
                autoFocus
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
          </div>

          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

          <Button type="submit" loading={busy} className="mt-6 w-full justify-center">
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </>
  );
}
