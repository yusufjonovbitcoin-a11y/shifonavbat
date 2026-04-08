import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Activity,
  AlertCircle,
  TrendingUp,
  Users,
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  X,
  Heart,
  CheckCircle,
  BarChart3,
} from "lucide-react";

type RiskLevel = "low" | "medium" | "high";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  riskLevel: RiskLevel;
  score: number;
  date: string;
  summary: string;
  redFlags: string[];
  medications: string[];
  conditions: string[];
}

const mockPatients: Patient[] = [
  {
    id: "12845",
    name: "Anvar Usmanov",
    age: 45,
    gender: "Erkak",
    riskLevel: "low",
    score: 2.3,
    date: "2026-04-05",
    summary:
      "Bemorda yengil gipertoniya tarixi mavjud, ammo hozirda barqaror holda. Oilada yurak kasalliklari mavjud. Jismoniy faollik o'rtacha darajada. Chekuvchi emas, qandli diabet yo'q.",
    redFlags: ["Oilada yurak kasalliklari tarixi"],
    medications: ["Enalapril 10mg"],
    conditions: ["Gipertoniya I daraja"],
  },
  {
    id: "12846",
    name: "Dilnoza Karimova",
    age: 52,
    gender: "Ayol",
    riskLevel: "high",
    score: 8.7,
    date: "2026-04-05",
    summary:
      "Bemorda qandli diabet 2-turi va gipertoniya II daraja mavjud. So'nggi 3 oyda ko'krak og'rig'i va nafas qisilishi shikoyatlari. NYHA II funktsional sinf. Zudlik bilan EKG va koronarografiya tavsiya etiladi.",
    redFlags: [
      "Ko'krak og'rig'i (anginal xarakter)",
      "Nafas qisilishi",
      "Qandli diabet + Gipertoniya kombinatsiyasi",
    ],
    medications: ["Metformin 1000mg", "Amlodipine 10mg", "Aspirin 100mg"],
    conditions: ["Qandli diabet 2-tur", "Gipertoniya II daraja", "Yurak yetishmovchiligi (NYHA II)"],
  },
  {
    id: "12847",
    name: "Sardor Rahimov",
    age: 38,
    gender: "Erkak",
    riskLevel: "medium",
    score: 4.2,
    date: "2026-04-04",
    summary:
      "Bemor kuniga 15 sigaret chekadi, jismoniy faollik past. BMI 28 (ortiqcha vazn). Oilada erta infarkt tarixi (otasi 50 yoshda). Lipid spektri tekshiruvi tavsiya etiladi.",
    redFlags: ["Chekish (15 sig/kun)", "Oilada erta infarkt tarixi", "Ortiqcha vazn"],
    medications: [],
    conditions: ["Ortiqcha vazn (BMI 28)"],
  },
  {
    id: "12848",
    name: "Nigora Saidova",
    age: 29,
    gender: "Ayol",
    riskLevel: "low",
    score: 0.8,
    date: "2026-04-04",
    summary:
      "Sog'lom yosh bemor. Hech qanday surunkali kasallik yo'q. Jismoniy faollik yuqori darajada. Profilaktik ko'rik maqsadida murojaat qilgan.",
    redFlags: [],
    medications: [],
    conditions: [],
  },
  {
    id: "12849",
    name: "Bobur Tursunov",
    age: 61,
    gender: "Erkak",
    riskLevel: "high",
    score: 9.2,
    date: "2026-04-03",
    summary:
      "Bemorda o'tgan infarkt tarixi (2 yil oldin). Hozirda stabil stenokardiya. Aritmiya epizodlari qayd etilgan. Antikoagulyant terapiya qabul qilmoqda. Muntazam kardiomonitoring zarur.",
    redFlags: ["O'tgan infarkt", "Aritmiya epizodlari", "Stabil stenokardiya"],
    medications: ["Aspirin 100mg", "Klopidogrel 75mg", "Atorvastatin 40mg", "Bisoprolol 5mg"],
    conditions: ["IYuK: Stabil stenokardiya", "O'tgan infarkt", "Aritmiya"],
  },
];

const riskStyles: Record<RiskLevel, string> = {
  low: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  high: "bg-red-100 text-red-700 border-red-200",
};

const riskLabels: Record<RiskLevel, string> = {
  low: "Past",
  medium: "O'rtacha",
  high: "Yuqori",
};

const riskBarColors: Record<RiskLevel, string> = {
  low: "bg-green-500",
  medium: "bg-yellow-500",
  high: "bg-red-500",
};

function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs border ${riskStyles[level]}`}>
      {riskLabels[level]}
    </span>
  );
}

export function DoctorDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState<RiskLevel | "all">("all");

  const filteredPatients = useMemo(
    () =>
      mockPatients.filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRisk = filterRisk === "all" || p.riskLevel === filterRisk;
        return matchesSearch && matchesRisk;
      }),
    [searchTerm, filterRisk]
  );

  const closeModal = useCallback(() => setSelectedPatient(null), []);

  const stats = useMemo(
    () => [
      { label: "Bugungi bemorlar", value: "5", icon: Users, colorBg: "bg-blue-100", colorIcon: "text-blue-600" },
      { label: "Yuqori xavf", value: "2", icon: AlertCircle, colorBg: "bg-red-100", colorIcon: "text-red-600" },
      { label: "O'rtacha SCORE2", value: "5.0%", icon: BarChart3, colorBg: "bg-green-100", colorIcon: "text-green-600" },
      { label: "Kutilayotgan", value: "3", icon: Calendar, colorBg: "bg-purple-100", colorIcon: "text-purple-600" },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Orqaga
              </Link>
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-900">Shifokor-LDA</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                title="Eksport"
              >
                <Download className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white text-sm">DR</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">Shifokr Dashboard</h1>
          <p className="text-gray-600">AI tahlil qilingan bemorlar ro'yxati va hisobotlar</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 ${stat.colorBg} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.colorIcon}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Bemor ismi bo'yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "low", "medium", "high"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setFilterRisk(level)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all border ${
                    filterRisk === level
                      ? level === "all"
                        ? "bg-gray-800 text-white border-gray-800"
                        : level === "low"
                        ? "bg-green-100 text-green-700 border-green-300"
                        : level === "medium"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                        : "bg-red-100 text-red-700 border-red-300"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {level === "all" ? (
                    <span className="flex items-center gap-1.5"><Filter className="w-4 h-4" />Barchasi</span>
                  ) : (
                    riskLabels[level]
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Bemor</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Yosh/Jins</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Xavf</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">SCORE2</th>
                  <th className="hidden sm:table-cell px-6 py-4 text-left text-sm text-gray-600">Sana</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Bemorlar topilmadi
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              patient.riskLevel === "high"
                                ? "bg-red-100"
                                : patient.riskLevel === "medium"
                                ? "bg-yellow-100"
                                : "bg-green-100"
                            }`}
                          >
                            <Activity
                              className={`w-5 h-5 ${
                                patient.riskLevel === "high"
                                  ? "text-red-600"
                                  : patient.riskLevel === "medium"
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="text-gray-900">{patient.name}</div>
                            <div className="text-sm text-gray-500">ID: {patient.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">{patient.age} yosh</div>
                        <div className="text-sm text-gray-500">{patient.gender}</div>
                      </td>
                      <td className="px-6 py-4">
                        <RiskBadge level={patient.riskLevel} />
                        {patient.redFlags.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                            <span className="text-xs text-orange-600">
                              {patient.redFlags.length} bayroq
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">{patient.score}%</div>
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${riskBarColors[patient.riskLevel]}`}
                            style={{ width: `${Math.min(patient.score * 10, 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 text-gray-500 text-sm">
                        {patient.date}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedPatient(patient)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200"
                        >
                          <Eye className="w-4 h-4" />
                          Ko'rish
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <Link
            to="/questionnaire"
            className="flex items-center gap-3 p-4 bg-white border border-emerald-200 rounded-xl hover:shadow-md hover:border-emerald-300 transition-all group"
          >
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-gray-900 text-sm">Yangi skrining boshlash</div>
              <div className="text-xs text-gray-500">AI anamnez tizimi</div>
            </div>
          </Link>
          <Link
            to="/analytics"
            className="flex items-center gap-3 p-4 bg-white border border-blue-200 rounded-xl hover:shadow-md hover:border-blue-300 transition-all group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-gray-900 text-sm">Analytics va Statistika</div>
              <div className="text-xs text-gray-500">Klinika ko'rsatkichlari</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  riskStyles[selectedPatient.riskLevel].split(" ")[0]
                }`}>
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl text-gray-900">{selectedPatient.name}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedPatient.age} yosh, {selectedPatient.gender} • ID: {selectedPatient.id}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Yopish"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Risk Assessment */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg text-gray-900 mb-4">Xavf baholash</h4>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Xavf darajasi</div>
                    <RiskBadge level={selectedPatient.riskLevel} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-2">SCORE2 (10 yillik)</div>
                    <div className="text-2xl text-gray-900">{selectedPatient.score}%</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2">Xavf vizualizatsiyasi</div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${riskBarColors[selectedPatient.riskLevel]}`}
                      style={{ width: `${Math.min(selectedPatient.score * 10, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              <div>
                <h4 className="text-lg text-gray-900 mb-3">AI Xulosa</h4>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">
                  {selectedPatient.summary}
                </p>
              </div>

              {/* Red Flags */}
              {selectedPatient.redFlags.length > 0 && (
                <div>
                  <h4 className="text-lg text-gray-900 mb-3">Qizil bayroqchalar</h4>
                  <div className="space-y-2">
                    {selectedPatient.redFlags.map((flag, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
                      >
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-900">{flag}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conditions */}
              {selectedPatient.conditions.length > 0 && (
                <div>
                  <h4 className="text-lg text-gray-900 mb-3">Kasalliklar</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.conditions.map((condition, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm border border-purple-200"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Medications */}
              {selectedPatient.medications.length > 0 && (
                <div>
                  <h4 className="text-lg text-gray-900 mb-3">Dori-darmonlar</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.medications.map((med, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm border border-green-200 flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {med}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* No red flags */}
              {selectedPatient.redFlags.length === 0 && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-800">Qizil bayroqchalar aniqlanmadi</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg">
                  Qabulni boshlash
                </button>
                <button className="flex-1 px-6 py-3 bg-white text-emerald-600 border-2 border-emerald-500 rounded-xl hover:bg-emerald-50 transition-colors">
                  PDF hisobotni yuklash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
