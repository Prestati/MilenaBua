/* ==========================================================
   Escape Haugesund – bedriftssiden
   Spillnavn hentes fra content/produkter.json, så kortene alltid viser
   spill som faktisk finnes. Bare «Mobilt spill» presenteres som noe
   vi kan ta med ut til kunden.
   ========================================================== */

const form = $("#inquiry");
const status = $("#form-status");

const names = (list) => list.map((p) => `<a href="${roomUrl(p.id)}">${esc(p.navn)}</a>`).join(", ");

loadProducts().then((all) => {
  const rooms = all.filter((p) => p.type === "Escape room");
  const portable = all.filter((p) => isMobileGame(p));
  const playHere = portable.filter((p) => p.bookero_widget_id); // kan bookes i spillrommet hos oss

  if (rooms.length) $("#rooms-names").innerHTML = `Rommene: ${names(rooms)}`;
  if (playHere.length) $("#games-names").innerHTML = `Spillene: ${names(playHere)}`;
  if (portable.length) {
    $("#delivery-names").innerHTML = `Kan tas med til dere: ${names(portable)}`;
    $("#delivery-note").textContent = `Spill som kan tas med til dere: ${portable.map((p) => p.navn).join(" og ")}. Escape rooms spilles hos oss.`;
  }

  // Kommer man fra et portabelt spill (bedrift.html?spill=<id>#kontakt), vises skjemaet for det spillet:
  // spillet er forhåndsvalgt, og kunden slipper å velge interesse og sted.
  const valgt = portable.find((g) => g.id === new URLSearchParams(location.search).get("spill"));
  if (valgt) {
    $("#kontakt .section-head").hidden = true;
    replaceForm(productInquiryHTML(valgt));
    setupProductInquiry($("#kontakt .pinq-holder"), valgt);
  } else if (!INQUIRY_ENABLED) {
    // Mottaket finnes ikke ennå: vis e-post og telefon i stedet for et skjema som ikke kommer frem
    replaceForm(
      contactFallbackHTML(
        "Forespørsel: bedriftsarrangement",
        "Send oss en e-post med litt om hva dere planlegger, eller ring oss, så tar vi det derfra.",
        ["Bedriftens navn", "Kontaktperson", "Telefonnummer", "Antall deltakere", "Ønsket dato", "Hvor ønsker dere opplegget? (hos Escape Haugesund / hos oss / ikke bestemt)", "Hva er dere interessert i?", "Kommentarer eller spesielle ønsker"]
      )
    );
  } else {
    setupSmartFields(portable.length > 0);
  }

  setupReveal(".section-head, .b2b-intro-text, .b2b-intro-media, .activity, .occasions li, .timeline li, .big-group, .faq details, .inquiry, .pinq-holder");
  restoreHashScroll();
});

function replaceForm(html) {
  const holder = document.createElement("div");
  holder.className = "pinq-holder";
  holder.innerHTML = html;
  form.replaceWith(holder);
}

/* ---------- Generelt skjema: vis bare relevante felt ---------- */
function setupSmartFields(canDeliver) {
  const stedField = $("#sted-field");
  const update = () => {
    const hosKunden = $("input[name=hvor]:checked", form)?.value.startsWith("Hos oss");
    stedField.hidden = !(hosKunden && canDeliver);
  };
  $$("input[name=hvor]", form).forEach((r) => r.addEventListener("change", update));
  form.addEventListener("reset", () => setTimeout(update));
  form.dato.min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  update();
}

/* ---------- Innsending ---------- */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const btn = $("button[type=submit]", form);
  btn.disabled = true;
  btn.textContent = "Sender …";
  status.hidden = true;

  sendInquiry(form)
    .then(() => {
      // Bekreftelsen vises bare når mottaket har sagt ok
      replaceForm(`
        <div class="inquiry-done" role="status">
          <p class="kicker">Forespørsel mottatt</p>
          <h2>Takk for forespørselen!</h2>
          <p>Vi har mottatt henvendelsen og tar kontakt for å finne et opplegg som passer dere.</p>
          <p class="fine">Merk: Dette er ikke en bekreftet booking før du har hørt fra oss.</p>
        </div>`);
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

setupMobileBook($("#page-hero"), $("#kontakt"));
