import "dotenv/config";
import express from "express";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { mkdir, readFile, writeFile } from "fs/promises";
import { createBot } from "./bot.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const PUBLIC_URL = process.env.PUBLIC_URL;
const WEBHOOK_PATH = process.env.WEBHOOK_PATH || "/telegram-webhook";
const CHECKIN_PUBLIC_URL = (process.env.CHECKIN_PUBLIC_URL || "https://shifonavbat.vercel.app").replace(/\/$/, "");
const STORE_DIR = join(__dirname, "..", "data");
const STORE_FILE = join(STORE_DIR, "checkins.json");

if (!BOT_TOKEN) {
  console.error("BOT_TOKEN .env faylida yo‘q. .env.example ni .env ga nusxalang.");
  process.exit(1);
}

const app = express();
const bot = createBot(BOT_TOKEN);
let checkins = [];

const rootDir = join(__dirname, "..");
const buildDir = join(rootDir, "build");
const publicDir = join(rootDir, "public");
const staticRoot =
  existsSync(join(buildDir, "index.html")) ? buildDir : publicDir;

app.use(express.json());
app.use(express.static(staticRoot));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, bot: "running" });
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

  // Telegram chat menu button: opens bot commands menu.
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
    bot.launch();
    console.log("Bot long polling rejimida ishlamoqda.");
  }

  if (existsSync(join(buildDir, "index.html"))) {
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      if (req.path === WEBHOOK_PATH) return next();
      res.sendFile(join(buildDir, "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`API + bot: http://localhost:${PORT}`);
    console.log(
      staticRoot === buildDir
        ? `Veb (build): http://localhost:${PORT}`
        : `Veb: avval "npm run build", keyin qayta ishga tushiring yoki "npm run dev" (5173)`
    );
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

const shutdown = () => {
  bot.stop("SIGINT");
  process.exit(0);
};
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
