import Link from "next/link";

export default function Navbar() {
  return (
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
        <span
          className="inline-block w-2 h-2 rounded-full shrink-0"
          style={{ background: "var(--orange)" }}
        />
      </Link>

      <ul className="flex items-center gap-1 list-none m-0 p-0">
        {[
          { label: "Om meg", href: "/om-meg" },
          { label: "Prosjekt: Escape Haugesund", href: "/escape-haugesund" },
          { label: "Butikk", href: "/#butikk" },
          { label: "Prosjekter", href: "/#prosjekter" },
        ].map(({ label, href }) => (
          <li key={label} className="hidden md:block">
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
    </header>
  );
}
