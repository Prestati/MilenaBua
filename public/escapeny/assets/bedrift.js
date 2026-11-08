/* ==========================================================
   Escape Haugesund – bedriftssiden
   Mobile spill hentes fra content/produkter.json (type «Mobilt spill»).
   ========================================================== */

const form = $("#inquiry");
const status = $("#form-status");
const spillSelect = $("#spill-select");

/* ---------- Mobile spill ---------- */
loadProducts().then((all) => {
  const games = all.filter((p) => p.type === "Mobilt spill");
  $("#mobile-list").innerHTML = games.map(productCard).join("");
  $("#mobile-spill").hidden = games.length === 0;
  observeRoomVideos($("#mobile-spill"));

  spillSelect.insertAdjacentHTML("beforeend", games.map((g) => `<option value="${esc(g.navn)}">${esc(g.navn)}</option>`).join(""));

  // Kommer man fra et portabelt spill (bedrift.html?spill=<id>#kontakt), vises skjemaet for det spillet:
  // spillet er forhåndsvalgt, og kunden slipper å velge interesse og spill.
  const valgt = games.find((g) => g.id === new URLSearchParams(location.search).get("spill"));
  if (valgt) {
    $("#kontakt .section-head").hidden = true;
    const holder = document.createElement("div");
    holder.className = "pinq-holder";
    holder.innerHTML = productInquiryHTML(valgt);
    form.replaceWith(holder);
    setupProductInquiry(holder, valgt);
  } else if (!INQUIRY_ENABLED) {
    // Generelt skjema er av til mottaket finnes: vis e-post og telefon i stedet
    const holder = document.createElement("div");
    holder.className = "pinq-holder";
    holder.innerHTML = contactFallbackHTML(
      "Forespørsel fra bedriftssiden",
      "Fortell oss hvor mange dere er, når dere vil spille og hva dere er interessert i: escape rooms, spillrommet eller at vi kommer til dere med et portabelt spill. Vi svarer så raskt vi kan, vanligvis innen én arbeidsdag.",
      ["Navn", "Bedrift / organisasjon", "Telefon", "Antall personer", "Ønsket dato", "Hva er dere interessert i?", "Om arrangementet"]
    );
    form.replaceWith(holder);
  } else {
    setupSmartFields(games.length > 0);
  }

  setupReveal(".section-head, .option, .room, .steps li, .inquiry");
  restoreHashScroll();
});

/* ---------- Generelt skjema: vis bare relevante felt ---------- */
function setupSmartFields(hasGames) {
  const spillField = $("#spill-field");
  const stedField = $("#sted-field");
  const checked = (value) => $(`input[name=interesse][value="${value}"]`, form).checked;
  const update = () => {
    const hosDere = checked("Portabelt spill hos dere");
    const spillrom = checked("Spillrommet hos oss (opptil 12)");
    spillField.hidden = !hasGames || !(hosDere || spillrom);
    stedField.hidden = !hosDere;
  };
  $$("input[name=interesse]", form).forEach((c) => c.addEventListener("change", update));
  form.addEventListener("reset", () => setTimeout(update));
  update();
}

/* ---------- Skjema ---------- */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const btn = $("button[type=submit]", form);
  btn.disabled = true;
  status.hidden = true;

  sendInquiry(form)
    .then(() => {
      form.reset();
      status.className = "form-status ok";
      status.innerHTML = "<strong>Takk!</strong> Vi har fått forespørselen og svarer så raskt vi kan.";
    })
    .catch(() => {
      status.className = "form-status error";
      status.innerHTML =
        '<strong>Forespørselen ble ikke sendt.</strong> Sjekk tilkoblingen og prøv igjen. Fungerer det fortsatt ikke, send e-post til <a href="mailto:post@escapehaugesund.no">post@escapehaugesund.no</a> eller ring <a href="tel:+4752711111">52 71 11 11</a>.';
    })
    .finally(() => {
      status.hidden = false;
      btn.disabled = false;
    });
});

setupMobileBook($("#page-hero"), $("#kontakt"));
