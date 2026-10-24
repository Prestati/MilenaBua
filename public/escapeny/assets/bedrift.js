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
  spillSelect.closest(".field").hidden = games.length === 0;

  // Kommer man fra et spill (bedrift.html?spill=<id>#kontakt), velges det på forhånd
  const valgt = games.find((g) => g.id === new URLSearchParams(location.search).get("spill"));
  if (valgt) spillSelect.value = valgt.navn;

  setupReveal(".section-head, .option, .room, .steps li, .inquiry");
  restoreHashScroll();
});

/* ---------- Skjema ---------- */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const btn = $("button[type=submit]", form);
  btn.disabled = true;
  status.hidden = true;

  // Netlify Forms forventer vanlig skjemadata postet til siden selv
  fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(new FormData(form)).toString(),
  })
    .then((r) => {
      if (!r.ok) throw new Error(r.status);
      form.reset();
      status.className = "form-status ok";
      status.innerHTML = "<strong>Takk!</strong> Vi har fått forespørselen og svarer så raskt vi kan.";
    })
    .catch(() => {
      status.className = "form-status error";
      status.innerHTML =
        'Skjemaet kunne ikke sendes akkurat nå. Send oss en e-post på <a href="mailto:post@escapehaugesund.no">post@escapehaugesund.no</a> eller ring <a href="tel:+4752711111">52 71 11 11</a>.';
    })
    .finally(() => {
      status.hidden = false;
      btn.disabled = false;
    });
});

setupMobileBook($("#page-hero"), $("#kontakt"));
