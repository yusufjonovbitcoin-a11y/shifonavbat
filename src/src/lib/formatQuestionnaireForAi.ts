/** Savol-javoblarni OpenAI uchun matn sifatida yig‘ish (Questionnaire bilan mos) */

export type QuestionForAi = {
  id: number;
  block: string;
  type: string;
  question: string;
  fields?: { name: string; placeholder: string; type?: string }[];
};

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

function formatAnswerForQuestion(q: QuestionForAi, answer: unknown): string {
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

  if (typeof answer === "object") {
    return JSON.stringify(answer);
  }

  return String(answer);
}

export function buildAnamnesisContext(
  questions: QuestionForAi[],
  answers: Record<number, unknown>
): string {
  const lines: string[] = [];
  for (const q of questions) {
    const a = answers[q.id];
    lines.push(
      `[${q.block}] Savol: ${q.question}\nJavob: ${formatAnswerForQuestion(q, a)}`
    );
  }
  return lines.join("\n\n");
}
