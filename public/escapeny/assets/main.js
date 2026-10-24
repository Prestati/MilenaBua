/* ==========================================================
   Escape Haugesund – forsiden
   Felles kode (header, produkter, booking) ligger i common.js.
   ========================================================== */

let PRODUCTS = [];

/* ---------- Film og nedtelling i hero ---------- */
(() => {
  const video = $(".hero-video");
  const btn = $("#video-toggle");
  const setPaused = (paused) => {
    btn.classList.toggle("paused", paused);
    btn.setAttribute("aria-label", paused ? "Spill av filmen" : "Sett filmen på pause");
  };
  if (reducedMotion) { video.pause(); video.removeAttribute("autoplay"); setPaused(true); }
  btn.addEventListener("click", () => {
    if (video.paused) { video.play(); setPaused(false); } else { video.pause(); setPaused(true); }
  });

})();

/* ---------- Stoppeklokke ---------- */
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const ticks = $("#sw-ticks");
  for (let i = 0; i < 60; i++) {
    const a = (i * 6 * Math.PI) / 180;
    const long = i % 5 === 0;
    const line = document.createElementNS(NS, "line");
    line.setAttribute("x1", 120 + Math.sin(a) * 100);
    line.setAttribute("y1", 160 - Math.cos(a) * 100);
    line.setAttribute("x2", 120 + Math.sin(a) * (long ? 88 : 94));
    line.setAttribute("y2", 160 - Math.cos(a) * (long ? 88 : 94));
    line.setAttribute("class", long ? "sw-tick sw-tick-long" : "sw-tick");
    ticks.appendChild(line);
  }

  const total = 60 * 60;
  const arc = $("#sw-arc");
  const min = $("#sw-min");
  const hand = $("#sw-hand");
  const circumference = 2 * Math.PI * 76;
  arc.style.strokeDasharray = circumference;

  // Viseren går alltid fremover (gradene nullstilles aldri), så den ikke spinner baklengs
  let ticksTotal = 0;
  let elapsed = 0;
  setInterval(() => {
    ticksTotal++;
    elapsed = elapsed >= total ? 0 : elapsed + 1;
    const left = total - elapsed;
    hand.style.transform = `rotate(${ticksTotal * 6}deg)`;
    arc.style.strokeDashoffset = circumference * (1 - left / total);
    min.textContent = Math.ceil(left / 60);
  }, 1000);
})();

/* ---------- Spillene ---------- */
function renderProducts() {
  const rooms = PRODUCTS.filter((p) => p.type === "Escape room");
  const extras = PRODUCTS.filter((p) => p.type !== "Escape room");

  $("#rooms").innerHTML = rooms.map(productCard).join("");
  $("#extras-list").innerHTML = extras.map(productCard).join("");
  $("#extras").hidden = extras.length === 0;

  $$("[data-count=rom]").forEach((el) => (el.textContent = rooms.length));
  const ord = ["", "Ett", "To", "Tre", "Fire", "Fem", "Seks"][rooms.length] || String(rooms.length);
  $("#rooms-lead").textContent =
    rooms.length === 1 ? "Ett rom, én historie. 60 minutter." : `${ord} rom, ${ord.toLowerCase()} historier. Alle varer i 60 minutter.`;

  observeRoomVideos($("#rom"));
}

/* ---------- Hurtigbooking med faner ---------- */
const tabsEl = $("#booking-tabs");
const panelsEl = $("#booking-panels");

function renderBooking() {
  // Mobile spill uten Bookero bestilles via bedriftssiden, så de får ikke egen fane her
  const bookable = PRODUCTS.filter((p) => !isMobileGame(p) || p.bookero_widget_id);
  tabsEl.innerHTML = bookable.map(
    (p) => `<button role="tab" id="tab-${esc(p.id)}" aria-controls="panel-${esc(p.id)}" data-tab="${esc(p.id)}">${esc(p.navn)}</button>`
  ).join("");
  panelsEl.innerHTML = bookable.map((p) => bookingPanelHTML(p, { hidden: true })).join("");
  if (bookable.some((p) => p.bookero_widget_id)) loadBookero();

  const tabs = $$("[role=tab]", tabsEl);
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => selectRoom(t.dataset.tab));
    t.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      selectRoom(next.dataset.tab, { focus: true });
    });
  });

  const first = bookable.find((p) => p.bookero_widget_id) || bookable[0];
  if (first) selectRoom(first.id);
}

function selectRoom(id, { focus = false } = {}) {
  $$("[role=tab]", tabsEl).forEach((t) => {
    const on = t.dataset.tab === id;
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
    if (on && focus) t.focus();
  });
  $$(".booking-panel", panelsEl).forEach((p) => (p.hidden = p.id !== `panel-${id}`));
}

/* ---------- Finn riktig rom ---------- */
const quiz = $("#quiz");
const quizResult = $("#quiz-result");

quiz.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(quiz);
  const erfaring = f.get("erfaring");
  const stemning = f.get("stemning");
  const antall = Number(f.get("antall"));

  // Bare rom med stemning satt i admin er med i testen
  const kandidater = PRODUCTS.filter(
    (p) => p.romtest_stemning && p.romtest_stemning !== "ingen" && (!p.maks_spillere || p.maks_spillere >= antall)
  );
  if (!kandidater.length) return;

  const score = (p) => {
    const level = Number(p.vanskelighet) || 3;
    let s = p.romtest_stemning === stemning ? 3 : 0;
    if (erfaring === "ny") s += p.nybegynnervennlig ? 3 : 5 - level;
    if (erfaring === "litt") s += level >= 3 && level <= 4 ? 2 : 0;
    if (erfaring === "mye") s += level - 2;
    return s;
  };
  // Ved likt: nybegynnere får det letteste rommet, erfarne det vanskeligste
  const retning = erfaring === "ny" ? 1 : -1;
  const best = kandidater
    .map((p) => [p, score(p)])
    .sort((a, b) => b[1] - a[1] || retning * ((Number(a[0].vanskelighet) || 3) - (Number(b[0].vanskelighet) || 3)))[0][0];

  const grunner = [];
  if (best.nybegynnervennlig && erfaring === "ny") grunner.push("perfekt første rom");
  if (best.romtest_stemning === stemning) {
    grunner.push({ mysterium: "et mysterium å nøste opp", skrekk: "for dere som tåler litt skrekk", tempo: "høyt tempo hele veien" }[stemning]);
  }
  if (erfaring === "mye" && Number(best.vanskelighet) >= 5) grunner.push("vår største utfordring");
  if (!grunner.length) grunner.push("passer godt for dere");

  quizResult.innerHTML = `
    <img src="${esc(best.bilde)}" alt="">
    <div>
      <p class="why">Vi foreslår · ${grunner.join(" · ")}</p>
      <h3>${esc(best.navn)}</h3>
      <p>${esc(best.kort_beskrivelse || best.beskrivelse)}</p>
      <a class="btn btn-primary" href="${roomUrl(best.id)}">Se ${esc(best.navn)} og book</a>
    </div>`;
  quizResult.hidden = false;
  quizResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

/* ---------- Priser ---------- */
(() => {
  const body = $("#price-body");
  body.innerHTML = Object.entries(PRICES)
    .map(([n, [a, b]]) => `<tr data-n="${n}"><td>${n} personer</td><td>${kr(a)}</td><td>${kr(b)}</td></tr>`)
    .join("");

  const out = $("#calc-players");
  const sum = $("#calc-sum");
  const pp = $("#calc-pp");
  const student = $("#calc-student");
  const [minus, plus] = $$(".stepper button");
  let n = 4;

  function update() {
    const helg = $("input[name=dag]:checked").value === "helg";
    let total = PRICES[n][helg ? 1 : 0];
    if (student.checked) total *= 0.8;
    out.textContent = n;
    sum.textContent = kr(total);
    pp.textContent = `${kr(total / n)} per person`;
    minus.disabled = n <= 2;
    plus.disabled = n >= 6;
    $$("tr", body).forEach((r) => r.classList.toggle("hl", Number(r.dataset.n) === n));
  }

  $$(".stepper button").forEach((b) =>
    b.addEventListener("click", () => {
      n = Math.min(6, Math.max(2, n + Number(b.dataset.step)));
      update();
    })
  );
  $$("input[name=dag]").forEach((r) => r.addEventListener("change", update));
  student.addEventListener("change", update);
  update();
})();

/* ---------- FAQ-søk ---------- */
(() => {
  const input = $("#faq-search");
  const items = $$("#faq-list details");
  const groups = $$("#faq-list .faq-group");
  const empty = $("#faq-empty");

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    let hits = 0;
    items.forEach((d) => {
      const match = !q || d.textContent.toLowerCase().includes(q);
      d.hidden = !match;
      d.open = Boolean(q) && match;
      if (match) hits++;
    });
    // Skjul gruppeoverskrifter uten treff
    groups.forEach((g) => {
      let el = g.nextElementSibling;
      let any = false;
      while (el && el.tagName === "DETAILS") {
        if (!el.hidden) any = true;
        el = el.nextElementSibling;
      }
      g.hidden = !any;
    });
    empty.hidden = hits > 0;
  });
})();

setupMobileBook($(".hero"), $("#booking"));

/* ---------- Aktiv menylenke ---------- */
(() => {
  const links = $$(".nav a");
  const map = new Map(links.map((a) => [a.getAttribute("href").replace(/^\/?#/, ""), a]));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.classList.remove("active"));
        map.get(e.target.id)?.classList.add("active");
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
})();

/* ---------- Start ---------- */
loadProducts().then((list) => {
  PRODUCTS = list;
  renderProducts();
  renderBooking();
  setupReveal(".section-head, .room, .steps li, .promo, .calc, .price-table, .quiz fieldset");
  restoreHashScroll();
});
