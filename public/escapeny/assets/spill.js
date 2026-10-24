/* ==========================================================
   Escape Haugesund – oversikt over alle spillene
   Ett avsnitt per produkttype, i rekkefølgen under.
   ========================================================== */

const CATEGORIES = [
  {
    type: "Escape room",
    id: "escape-rooms",
    title: "Escape rooms",
    lead: "60 minutter i et ekte rom hos oss i Strandgata 130. Gamemaster og hint underveis.",
  },
  {
    type: "Mobilt spill",
    id: "portable-spill",
    title: "Portable escape-spill",
    lead: "Vi tar med spillet til julebordet, firmafesten eller selskapet. Eller spill hos oss.",
    link: { href: "bedrift.html", text: "Les mer om bedrift og grupper" },
  },
  {
    type: "Annen opplevelse",
    id: "andre-opplevelser",
    title: "Andre opplevelser",
    lead: "",
  },
];

loadProducts().then((all) => {
  const groups = CATEGORIES.map((c) => ({ ...c, items: all.filter((p) => p.type === c.type) })).filter((c) => c.items.length);

  $("#category-links").innerHTML = groups
    .map((c) => `<a href="#${c.id}">${esc(c.title)} <span>${c.items.length}</span></a>`)
    .join("");

  $("#alle-spill").innerHTML = groups
    .map(
      (c, i) => `
      <section class="section ${i % 2 ? "section-alt" : ""} game-group" id="${c.id}">
        <div class="wrap">
          <header class="section-head">
            <h2>${esc(c.title)}</h2>
            ${c.lead ? `<p class="section-lead">${esc(c.lead)}${c.link ? ` <a href="${c.link.href}">${esc(c.link.text)}</a>.` : ""}</p>` : ""}
          </header>
        </div>
        <div class="rooms rooms-grid">${c.items.map(productCard).join("")}</div>
      </section>`
    )
    .join("");

  observeRoomVideos($("#alle-spill"));
  setupReveal(".game-group .section-head, .game-group .room");
  restoreHashScroll();
});
