import Link from "next/link";

const sections = [
  { href: "/admin/hero", label: "Forside", desc: "Endre tekst, bilde og hero-seksjonen", icon: "🖥" },
  { href: "/admin/escape", label: "Escape Haugesund", desc: "Rediger tekst og mål for Escape-kortet", icon: "🔐" },
  { href: "/admin/produkter", label: "Produkter", desc: "Legg til, endre eller slett produkter", icon: "🛍" },
  { href: "/admin/prosjekter", label: "Prosjekter", desc: "Administrer prosjektene dine", icon: "📁" },
  { href: "/admin/blogg", label: "Blogg", desc: "Skriv og rediger blogginnlegg", icon: "✏️" },
];

export default function AdminDashboard() {
  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-[1.8rem] font-extrabold tracking-[-0.03em] mb-1" style={{ color: "var(--ink)" }}>
        Hei, Milena 👋
      </h1>
      <p className="text-[0.9rem] mb-8" style={{ color: "var(--mid)" }}>
        Hva vil du redigere i dag?
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map(({ href, label, desc, icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-start gap-4 p-5 rounded-[14px] border no-underline transition-all hover:-translate-y-0.5 hover:border-[var(--blue)] hover:shadow-[0_8px_24px_rgba(59,111,212,0.1)]"
            style={{ background: "var(--white)", borderColor: "var(--faint)" }}
          >
            <span
              className="w-10 h-10 rounded-[10px] flex items-center justify-center text-xl shrink-0"
              style={{ background: "var(--blue-lt)" }}
            >
              {icon}
            </span>
            <div>
              <div className="text-[0.95rem] font-bold" style={{ color: "var(--ink)" }}>{label}</div>
              <div className="text-[0.78rem] mt-0.5" style={{ color: "var(--mid)" }}>{desc}</div>
            </div>
          </Link>
        ))}
      </div>

      <div
        className="mt-8 p-5 rounded-[14px] border"
        style={{ background: "var(--orange-lt)", borderColor: "rgba(240,123,63,0.2)" }}
      >
        <p className="text-[0.82rem] font-semibold" style={{ color: "var(--orange)" }}>
          💡 Tips: Endringer på siden er synlige med en gang du lagrer.
        </p>
      </div>
    </div>
  );
}
