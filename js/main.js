/* =========================================================
   BMW PREMIUM SAIGON — MAIN SCRIPT
   ========================================================= */

const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ---------------- Navigation ---------------- */
function initNav() {
  const toggle = qs(".nav-toggle");
  const nav = qs(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => nav.classList.toggle("open"));
    qsa("a", nav).forEach((a) =>
      a.addEventListener("click", () => nav.classList.remove("open"))
    );
  }
  // Highlight active page link
  const current = location.pathname.split("/").pop() || "index.html";
  qsa(".main-nav a[data-page]").forEach((a) => {
    if (a.dataset.page === current) a.classList.add("active");
  });
}

/* ---------------- Scroll reveal ---------------- */
function initReveal() {
  const items = qsa(".reveal");
  if (!("IntersectionObserver" in window) || items.length === 0) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((el) => io.observe(el));
}

/* ---------------- Instrument-cluster count-up ---------------- */
function initGaugeCount() {
  const items = qsa("[data-count-to]");
  if (items.length === 0) return;
  const animate = (el) => {
    const target = parseFloat(el.dataset.countTo);
    const decimals = el.dataset.countTo.includes(".") ? 1 : 0;
    const duration = 1100;
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(tick);
  };
  if (!("IntersectionObserver" in window)) {
    items.forEach(animate);
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  items.forEach((el) => io.observe(el));
}

/* ---------------- Car silhouette (SVG generator) ---------------- */
const BODY_PATHS = {
  sedan: {
    body: "M40,150 C40,139 46,124 62,118 L98,93 C114,77 138,66 168,64 L246,64 C270,66 288,76 300,90 L328,116 C354,120 368,131 368,150 Z",
    window:
      "M118,92 L152,70 C163,66 175,64 188,64 L236,64 C249,64 259,68 267,75 L289,92 Z",
    wheelX: [112, 290],
    hoodX: 302,
    mirrorX: 192,
    mirrorY: 88,
  },
  suv: {
    body: "M34,150 C34,137 41,119 60,112 L84,88 C100,70 126,53 162,50 L250,50 C280,53 300,66 313,84 L335,110 C359,116 371,129 371,150 Z",
    window:
      "M112,86 L146,62 C158,57 172,54 188,54 L236,54 C250,54 261,58 270,66 L293,86 Z",
    wheelX: [108, 292],
    hoodX: 314,
    mirrorX: 186,
    mirrorY: 78,
  },
  coupe: {
    body: "M46,150 C46,138 51,124 69,117 L112,99 C133,76 158,62 188,60 L256,60 C276,62 289,72 297,86 L320,119 C350,123 365,133 365,150 Z",
    window:
      "M132,96 L166,73 C176,68 187,65 198,65 L240,65 C251,65 260,70 267,79 L284,96 Z",
    wheelX: [116, 288],
    hoodX: 298,
    mirrorX: 206,
    mirrorY: 96,
  },
};

function wheelSVG(cx) {
  return `
    <g>
      <circle cx="${cx}" cy="150" r="27" fill="#14181f"/>
      <circle cx="${cx}" cy="150" r="16" fill="#5b6472"/>
      <circle cx="${cx}" cy="150" r="16" fill="none" stroke="#9aa5b1" stroke-width="1.4"/>
      <circle cx="${cx}" cy="150" r="5" fill="#0a1428"/>
      <path d="M${cx},134 L${cx},166 M${cx - 16},150 L${cx + 16},150 M${cx - 11},139 L${cx + 11},161 M${cx - 11},161 L${cx + 11},139"
        stroke="#7c8794" stroke-width="1.2" opacity=".7"/>
    </g>`;
}

function carSVG(car) {
  const p = BODY_PATHS[car.bodyType] || BODY_PATHS.sedan;
  const isElectric = car.category === "electric";
  const isM = car.id === "m4";
  const grilleColor = isElectric ? "#3fb8c4" : "#14181f";

  const mStripe = isM
    ? `<g stroke-width="3.4" stroke-linecap="round">
         <line x1="${p.mirrorX - 10}" y1="${p.mirrorY + 24}" x2="${p.mirrorX + 4}" y2="${p.mirrorY + 10}" stroke="#1c69d4"/>
         <line x1="${p.mirrorX - 4}" y1="${p.mirrorY + 24}" x2="${p.mirrorX + 10}" y2="${p.mirrorY + 10}" stroke="#0a1428"/>
         <line x1="${p.mirrorX + 2}" y1="${p.mirrorY + 24}" x2="${p.mirrorX + 16}" y2="${p.mirrorY + 10}" stroke="#e2231a"/>
       </g>`
    : "";

  return `
  <svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${car.name}">
    <ellipse cx="200" cy="163" rx="168" ry="11" fill="#0a1428" opacity=".08"/>
    ${wheelSVG(p.wheelX[0])}
    ${wheelSVG(p.wheelX[1])}
    <path d="${p.body}" fill="${car.color}" stroke="${car.colorStroke}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="${p.window}" fill="#0a1428" opacity=".82"/>
    <path d="${p.window}" fill="none" stroke="${car.colorStroke}" stroke-width="1.4" opacity=".5"/>
    <line x1="200" y1="64" x2="200" y2="${car.bodyType === "suv" ? 50 : car.bodyType === "coupe" ? 62 : 64}" stroke="${car.colorStroke}" stroke-width="1.2" opacity=".4"/>
    <rect x="${p.hoodX}" y="126" width="16" height="16" rx="3" fill="${grilleColor}"/>
    <ellipse cx="${p.hoodX + 22}" cy="120" rx="7" ry="5" fill="#eef1f5" stroke="${car.colorStroke}" stroke-width="1"/>
    <circle cx="${p.hoodX - 24}" cy="102" r="5.5" fill="#fff" stroke="${car.colorStroke}" stroke-width="1"/>
    <path d="M${p.hoodX - 24},96.5 A5.5,5.5 0 0 1 ${p.hoodX - 24},107.5" fill="#1c69d4"/>
    ${mStripe}
  </svg>`;
}

/* ---------------- Car cards ---------------- */
function specMini(car) {
  return `
    <div class="car-specs-mini">
      <div><b>${car.power}</b><span>Mã lực</span></div>
      <div><b>${car.accel}s</b><span>0–100km/h</span></div>
      <div><b>${car.transmission.includes("điện") ? "Điện" : car.fuel}</b><span>Nhiên liệu</span></div>
    </div>`;
}

function renderCarCard(car) {
  return `
    <article class="car-card reveal">
      <div class="car-card-media">
        <span class="car-tag">${car.categoryLabel}</span>
        ${carSVG(car)}
      </div>
      <div class="car-card-body">
        <h3>${car.name}</h3>
        <p class="car-tagline">${car.tagline}</p>
        ${specMini(car)}
        <div class="car-card-footer">
          <span class="car-price">${car.priceLabel} <small>VNĐ trở lên</small></span>
        </div>
        <a class="car-link" href="chi-tiet-xe.html?id=${car.id}">
          Xem chi tiết
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>
      </div>
    </article>`;
}

function renderCarList(containerSel, cars) {
  const el = qs(containerSel);
  if (!el) return;
  el.innerHTML = cars.map(renderCarCard).join("");
  initReveal();
}

/* ---------------- Cars page: filtering ---------------- */
function initCarsPage() {
  const grid = qs("#car-grid");
  if (!grid) return;
  renderCarList("#car-grid", CARS);

  const pills = qsa(".filter-pill");
  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      pills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      const cat = pill.dataset.filter;
      const filtered = cat === "all" ? CARS : CARS.filter((c) => c.category === cat);
      renderCarList("#car-grid", filtered);
    });
  });
}

/* ---------------- Home page: featured cars ---------------- */
function initHomeFeatured() {
  const el = qs("#featured-cars");
  if (!el) return;
  const ids = ["x5", "m4", "i4"];
  renderCarList("#featured-cars", ids.map(getCarById));
}

/* ---------------- Detail page ---------------- */
function initDetailPage() {
  const root = qs("#detail-root");
  if (!root) return;

  const params = new URLSearchParams(location.search);
  const car = getCarById(params.get("id")) || CARS[0];

  document.title = `${car.name} — BMW Premium Saigon`;

  qs("#d-breadcrumb-name").textContent = car.name;
  qs("#d-tag").textContent = car.categoryLabel;
  qs("#d-name").textContent = car.name;
  qs("#d-tagline").textContent = car.tagline;
  qs("#d-price").innerHTML = `${car.priceLabel} <small>Giá niêm yết tham khảo (VNĐ), chưa gồm phí lăn bánh</small>`;
  qs("#d-media").innerHTML = carSVG(car);
  qs("#d-description").textContent = car.description;
  qs("#d-color").textContent = car.colorName;

  qs("#d-book-link").href = `index.html?car=${car.id}#dat-lai-thu`;

  const specs = [
    ["Động cơ", car.engine],
    ["Công suất", `${car.power} mã lực`],
    ["Mô-men xoắn", `${car.torque} Nm`],
    ["Tăng tốc 0–100km/h", `${car.accel} giây`],
    ["Tốc độ tối đa", `${car.topSpeed} km/h`],
    ["Hộp số", car.transmission],
    ["Số chỗ ngồi", `${car.seats} chỗ`],
    ["Khoang hành lý", `${car.trunk} lít`],
  ];
  if (car.range) specs.splice(4, 0, ["Tầm hoạt động (điện)", `${car.range} km`]);

  qs("#d-spec-table").innerHTML = specs
    .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
    .join("");

  qs("#d-features").innerHTML = car.features
    .map(
      (f) => `<li>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
        <span>${f}</span>
      </li>`
    )
    .join("");

  // gauge strip on detail hero
  qs("#d-gauge").innerHTML = [
    [car.power, "Mã lực", "HP"],
    [car.accel, "0–100 km/h", "giây"],
    [car.topSpeed, "Tốc độ tối đa", "km/h"],
    [car.torque, "Mô-men xoắn", "Nm"],
  ]
    .map(
      ([v, label, unit]) => `
      <div class="gauge">
        <div class="gauge-value"><span data-count-to="${v}">0</span><small>${unit}</small></div>
        <div class="gauge-label">${label}</div>
      </div>`
    )
    .join("");
  initGaugeCount();

  // related cars
  const related = CARS.filter((c) => c.id !== car.id && c.category === car.category)
    .concat(CARS.filter((c) => c.id !== car.id && c.category !== car.category))
    .slice(0, 3);
  renderCarList("#related-cars", related);
}

/* ---------------- Booking form ---------------- */
function initBookingForm() {
  const form = qs("#booking-form");
  if (!form) return;

  const select = qs("#booking-car");
  select.innerHTML =
    `<option value="">Chọn dòng xe quan tâm</option>` +
    CARS.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");

  const params = new URLSearchParams(location.search);
  const preselect = params.get("car");
  if (preselect && getCarById(preselect)) {
    select.value = preselect;
    setTimeout(() => {
      qs("#dat-lai-thu")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const success = qs("#booking-success");
    success.classList.add("show");
    form.reset();
    success.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}

/* ---------------- Footer year ---------------- */
function initFooterYear() {
  const el = qs("#year");
  if (el) el.textContent = new Date().getFullYear();
}

/* ---------------- Init ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initFooterYear();
  initHomeFeatured();
  initCarsPage();
  initDetailPage();
  initBookingForm();
  initReveal();
  initGaugeCount();
});
