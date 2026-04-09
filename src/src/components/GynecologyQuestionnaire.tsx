import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle, ClipboardPlus, Loader2, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router";
import {
  GYNECOLOGY_QUESTIONS as questions,
  GYNECOLOGY_TOTAL as TOTAL,
} from "../data/gynecologyQuestionnaire";
import { buildAnamnesisContext } from "../lib/formatQuestionnaireForAi";
import { buildScreeningQa } from "../lib/screeningFromAnswers";
import { apiUrl } from "../lib/api";

function isEmpty(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") return v.trim() === "";
  if (typeof v === "object") {
    return Object.values(v as Record<string, unknown>).every((x) => isEmpty(x));
  }
  return false;
}

export function GynecologyQuestionnaire() {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, unknown>>({});
  const [currentAnswer, setCurrentAnswer] = useState<unknown>(null);
  const [completed, setCompleted] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAttempted, setAiAttempted] = useState(false);
  const screeningSubmitDone = useRef(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = useMemo(
    () => ((currentQuestionIndex + 1) / TOTAL) * 100,
    [currentQuestionIndex]
  );

  const canProceed = currentQuestion.optional ? true : !isEmpty(currentAnswer);

  const handleNext = useCallback(() => {
    if (!canProceed) return;
    const nextAnswers = { ...answers, [currentQuestion.id]: currentAnswer };
    setAnswers(nextAnswers);

    if (currentQuestionIndex < TOTAL - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      setCurrentAnswer(nextAnswers[questions[nextIdx].id] ?? null);
    } else {
      setAiLoading(true);
      setCompleted(true);
    }
  }, [canProceed, answers, currentQuestion.id, currentAnswer, currentQuestionIndex]);

  const handlePrevious = () => {
    if (currentQuestionIndex <= 0) return;
    const prevIdx = currentQuestionIndex - 1;
    setCurrentQuestionIndex(prevIdx);
    setCurrentAnswer(answers[questions[prevIdx].id] ?? null);
  };

  const completionSnapshot = useMemo(() => {
    if (!completed) return null;
    const redFlags: string[] = [];
    if (answers[14] === "Ha") redFlags.push("Sikl orasida qon ketish");
    if (answers[29] === "Ha") redFlags.push("Jinsiy aloqadan keyin qon ketish");
    if (answers[23] === "Ha" && answers[32] === "Ha") {
      redFlags.push("Qorin og'rig'i + isitma/holsizlik");
    }
    if (answers[33] === "Ha") redFlags.push("Qichishish yoki achishish");

    let score = 0;
    if (answers[14] === "Ha") score += 3;
    if (answers[29] === "Ha") score += 3;
    if (answers[23] === "Ha") score += 1;
    if (answers[32] === "Ha") score += 2;
    if (answers[37] === "Ha") score += 2;
    if (answers[35] === "Hech qachon" || answers[35] === "3 yildan ko'p") score += 1;
    const riskScore = Math.min(score, 10);
    const riskLevel: "low" | "medium" | "high" =
      riskScore >= 7 ? "high" : riskScore >= 4 ? "medium" : "low";
    const riskLabel = riskLevel === "high" ? "Yuqori" : riskLevel === "medium" ? "O'rtacha" : "Past";

    const bmiData = answers[2] as { weight?: string; height?: string } | undefined;
    const weight = Number(bmiData?.weight);
    const height = Number(bmiData?.height);
    const bmi =
      Number.isFinite(weight) && Number.isFinite(height) && height > 0
        ? (weight / Math.pow(height / 100, 2)).toFixed(1)
        : null;
    const pap = String(answers[35] ?? "—");
    const fallbackSummary =
      `${answers[1] || "—"} yoshli ayol bemor. ` +
      `${bmi ? `BMI: ${bmi}. ` : ""}` +
      `Menstrual sikl: ${String(answers[10] ?? "—")}, og'riq: ${String(answers[12] ?? "—")}, qon ketish: ${String(answers[13] ?? "—")}. ` +
      `Pap-test holati: ${pap}. ` +
      `${redFlags.length > 0 ? `Qizil bayroqlar: ${redFlags.join(", ")}. ` : ""}` +
      `Ginekologik xavf darajasi: ${riskScore}/10 (${riskLabel.toLowerCase()}).`;

    return {
      riskScore,
      riskLevel,
      riskLabel,
      redFlags,
      redFlagDetected: redFlags.length > 0,
      bmi,
      fallbackSummary,
    };
  }, [completed, answers]);

  useEffect(() => {
    if (!completionSnapshot) {
      setAiLoading(false);
      setAiSummary(null);
      setAiAttempted(false);
      return;
    }
    let cancelled = false;
    setAiAttempted(false);
    setAiLoading(true);
    setAiSummary(null);
    const ctx = buildAnamnesisContext(questions, answers);
    fetch(apiUrl("/api/ai/anamnesis"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        context: `Yo'nalish: Ginekologiya.\n\n${ctx}`,
        score2: completionSnapshot.riskScore,
        riskLevel: completionSnapshot.riskLevel,
        riskLabel: `Ginekologik ${completionSnapshot.riskLabel}`,
        redFlags: completionSnapshot.redFlags,
        conditions: [],
        bmi: completionSnapshot.bmi,
        redFlagDetected: completionSnapshot.redFlagDetected,
      }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Xato");
        if (!cancelled) setAiSummary(data.summary);
      })
      .catch(() => {
        if (!cancelled) setAiSummary(null);
      })
      .finally(() => {
        if (!cancelled) {
          setAiLoading(false);
          setAiAttempted(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [completionSnapshot, answers]);

  useEffect(() => {
    if (!completionSnapshot || !aiAttempted || aiLoading) return;
    if (screeningSubmitDone.current) return;
    screeningSubmitDone.current = true;
    const preparedAnswers = { ...answers, 2: "Ayol" };
    const screeningQa = buildScreeningQa(questions, answers);
    fetch(apiUrl("/api/screenings"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientName: null,
        answers: preparedAnswers,
        score2: completionSnapshot.riskScore,
        riskLevel: completionSnapshot.riskLevel,
        riskLabel: completionSnapshot.riskLabel,
        summary: aiSummary ?? completionSnapshot.fallbackSummary,
        redFlags: completionSnapshot.redFlags,
        conditions: [],
        bmi: completionSnapshot.bmi,
        redFlagDetected: completionSnapshot.redFlagDetected,
        screeningQa,
      }),
    }).catch(() => {
      screeningSubmitDone.current = false;
    });
  }, [completionSnapshot, aiAttempted, aiLoading, answers, aiSummary]);

  useEffect(() => {
    if (!completed || !aiAttempted || aiLoading) return;
    const t = setTimeout(() => navigate("/dashboard"), 600);
    return () => clearTimeout(t);
  }, [completed, aiAttempted, aiLoading, navigate]);

  if (completed) {
    if (!completionSnapshot) return null;
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-blue-100">
          {completionSnapshot.redFlagDetected && (
            <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-6 mb-6 shadow-xl">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-12 h-12 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-2xl text-red-900 mb-2">⚠️ Tezkor ko'rik zarur</h3>
                  <p className="text-red-700">
                    Xavfli belgilar aniqlandi. Imkon qadar tezroq ginekolog ko'rigiga murojaat qiling.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl text-gray-900 mb-4">Ginekologik skrining tugallandi</h2>
            <p className="text-lg text-gray-600">Ma'lumotlar AI yordamida tahlil qilindi</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 mb-6 border border-blue-100">
            <h3 className="text-xl text-gray-900 mb-4">Ginekologik xavf baholash</h3>
            <div className="grid sm:grid-cols-3 gap-6 mb-4">
              <div>
                <div className="text-sm text-gray-600 mb-2">Xavf darajasi</div>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm border ${
                    completionSnapshot.riskLevel === "low"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : completionSnapshot.riskLevel === "medium"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                        : "bg-red-100 text-red-700 border-red-200"
                  }`}
                >
                  {completionSnapshot.riskLabel}
                </span>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-2">Xavf balli</div>
                <div className="text-3xl text-blue-600">{completionSnapshot.riskScore}/10</div>
              </div>
              {completionSnapshot.bmi && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">BMI</div>
                  <div className="text-3xl text-purple-600">{completionSnapshot.bmi}</div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
            <h3 className="text-lg text-gray-900 mb-3">AI Anamnez xulosasi</h3>
            {aiLoading ? (
              <div className="flex items-center gap-3 text-gray-600 py-2">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600 shrink-0" aria-hidden />
                <span>AI tahlili yuklanmoqda...</span>
              </div>
            ) : (
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {aiSummary ?? completionSnapshot.fallbackSummary}
              </p>
            )}
          </div>
          <div className="text-center text-sm text-gray-500">
            Dashboardga avtomatik yo'naltirilmoqda...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <header className="bg-white/90 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Orqaga
          </Link>
        </div>
      </header>

      <div className="bg-white/90 backdrop-blur-md border-b border-emerald-100 sticky top-[57px] z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between text-sm mb-2">
            <div>
              <span className="text-gray-700">Savol {currentQuestionIndex + 1} / {TOTAL}</span>
              <span className="text-emerald-600 ml-2">• {currentQuestion.block}</span>
            </div>
            <span className="text-emerald-600">{Math.round(progress)}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-emerald-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <ClipboardPlus className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-sm text-emerald-600">{currentQuestion.block}</div>
              <div className="text-gray-900">Savol #{currentQuestion.id}</div>
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl text-gray-900 leading-relaxed mb-8">
            {currentQuestion.question}
          </h2>

          {currentQuestion.type === "binary" && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              {(["Yo'q", "Ha"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCurrentAnswer(option)}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    currentAnswer === option
                      ? "border-emerald-500 bg-emerald-50 shadow-lg"
                      : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/60"
                  }`}
                >
                  <span className="text-xl text-gray-900">{option}</span>
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === "text" && (
            <input
              type="text"
              value={String(currentAnswer ?? "")}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder={currentQuestion.placeholder ?? "Javobingizni kiriting"}
              className="w-full p-5 text-lg border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none transition-all mb-8"
            />
          )}

          {(currentQuestion.type === "number" || currentQuestion.type === "date") && (
            <input
              type={currentQuestion.type === "date" ? "date" : "number"}
              value={String(currentAnswer ?? "")}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder={currentQuestion.placeholder}
              className="w-full p-5 text-lg border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none transition-all mb-8"
            />
          )}

          {currentQuestion.type === "select" && currentQuestion.options && (
            <div className="grid gap-3 mb-8">
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCurrentAnswer(option)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all ${
                    currentAnswer === option
                      ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-blue-50 shadow-lg"
                      : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                  }`}
                >
                  <span className="text-lg text-gray-900">{option}</span>
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === "multiInput" && currentQuestion.fields && (
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {currentQuestion.fields.map((field) => (
                <input
                  key={field.name}
                  type={field.type ?? "text"}
                  value={String((currentAnswer as Record<string, string> | null)?.[field.name] ?? "")}
                  onChange={(e) =>
                    setCurrentAnswer({
                      ...((currentAnswer as Record<string, string> | null) ?? {}),
                      [field.name]: e.target.value,
                    })
                  }
                  placeholder={field.placeholder}
                  className="p-5 text-lg border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none transition-all"
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="group inline-flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all rounded-xl hover:bg-emerald-50"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Orqaga
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed}
              className="group inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-xl shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestionIndex === TOTAL - 1 ? "Tugatish" : "Keyingi"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
