"use client";

import { FormEvent, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

function loginErrorMessage(status: number) {
  if (status === 400) return "Please enter your password.";
  if (status === 401) return "Incorrect password. Please try again.";
  if (status === 500 || status === 503) {
    return "Admin login is not configured correctly. Please check environment settings.";
  }
  return "Unable to sign in right now. Please try again.";
}

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const passwordRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");

    if (!password.trim()) {
      setError("Please enter your password.");
      passwordRef.current?.focus();
      return;
    }

    setLoading(true);
    setError("");

    let redirecting = false;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        credentials: "same-origin",
        body: JSON.stringify({
          password
        })
      });

      await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(loginErrorMessage(response.status));
        passwordRef.current?.focus();
        return;
      }

      setError("");
      redirecting = true;
      const next = searchParams.get("next");
      router.replace(next?.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch {
      setError("Unable to connect to the server. Please try again.");
      passwordRef.current?.focus();
    } finally {
      if (!redirecting) setLoading(false);
    }
  }

  return (
    <form className="admin-login-card" onSubmit={submit}>
      <div className="admin-login-logo">
        <Image src="/images/logo.png" alt="Impex-Pro" width={72} height={72} priority />
      </div>
      <div className="section-tag">Secure Admin</div>
      <h1>Welcome Back</h1>
      <p>Access your Impex-Pro Admin Dashboard to manage inquiries, blogs, activities, team profiles, reviews, and business content.</p>
      <div className="form-group">
        <label htmlFor="admin-password">Admin Password</label>
        <input
          ref={passwordRef}
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "admin-login-error" : undefined}
          onChange={() => {
            if (error) setError("");
          }}
        />
      </div>
      {error ? (
        <div id="admin-login-error" className="form-msg error admin-login-error" role="alert" aria-live="assertive">
          {error}
        </div>
      ) : null}
      <button type="submit" className="form-submit" disabled={loading}>
        {loading ? <><span className="login-spinner" aria-hidden="true" />Signing you in...</> : "Sign In to Dashboard"}
      </button>
      <small className="admin-login-foot">Secure admin access for Impex-Pro management.</small>
    </form>
  );
}
