import { useState, useCallback, useMemo } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Activity,
  AlertTriangle,
  Phone,
} from "lucide-react";
import { BodyMap } from "./BodyMap";

interface Question {
  id: number;
  block: string;
  type: "binary" | "scale" | "text" | "number" | "select" | "multiInput" | "bodyMap";
  question: string;
  options?: string[];
  placeholder?: string;
  fields?: { name: string; placeholder: string; type?: string }[];
}

// Questions defined outside component to avoid re-creation on each render
const questions: Question[] = [
  // Blok 1: Demografiya va Skrining (1-5)
  { id: 1,  block: "Demografiya va Skrining", type: "number",   question: "Yoshingiz nechada?", placeholder: "Yoshingizni kiriting" },
  { id: 2,  block: "Demografiya va Skrining", type: "select",   question: "Jinsingiz?", options: ["Erkak", "Ayol"] },
  { id: 3,  block: "Demografiya va Skrining", type: "multiInput", question: "Vazningiz va bo'yingiz? (BMI hisoblash uchun)",
    fields: [
      { name: "weight", placeholder: "Vazn (kg)",  type: "number" },
      { name: "height", placeholder: "Bo'y (sm)",  type: "number" },
    ],
  },
  { id: 4,  block: "Demografiya va Skrining", type: "number",   question: "Odatda tinch holatda yurak urishingiz (puls) bir daqiqada nechta?", placeholder: "Puls (urish/min)" },
  { id: 5,  block: "Demografiya va Skrining", type: "select",   question: "Oxirgi marta qachon EKG yoki UZI (ExoKG) tekshiruvidan o'tgansiz?",
    options: ["1 oy ichida", "3 oy ichida", "6 oy ichida", "1 yil ichida", "1 yildan ko'p", "Hech qachon"],
  },

  // Blok 2: "Qizil bayroqchalar" (6-12) - WITH BODY MAP
  { id: 6,  block: "Qizil bayroqchalar", type: "binary",  question: "Hozir ko'krak qafasida siquvchi, og'irlik yoki kuydiruvchi og'riq bormi?" },
  { id: 7,  block: "Qizil bayroqchalar", type: "bodyMap", question: "Og'riq tanangiznig qaysi qismlariga tarqaladi? (Bosib ko'rsating)" },
  { id: 8,  block: "Qizil bayroqchalar", type: "binary",  question: "Og'riq bilan birga kuchli sovuq ter bosishi kuzatildimi?" },
  { id: 9,  block: "Qizil bayroqchalar", type: "binary",  question: "To'satdan paydo bo'lgan kuchli nafas qisishi bormi?" },
  { id: 10, block: "Qizil bayroqchalar", type: "binary",  question: "Oxirgi vaqtlarda to'satdan hushingizdan ketish holatlari bo'ldimi?" },
  { id: 11, block: "Qizil bayroqchalar", type: "binary",  question: "Oyoqlaringizda keskin paydo bo'lgan kuchli shish va og'riq bormi?" },
  { id: 12, block: "Qizil bayroqchalar", type: "binary",  question: "Yurak urishi juda tezlashib (120+), bosh aylanishi bilan kuzatilyaptimi?" },

  // Blok 3: Arterial qon bosimi (13-18)
  { id: 13, block: "Arterial qon bosimi", type: "binary", question: "Sizda gipertoniya (qon bosimi ko'tarilishi) tashxisi bormi?" },
  { id: 14, block: "Arterial qon bosimi", type: "text",   question: "Odatdagi (ishchi) qon bosimingiz necha?", placeholder: "Mis: 120/80" },
  { id: 15, block: "Arterial qon bosimi", type: "binary", question: "Qon bosimingiz 140/90 dan tez-tez ko'tarilib turadimi?" },
  { id: 16, block: "Arterial qon bosimi", type: "binary", question: "Qon bosimi ko'tarilganda bosh aylanishi yoki ko'ngil ayniши bo'ladimi?" },
  { id: 17, block: "Arterial qon bosimi", type: "binary", question: "Boshning orqa (ensa) qismida og'irlik yoki og'riq sezasizmi?" },
  { id: 18, block: "Arterial qon bosimi", type: "binary", question: "Qon bosimini tushiruvchi dorilarni muntazam ichасizmi?" },

  // Blok 4: Yurak yetishmovchiligi va Nafas qisishi (19-25)
  { id: 19, block: "Yurak yetishmovchiligi", type: "binary", question: "Oddiy yurishda (masalan, 100-200 metr) nafas qisishi seziladimi?" },
  { id: 20, block: "Yurak yetishmovchiligi", type: "binary", question: "Zinadan 1-2 qavat ko'tarilganda to'xtab dam olishga ehtiyoj sezasizmi?" },
  { id: 21, block: "Yurak yetishmovchiligi", type: "binary", question: "Kechasi yotib uxlaganda nafas qisishidan uyg'onib ketasizmi?" },
  { id: 22, block: "Yurak yetishmovchiligi", type: "binary", question: "Past yostiqda yotish sizga noqulaylik tug'diradimi?" },
  { id: 23, block: "Yurak yetishmovchiligi", type: "binary", question: "Oyoq to'piqlari sohasida kechqurun shishlar paydo bo'ladimi?" },
  { id: 24, block: "Yurak yetishmovchiligi", type: "binary", question: "Tez charchash va doimiy holsizlik sizni bezovta qiladimi?" },
  { id: 25, block: "Yurak yetishmovchiligi", type: "binary", question: "Quruq yo'tal (ayniqsa kechasi yotishda) bezovta qiladimi?" },

  // Blok 5: Yurak ritmi va Stenokardiya (26-32)
  { id: 26, block: "Yurak ritmi va Stenokardiya", type: "binary",  question: "Yuragingiz \"o'ynashi\", \"kinab qolishi\" yoki \"urib ketishi\"ni sezasizmi?" },
  { id: 27, block: "Yurak ritmi va Stenokardiya", type: "binary",  question: "Yurak urishi bir tekis emasligini (aritmiya) his qilasizmi?" },
  { id: 28, block: "Yurak ritmi va Stenokardiya", type: "binary",  question: "Ko'krakdagi og'riq asosan jismoniy harakat vaqtida paydo bo'ladimi?" },
  { id: 29, block: "Yurak ritmi va Stenokardiya", type: "binary",  question: "Harakatni to'xtatganingizda og'riq 2-5 daqiqada o'tib ketadimi?" },
  { id: 30, block: "Yurak ritmi va Stenokardiya", type: "binary",  question: "Sovuq havoda yurganda ko'krak sohasida noqulaylik seziladimi?" },
  { id: 31, block: "Yurak ritmi va Stenokardiya", type: "binary",  question: "Og'riq paytida til ostiga Nitroglitserin qo'ysangiz ta'sir qiladimi?" },
  { id: 32, block: "Yurak ritmi va Stenokardiya", type: "bodyMap", question: "Ko'krak qafasidagi og'riq qaerga tarqaladi?" },

  // Blok 6: Xavf omillari va Irsiyat (33-40)
  { id: 33, block: "Xavf omillari va Irsiyat", type: "select", question: "Tamaki mahsulotlarini chekasizmi?",
    options: ["Yo'q, hech qachon chekmаganman", "Yo'q, tashladim (1 yildan ko'p)", "Yo'q, tashladim (1 yil ichida)", "Ha, chekaman"],
  },
  { id: 34, block: "Xavf omillari va Irsiyat", type: "binary", question: "Qandli diabet (shakar) kasalligingiz bormi?" },
  { id: 35, block: "Xavf omillari va Irsiyat", type: "binary", question: "Qondagi xolesterin miqdori yuqoriligini bilasizmi?" },
  { id: 36, block: "Xavf omillari va Irsiyat", type: "binary", question: "Ota-onangiz yoki yaqinlaringizda erta yoshda (55 yoshgacha) infarkt yoki insult bo'lganmi?" },
  { id: 37, block: "Xavf omillari va Irsiyat", type: "binary", question: "Sizda buyrak kasalliklari bormi?" },
  { id: 38, block: "Xavf omillari va Irsiyat", type: "binary", question: "Ilgari infarkt yoki insult o'tkazganmisiz?" },
  { id: 39, block: "Xavf omillari va Irsiyat", type: "binary", question: "Yuragingizda stent yoki shunt bormi?" },
  { id: 40, block: "Xavf omillari va Irsiyat", type: "select", question: "Spirtli ichimliklarni qay darajada iste'mol qilasiz?",
    options: ["Hech qachon", "Oyiga 1-2 marta", "Haftada 1-2 marta", "Deyarli har kuni"],
  },

  // Blok 7: Turmush tarzi va Psixosomatika (41-50)
  { id: 41, block: "Turmush tarzi va Psixosomatika", type: "number", question: "Kuniga o'rtacha necha soat uхlаysiz?", placeholder: "Soatlar soni" },
  { id: 42, block: "Turmush tarzi va Psixosomatika", type: "scale",  question: "Ishingiz va hayotingizda stress darajasi qanday? (1-10 ball)" },
  { id: 43, block: "Turmush tarzi va Psixosomatika", type: "binary", question: "Oxirgi vaqtlarda sabаbsiz xavotir yoki qo'rquv hissi bo'lyaptimi?" },
  { id: 44, block: "Turmush tarzi va Psixosomatika", type: "select", question: "Ovqatlanishda tuzni ko'p iste'mol qilasizmi?",
    options: ["Kam iste'mol qilаman", "O'rtacha", "Ko'p iste'mol qilаman"],
  },
  { id: 45, block: "Turmush tarzi va Psixosomatika", type: "number", question: "Haftada necha marta jismoniy mashqlar yoki faol yurish bilan shug'ullanasiz?", placeholder: "Marta/hafta" },
  { id: 46, block: "Turmush tarzi va Psixosomatika", type: "select", question: "Oxirgi marta qachon umumiy qon tahlili topshirgansiz?",
    options: ["3 oy ichida", "6 oy ichida", "1 yil ichida", "1 yildan ko'p", "Eslаy olmаyman"],
  },
  { id: 47, block: "Turmush tarzi va Psixosomatika", type: "text",   question: "Doimiy ravishda ichadigan barcha dorilar ro'yxatini bilasizmi?", placeholder: "Dorilar nomi (masalan: Aspirin, Enalapril...)" },
  { id: 48, block: "Turmush tarzi va Psixosomatika", type: "text",   question: "Sizda allergik reaksiyalar bormi (ayniqsa dorilarga)?", placeholder: "Allergiya bo'lsa kiriting" },
  { id: 49, block: "Turmush tarzi va Psixosomatika", type: "binary", question: "Ko'krak qafasidagi og'riq chuqur nafas olganda yoki tanani burgan daо'zgaradimi?" },
  { id: 50, block: "Turmush tarzi va Psixosomatika", type: "scale",  question: "Hayot sifati: Hozirgi sog'lig'ingiz sizni necha foiz qoniqtiradi?" },
];

const TOTAL = questions.length;

// Red flag question IDs
const RED_FLAG_IDS = new Set([6, 8, 9, 10, 11, 12]);

// Helper: calculate BMI
function calculateBMI(weight: number, height: number): string {
  const h = height / 100;
  return (weight / (h * h)).toFixed(1);
}

// Helper: calculate simplified SCORE2
function calculateSCORE2(answers: Record<number, any>): number {
  let score = 0;
  const age = Number(answers[1]) || 0;
  if (age >= 60) score += 3;
  else if (age >= 50) score += 2;
  else if (age >= 40) score += 1;

  if (answers[2] === "Erkak") score += 1;
  if (answers[33] === "Ha, chekaman") score += 2;
  else if (answers[33] === "Yo'q, tashladim (1 yil ichida)") score += 1;
  if (answers[34] === "Ha") score += 2;
  if (answers[35] === "Ha") score += 1;
  if (answers[36] === "Ha") score += 1;
  if (answers[24] === "Ha") score += 1;

  return Math.min(score * 1.2, 15);
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

export function Questionnaire() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [completed, setCompleted] = useState(false);
  const [redFlagDetected, setRedFlagDetected] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = useMemo(
    () => ((currentQuestionIndex + 1) / TOTAL) * 100,
    [currentQuestionIndex]
  );

  // Check for red flags
  const checkRedFlags = useCallback((questionId: number, answer: any) => {
    if (RED_FLAG_IDS.has(questionId)) {
      if (answer === "Ha" || (Array.isArray(answer) && answer.length > 0)) {
        setRedFlagDetected(true);
      }
    }
    // Body map red flag (question 7)
    if (questionId === 7 && Array.isArray(answer) && answer.length > 0) {
      setRedFlagDetected(true);
    }
  }, []);

  const handleNext = useCallback(() => {
    // Text and bodyMap are optional; others require an answer
    const isOptional = currentQuestion.type === "text" || currentQuestion.type === "bodyMap";
    if (currentAnswer === null && !isOptional) return;

    const newAnswers = { ...answers, [currentQuestion.id]: currentAnswer };
    setAnswers(newAnswers);
    checkRedFlags(currentQuestion.id, currentAnswer);

    if (currentQuestionIndex < TOTAL - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      setCurrentAnswer(answers[questions[nextIdx].id] ?? null);
    } else {
      setCompleted(true);
    }
  }, [currentAnswer, answers, currentQuestion, currentQuestionIndex, checkRedFlags]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      const prevIdx = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIdx);
      setCurrentAnswer(answers[questions[prevIdx].id] ?? null);
    }
  }, [currentQuestionIndex, answers]);

  const handleBodyMapToggle = useCallback(
    (area: string) => {
      const current: string[] = Array.isArray(currentAnswer) ? currentAnswer : [];
      setCurrentAnswer(
        current.includes(area) ? current.filter((a) => a !== area) : [...current, area]
      );
    },
    [currentAnswer]
  );

  // ── COMPLETED SCREEN ──────────────────────────────────────────────────
  if (completed) {
    const score2 = calculateSCORE2(answers);
    const riskLevel: "low" | "medium" | "high" =
      score2 < 5 ? "low" : score2 < 10 ? "medium" : "high";

    const bmi =
      answers[3]?.weight && answers[3]?.height
        ? calculateBMI(Number(answers[3].weight), Number(answers[3].height))
        : null;

    const redFlags: string[] = [];
    if (answers[6] === "Ha") redFlags.push("Ko'krak qafasida og'riq");
    if (answers[7] && Array.isArray(answers[7]) && answers[7].length > 0) {
      redFlags.push(`Og'riqning tarqalishi: ${(answers[7] as string[]).map((a) => areaLabels[a] ?? a).join(", ")}`);
    }
    if (answers[8]  === "Ha") redFlags.push("Sovuq ter");
    if (answers[9]  === "Ha") redFlags.push("Keskin nafas qisishi");
    if (answers[10] === "Ha") redFlags.push("Hushdan ketish");
    if (answers[11] === "Ha") redFlags.push("Oyoqlarda keskin shish");
    if (answers[12] === "Ha") redFlags.push("Taxikardiya + bosh aylanishi");

    const conditions: string[] = [];
    if (answers[13] === "Ha") conditions.push("Gipertoniya");
    if (answers[34] === "Ha") conditions.push("Qandli diabet");
    if (answers[38] === "Ha") conditions.push("Infarkt/insult tarixi");
    if (answers[39] === "Ha") conditions.push("Stent/shunt");

    const riskColor = { low: "green", medium: "yellow", high: "red" }[riskLevel];
    const riskLabel = { low: "Past", medium: "O'rtacha", high: "Yuqori" }[riskLevel];

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          {/* Emergency alert */}
          {redFlagDetected && (
            <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-6 mb-6 shadow-xl">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-12 h-12 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-2xl text-red-900 mb-2">⚠️ Tezkor yordam zarur!</h3>
                  <p className="text-red-700 mb-4">
                    Sizning javoblaringiz asosida yurak-qon tomir kasalliklarining xavfli belgilari
                    aniqlandi. Zudlik bilan tibbiy yordamga murojaat qiling!
                  </p>
                  <a
                    href="tel:103"
                    className="inline-flex items-center gap-3 px-6 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg text-lg"
                  >
                    <Phone className="w-6 h-6" />
                    103 ga qo'ng'iroq qilish
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-blue-100">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl text-gray-900 mb-4">Skrining tugallandi!</h2>
              <p className="text-lg text-gray-600">Sizning javoblaringiz AI tomonidan tahlil qilindi</p>
            </div>

            {/* SCORE2 Risk Assessment */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 mb-6 border border-blue-100">
              <h3 className="text-xl text-gray-900 mb-4">Kardiovaskulyar xavf baholash (SCORE2)</h3>
              <div className="grid sm:grid-cols-3 gap-6 mb-4">
                <div>
                  <div className="text-sm text-gray-600 mb-2">Xavf darajasi</div>
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm border ${
                      riskLevel === "low"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : riskLevel === "medium"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                        : "bg-red-100 text-red-700 border-red-200"
                    }`}
                  >
                    {riskLabel}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2">SCORE2 (10 yillik)</div>
                  <div className="text-3xl text-blue-600">{score2.toFixed(1)}%</div>
                </div>
                {bmi && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">BMI indeksi</div>
                    <div className="text-3xl text-purple-600">{bmi}</div>
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-2">Xavf vizualizatsiyasi</div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      riskLevel === "low"
                        ? "bg-green-500"
                        : riskLevel === "medium"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(score2 * 6, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Red Flags */}
            {redFlags.length > 0 && (
              <div className="bg-red-50 rounded-xl p-6 mb-6 border border-red-200">
                <h3 className="text-lg text-red-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Qizil bayroqchalar
                </h3>
                <div className="space-y-2">
                  {redFlags.map((flag, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-red-700">
                      <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                      {flag}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conditions */}
            {conditions.length > 0 && (
              <div className="bg-purple-50 rounded-xl p-6 mb-6 border border-purple-200">
                <h3 className="text-lg text-purple-900 mb-3">Mavjud kasalliklar</h3>
                <div className="flex flex-wrap gap-2">
                  {conditions.map((condition, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm border border-purple-300"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Summary */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
              <h3 className="text-lg text-gray-900 mb-3">AI Anamnez xulosasi</h3>
              <p className="text-gray-700 leading-relaxed">
                {answers[1]} yoshli {answers[2]?.toLowerCase() ?? ""} bemor.{" "}
                {bmi ? `BMI indeksi: ${bmi}. ` : ""}
                {answers[33] === "Ha, chekaman" ? "Chekuvchi. " : ""}
                {answers[34] === "Ha" ? "Qandli diabet diagnozi qo'yilgan. " : ""}
                {answers[13] === "Ha" ? "Gipertoniya tarixi mavjud. " : ""}
                {answers[24] === "Ha" ? "Umumiy holsizlik va tez charchash hissi qayd etilgan. " : ""}
                {answers[36] === "Ha" ? "Oilada erta infarkt/insult tarixi bor. " : ""}
                SCORE2 xavf darajasi: {score2.toFixed(1)}% ({riskLabel.toLowerCase()}).{" "}
                {riskLevel === "high"
                  ? "Zudlik bilan kardiolog konsultatsiyasi, EKG va exokardiografiya tavsiya etiladi."
                  : riskLevel === "medium"
                  ? "Muntazam nazorat va profilaktik chora-tadbirlar tavsiya etiladi."
                  : "Yiliga 1 marta profilaktik tekshiruv o'tish tavsiya etiladi."}
              </p>
            </div>

            {/* Recommendations */}
            <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
              <h3 className="text-lg text-blue-900 mb-3">Tavsiyalar</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                {riskLevel === "high" && (
                  <>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      Tezkor kardiolog konsultatsiyasi (1-2 hafta ichida)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      EKG, ExoKG, lipid spektri tekshiruvlari
                    </li>
                  </>
                )}
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  Jismoniy faollikni oshiring (haftada 150 daqiqa)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  Tuz iste'molini kamaytiring (kuniga 5g dan ko'p emas)
                </li>
                {answers[33] === "Ha, chekaman" && (
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    Chekishni to'xtatish dasturi (xavfni 50% ga kamaytiradi)
                  </li>
                )}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/dashboard"
                className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
              >
                Shifokr panelini ko'rish
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="flex-1 px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-colors">
                PDF hisobotni yuklash
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── QUESTIONNAIRE SCREEN ─────────────────────────────────────────────
  const canProceed =
    currentAnswer !== null ||
    currentQuestion.type === "text" ||
    currentQuestion.type === "bodyMap";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
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

      {/* Progress Bar */}
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

          {/* Block indicators */}
          <div className="hidden sm:flex gap-1 mt-3">
            {["Demografiya", "Qizil bayroq", "Qon bosimi", "Yurak yet.", "Ritm/Steno", "Xavf omil", "Turmush"].map(
              (label, i) => {
                const blockStart = [0, 5, 12, 18, 25, 32, 40][i];
                const blockEnd = [5, 12, 18, 25, 32, 40, 50][i];
                const isActive = currentQuestionIndex >= blockStart && currentQuestionIndex < blockEnd;
                const isDone = currentQuestionIndex >= blockEnd;
                return (
                  <div
                    key={i}
                    className={`flex-1 h-1 rounded-full transition-all ${
                      isDone
                        ? "bg-emerald-500"
                        : isActive
                        ? "bg-emerald-300"
                        : "bg-gray-200"
                    }`}
                    title={label}
                  />
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* Red Flag Warning Banner */}
      {redFlagDetected && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b-2 border-red-400 sticky top-[133px] z-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 animate-pulse" />
              <p className="text-sm text-red-700">
                Xavfli belgilar aniqlandi. Skrining tugagach tezkor tibbiy yordam tavsiyasi beriladi.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Question Card */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-3xl opacity-30 blur-3xl pointer-events-none" />
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-emerald-100">
            {/* Question header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 flex-shrink-0">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="text-sm text-emerald-600">{currentQuestion.block}</div>
                  <div className="text-gray-900">Savol #{currentQuestion.id}</div>
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl text-gray-900 leading-relaxed">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Binary */}
            {currentQuestion.type === "binary" && (
              <div className="grid grid-cols-2 gap-4 mb-8">
                {(["Ha", "Yo'q"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setCurrentAnswer(option)}
                    className={`p-8 rounded-2xl border-2 transition-all ${
                      currentAnswer === option
                        ? option === "Ha"
                          ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-xl scale-105"
                          : "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-xl scale-105"
                        : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                    }`}
                  >
                    <div
                      className={`text-2xl transition-colors ${
                        currentAnswer === option
                          ? option === "Ha"
                            ? "text-emerald-700"
                            : "text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      {option}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Scale */}
            {currentQuestion.type === "scale" && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4 text-sm text-gray-500 px-2">
                  <span>1 (Juda kam)</span>
                  <span>10 (Juda yuqori)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentAnswer ?? 5}
                  onChange={(e) => setCurrentAnswer(parseInt(e.target.value))}
                  className="w-full h-4 rounded-full appearance-none cursor-pointer accent-emerald-600"
                  style={{
                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${
                      ((currentAnswer ?? 5) - 1) * 11.11
                    }%, #e5e7eb ${((currentAnswer ?? 5) - 1) * 11.11}%, #e5e7eb 100%)`,
                  }}
                />
                <div className="text-center mt-6">
                  <div className="inline-block px-10 py-5 bg-gradient-to-br from-emerald-100 to-blue-100 text-emerald-700 rounded-2xl text-4xl shadow-lg border-2 border-emerald-200">
                    {currentAnswer ?? 5}
                  </div>
                </div>
              </div>
            )}

            {/* Number */}
            {currentQuestion.type === "number" && (
              <div className="mb-8">
                <input
                  type="number"
                  value={currentAnswer ?? ""}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  className="w-full p-6 text-xl border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none transition-all"
                />
              </div>
            )}

            {/* Text */}
            {currentQuestion.type === "text" && (
              <div className="mb-8">
                <input
                  type="text"
                  value={currentAnswer ?? ""}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder={currentQuestion.placeholder ?? "Javobingizni kiriting..."}
                  className="w-full p-6 text-xl border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none transition-all"
                />
              </div>
            )}

            {/* Select */}
            {currentQuestion.type === "select" && currentQuestion.options && (
              <div className="grid gap-3 mb-8">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentAnswer(option)}
                    className={`p-5 rounded-2xl border-2 text-left transition-all group ${
                      currentAnswer === option
                        ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-blue-50 shadow-lg scale-[1.02]"
                        : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          currentAnswer === option
                            ? "border-emerald-500 bg-emerald-500 shadow-lg"
                            : "border-gray-300 group-hover:border-emerald-400"
                        }`}
                      >
                        {currentAnswer === option && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-lg text-gray-900">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Multi Input */}
            {currentQuestion.type === "multiInput" && currentQuestion.fields && (
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {currentQuestion.fields.map((field, idx) => (
                  <input
                    key={idx}
                    type={field.type ?? "text"}
                    value={currentAnswer?.[field.name] ?? ""}
                    onChange={(e) =>
                      setCurrentAnswer({ ...currentAnswer, [field.name]: e.target.value })
                    }
                    placeholder={field.placeholder}
                    className="p-6 text-xl border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none transition-all"
                  />
                ))}
              </div>
            )}

            {/* Body Map */}
            {currentQuestion.type === "bodyMap" && (
              <div className="mb-8">
                <BodyMap
                  selectedAreas={Array.isArray(currentAnswer) ? currentAnswer : []}
                  onAreaClick={handleBodyMapToggle}
                  multiSelect
                />
              </div>
            )}

            {/* Navigation */}
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
                className="group inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-xl shadow-emerald-200 hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {currentQuestionIndex === TOTAL - 1 ? "Tugatish" : "Keyingi"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
