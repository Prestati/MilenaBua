/* ==========================================================
   Escape Haugesund – felles kode for forside og romsider
   ========================================================== */

const PRODUCTS_URL = "content/produkter.json";
const BOOKERO_BASE_URL = "https://app.bookero.no";
const BOOKERO_SCRIPT = "https://app.bookero.no/build/widget.js?v=1792678666";

// Pris per lag: [man–tor, fre–søn]
const PRICES = {
  2: [1100, 1200],
  3: [1300, 1400],
  4: [1500, 1600],
  5: [1700, 1800],
  6: [1900, 2000],
};

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const kr = (n) => `${Math.round(n).toLocaleString("nb-NO")} kr`;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// Tekst fra admin settes inn i HTML, så den må escapes
const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const spillere = (p) => {
  if (p.min_spillere && p.maks_spillere) return `${p.min_spillere}–${p.maks_spillere}`;
  if (p.maks_spillere) return `Opptil ${p.maks_spillere}`;
  return p.min_spillere ? `Minst ${p.min_spillere}` : "";
};

const isMobileGame = (p) => p.type === "Mobilt spill";
// Mobile spill bestilles via skjemaet på bedriftssiden
const inquiryUrl = (p) => `bedrift.html?spill=${encodeURIComponent(p.id)}#kontakt`;

// Lenke til romsiden. Når siden publiseres kan dette bli /rom/<id>
// med en omskrivingsregel hos hostingen (se _redirects).
const roomUrl = (id) => `rom.html?id=${encodeURIComponent(id)}`;

const dotsHTML = (level) =>
  `<span class="dots" aria-label="Vanskelighet ${level} av 5">${Array.from({ length: 5 }, (_, i) => `<i class="${i < level ? "on" : ""}"></i>`).join("")}</span>`;

/* ---------- Header og meny ---------- */
(() => {
  const header = $(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 20);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
})();

/* ---------- Produkter ---------- */
function loadProducts() {
  return fetch(PRODUCTS_URL, { cache: "no-cache" })
    .then((r) => r.json())
    .then((data) => (data.produkter || []).filter((p) => p.synlig !== false && p.id && p.navn))
    .catch((err) => {
      console.error("Fant ikke produktene:", err);
      return [];
    });
}

// Fakta-linjen (vanskelighet, spillere, minutter og ekstra fakta fra admin, f.eks. «23 gåter»)
function metaItems(p) {
  const level = Number(p.vanskelighet) || 0;
  return [
    level && `<li>${dotsHTML(level)}<small>Vanskelighet</small></li>`,
    spillere(p) && `<li><strong>${esc(spillere(p))}</strong><small>Spillere</small></li>`,
    p.varighet && `<li><strong>${esc(p.varighet)}</strong><small>Minutter</small></li>`,
    ...(p.ekstra_fakta || []).filter((f) => f.verdi).map((f) => `<li><strong>${esc(f.verdi)}</strong><small>${esc(f.tekst)}</small></li>`),
  ].filter(Boolean);
}

function productCard(p) {
  const meta = metaItems(p).slice(0, 3).join("");
  const media = p.film
    ? `<video class="room-video" muted loop playsinline preload="none" poster="${esc(p.bilde)}"><source src="${esc(p.film)}" type="video/mp4"></video>`
    : `<img class="room-video" src="${esc(p.bilde)}" alt="" loading="lazy">`;

  // Hele kortet er klikkbart via lenken over tittelen (se .room-link i CSS)
  return `
    <article class="room" data-room="${esc(p.id)}">
      ${media}
      <div class="room-content">
        ${p.merkelapp ? `<span class="tag ${p.fremhevet ? "" : "tag-outline"}">${esc(p.merkelapp)}</span>` : ""}
        <h3><a class="room-link" href="${roomUrl(p.id)}">${esc(p.navn)}</a></h3>
        <p>${esc(p.beskrivelse)}</p>
        ${meta ? `<ul class="room-meta">${meta}</ul>` : ""}
        ${p.kampanje ? `<p class="card-kampanje">${esc(p.kampanje)}</p>` : ""}
        <span class="btn btn-primary" aria-hidden="true">${isMobileGame(p) ? "Les mer" : "Les mer og book"}</span>
      </div>
    </article>`;
}

// Romfilmer spilles bare når kortet er synlig
function observeRoomVideos(root = document) {
  if (reducedMotion) return;
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.play().catch(() => {});
        else e.target.pause();
      }),
    { threshold: 0.35 }
  );
  $$("video.room-video", root).forEach((v) => io.observe(v));
}

/* ---------- Booking ---------- */
// compact: bare kalenderen (romsiden har infoen i toppen allerede)
function bookingPanelHTML(p, { hidden = false, compact = false } = {}) {
  const right = p.bookero_widget_id
    ? `<div class="booking-widget">
         <div data-booking-widget
              data-widget-id="${esc(p.bookero_widget_id)}"
              data-locale="no"
              data-base-url="${BOOKERO_BASE_URL}"></div>
       </div>`
    : `<div class="booking-fallback">
         <h4>Online booking kommer snart</h4>
         <p>Inntil videre booker du ${esc(p.navn)} enkelt på telefon eller e-post. Vi svarer raskt.</p>
         <div class="actions">
           <a class="btn btn-primary" href="tel:+4752711111">Ring 52 71 11 11</a>
           <a class="btn btn-ghost" href="mailto:post@escapehaugesund.no?subject=${encodeURIComponent("Booking " + p.navn)}">Send e-post</a>
         </div>
       </div>`;
  const level = Number(p.vanskelighet) || 0;
  return `
    <div class="booking-panel ${compact ? "booking-panel-compact" : ""}" ${compact ? "" : `role="tabpanel" aria-labelledby="tab-${esc(p.id)}"`} id="panel-${esc(p.id)}" ${hidden ? "hidden" : ""}>
      ${compact ? "" : `<div class="booking-info" style="--poster: url('${esc(p.bilde)}')">
        <h3>${esc(p.navn)}</h3>
        <ul>
          ${spillere(p) ? `<li>${esc(spillere(p))} spillere</li>` : ""}
          ${p.varighet ? `<li>${esc(p.varighet)} minutter</li>` : ""}
          ${level ? `<li>Vanskelighet ${level} av 5</li>` : ""}
          <li>Møt opp 10 min før</li>
        </ul>
        <p class="fine">Avbestilling senest 12 timer før. Dere betaler for antallet som faktisk spiller.</p>
      </div>`}
      ${right}
    </div>`;
}

function loadBookero() {
  if ($("script[data-bookero]")) return;
  const s = document.createElement("script");
  s.src = BOOKERO_SCRIPT;
  s.async = true;
  s.charset = "utf-8";
  s.dataset.bookero = "";
  document.body.appendChild(s);
}

/* ---------- Mobil bookingknapp ---------- */
function setupMobileBook(topEl, bookingEl) {
  const btn = $("#mobile-book");
  if (!btn) return;
  let pastTop = false;
  let atBooking = false;
  const sync = () => btn.classList.toggle("show", pastTop && !atBooking);
  new IntersectionObserver(([e]) => { pastTop = !e.isIntersecting; sync(); }).observe(topEl);
  new IntersectionObserver(([e]) => { atBooking = e.isIntersecting; sync(); }, { threshold: 0.05 }).observe(bookingEl);
}

/* ---------- Lenker til en del av siden ---------- */
// Kort lastes inn etter at nettleseren har hoppet til f.eks. #faq, så innholdet
// over flytter seg. Hopp på nytt når alt er på plass. (Bookero bruker #step=…, som hoppes over.)
function restoreHashScroll() {
  if (!/^#[\w-]+$/.test(location.hash)) return;
  const target = document.getElementById(location.hash.slice(1));
  if (target) requestAnimationFrame(() => target.scrollIntoView({ behavior: "instant" }));
}

/* ---------- Animasjon ved scroll ---------- */
function setupReveal(selector) {
  if (reducedMotion) return;
  const els = $$(selector);
  els.forEach((el) => el.classList.add("reveal"));
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.12 }
  );
  els.forEach((el) => io.observe(el));
}
