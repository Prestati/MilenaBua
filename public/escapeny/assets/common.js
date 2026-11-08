/* ==========================================================
   Escape Haugesund – felles kode for forside og romsider
   ========================================================== */

const PRODUCTS_URL = "content/produkter.json";
// Mottaket for forespørsler (bedriftsskjemaet og «Vi kommer til dere»).
// Må finnes der siden ligger, ellers viser skjemaet feilmelding i stedet for «mottatt».
const INQUIRY_ENDPOINT = "api/foresporsel";
// Skru på når mottaket finnes. Til da viser skjemaene «Send e-post» og «Ring» i stedet,
// så ingen kunder sender forespørsler som ikke kommer frem.
const INQUIRY_ENABLED = false;

// Midlertidig erstatning for skjemaene: ferdig utfylt e-post + telefon
function contactFallbackHTML(subject, intro, fields) {
  const body = `Hei!\n\n${fields.map((f) => `${f}: `).join("\n")}\n\nHilsen`;
  const mail = `mailto:post@escapehaugesund.no?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return `
    <div class="contact-fallback">
      <h3 class="pinq-fields-title">Ta kontakt</h3>
      <p>${intro}</p>
      <div class="actions">
        <a class="btn btn-primary" href="${mail}">Send e-post</a>
        <a class="btn btn-ghost" href="tel:+4752711111">Ring 52 71 11 11</a>
      </div>
      <p class="fine">Dette er en uforpliktende forespørsel, ikke en bekreftet booking. Vi tar kontakt for å avtale detaljene.</p>
    </div>`;
}
const BOOKERO_BASE_URL = "https://app.bookero.no";
const BOOKERO_SCRIPT = "https://app.bookero.no/build/widget.js?v=1792819627";

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

// Bilder i CSS-variabler (--photo, --poster) leses relativt til stilarket, ikke siden.
// Derfor gjøres stien om til full adresse før den settes inn.
const absUrl = (path) => new URL(path, document.baseURI).href;

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
        <span class="btn btn-primary" aria-hidden="true">${isMobileGame(p) && !p.bookero_widget_id ? "Les mer" : "Les mer og book"}</span>
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
      ${compact ? "" : `<div class="booking-info" style="--poster: url('${esc(absUrl(p.bilde))}')">
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

/* ---------- Forespørsler ---------- */
// Sender et skjema til mottaket. Lykkes bare når mottaket svarer { ok: true },
// så kunden aldri får bekreftelse på noe som ikke er sendt.
function sendInquiry(form) {
  return fetch(INQUIRY_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(new FormData(form)).toString(),
  })
    .then((r) => r.json())
    .then((data) => {
      if (!data.ok) throw new Error(data.error || "Ikke sendt");
      return data;
    });
}

/* ---------- «Vi kommer til dere»-skjema for portable spill ---------- */
// Brukes i vinduet på spillsiden og på bedriftssiden (bedrift.html?spill=<id>).
// Spillet er forhåndsvalgt og følger med i innsendingen, så kunden slipper å velge.
function productInquiryHTML(p) {
  const navn = esc(p.navn);
  const field = (label, input, required) =>
    `<label class="field"><span>${label}${required ? " *" : " <em>(valgfritt)</em>"}</span>${input}</label>`;
  return `
    <div class="pinq">
      <p class="kicker">${navn}</p>
      <h2 class="pinq-title" id="inquiry-title">Vi tar spillet med til dere!</h2>
      <div class="pinq-intro">
        <p>Planlegger dere en bursdag, firmafest, teambuilding eller en annen samling? Vi tar med ${navn} og en gamemaster som sørger for en spennende opplevelse der dere er.</p>
        <p>${INQUIRY_ENABLED
          ? "Fyll ut skjemaet, så tar vi kontakt for å avklare muligheter, praktiske detaljer og pris. Helt uforpliktende!"
          : "Ta kontakt, så avklarer vi muligheter, praktiske detaljer og pris sammen. Helt uforpliktende!"}</p>
      </div>
      ${!INQUIRY_ENABLED ? contactFallbackHTML(
        `Forespørsel: ${p.navn} hos oss`,
        "Send oss en e-post med litt om arrangementet – antall deltakere, ønsket dato og tid, og hvor dere vil at vi skal komme. Eller ring oss, så tar vi det derfra.",
        ["Navn", "Bedrift / organisasjon", "Telefonnummer", "Antall deltakere", "Ønsket dato", "Ønsket tidspunkt", "Hvor skal vi komme?", "Om arrangementet"]
      ) : `
      <form class="inquiry pinq-form" method="POST">
        <h3 class="pinq-fields-title">Fortell oss litt om arrangementet</h3>
        <input type="hidden" name="form-name" value="vi-kommer-til-dere">
        <input type="hidden" name="spill" value="${navn}">
        <input type="hidden" name="type" value="Vi kommer til dere: ${navn} med gamemaster, gjennomføres hos kunden">
        <p class="hidden-field"><label>Ikke fyll ut: <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
        <div class="field-row">
          ${field("Navn", `<input name="navn" required autocomplete="name">`, true)}
          ${field("Bedrift / organisasjon", `<input name="bedrift" autocomplete="organization">`)}
        </div>
        <div class="field-row">
          ${field("E-post", `<input type="email" name="epost" required autocomplete="email">`, true)}
          ${field("Telefonnummer", `<input type="tel" name="telefon" required autocomplete="tel">`, true)}
        </div>
        <div class="field-row">
          ${field("Antall deltakere", `<input type="number" name="antall" required min="1" inputmode="numeric">`, true)}
          ${field("Ønsket dato", `<input type="date" name="dato">`)}
        </div>
        <div class="field-row">
          ${field("Ønsket tidspunkt", `<input type="time" name="tidspunkt" step="900">`)}
          ${field("Hvor skal vi komme?", `<input name="sted" autocomplete="street-address" placeholder="Adresse eller sted">`)}
        </div>
        ${field("Fortell litt om arrangementet", `<textarea name="melding" rows="5" placeholder="F.eks. Vi planlegger en firmafest for 12 personer og ønsker ${navn} på kontoret vårt."></textarea>`)}
        <button type="submit" class="btn btn-primary">Send forespørsel</button>
        <p class="fine pinq-note">Dette er en uforpliktende forespørsel, ikke en bekreftet booking. Vi tar kontakt for å avtale detaljene.</p>
        <p class="form-status" role="alert" hidden></p>
      </form>`}
    </div>`;
}

function setupProductInquiry(root, p, { closeButton = false } = {}) {
  const form = $("form", root);
  if (!form) return; // skjemaet er av (INQUIRY_ENABLED), e-post/telefon vises i stedet
  const status = $(".form-status", form);
  const btn = $("button[type=submit]", form);
  // Datoer i fortiden kan ikke velges (lokal dato, ikke UTC)
  const now = new Date();
  form.dato.min = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = "Sender …";
    status.hidden = true;

    sendInquiry(form)
      .then(() => {
        // Bekreftelsen vises bare når mottaket har sagt ok
        root.innerHTML = `
          <div class="inquiry-done" role="status">
            <p class="kicker">${esc(p.navn)}</p>
            <h2>Takk for forespørselen!</h2>
            <p>Vi har mottatt henvendelsen din og tar kontakt for å se på mulighetene. ${esc(p.foresporsel_takk || "Vi gleder oss til å planlegge opplevelsen sammen med dere!")}</p>
            ${closeButton ? `<button type="button" class="btn btn-primary" data-close-inquiry>Lukk</button>` : ""}
          </div>`;
      })
      .catch(() => {
        status.className = "form-status error";
        status.innerHTML =
          '<strong>Forespørselen ble ikke sendt.</strong> Sjekk tilkoblingen og prøv igjen. Fungerer det fortsatt ikke, send e-post til <a href="mailto:post@escapehaugesund.no">post@escapehaugesund.no</a> eller ring <a href="tel:+4752711111">52 71 11 11</a>.';
        status.hidden = false;
        btn.disabled = false;
        btn.textContent = "Prøv igjen";
      });
  });
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
  if (target) setTimeout(() => target.scrollIntoView({ behavior: "instant" }));
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
