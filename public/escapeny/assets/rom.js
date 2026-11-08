/* ==========================================================
   Escape Haugesund – romside (rom.html?id=<id> eller /rom/<id>)
   Alt innhold hentes fra content/produkter.json.
   ========================================================== */

const roomId =
  new URLSearchParams(location.search).get("id") ||
  (location.pathname.match(/\/rom\/([^/]+)\/?$/) || [])[1];

function paragraphs(text) {
  return String(text || "")
    .split(/\n\s*\n/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => `<p>${esc(t)}</p>`)
    .join("");
}

function renderNotFound() {
  document.title = "Fant ikke rommet – Escape Haugesund";
  $("#room-main").innerHTML = `
    <section class="section not-found">
      <div class="wrap center">
        <h1>Fant ikke rommet</h1>
        <p class="section-lead">Rommet finnes ikke, eller det er ikke lenger på nettsiden.</p>
        <a class="btn btn-primary" href="spill.html">Se alle spill</a>
      </div>
    </section>`;
}

function renderRoom(p, all) {
  const level = Number(p.vanskelighet) || 0;
  const isRoom = p.type === "Escape room";
  const mobile = isMobileGame(p);
  // Mobile spill uten egen Bookero-widget bestilles via skjemaet på bedriftssiden.
  // Med widget kan de bookes i spillrommet hos oss, og «vi kommer til dere» går via skjemaet.
  const viaSkjema = mobile && !p.bookero_widget_id;
  const spillrom = mobile && !viaSkjema;
  const bestillUrl = viaSkjema ? inquiryUrl(p) : "#booking";
  const bestillTekst = viaSkjema ? "Send forespørsel" : spillrom ? "Book spill hos oss" : `Book ${esc(p.navn)}`;

  document.title = `${p.navn} – ${isRoom ? "escape room i Haugesund" : mobile ? "portabelt escape-spill | Escape Haugesund" : "Escape Haugesund"}`;
  $('meta[name="description"]').setAttribute("content", p.kort_beskrivelse || p.beskrivelse || "");

  // Topp med film
  const hero = $("#room-hero");
  hero.insertAdjacentHTML(
    "afterbegin",
    p.film
      ? `<video class="hero-video" autoplay muted loop playsinline poster="${esc(p.bilde)}"><source src="${esc(p.film)}" type="video/mp4"></video>`
      : `<img class="hero-video" src="${esc(p.bilde)}" alt="">`
  );
  if (reducedMotion) $("video.hero-video", hero)?.pause();

  $("#room-hero-content").insertAdjacentHTML(
    "beforeend",
    `
    ${p.merkelapp ? `<span class="tag ${p.fremhevet ? "" : "tag-outline"}">${esc(p.merkelapp)}</span>` : ""}
    ${mobile ? `<p class="kicker">Portabelt escape-spill</p>` : ""}
    <h1 class="room-title">${esc(p.navn)}</h1>
    ${p.undertittel ? `<p class="room-subtitle">${esc(p.undertittel)}</p>` : ""}
    <div class="hero-lead">${p.ingress ? paragraphs(p.ingress) : `<p>${esc(p.kort_beskrivelse || p.beskrivelse)}</p>`}</div>
    <ul class="room-meta room-meta-hero">${metaItems(p).join("")}</ul>
    <div class="hero-actions">
      <a href="${bestillUrl}" class="btn btn-primary">${bestillTekst}</a>
      ${spillrom
        ? `<button type="button" class="btn btn-ghost" data-open-inquiry>Vi kommer til dere – send forespørsel</button>`
        : `<a href="#om-rommet" class="btn btn-ghost">Les mer</a>`}
    </div>
    ${spillrom ? `<a href="#om-rommet" class="read-more">Les mer om spillet <span aria-hidden="true">↓</span></a>` : ""}
    ${p.kampanje ? `<p class="kampanje-strip"><strong>${esc(p.kampanje.split(" – ")[0])}</strong>${p.kampanje.includes(" – ") ? ` <span>${esc(p.kampanje.split(" – ").slice(1).join(" – "))}</span>` : ""}</p>` : ""}`
  );

  // Historien
  $("#room-story").innerHTML = `
    <p class="kicker">${isRoom ? "Historien" : mobile ? "Om spillet" : "Om opplevelsen"}</p>
    <h2>${mobile ? `Hva er ${esc(p.navn)}?` : esc(p.navn)}</h2>
    <div class="story-text">${paragraphs(p.historie || p.beskrivelse)}</div>
    ${p.om_spillet?.length ? `
      <h3 class="story-subtitle">Slik fungerer det</h3>
      <ul class="story-list">${p.om_spillet.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
    ${spillrom ? "" /* «To måter å spille på» forklarer gamemaster og hvor man spiller */ : `<div class="gm-note">
      ${mobile
        ? "<strong>Vi hjelper dere på veien.</strong> En gamemaster kan bli med og hjelpe dere ved behov."
        : "<strong>Dere er aldri alene.</strong> En gamemaster følger med hele tiden og gir dere så mange hint dere trenger."}
    </div>`}`;

  // Praktisk info. Prisen gjelder escape rooms (pris per lag)
  const minPris = isRoom ? PRICES[Math.max(2, Number(p.min_spillere) || 2)]?.[0] : null;
  const facts = [
    spillere(p) && [
      "Spillere",
      // Escape rooms som kan spilles av to: si fra at det er krevende, men fullt mulig
      isRoom && Number(p.min_spillere) === 2
        ? `${spillere(p)} personer. Vi anbefaler 3 eller flere. Med to spillere blir det en ekstra utfordring, men mange spiller to og har en flott opplevelse.`
        : `${spillere(p)} personer`,
    ],
    p.varighet && ["Varighet", `${p.varighet} minutter`],
    level && ["Vanskelighet", `${dotsHTML(level)} <span class="sr-only">${level} av 5</span>`, true],
    minPris && ["Pris", `Fra ${kr(minPris)} per lag`],
    isRoom && ["Alder", "10–80 år. Under 14 år må ha med en voksen."],
    isRoom && ["Språk", "Oppgavene er på engelsk. Hint på norsk eller engelsk."],
    // Hvor og gamemaster står i «To måter å spille på» for spill som kan bookes hos oss
    mobile && !spillrom && ["Hvor", p.hvor || "Vi kommer til dere, eller dere spiller hos oss i Strandgaten (opptil 12 personer)."],
    mobile && ["Passer for", "Firmafest og julebord, bursdager og private selskap."],
    mobile && !spillrom && ["Gamemaster", "Blir med og hjelper dere på veien ved behov."],
    mobile && ["Faktura", "Bedrifter kan få faktura."],
    !mobile && ["Oppmøte", "10 minutter før. Strandgata 130, 2. etasje."],
  ].filter(Boolean);
  $("#room-facts").innerHTML = `
    <p class="facts-title">Praktisk</p>
    <dl>${facts.map(([k, v, html]) => `<div><dt>${k}</dt><dd>${html ? v : esc(v)}</dd></div>`).join("")}</dl>
    <a href="${bestillUrl}" class="btn btn-primary">${viaSkjema ? "Send forespørsel" : "Se ledige tider"}</a>`;

  // Booking for akkurat dette rommet. Mobile spill bestilles via skjema i stedet
  if (viaSkjema) {
    $("#booking").hidden = true;
    $("#mobile-book").href = bestillUrl;
    $("#mobile-book").textContent = "Send forespørsel";
    $(".header-cta").href = bestillUrl;
    $(".header-cta").textContent = "Send forespørsel";
  } else {
    $("#booking-title").textContent = spillrom ? `Book ${p.navn} hos oss` : `Book ${p.navn}`;
    if (spillrom) {
      $("#booking-lead").innerHTML = `Spill i et eget rom hos oss i Strandgata 130, for opptil 12 personer. Velg dato og tidspunkt i kalenderen. Vil dere heller at vi kommer til dere? <button type="button" class="link-button" data-open-inquiry>Send forespørsel</button>`;
    }
    $("#booking-panels").innerHTML = bookingPanelHTML(p, { compact: true });
    if (p.bookero_widget_id) loadBookero();
  }

  // To måter å spille på (portable spill som også kan bookes hos oss)
  if (spillrom) {
    const ways = $("#to-maater");
    ways.innerHTML = `
      <div class="wrap">
        <header class="section-head center"><h2>To måter å spille på</h2></header>
        <div class="split ways">
          <article class="promo" style="--photo: url('${esc(absUrl(p.bilde))}'); --photo-pos: 30% 70%">
            <p class="kicker">Hos Escape Haugesund</p>
            <h2>Spill hos oss</h2>
            <p>Kom til Escape Haugesund og spill ${esc(p.navn)} i et eget rom. Her er det ikke rommet dere skal rømme fra, men mysteriet dere skal løse! Book ledig tid direkte i kalenderen.</p>
            <a href="#booking" class="btn btn-primary">Book spill hos oss</a>
          </article>
          <article class="promo" style="--photo: url('${esc(absUrl(p.bilde))}'); --photo-pos: 90% 20%; --photo-size: 230%">
            <p class="kicker">Hjemme, på jobben eller på arrangement</p>
            <h2>Vi kommer til dere</h2>
            <p>Vil dere spille hjemme, på arbeidsplassen eller på et arrangement? Vi tar med spillet og en gamemaster som leder dere gjennom opplevelsen. Send oss en forespørsel, så finner vi en løsning sammen.</p>
            <button type="button" class="btn btn-ghost" data-open-inquiry>Send forespørsel</button>
          </article>
        </div>
      </div>`;
    ways.hidden = false;
    $("#andre").classList.remove("section-alt");
    setupInquiryDialog(p);
  }

  // Andre spill
  const others = all.filter((o) => o.id !== p.id);
  $("#other-rooms").innerHTML = others.map(productCard).join("");
  $("#andre").hidden = others.length === 0;
  observeRoomVideos($("#andre"));

  setupMobileBook($("#room-hero"), viaSkjema ? $("#andre") : $("#booking"));
  setupReveal(".room-story, .room-facts, #andre .room, .section-head");
}

/* ---------- «Vi kommer til dere»-skjemaet ---------- */
function setupInquiryDialog(p) {
  const dialog = $("#inquiry-dialog");
  const body = $("#inquiry-body");
  body.innerHTML = productInquiryHTML(p);
  setupProductInquiry(body, p, { closeButton: true });

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-open-inquiry]")) dialog.showModal();
    if (e.target.closest("[data-close-inquiry]") || e.target === dialog) dialog.close();
  });
}

loadProducts().then((all) => {
  const p = all.find((x) => x.id === roomId);
  if (p) renderRoom(p, all);
  else renderNotFound();
});
