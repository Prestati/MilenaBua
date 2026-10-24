import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Forhåndsvisning av nye escapehaugesund.no ligger i public/escapeny
// og er beskyttet med eget passord (ESCAPE_PREVIEW_PASSWORD).
const ESCAPE_PREVIEW = "/escapeny";
const ESCAPE_LOGIN = `${ESCAPE_PREVIEW}/login`;
const ESCAPE_COOKIE = "escapeny_auth";

// Cookien inneholder en hash av passordet, så den slutter å virke hvis passordet byttes
async function escapeToken(password: string) {
  const data = new TextEncoder().encode(`escapeny:${password}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Bare stier inne i forhåndsvisningen er lov som «gå videre til»
function safeNext(next: string | null) {
  return next && next.startsWith(`${ESCAPE_PREVIEW}/`) && !next.startsWith("//") ? next : `${ESCAPE_PREVIEW}/index.html`;
}

function loginPage(next: string, error: boolean) {
  const html = `<!doctype html>
<html lang="no"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Escape Haugesund – forhåndsvisning</title>
<style>
  *{box-sizing:border-box} body{margin:0;min-height:100svh;display:grid;place-items:center;padding:16px;background:#000;color:#fff;font-family:Montserrat,system-ui,-apple-system,sans-serif}
  form{width:min(100%,380px);padding:32px;border-radius:18px;background:#121212}
  p.k{margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#f99b22}
  h1{margin:0 0 8px;font-size:1.6rem} p.l{margin:0 0 22px;color:rgba(255,255,255,.66);line-height:1.5}
  input{width:100%;min-height:52px;padding:0 16px;border:2px solid rgba(255,255,255,.14);border-radius:12px;background:#1b1b1b;color:#fff;font:500 16px Montserrat,system-ui,sans-serif}
  input:focus{outline:none;border-color:#f99b22}
  button{width:100%;min-height:52px;margin-top:14px;border:0;border-radius:999px;background:#fff;color:#000;font:700 15px Montserrat,system-ui,sans-serif;letter-spacing:.04em;text-transform:uppercase;cursor:pointer}
  button:hover{background:#f99b22} .e{margin:12px 0 0;color:#f99b22;font-size:14px}
</style></head><body>
<form method="post" action="${ESCAPE_LOGIN}">
  <p class="k">Forhåndsvisning</p>
  <h1>Nye escapehaugesund.no</h1>
  <p class="l">Skriv inn passordet for å se den nye nettsiden.</p>
  <input type="hidden" name="next" value="${next.replace(/"/g, "&quot;")}">
  <input type="password" name="password" placeholder="Passord" autocomplete="current-password" required autofocus aria-label="Passord">
  <button type="submit">Vis siden</button>
  ${error ? '<p class="e" role="alert">Feil passord. Prøv igjen.</p>' : ""}
</form></body></html>`;
  return new NextResponse(html, {
    status: error ? 401 : 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex, nofollow" },
  });
}

async function escapePreview(request: NextRequest, pathname: string) {
  const password = process.env.ESCAPE_PREVIEW_PASSWORD;
  if (!password) {
    return new NextResponse("Forhåndsvisningen er ikke satt opp ennå.", { status: 503 });
  }
  const token = await escapeToken(password);

  // Filene ligger med små bokstaver, så /Escapeny/... sendes til /escapeny/...
  const lower = pathname.toLowerCase();
  if (pathname !== lower) {
    return NextResponse.redirect(new URL(lower + request.nextUrl.search, request.url));
  }

  if (lower === ESCAPE_LOGIN) {
    if (request.method === "POST") {
      const form = await request.formData();
      const next = safeNext(String(form.get("next") ?? ""));
      if (!safeEqual(String(form.get("password") ?? ""), password)) return loginPage(next, true);
      const res = NextResponse.redirect(new URL(next, request.url), 303);
      res.cookies.set(ESCAPE_COOKIE, token, {
        httpOnly: true,
        secure: request.nextUrl.protocol === "https:",
        sameSite: "lax",
        path: ESCAPE_PREVIEW,
        maxAge: 60 * 60 * 24 * 30,
      });
      return res;
    }
    return loginPage(safeNext(request.nextUrl.searchParams.get("next")), false);
  }

  if (!safeEqual(request.cookies.get(ESCAPE_COOKIE)?.value ?? "", token)) {
    const login = new URL(ESCAPE_LOGIN, request.url);
    login.searchParams.set("next", lower === ESCAPE_PREVIEW || lower === `${ESCAPE_PREVIEW}/` ? `${ESCAPE_PREVIEW}/index.html` : lower + request.nextUrl.search);
    return NextResponse.redirect(login);
  }

  if (lower === ESCAPE_PREVIEW || lower === `${ESCAPE_PREVIEW}/`) {
    return NextResponse.redirect(new URL(`${ESCAPE_PREVIEW}/index.html`, request.url));
  }

  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.toLowerCase().startsWith(ESCAPE_PREVIEW)) {
    return escapePreview(request, pathname);
  }

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("mb_admin")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const authSecret = process.env.AUTH_SECRET;
      if (!authSecret) throw new Error("AUTH_SECRET mangler");
      const secret = new TextEncoder().encode(authSecret);
      await jwtVerify(token, secret);
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/escapeny", "/escapeny/:path*", "/Escapeny", "/Escapeny/:path*"],
};
