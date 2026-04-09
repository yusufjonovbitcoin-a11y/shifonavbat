type QuestionForScreening = {
  id: number;
  block: string;
  type: "binary" | "scale" | "text" | "number" | "select" | "multiInput" | "bodyMap" | "date";
  question: string;
  fields?: { name: string; placeholder: string; type?: string }[];
  binaryIjobiyOption?: "yoq" | "ha";
};

export type ScreeningPolarity = "ijobiy" | "salbiy" | "neutral";

export interface ScreeningQA {
  block?: string;
  question: string;
  answer: string;
  polarity: ScreeningPolarity;
}

const areaLabels: Record<string, string> = {
  head: "Bosh",
  neck: "Bo'yin",
  jaw: "Jag'",
  chest: "Ko'krak qafasi",
  leftShoulder: "Chap elka",
  rightShoulder: "O'ng elka",
  leftArm: "Chap qo'l",
  rightArm: "O'ng qo'l",
  stomach: "Qorin",
  upperBack: "Orqa (kuraksohasi)",
};

function formatAnswer(q: QuestionForScreening, answer: unknown): string {
  if (answer === null || answer === undefined || answer === "") return "—";

  if (q.type === "bodyMap") {
    if (!Array.isArray(answer) || answer.length === 0) return "—";
    return (answer as string[]).map((a) => areaLabels[a] ?? a).join(", ");
  }

  if (q.type === "multiInput" && q.fields) {
    if (typeof answer !== "object" || answer === null) return "—";
    const o = answer as Record<string, string>;
    const parts = q.fields
      .map((f) => {
        const v = o[f.name];
        return v ? `${f.placeholder ?? f.name}: ${v}` : null;
      })
      .filter(Boolean);
    return parts.length ? parts.join("; ") : "—";
  }

  if (typeof answer === "object") return JSON.stringify(answer);
  return String(answer);
}

/** Skrining jadvali uchun savol-javoblar va ijobiy/salbiy ustunlari */
export function buildScreeningQa(
  questionList: QuestionForScreening[],
  answers: Record<number, unknown>
): ScreeningQA[] {
  const out: ScreeningQA[] = [];
  for (const q of questionList) {
    const a = answers[q.id];
    if (a === undefined || a === null || a === "") continue;

    let polarity: ScreeningPolarity = "neutral";

    if (q.type === "binary") {
      const isHa = a === "Ha";
      if (q.binaryIjobiyOption === "ha") polarity = isHa ? "ijobiy" : "salbiy";
      else polarity = isHa ? "salbiy" : "ijobiy";
    } else if (q.type === "bodyMap") {
      polarity = Array.isArray(a) && a.length > 0 ? "salbiy" : "ijobiy";
    } else if (q.type === "scale") {
      const n = Number(a);
      polarity = !Number.isNaN(n) && n >= 7 ? "salbiy" : "ijobiy";
    } else {
      polarity = "neutral";
    }

    out.push({
      block: q.block,
      question: q.question,
      answer: formatAnswer(q, a),
      polarity,
    });
  }
  return out;
}
