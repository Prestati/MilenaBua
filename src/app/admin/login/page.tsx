"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="w-full max-w-sm rounded-[20px] border p-8"
        style={{ background: "var(--white)", borderColor: "var(--faint)" }}
      >
        <div className="flex items-center gap-2 mb-8">
          <span className="text-[1.1rem] font-extrabold tracking-[-0.03em]" style={{ color: "var(--ink)" }}>
            Milena Bua
          </span>
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--orange)" }} />
          <span className="text-[0.8rem] font-medium ml-1" style={{ color: "var(--mid)" }}>Admin</span>
        </div>

        <h1 className="text-[1.4rem] font-extrabold tracking-[-0.03em] mb-1" style={{ color: "var(--ink)" }}>
          Logg inn
        </h1>
        <p className="text-[0.85rem] mb-6" style={{ color: "var(--mid)" }}>
          Kun for deg, Milena.
        </p>

        <form action={action} className="flex flex-col gap-4">
          <div>
            <label className="block text-[0.78rem] font-semibold mb-1.5" style={{ color: "var(--ink)" }}>
              Brukernavn
            </label>
            <input
              name="username"
              type="text"
              autoComplete="username"
              required
              className="w-full px-4 py-3 rounded-[10px] border text-[0.9rem] outline-none focus:border-[var(--blue)]"
              style={{ borderColor: "var(--faint)", background: "var(--bg)", color: "var(--ink)", fontFamily: "inherit", transition: "border-color 0.2s" }}
            />
          </div>
          <div>
            <label className="block text-[0.78rem] font-semibold mb-1.5" style={{ color: "var(--ink)" }}>
              Passord
            </label>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 rounded-[10px] border text-[0.9rem] outline-none focus:border-[var(--blue)]"
              style={{ borderColor: "var(--faint)", background: "var(--bg)", color: "var(--ink)", fontFamily: "inherit", transition: "border-color 0.2s" }}
            />
          </div>

          {state?.error && (
            <p className="text-[0.82rem] font-medium text-center px-3 py-2 rounded-[8px]" style={{ color: "#dc2626", background: "#fef2f2" }}>
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-1 py-3 rounded-[10px] text-[0.88rem] font-bold text-white transition-all disabled:opacity-60"
            style={{ background: "var(--blue)", fontFamily: "inherit" }}
          >
            {pending ? "Logger inn…" : "Logg inn"}
          </button>
        </form>
      </div>
    </div>
  );
}
