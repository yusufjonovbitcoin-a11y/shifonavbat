/**
 * Savollar endi `src/src/data/cardioQuestionnaire.ts` da.
 * O'zgartirish uchun shu faylni tahrirlang — avtomatik chiqarish shart emas.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const qPath = path.join(root, "src/src/components/Questionnaire.tsx");
const dataPath = path.join(root, "src/src/data/cardioQuestionnaire.ts");
const q = fs.readFileSync(qPath, "utf8");
if (!q.includes("cardioQuestionnaire")) {
  console.warn("Questionnaire.tsx import yo'q — qo'lda tekshiring.");
}
if (!fs.existsSync(dataPath)) {
  console.error("Yo'q:", dataPath);
  process.exit(1);
}
console.log("Savollar manbai:", dataPath);
process.exit(0);
