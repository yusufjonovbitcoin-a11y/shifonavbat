import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle, ClipboardPlus } from "lucide-react";
import { Link, useNavigate } from "react-router";
import {
  GYNECOLOGY_QUESTIONS as questions,
  GYNECOLOGY_TOTAL as TOTAL,
} from "../data/gynecologyQuestionnaire";

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

  const currentQuestion = questions[currentQuestionIndex];
  const progress = useMemo(
    () => ((currentQuestionIndex + 1) / TOTAL) * 100,
    [currentQuestionIndex]
  );

  const canProceed = currentQuestion.optional ? true : !isEmpty(currentAnswer);

  const handleNext = () => {
    if (!canProceed) return;
    const nextAnswers = { ...answers, [currentQuestion.id]: currentAnswer };
    setAnswers(nextAnswers);

    if (currentQuestionIndex < TOTAL - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      setCurrentAnswer(nextAnswers[questions[nextIdx].id] ?? null);
    } else {
      navigate("/dashboard");
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex <= 0) return;
    const prevIdx = currentQuestionIndex - 1;
    setCurrentQuestionIndex(prevIdx);
    setCurrentAnswer(answers[questions[prevIdx].id] ?? null);
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4 flex items-center justify-center">
        <div className="w-full max-w-3xl bg-white rounded-3xl border border-emerald-100 shadow-2xl p-8 md:p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center mb-5">
            <CheckCircle className="w-9 h-9 text-emerald-600" />
          </div>
          <h1 className="text-3xl text-gray-900">Ginekologik anketa tugallandi</h1>
          <p className="text-gray-600 mt-3">
            Ma'lumotlar qabul qilindi. Shifokor ko'rigida ushbu javoblar asosida batafsil baholash
            o'tkaziladi.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200/80 hover:from-emerald-600 hover:to-emerald-700 transition-all"
            >
              Bosh sahifa
            </Link>
            <button
              type="button"
              onClick={() => {
                setCompleted(false);
                setCurrentQuestionIndex(0);
                setAnswers({});
                setCurrentAnswer(null);
              }}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Qayta to'ldirish
            </button>
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
