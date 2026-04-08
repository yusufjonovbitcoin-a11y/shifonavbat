/**
 * Юрак-қон томир скрининги — 50 савол.
 * Қизил байроқ: 6–10 саволлардан бири «Ҳа» → 103.
 * Хавф баҳоси: 1, 2, 24, 26, 34 — оддий модел (клиник SCORE2 эмас).
 */

const RED_FLAG_IDS = [6, 7, 8, 9, 10];

const BLOCKS = [
  { n: 1, title: "1-блок: Демография ва Скрининг (1–5)", range: [1, 5] },
  { n: 2, title: '2-блок: "Қизил байроқчалар" – Зудлик билан ёрдам керак! (6–12)', range: [6, 12] },
  { n: 3, title: "3-блок: Артериал қон босими (13–18)", range: [13, 18] },
  { n: 4, title: "4-блок: Юрак етишмовчилиги ва Нафас қисиши (19–25)", range: [19, 25] },
  { n: 5, title: "5-блок: Юрак ритми ва Стенокардия (26–32)", range: [26, 32] },
  { n: 6, title: "6-блок: Хавф омиллари ва Ирсият (33–40)", range: [33, 40] },
  { n: 7, title: "7-блок: Турмуш тарзи ва Психосоматика (41–50)", range: [41, 50] },
];

/** @type {{ id: number, text: string, type: string, options?: string[], min?: number, max?: number, placeholder?: string }[]} */
const QUESTIONS = [
  { id: 1, text: "Ёшингиз нечада?", type: "number", min: 1, max: 120, placeholder: "Масалан: 45" },
  { id: 2, text: "Жинсингиз?", type: "select", options: ["Эркак", "Аёл"] },
  { id: 3, text: "Вазнингиз ва бўйингиз? (BMI ҳисоблаш учун)", type: "bmi" },
  { id: 4, text: "Одатда тинч ҳолатда юрак уришингиз (пульс) бир дақиқада нечта?", type: "number", min: 30, max: 220, placeholder: "Зарб/дақ" },
  {
    id: 5,
    text: "Охирги марта қачон ЭКГ ёки УЗИ (ЭхоКГ) текширувидан ўтгансиз?",
    type: "text",
    placeholder: "Сана ёки қисқа изоҳ",
  },
  { id: 6, text: "Ҳозир кўкрак қафасида сиқувчи, оғирлик ёки куйдирувчи оғриқ борми?", type: "yesno" },
  { id: 7, text: "Оғриқ чап қўл, ияк, бўйин ёки икки курак орасига тарқаляптими?", type: "yesno" },
  { id: 8, text: "Оғриқ билан бирга кучли совуқ тер босиши кузатилдими?", type: "yesno" },
  { id: 9, text: "Тўсатдан пайдо бўлган кучли нафас қисиши борми?", type: "yesno" },
  { id: 10, text: "Охирги вақтларда тўсатдан ҳушингиздан кетиш ҳолатлари бўлдими?", type: "yesno" },
  { id: 11, text: "Оёқларингизда кескин пайдо бўлган кучли шиш ва оғриқ борми?", type: "yesno" },
  { id: 12, text: "Юрак уриши жуда тезлашиб (120+), бош айланиши билан кузатиляптими?", type: "yesno" },
  { id: 13, text: "Сизда гипертония (қон босими кўтарилиши) ташхиси борми?", type: "yesno" },
  { id: 14, text: "Одатдаги (ишчи) қон босимингиз неча?", type: "text", placeholder: "Масалан: 130/85" },
  { id: 15, text: "Қон босимингиз 140/90 дан тез-тез кўтарилиб турадими?", type: "yesno" },
  { id: 16, text: "Қон босими кўтарилганда бош айланиши ёки кўнгил айниши бўладими?", type: "yesno" },
  { id: 17, text: "Бошнинг орқа (энса) қисмида оғирлик ёки оғриқ сезасизми?", type: "yesno" },
  { id: 18, text: "Қон босимини туширувчи дориларни мунтазам ичасизми?", type: "yesno" },
  { id: 19, text: "Оддий юришда (масалан, 100–200 метр) нафас қисиши сезиладими?", type: "yesno" },
  { id: 20, text: "Зинадан 1–2 қават кўтарилганда тўхтаб дам олишга эҳтиёж сезасизми?", type: "yesno" },
  { id: 21, text: "Кечаси ётиб ухлаганда нафас қисишидан уйғониб кетасизми?", type: "yesno" },
  { id: 22, text: "Паст ёстиқда ётиш сизга ноқулайлик туғдирадими?", type: "yesno" },
  { id: 23, text: "Оёқ тўпиқлари соҳасида кечқурун шишлар пайдо бўладими?", type: "yesno" },
  { id: 24, text: "Тез чарчаш ва доимий ҳолсизлик сизни безовта қиладими?", type: "yesno" },
  { id: 25, text: "Қуруқ йўтал (айниқса кечаси ётишда) безовта қиладими?", type: "yesno" },
  { id: 26, text: 'Юрагингиз "ўйнаши", "кинаб қолиши" ёки "уриб кетиши"ни сезасизми?', type: "yesno" },
  { id: 27, text: "Юрак уриши бир текис эмаслигини (аритмия) ҳис қиласизми?", type: "yesno" },
  { id: 28, text: "Кўкракдаги оғриқ асосан жисмоний ҳаракат вақтида пайдо бўладими?", type: "yesno" },
  { id: 29, text: "Ҳаракатни тўхтатганингизда оғриқ 2–5 дақиқада ўтиб кетадими?", type: "yesno" },
  { id: 30, text: "Совуқ ҳавода юрганда кўкрак соҳасида ноқулайлик сезиладими?", type: "yesno" },
  { id: 31, text: "Оғриқ пайтида тил остига Нитроглицерин қўйсангиз таъсир қиладими?", type: "yesno" },
  { id: 32, text: "Кўкрак қафасидаги оғриқ елкага ёки ошқозон соҳасига урадими?", type: "yesno" },
  { id: 33, text: "Тамаки маҳсулотларини чекасизми? (Агар ташлаган бўлсангиз, қачон?)", type: "text", placeholder: "Ҳа/Йўқ ёки қачон ташлаган" },
  { id: 34, text: "Қандли диабет (сахар) касаллигингиз борми?", type: "yesno" },
  { id: 35, text: "Қондаги холестерин миқдори юқорилигини биласизми?", type: "yesno" },
  { id: 36, text: "Ота-онангиз ёки яқинларингизда эрта ёшда (55 ёшгача) инфаркт ёки инсульт бўлганми?", type: "yesno" },
  { id: 37, text: "Сизда буйрак касалликлари борми?", type: "yesno" },
  { id: 38, text: "Илгари инфаркт ёки инсульт ўтказганмисиз?", type: "yesno" },
  { id: 39, text: "Юрагингизда стент ёки шунт борми?", type: "yesno" },
  { id: 40, text: "Спиртли ичимликларни қай даражада истеъмол қиласиз?", type: "text", placeholder: "Қисқа изоҳ" },
  { id: 41, text: "Кунига ўртача неча соат ухлайсиз?", type: "number", min: 0, max: 24, placeholder: "Соат" },
  {
    id: 42,
    text: "Ишингиз ва ҳаётингизда стресс даражаси қандай? (1–10 балл)",
    type: "number",
    min: 1,
    max: 10,
    placeholder: "1–10",
  },
  { id: 43, text: "Охирги вақтларда сабабсиз хавотир ёки қўрқув ҳисси бўляптими?", type: "yesno" },
  { id: 44, text: "Овқатланишда тузни кўп истеъмол қиласизми?", type: "yesno" },
  { id: 45, text: "Ҳафтада неча марта жисмоний машқлар ёки фаол юриш билан шуғулланасиз?", type: "text", placeholder: "Масалан: 3" },
  { id: 46, text: "Охирги марта қачон умумий қон таҳлили топширгансиз?", type: "text", placeholder: "Сана" },
  { id: 47, text: "Доимий равишда ичадиган барча дорилар рўйхатини биласизми?", type: "text", placeholder: "Рўйхат ёки йўқ" },
  { id: 48, text: "Сизда аллергик реакциялар борми (айниқса дориларга)?", type: "yesno" },
  {
    id: 49,
    text: "Кўкрак қафасидаги оғриқ чуқур нафас олганда ёки танани бурганда ўзгарадими? (Мушак оғриғини ажратиш учун)",
    type: "yesno",
  },
  { id: 50, text: "Ҳаёт сифати: Ҳозирги соғлиғингиз сизни неча фоиз қониқтиради?", type: "number", min: 0, max: 100, placeholder: "0–100 %" },
];

const state = {
  answers: {},
  /** 0-based индекс: 0 … 49 */
  stepIndex: 0,
};

function getAnswer(id) {
  return state.answers[id];
}

function setAnswer(id, val) {
  state.answers[id] = val;
  updateRedFlag();
  updateProgress();
}

function isYes(val) {
  return val === "ha" || val === true || val === "Ҳа";
}

function redFlagActive() {
  return RED_FLAG_IDS.some((id) => isYes(getAnswer(id)));
}

function updateRedFlag() {
  const el = document.getElementById("emergency");
  if (!el) return;
  el.classList.toggle("visible", redFlagActive());
}

function answeredCount() {
  let n = 0;
  for (const q of QUESTIONS) {
    if (q.type === "bmi") {
      const b = getAnswer("bmi");
      if (b && b.w && b.h) n++;
    } else {
      const a = getAnswer(q.id);
      if (a !== undefined && a !== "" && !(Number.isNaN(a) && q.type === "number")) n++;
    }
  }
  return n;
}

function updateProgress() {
  const step = state.stepIndex + 1;
  const pct = Math.round((step / QUESTIONS.length) * 100);
  const fill = document.getElementById("progressFill");
  const label = document.getElementById("progressLabel");
  if (fill) fill.style.width = `${pct}%`;
  if (label) {
    const done = answeredCount();
    label.textContent = `Савол ${step} / ${QUESTIONS.length} · жавоблар: ${done}/${QUESTIONS.length} (${pct}%)`;
  }
}

function getBlockForQuestionId(id) {
  return BLOCKS.find((b) => id >= b.range[0] && id <= b.range[1]);
}

/** @param {number} idx QUESTIONS индекси */
function isStepValid(idx) {
  const q = QUESTIONS[idx];
  if (!q) return false;
  if (q.type === "bmi") {
    const b = getAnswer("bmi");
    if (!b || !b.w || !b.h) return false;
    const w = Number(b.w);
    const h = Number(b.h);
    return Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0;
  }
  const a = getAnswer(q.id);
  if (q.type === "yesno") return a === "ha" || a === "yoq";
  if (q.type === "number") {
    if (a === "" || a === undefined) return false;
    if (Number.isNaN(Number(a))) return false;
    return true;
  }
  if (q.type === "select") return a !== undefined && a !== "";
  if (q.type === "text") return String(a ?? "").trim().length > 0;
  return false;
}

/**
 * Оддий 10 йиллик ЮҚ хавф баҳоси (демо, клиник SCORE2 эмас).
 * 1-йош, 2-жинс, 24, 26, 34 — қатнашади.
 */
function estimateTenYearRiskPct() {
  const age = Number(getAnswer(1));
  const sex = getAnswer(2);
  const q24 = isYes(getAnswer(24));
  const q26 = isYes(getAnswer(26));
  const q34 = isYes(getAnswer(34));

  let base = 3;
  if (Number.isFinite(age)) {
    if (age >= 40) base += 4;
    if (age >= 50) base += 6;
    if (age >= 60) base += 10;
    if (age >= 70) base += 8;
  }
  if (sex === "Эркак") base += 4;
  if (q24) base += 7;
  if (q26) base += 5;
  if (q34) base += 14;

  return Math.min(95, Math.round(base));
}

function buildAnamnesisSummary() {
  const parts = [];
  const age = getAnswer(1);
  const sex = getAnswer(2);
  if (age) parts.push(`Ёш: ${age}.`);
  if (sex) parts.push(`Жинс: ${sex}.`);
  const bmi = getAnswer("bmi");
  if (bmi && bmi.w && bmi.h) {
    const v = (Number(bmi.w) / (Number(bmi.h) / 100) ** 2).toFixed(1);
    parts.push(`BMI тахминий: ${v}.`);
  }
  if (redFlagActive()) {
    parts.push("Қизил байроқ: 6–10 саволлардан бирида мусбат жавоб — зудлик билан тиббий ёрдам тавсия этилади.");
  }
  if (isYes(getAnswer(34))) parts.push("Қандли диабет ҳақида мусбат жавоб.");
  if (isYes(getAnswer(13))) parts.push("Гипертония ташхиси қайд этилган.");
  return parts.join(" ");
}

function formatAnswerForExport(q) {
  if (q.type === "bmi") {
    const b = getAnswer("bmi") || {};
    const bmi =
      b.w && b.h ? (Number(b.w) / (Number(b.h) / 100) ** 2).toFixed(1) : "—";
    return `вазн ${b.w || "—"} кг, бўй ${b.h || "—"} см, BMI ${bmi}`;
  }
  const a = getAnswer(q.id);
  if (a === "ha") return "Ҳа";
  if (a === "yoq") return "Йўқ";
  if (a === undefined || a === "") return "—";
  return String(a);
}

function collectAllForPdf() {
  const lines = [];
  for (const q of QUESTIONS) {
    lines.push(`${q.id}. ${q.text}\n   Жавоб: ${formatAnswerForExport(q)}`);
  }
  return lines.join("\n\n");
}

function showResult() {
  const risk = estimateTenYearRiskPct();
  const summary = buildAnamnesisSummary();
  const panel = document.getElementById("resultPanel");
  const riskEl = document.getElementById("riskValue");
  const sumEl = document.getElementById("summaryText");
  if (riskEl) riskEl.textContent = `${risk} %`;
  if (sumEl) sumEl.textContent = summary || "Маълумот йетарли эмас.";
  if (panel) panel.classList.add("visible");
  panel?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function downloadPdf() {
  if (typeof html2pdf === "undefined") {
    alert("PDF кутубхонаси юкланмаган. Саҳифани янгиланг.");
    return;
  }
  const risk = estimateTenYearRiskPct();
  const summary = escapeHtml(buildAnamnesisSummary() || "—");
  const body = escapeHtml(collectAllForPdf());

  const el = document.createElement("div");
  el.style.cssText =
    "padding:40px;font-size:11pt;font-family:'DM Sans',sans-serif;color:#111;max-width:640px;line-height:1.45;";
  el.innerHTML = `
    <h1 style="font-size:18pt;margin:0 0 8px;">Юрак-қон томир скрининг — ҳисобот</h1>
    <h2 style="font-size:13pt;margin:20px 0 8px;">1. Беморнинг асосий хавфи (10 йил, оддий модел)</h2>
    <p style="margin:0 0 16px;font-size:14pt;font-weight:700;">${risk} %</p>
    <h2 style="font-size:13pt;margin:16px 0 8px;">2. Анамнез хулосаси</h2>
    <p style="margin:0 0 16px;">${summary}</p>
    <h2 style="font-size:13pt;margin:16px 0 8px;">3. Барча саволлар ва жавоблар</h2>
    <pre style="white-space:pre-wrap;font-size:9pt;font-family:inherit;margin:0;">${body}</pre>
  `;
  el.style.position = "fixed";
  el.style.left = "-9999px";
  el.style.top = "0";
  document.body.appendChild(el);

  const opt = {
    margin: 12,
    filename: "skrining-hisobot.pdf",
    image: { type: "jpeg", quality: 0.96 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["css", "legacy"] },
  };

  html2pdf()
    .set(opt)
    .from(el)
    .save()
    .then(() => el.remove())
    .catch(() => {
      el.remove();
      alert("PDF яратишда хато. Қайта уриниб кўринг.");
    });
}

function renderYesNo(id) {
  const v = getAnswer(id);
  return `
    <div class="yesno" data-q="${id}">
      <label><input type="radio" name="q${id}" value="ha" ${v === "ha" ? "checked" : ""} /> Ҳа</label>
      <label><input type="radio" name="q${id}" value="yoq" ${v === "yoq" ? "checked" : ""} /> Йўқ</label>
    </div>
  `;
}

function renderQuestion(q) {
  const num = `<div class="q-num">Савол ${q.id}</div>`;
  const text = `<div class="q-text">${escapeHtml(q.text)}</div>`;

  if (q.type === "yesno") {
    return `<div class="q" data-id="${q.id}">${num}${text}${renderYesNo(q.id)}</div>`;
  }
  if (q.type === "number") {
    const val = getAnswer(q.id) ?? "";
    return `<div class="q" data-id="${q.id}">${num}${text}
      <input type="number" class="inline-num" min="${q.min ?? ""}" max="${q.max ?? ""}" placeholder="${q.placeholder || ""}" value="${val}" data-q="${q.id}" />
    </div>`;
  }
  if (q.type === "select") {
    const val = getAnswer(q.id) ?? "";
    const opts = (q.options || [])
      .map((o) => `<option value="${escapeHtml(o)}" ${val === o ? "selected" : ""}>${escapeHtml(o)}</option>`)
      .join("");
    return `<div class="q" data-id="${q.id}">${num}${text}
      <select data-q="${q.id}"><option value="">— танланг —</option>${opts}</select>
    </div>`;
  }
  if (q.type === "text") {
    const val = getAnswer(q.id) ?? "";
    return `<div class="q" data-id="${q.id}">${num}${text}
      <textarea data-q="${q.id}" placeholder="${escapeHtml(q.placeholder || "")}">${escapeHtml(String(val))}</textarea>
    </div>`;
  }
  if (q.type === "bmi") {
    const b = getAnswer("bmi") || {};
    const w = b.w ?? "";
    const h = b.h ?? "";
    let bmiText = "";
    if (w && h) {
      const bmi = (Number(w) / (Number(h) / 100) ** 2).toFixed(1);
      bmiText = `<div class="bmi-out">BMI: ${bmi}</div>`;
    }
    return `<div class="q" data-id="bmi">${num}${text}
      <div class="row">
        <input type="number" class="inline-num" placeholder="Вазн (кг)" data-bmi-w value="${w}" min="20" max="300" />
        <input type="number" class="inline-num" placeholder="Бўй (см)" data-bmi-h value="${h}" min="80" max="250" />
      </div>${bmiText}
    </div>`;
  }
  return "";
}

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function renderCurrentStep() {
  const root = document.getElementById("questionnaire");
  if (!root) return;

  const idx = state.stepIndex;
  const q = QUESTIONS[idx];
  if (!q) return;

  const block = getBlockForQuestionId(q.id);
  const blockTitle = block ? escapeHtml(block.title) : "";
  const isLast = idx >= QUESTIONS.length - 1;

  const qHtml = renderQuestion(q);
  const hint = `<p class="wizard-hint">Жавоб беринг, кейин «${isLast ? "Натижани кўриш" : "Кейинги"}» ни босинг.</p>`;

  root.innerHTML = `
    <div class="step-shell">
      <div class="step-block-label">${blockTitle}</div>
      <div class="step-body">${qHtml}</div>
    </div>
    ${hint}
    <nav class="wizard-nav" aria-label="Саволлар бўйича">
      <button type="button" class="btn btn-secondary btn-back" id="btnBack" ${idx === 0 ? "disabled" : ""}>Ортга</button>
      <button type="button" class="btn btn-primary" id="btnNext">${isLast ? "Натижани кўриш" : "Кейинги"}</button>
    </nav>
  `;

  document.getElementById("btnBack")?.addEventListener("click", () => {
    if (state.stepIndex > 0) {
      state.stepIndex -= 1;
      renderCurrentStep();
      updateProgress();
      updateRedFlag();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  document.getElementById("btnNext")?.addEventListener("click", () => {
    if (!isStepValid(state.stepIndex)) {
      alert("Илтимос, жорий саволга тўлиқ жавоб беринг.");
      return;
    }
    if (isLast) {
      showResult();
      return;
    }
    state.stepIndex += 1;
    renderCurrentStep();
    updateProgress();
    updateRedFlag();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const firstFocus =
    root.querySelector('input[type="number"]') || root.querySelector("select") || root.querySelector("textarea");
  firstFocus?.focus?.();
}

function mount() {
  const root = document.getElementById("questionnaire");
  if (!root) return;

  root.addEventListener("change", (e) => {
    const t = e.target;
    if (t.matches('input[type="radio"]') && t.closest(".yesno")) {
      const wrap = t.closest(".yesno");
      const id = Number(wrap.dataset.q);
      setAnswer(id, t.value);
    }
    if (t.matches("select[data-q]")) {
      setAnswer(Number(t.dataset.q), t.value);
    }
    if (t.matches("input[data-q]") && t.type === "number") {
      setAnswer(Number(t.dataset.q), t.value === "" ? "" : Number(t.value));
    }
    if (t.matches("textarea[data-q]")) {
      setAnswer(Number(t.dataset.q), t.value);
    }
    if (t.matches("[data-bmi-w]") || t.matches("[data-bmi-h]")) {
      const row = t.closest(".q");
      const wIn = row?.querySelector("[data-bmi-w]");
      const hIn = row?.querySelector("[data-bmi-h]");
      const w = wIn?.value;
      const h = hIn?.value;
      state.answers.bmi = { w, h };
      updateRedFlag();
      updateProgress();
      const bmiOut = row?.querySelector(".bmi-out");
      if (bmiOut && w && h) {
        const bmi = (Number(w) / (Number(h) / 100) ** 2).toFixed(1);
        bmiOut.textContent = `BMI: ${bmi}`;
      } else if (bmiOut) bmiOut.textContent = "";
    }
  });

  root.addEventListener("input", (e) => {
    const t = e.target;
    if (t.matches("input[data-q]") && t.type === "number") {
      setAnswer(Number(t.dataset.q), t.value === "" ? "" : Number(t.value));
    }
    if (t.matches("textarea[data-q]")) {
      setAnswer(Number(t.dataset.q), t.value);
    }
  });

  renderCurrentStep();
  updateProgress();
  updateRedFlag();

  document.getElementById("btnPdf")?.addEventListener("click", downloadPdf);
}

document.addEventListener("DOMContentLoaded", mount);
