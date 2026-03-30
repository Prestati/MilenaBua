import Link from "next/link";
import { clearSession } from "@/lib/auth";
import { redirect } from "next/navigation";

async function logoutAction() {
  "use server";
  await clearSession();
  redirect("/admin/login");
}

const nav = [
  { href: "/admin", label: "Dashboard", icon: "⬡" },
  { href: "/admin/hero", label: "Forside", icon: "🖥" },
  { href: "/admin/om-meg", label: "Om meg", icon: "👤" },
  { href: "/admin/escape", label: "Escape (forside)", icon: "🔐" },
  { href: "/admin/escape-side", label: "Escape (prosjektside)", icon: "📊" },
  { href: "/admin/produkter", label: "Produkter", icon: "🛍" },
  { href: "/admin/prosjekter", label: "Prosjekter", icon: "📁" },
  { href: "/admin/blogg", label: "Blogg", icon: "✏️" },
  { href: "/admin/nyhetsbrev", label: "Nyhetsbrev", icon: "📨" },
  { href: "/admin/epost", label: "E-posttekster", icon: "✉️" },
  { href: "/admin/innstillinger", label: "Sosiale medier", icon: "🔗" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)", fontFamily: "var(--font-plus-jakarta), sans-serif" }}>
      {/* Sidebar */}
      <aside
        className="w-56 shrink-0 flex flex-col border-r min-h-screen"
        style={{ background: "var(--white)", borderColor: "var(--faint)" }}
      >
        <div className="px-5 py-5 border-b flex items-center gap-2" style={{ borderColor: "var(--faint)" }}>
          <Link href="/" className="text-[1rem] font-extrabold tracking-[-0.03em] no-underline" style={{ color: "var(--ink)" }}>
            Milena Bua
          </Link>
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--orange)" }} />
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {nav.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] text-[0.82rem] font-medium no-underline transition-colors hover:bg-[var(--blue-lt)] hover:text-[var(--blue)]"
              style={{ color: "var(--mid)" }}
            >
              <span>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t" style={{ borderColor: "var(--faint)" }}>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] text-[0.82rem] font-medium text-left transition-colors hover:bg-red-50 hover:text-red-600"
              style={{ color: "var(--mid)", fontFamily: "inherit", background: "transparent", border: "none", cursor: "pointer" }}
            >
              <span>🚪</span>
              Logg ut
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
