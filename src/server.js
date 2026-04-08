import "dotenv/config";
import express from "express";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { mkdir, readFile, writeFile } from "fs/promises";
import { randomBytes } from "crypto";
import OpenAI from "openai";
import { createBot } from "./bot.js";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const openaiClient = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

const ANAMNESIS_SYSTEM = `Sen ShifokorLDA tizimining tibbiy AI yordamchisisisan. Ixtisosliging: kardiovaskulyar skrining anamnezi tahlili va profilaktik maslahat.

═══════════════════════════════
ROL VA VAKOLAT CHEGARASI
═══════════════════════════════
• Siz faqat anamnez xulosachisisiz — yakuniy klinik tashxis qo'yish vakolatingiz YO'Q.
• Barcha xulosa va tavsiyalar shifokor tasdig'iga muhtoj ekanligini doim ta'kidlang.
• Dori tayinlamang, dozalar ko'rsatmang, diagnostik xulosani "tashxis" deb atamang.
• Shoshilinch holatlarda (qizil bayroqlar aniqlangan bo'lsa) darhol 103 yoki shifokorga murojaat qilishni birinchi o'rinda tavsiya eting.

═══════════════════════════════
TAHLIL STRUKTURASI (QUYIDAGI TARTIBDA YOZING)
═══════════════════════════════

1. **UMUMIY TAVSIF**
   – Bemorning demografik ma'lumotlari, asosiy shikoyatlar va aniqlangan xavf omillarini qisqacha jamlang.
   – BMI bo'lsa, uning tibbiy ahamiyatini izohlang (Normaga muvofiq / Ortiqcha vazn / Semizlik I–III).

2. **KARDIOVASKULYAR XAVF BAHOLASH**
   – SCORE2 qiymatini talqin qiling: past (<5%), o'rta (5–10%), yuqori (>10%) va bu bemorning yoshiga mos keladimi.
   – Aniqlangan xavf omillarini (chekish, diabet, gipertoniya, irsiyat, xolesterin va boshqalar) sanab, har birining kardiovaskulyar xavfga qo'shgan og'irligini izohlang.

3. **QIZIL BAYROQCHALAR SHARHI**  ← faqat aniqlangan bo'lsa
   – Har bir qizil bayroqni alohida ko'rsating va uning klinik ahamiyatini tushuntiring.
   – Shoshilinch holat belgilari bo'lsa, ushbu bo'limni BIRINCHI joyga ko'chiring va katta harfda "⚠️ TEZKOR TIBBIY YORDAM ZARUR" deb yozing.

4. **SIMPTOMLAR TAHLILI**
   – Bemorning bildirilgan simptomlarini (nafas qisishi, ko'krak og'rig'i, shish, aritmiya va boshqalar) kardiovaskulyar patologiyalar bilan bog'lang.
   – Simptomlar o'rtasidagi klinik aloqalarni izohlang (masalan: "kechasi nafas qisishi + oyoq shishi → yurak yetishmovchiligi ehtimoli").

5. **TAVSIYALAR (PRIORITET BO'YICHA)**
   – 🔴 Shoshilinch: darhol amalga oshirish lozim bo'lgan harakatlar
   – 🟡 Muhim: 1–4 hafta ichida rejalashtirilgan tekshiruvlar
   – 🟢 Profilaktik: turmush tarzi o'zgarishlari, muntazam monitoring

6. **ZARUR TEKSHIRUVLAR TAVSIYASI**
   – Anamnez asosida qaysi instrumental va laboratoriya tekshiruvlari o'tkazilishi maqsadga muvofiq ekanligini ko'rsating (EKG, ExoKG, lipid spektri, glyukoza, qon bosimi monitoringi va boshqalar).

═══════════════════════════════
TIL VA FORMAT QOIDALARI
═══════════════════════════════
• Til: O'zbek (lotin yozuvi). Tibbiy terminlarni o'zbek tilida izohlang.
• Markdown ishlatishingiz mumkin (sarlavhalar, ro'yxatlar, qalin matn).
• Har bir bo'lim sarlavhasi qalin (**) bo'lsin.
• Haddan tashqari texnik jargondan saqlaning — xulosa bemorga ham tushunarli bo'lishi lozim.
• Umumiy hajm: 250–500 so'z (ortiqcha emas, kamaytirilmagan ma'lumot).
• Oxirida hamisha: "Bu xulosa tibbiy maslahat emas. Iltimos, shifokor ko'rigidan o'ting." degan eslatmani qo'shing.`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const PUBLIC_URL = process.env.PUBLIC_URL;
const WEBHOOK_PATH = process.env.WEBHOOK_PATH || "/telegram-webhook";
const CHECKIN_PUBLIC_URL = (process.env.CHECKIN_PUBLIC_URL || "https://shifonavbat.vercel.app").replace(/\/$/, "");
const STORE_DIR = join(__dirname, "..", "data");
const STORE_FILE = join(STORE_DIR, "checkins.json");
const SCREENINGS_FILE = join(STORE_DIR, "screenings.json");

const DOCTOR_LOGIN = String(process.env.DOCTOR_LOGIN ?? "").trim();
const DOCTOR_PASSWORD = String(process.env.DOCTOR_PASSWORD ?? "").trim();
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

/** @type {Map<string, number>} token -> muddot tugash vaqti (timestamp) */
const doctorSessions = new Map();

let screenings = [];

/** Telegram ixtiyoriy: Railwayda faqat API + veb uchun BOT_TOKEN bo‘lmasa ham ishga tushadi */
const bot = BOT_TOKEN ? createBot(BOT_TOKEN) : null;
if (!bot) {
  console.warn(
    "BOT_TOKEN yo'q — Telegram bot o'chirilgan. ShifokorLDA API va statik veb ishlaydi. Bot uchun BOT_TOKEN qo'shing."
  );
}

const app = express();
let checkins = [];

const rootDir = join(__dirname, "..");
const buildDir = join(rootDir, "build");
const publicDir = join(rootDir, "public");
const staticRoot =
  existsSync(join(buildDir, "index.html")) ? buildDir : publicDir;

app.use(express.json());
app.use(express.static(staticRoot));

app.use((req, res, next) => {
  const origin = process.env.CORS_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

function requireDoctorAuth(req, res, next) {
  const h = req.headers.authorization;
  const token = typeof h === "string" && h.startsWith("Bearer ") ? h.slice(7).trim() : null;
  if (!token) {
    return res.status(401).json({ ok: false, error: "Kirish talab qilinadi." });
  }
  const exp = doctorSessions.get(token);
  if (!exp || exp < Date.now()) {
    doctorSessions.delete(token);
    return res.status(401).json({ ok: false, error: "Sessiya tugagan. Qayta kiring." });
  }
  next();
}

async function loadScreenings() {
  try {
    await mkdir(STORE_DIR, { recursive: true });
    const raw = await readFile(SCREENINGS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    screenings = Array.isArray(parsed) ? parsed : [];
  } catch {
    screenings = [];
  }
}

async function saveScreenings() {
  await mkdir(STORE_DIR, { recursive: true });
  await writeFile(SCREENINGS_FILE, JSON.stringify(screenings, null, 2), "utf8");
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    bot: bot ? "running" : "disabled",
    openai: Boolean(openaiClient),
    doctorAuthConfigured: Boolean(DOCTOR_LOGIN && DOCTOR_PASSWORD),
  });
});

app.post("/api/auth/login", (req, res) => {
  if (!DOCTOR_LOGIN || !DOCTOR_PASSWORD) {
    return res.status(503).json({
      ok: false,
      error:
        "Serverda DOCTOR_LOGIN va DOCTOR_PASSWORD o'rnatilmagan (Railway → Variables).",
    });
  }
  const login = String(req.body?.login ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "").trim();
  const expectedLogin = DOCTOR_LOGIN.toLowerCase();
  if (login !== expectedLogin || password !== DOCTOR_PASSWORD) {
    return res.status(401).json({ ok: false, error: "Login yoki parol noto'g'ri." });
  }
  const token = randomBytes(32).toString("hex");
  doctorSessions.set(token, Date.now() + SESSION_MS);
  return res.json({ ok: true, token });
});

app.post("/api/screenings", async (req, res) => {
  try {
    const body = req.body || {};
    const answers = body.answers;
    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ ok: false, error: "answers majburiy." });
    }
    const score2 = Number(body.score2);
    if (Number.isNaN(score2)) {
      return res.status(400).json({ ok: false, error: "score2 majburiy." });
    }
    const riskLevel = body.riskLevel;
    if (!["low", "medium", "high"].includes(riskLevel)) {
      return res.status(400).json({ ok: false, error: "riskLevel noto'g'ri." });
    }

    const id = `${Date.now()}-${randomBytes(4).toString("hex")}`;
    const record = {
      id,
      createdAt: new Date().toISOString(),
      patientName: body.patientName != null ? String(body.patientName).trim() || null : null,
      answers,
      score2,
      riskLevel,
      riskLabel: String(body.riskLabel || ""),
      summary: String(body.summary || ""),
      redFlags: Array.isArray(body.redFlags) ? body.redFlags.map(String) : [],
      conditions: Array.isArray(body.conditions) ? body.conditions.map(String) : [],
      bmi: body.bmi != null && body.bmi !== "" ? String(body.bmi) : null,
      redFlagDetected: Boolean(body.redFlagDetected),
      screeningQa: Array.isArray(body.screeningQa) ? body.screeningQa : [],
      acceptedAt: null,
    };

    screenings.push(record);
    await saveScreenings();
    return res.json({ ok: true, screening: record });
  } catch (err) {
    console.error("POST /api/screenings:", err);
    return res.status(500).json({ ok: false, error: "Saqlab bo'lmadi." });
  }
});

app.get("/api/screenings", requireDoctorAuth, (_req, res) => {
  const sorted = [...screenings].sort((a, b) =>
    String(b.createdAt).localeCompare(String(a.createdAt))
  );
  return res.json({ ok: true, screenings: sorted });
});

app.patch("/api/screenings/:id/accept", requireDoctorAuth, async (req, res) => {
  const id = norm(req.params.id);
  const row = screenings.find((x) => x.id === id);
  if (!row) return res.status(404).json({ ok: false, error: "Topilmadi." });
  if (row.acceptedAt) {
    return res.json({ ok: true, screening: row, alreadyAccepted: true });
  }
  row.acceptedAt = new Date().toISOString();
  await saveScreenings();
  return res.json({ ok: true, screening: row });
});

function buildAnalyticsPayload() {
  const total = screenings.length;
  const highRisk = screenings.filter((s) => s.riskLevel === "high").length;
  const avgScore2 =
    total > 0 ? screenings.reduce((a, s) => a + Number(s.score2 || 0), 0) / total : 0;

  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const thisMonth = screenings.filter((s) => String(s.createdAt).startsWith(ym)).length;

  const riskDistribution = [
    { name: "Past xavf", value: screenings.filter((s) => s.riskLevel === "low").length, color: "#10b981" },
    {
      name: "O'rtacha xavf",
      value: screenings.filter((s) => s.riskLevel === "medium").length,
      color: "#f59e0b",
    },
    { name: "Yuqori xavf", value: highRisk, color: "#ef4444" },
  ];

  const monthKeys = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthKeys.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString("uz-UZ", { month: "short" }),
    });
  }
  const monthlyTrend = monthKeys.map(({ key, label }) => {
    const inMonth = screenings.filter((s) => String(s.createdAt).startsWith(key));
    return {
      month: label,
      bemorlar: inMonth.length,
      yuqoriXavf: inMonth.filter((s) => s.riskLevel === "high").length,
      ortacha: inMonth.filter((s) => s.riskLevel === "medium").length,
    };
  });

  const condCount = new Map();
  for (const s of screenings) {
    for (const c of s.conditions || []) {
      const k = String(c).trim();
      if (!k) continue;
      condCount.set(k, (condCount.get(k) || 0) + 1);
    }
  }
  const conditionsTop = [...condCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([kasallik, soni]) => ({ kasallik, soni }));

  const ageBins = [
    { guruh: "20-30", min: 20, max: 30 },
    { guruh: "31-40", min: 31, max: 40 },
    { guruh: "41-50", min: 41, max: 50 },
    { guruh: "51-60", min: 51, max: 60 },
    { guruh: "61+", min: 61, max: 120 },
  ];
  const ageGroups = ageBins.map(({ guruh, min, max }) => ({
    guruh,
    soni: screenings.filter((s) => {
      const a = Number(s.answers?.[1]);
      return !Number.isNaN(a) && a >= min && a <= max;
    }).length,
  }));

  return {
    total,
    highRisk,
    avgScore2: Math.round(avgScore2 * 10) / 10,
    thisMonth,
    riskDistribution,
    monthlyTrend,
    conditionsTop,
    ageGroups,
  };
}

app.get("/api/analytics/summary", requireDoctorAuth, (_req, res) => {
  return res.json({ ok: true, ...buildAnalyticsPayload() });
});

app.post("/api/ai/anamnesis", async (req, res) => {
  if (!openaiClient) {
    return res.status(503).json({
      ok: false,
      error: "OPENAI_API_KEY .env da yo'q. Kalit qo'shib serverni qayta ishga tushiring.",
    });
  }

  try {
    const body = req.body || {};
    const context = String(body.context || "").trim();
    if (context.length < 30) {
      return res.status(400).json({
        ok: false,
        error: "Skrining matni yetarli emas.",
      });
    }
    if (context.length > 120_000) {
      return res.status(400).json({ ok: false, error: "Matn juda uzun." });
    }

    const score2 = body.score2;
    const riskLevel = String(body.riskLevel || "");
    const riskLabel = String(body.riskLabel || "");
    const bmi = body.bmi != null && body.bmi !== "" ? String(body.bmi) : null;
    const redFlagDetected = Boolean(body.redFlagDetected);
    const redFlags = Array.isArray(body.redFlags) ? body.redFlags.map(String) : [];
    const conditions = Array.isArray(body.conditions) ? body.conditions.map(String) : [];

    const userContent = [
      "══════════════════════════════════",
      "TIZIM TOMONIDAN HISOBLANGAN KO'RSATKICHLAR",
      "══════════════════════════════════",
      `• SCORE2 (10 yillik kardiovaskulyar xavf): ${score2}% — ${riskLabel} daraja (${riskLevel})`,
      bmi ? `• BMI indeksi: ${bmi}` : null,
      `• Shoshilinch holat belgilari (qizil bayroq): ${redFlagDetected ? "✅ HA — TEZKOR YORDAM ZARUR" : "Yo'q"}`,
      redFlags.length
        ? `• Aniqlangan qizil bayroqlar:\n${redFlags.map((f) => `  – ${f}`).join("\n")}`
        : null,
      conditions.length
        ? `• Mavjud surunkali kasalliklar:\n${conditions.map((c) => `  – ${c}`).join("\n")}`
        : null,
      "",
      "══════════════════════════════════",
      "BEMORNING TO'LIQ SKRINING SAVOL-JAVOBLARI",
      "══════════════════════════════════",
      context,
    ]
      .filter((line) => line !== null)
      .join("\n");

    const completion = await openaiClient.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: ANAMNESIS_SYSTEM },
        { role: "user", content: userContent },
      ],
      max_tokens: 2500,
      temperature: 0.25,
    });

    const summary = completion.choices[0]?.message?.content?.trim() || "";
    if (!summary) {
      return res.status(502).json({ ok: false, error: "AI bo'sh javob qaytardi." });
    }

    return res.json({ ok: true, summary });
  } catch (err) {
    console.error("OpenAI:", err?.message || err);
    return res.status(500).json({
      ok: false,
      error: "OpenAI API xatosi. Keyinroq urinib ko'ring.",
    });
  }
});

app.get("/check-in", (req, res) => {
  const qs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  return res.redirect(302, `${CHECKIN_PUBLIC_URL}${qs}`);
});

function norm(v) {
  return String(v || "").trim();
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function nextTicket(dept) {
  const key = todayKey();
  const count = checkins.filter((x) => x.dept === dept && x.day === key).length + 1;
  return `${dept.toUpperCase()}-${String(count).padStart(3, "0")}`;
}

async function loadStore() {
  try {
    await mkdir(STORE_DIR, { recursive: true });
    const raw = await readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    checkins = Array.isArray(parsed) ? parsed : [];
  } catch {
    checkins = [];
  }
}

async function saveStore() {
  await mkdir(STORE_DIR, { recursive: true });
  await writeFile(STORE_FILE, JSON.stringify(checkins, null, 2), "utf8");
}

app.post("/api/check-in", async (req, res) => {
  const dept = norm(req.body?.dept).toLowerCase();
  const doc = norm(req.body?.doc);
  const pid = norm(req.body?.pid);
  const sourceUrl = norm(req.body?.sourceUrl);

  if (!dept || !doc || !pid) {
    return res.status(400).json({
      ok: false,
      error: "dept, doc, pid majburiy.",
    });
  }

  const day = todayKey();
  const ticket = nextTicket(dept);
  const record = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    dept,
    doc,
    pid,
    day,
    ticket,
    checkedInAt: new Date().toISOString(),
    sourceUrl,
  };

  checkins.push(record);
  await saveStore();
  return res.json({ ok: true, checkin: record });
});

app.get("/api/check-in/:id", (req, res) => {
  const one = checkins.find((x) => x.id === req.params.id);
  if (!one) return res.status(404).json({ ok: false, error: "Topilmadi" });
  return res.json({ ok: true, checkin: one });
});

async function main() {
  await loadStore();
  await loadScreenings();

  if (bot) {
    try {
      try {
        await bot.telegram.setChatMenuButton({
          menu_button: { type: "commands" },
        });
      } catch (err) {
        console.warn("setChatMenuButton failed:", err?.message || err);
      }

      if (PUBLIC_URL) {
        const webhookUrl = `${PUBLIC_URL.replace(/\/$/, "")}${WEBHOOK_PATH}`;
        await bot.telegram.setWebhook(webhookUrl);
        app.use(bot.webhookCallback(WEBHOOK_PATH));
        console.log(`Webhook: ${webhookUrl}`);
      } else {
        bot.launch().catch((err) => console.warn("bot.launch:", err?.message || err));
        console.log("Bot long polling rejimida ishlamoqda.");
      }
    } catch (err) {
      console.warn("Telegram bot ishga tushmadi (API ishlayveradi):", err?.message || err);
    }
  }

  if (existsSync(join(buildDir, "index.html"))) {
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      if (req.path === WEBHOOK_PATH) return next();
      res.sendFile(join(buildDir, "index.html"));
    });
  }

  const host = process.env.HOST || "0.0.0.0";
  app.listen(PORT, host, () => {
    console.log(`API: http://${host}:${PORT}`);
    console.log(
      staticRoot === buildDir
        ? `Veb (build): ${PORT}-port`
        : `Veb: avval "npm run build", keyin qayta ishga tushiring`
    );
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

const shutdown = () => {
  if (bot) bot.stop("SIGINT");
  process.exit(0);
};
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
