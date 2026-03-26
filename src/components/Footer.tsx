import { readContent } from "@/lib/content";

interface Social { label: string; href: string; }

export default async function Footer() {
  const socialsRaw = await readContent<Social[]>("socials.json").catch(() => [] as Social[]);
  const socials = socialsRaw.filter((s) => s.href);

  return (
    <footer
      className="border-t"
      style={{
        padding: "2rem max(1.5rem, calc((100vw - 1100px) / 2))",
        borderColor: "var(--faint)",
      }}
    >
      <div className="flex justify-between items-center flex-wrap gap-4">
        <a
          href="/"
          className="text-[1rem] font-extrabold tracking-[-0.03em] no-underline"
          style={{ color: "var(--mid)" }}
        >
          Milena Bua
        </a>

        <ul className="flex gap-[1.8rem] list-none m-0 p-0">
          {socials.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.75rem] font-medium no-underline transition-colors hover:text-[var(--ink)]"
                style={{ color: "var(--mid)" }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <span className="text-[0.72rem]" style={{ color: "var(--mid)" }}>
          © 2026 Milena Bua
        </span>
      </div>
    </footer>
  );
}
