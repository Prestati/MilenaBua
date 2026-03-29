"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { label: "Om meg", href: "/om-meg" },
  { label: "Innblikk", href: "/blogg" },
  { label: "Prosjekt: Escape Haugesund", href: "/escape-haugesund" },
  { label: "Butikk", href: "/#butikk" },
  { label: "Prosjekter", href: "/#prosjekter" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-50 flex items-center justify-between h-[62px] border-b backdrop-blur-[12px]"
        style={{
          padding: "0 max(1.5rem, calc((100vw - 1100px) / 2))",
          background: "rgba(250,249,247,0.96)",
          borderColor: "var(--faint)",
        }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-[1.1rem] font-extrabold tracking-[-0.03em] no-underline"
          style={{ color: "var(--ink)" }}
        >
          Milena Bua
          <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: "var(--orange)" }} />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1 list-none m-0 p-0">
          {links.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                className="text-[0.82rem] font-medium px-[0.9rem] py-[0.4rem] rounded-[8px] no-underline transition-colors hover:bg-[var(--blue-lt)] hover:text-[var(--blue)]"
                style={{ color: "var(--mid)" }}
              >
                {label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="/#nyhetsbrev"
              className="text-[0.82rem] font-semibold px-[1.2rem] py-[0.45rem] rounded-full text-white no-underline transition-all hover:-translate-y-px"
              style={{ background: "var(--blue)" }}
            >
              Nyhetsbrev
            </a>
          </li>
        </ul>

        {/* Hamburger-knapp (mobil) */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-[5px] rounded-[8px]"
          style={{ background: "transparent", border: "none", cursor: "pointer" }}
          onClick={() => setOpen(!open)}
          aria-label="Meny"
        >
          <span style={{ display: "block", width: 22, height: 2, background: "var(--ink)", borderRadius: 2, transition: "transform 0.2s", transform: open ? "translateY(7px) rotate(45deg)" : "none" }} />
          <span style={{ display: "block", width: 22, height: 2, background: "var(--ink)", borderRadius: 2, transition: "opacity 0.2s", opacity: open ? 0 : 1 }} />
          <span style={{ display: "block", width: 22, height: 2, background: "var(--ink)", borderRadius: 2, transition: "transform 0.2s", transform: open ? "translateY(-7px) rotate(-45deg)" : "none" }} />
        </button>
      </header>

      {/* Mobil-meny */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 flex flex-col pt-[62px]"
          style={{ background: "rgba(250,249,247,0.98)", backdropFilter: "blur(12px)" }}
        >
          <nav className="flex flex-col px-6 py-6 gap-1">
            {links.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="text-[1.1rem] font-semibold px-4 py-3 rounded-[10px] no-underline transition-colors hover:bg-[var(--blue-lt)] hover:text-[var(--blue)]"
                style={{ color: "var(--ink)" }}
              >
                {label}
              </a>
            ))}
            <a
              href="/#nyhetsbrev"
              onClick={() => setOpen(false)}
              className="mt-4 text-center text-[0.95rem] font-bold px-6 py-3 rounded-full text-white no-underline"
              style={{ background: "var(--blue)" }}
            >
              Nyhetsbrev
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
