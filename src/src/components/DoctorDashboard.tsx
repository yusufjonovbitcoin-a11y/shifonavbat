import { useState, useMemo, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { apiUrl, authJsonHeaders, getAuthToken } from "../lib/api";
import {
  ArrowLeft,
  Activity,
  AlertCircle,
  TrendingUp,
  Users,
  Calendar,
  Search,
  Download,
  Eye,
  X,
  Heart,
  CheckCircle,
  BarChart3,
  ListChecks,
} from "lucide-react";

type RiskLevel = "low" | "medium" | "high";

type ScreeningPolarity = "ijobiy" | "salbiy" | "neutral";

interface ScreeningQA {
  block?: string;
  question: string;
  answer: string;
  /** Chap ustun: ijobiy, o'ng ustun: salbiy; demografiya/ko'rsatkichlar: neutral */
  polarity: ScreeningPolarity;
}

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
  conditions: string[];
  screeningQa?: ScreeningQA[];
  /** Serverda qabul vaqti (mavjud bo'lsa) */
  acceptedAt?: string | null;
}

interface ScreeningApiRow {
  id: string;
  patientName: string | null;
  answers: Record<number, unknown>;
  score2: number;
  riskLevel: RiskLevel;
  createdAt: string;
  summary: string;
  redFlags: string[];
  conditions: string[];
  screeningQa?: ScreeningQA[];
  acceptedAt: string | null;
}

function screeningToPatient(row: ScreeningApiRow): Patient {
  const age = Number(row.answers?.[1]) || 0;
  const gender = String(row.answers?.[2] ?? "—");
  const name = row.patientName?.trim() || `Bemor ${row.id.slice(-6)}`;
  return {
    id: row.id,
    name,
    age,
    gender,
    riskLevel: row.riskLevel,
    score: row.score2,
    date: row.createdAt.slice(0, 10),
    summary: row.summary,
    redFlags: row.redFlags ?? [],
    conditions: row.conditions ?? [],
    screeningQa: row.screeningQa,
    acceptedAt: row.acceptedAt,
  };
}

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

function formatUzDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("uz-UZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function DoctorDashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"mijoz" | "tarix">("mijoz");

  useEffect(() => {
    if (!getAuthToken()) {
      navigate("/", { replace: true });
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    fetch(apiUrl("/api/screenings"), { headers: authJsonHeaders() })
      .then(async (r) => {
        if (r.status === 401) {
          navigate("/", { replace: true });
          return;
        }
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Ma'lumot yuklanmadi");
        if (!cancelled && data.ok && Array.isArray(data.screenings)) {
          setPatients(data.screenings.map((s: ScreeningApiRow) => screeningToPatient(s)));
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setLoadError(e.message || "Tarmoq xatosi");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const finalizeAcceptance = useCallback(
    async (id: string) => {
      const p = patients.find((x) => x.id === id);
      if (p?.acceptedAt) return;
      try {
        const r = await fetch(apiUrl(`/api/screenings/${encodeURIComponent(id)}/accept`), {
          method: "PATCH",
          headers: authJsonHeaders(),
        });
        if (r.status === 401) {
          navigate("/", { replace: true });
          return;
        }
        const data = await r.json();
        if (data.ok && data.screening) {
          const updated = screeningToPatient(data.screening as ScreeningApiRow);
          setPatients((prev) => prev.map((x) => (x.id === id ? updated : x)));
          setSelectedPatient((cur) => (cur?.id === id ? updated : cur));
        }
      } catch {
        /* noop */
      }
    },
    [patients, navigate]
  );

  useEffect(() => {
    if (!selectedPatient) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selectedPatient]);

  const filteredPatients = useMemo(
    () =>
      patients.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [patients, searchTerm]
  );

  const displayedPatients = useMemo(() => {
    if (viewMode === "tarix") {
      return [...filteredPatients]
        .filter((p) => p.acceptedAt)
        .sort((a, b) => (b.acceptedAt ?? "").localeCompare(a.acceptedAt ?? ""));
    }
    return filteredPatients.filter((p) => !p.acceptedAt);
  }, [viewMode, filteredPatients]);

  const tableEmptyMessage = useMemo(() => {
    if (viewMode === "tarix") {
      return "Tarixda qabul qilingan bemorlar yo'q";
    }
    if (filteredPatients.length === 0) {
      return "Hozircha skrininglar yo'q — bemorga /questionnaire havolasini yuboring";
    }
    if (filteredPatients.every((p) => p.acceptedAt)) {
      return "Navbatdagi bemorlar yo'q — barchasi qabul qilingan (Tarix bo'limida)";
    }
    return "Bemorlar topilmadi";
  }, [viewMode, filteredPatients]);

  const closeModal = useCallback(() => setSelectedPatient(null), []);

  const screeningColumns = useMemo(() => {
    const q = selectedPatient?.screeningQa;
    if (!q?.length) return null;
    return {
      ijobiy: q.filter((x) => x.polarity === "ijobiy"),
      salbiy: q.filter((x) => x.polarity === "salbiy"),
      neutral: q.filter((x) => x.polarity === "neutral"),
    };
  }, [selectedPatient]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const queue = patients.filter((p) => !p.acceptedAt);
    const todayCount = patients.filter((p) => p.date === today).length;
    const high = queue.filter((p) => p.riskLevel === "high").length;
    const avg =
      queue.length > 0
        ? (queue.reduce((a, p) => a + p.score, 0) / queue.length).toFixed(1)
        : "—";
    return [
      {
        label: "Bugungi skrining",
        value: String(todayCount),
        icon: Users,
        colorBg: "bg-blue-100",
        colorIcon: "text-blue-600",
      },
      {
        label: "Navbat: yuqori xavf",
        value: String(high),
        icon: AlertCircle,
        colorBg: "bg-red-100",
        colorIcon: "text-red-600",
      },
      {
        label: "Navbat: o'rtacha SCORE2",
        value: avg === "—" ? "—" : `${avg}%`,
        icon: BarChart3,
        colorBg: "bg-green-100",
        colorIcon: "text-green-600",
      },
      {
        label: "Kutilayotgan (navbat)",
        value: String(queue.length),
        icon: Calendar,
        colorBg: "bg-purple-100",
        colorIcon: "text-purple-600",
      },
    ];
  }, [patients]);

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
                <span className="text-gray-900">ShifokorLDA</span>
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
          {loading ? <p className="text-sm text-gray-500 mt-2">Ma&apos;lumotlar yuklanmoqda...</p> : null}
          {loadError ? (
            <p className="text-sm text-red-600 mt-2" role="alert">
              {loadError}
            </p>
          ) : null}
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
              <button
                type="button"
                onClick={() => setViewMode("mijoz")}
                className={`px-4 py-2 rounded-lg text-sm transition-all border ${
                  viewMode === "mijoz"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                Mijoz
              </button>
              <button
                type="button"
                onClick={() => setViewMode("tarix")}
                className={`px-4 py-2 rounded-lg text-sm transition-all border ${
                  viewMode === "tarix"
                    ? "bg-gray-800 text-white border-gray-800"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                Tarix
              </button>
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
                  <th className="hidden sm:table-cell px-6 py-4 text-left text-sm text-gray-600">
                    {viewMode === "tarix" ? "Qabul vaqti" : "Sana"}
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayedPatients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {tableEmptyMessage}
                    </td>
                  </tr>
                ) : (
                  displayedPatients.map((patient) => (
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
                        {viewMode === "tarix" && patient.acceptedAt
                          ? formatUzDateTime(patient.acceptedAt)
                          : patient.date}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
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

        {/* Stats — jadval ostida */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8 mb-8">
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

        {/* Quick Links */}
        <div className="grid sm:grid-cols-2 gap-4">
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

      {/* Bemor kartasi — to'liq ekran panel */}
      {selectedPatient && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-white"
          role="dialog"
          aria-modal="true"
          aria-labelledby="patient-panel-title"
        >
          {/* Panel sarlavhasi */}
          <div className="flex-shrink-0 border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8 py-4 shadow-sm">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    riskStyles[selectedPatient.riskLevel].split(" ")[0]
                  }`}
                >
                  <Activity className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 id="patient-panel-title" className="text-xl text-gray-900 truncate">
                    {selectedPatient.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {selectedPatient.age} yosh, {selectedPatient.gender} • ID: {selectedPatient.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="flex-shrink-0 p-2.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors border border-transparent hover:border-gray-200"
                aria-label="Yopish"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pb-10">
              {/* Skrining savol-javoblar — xavf baholashdan oldin */}
              {screeningColumns && (
                <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-white to-blue-50/50 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <ListChecks className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <h4 className="text-lg text-gray-900">Skrining: savol-javoblar</h4>
                      <p className="text-sm text-gray-500">
                        Chap: ijobiy javoblar · O&apos;ng: salbiy javoblar
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
                    {/* Chap — ijobiy */}
                    <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/50 overflow-hidden flex flex-col min-h-[120px]">
                      <div className="flex items-center gap-2 px-4 py-3 bg-emerald-100/80 border-b border-emerald-200">
                        <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0" />
                        <span className="text-sm font-semibold text-emerald-900">Ijobiy javoblar</span>
                      </div>
                      {screeningColumns.ijobiy.length === 0 ? (
                        <p className="text-sm text-gray-500 px-4 py-6 text-center">Yo&apos;q</p>
                      ) : (
                        <ul className="divide-y divide-emerald-100 bg-white/80">
                          {screeningColumns.ijobiy.map((row, idx) => (
                            <li key={idx} className="px-4 py-3 sm:px-4 hover:bg-emerald-50/50 transition-colors">
                              {row.block && (
                                <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                                  {row.block}
                                </span>
                              )}
                              <p className="text-sm text-gray-700 mt-0.5 leading-snug">{row.question}</p>
                              <p className="text-base text-emerald-900 font-semibold mt-1">{row.answer}</p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* O'ng — salbiy */}
                    <div className="rounded-xl border-2 border-rose-200 bg-rose-50/50 overflow-hidden flex flex-col min-h-[120px]">
                      <div className="flex items-center gap-2 px-4 py-3 bg-rose-100/80 border-b border-rose-200">
                        <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" />
                        <span className="text-sm font-semibold text-rose-900">Salbiy javoblar</span>
                      </div>
                      {screeningColumns.salbiy.length === 0 ? (
                        <p className="text-sm text-gray-500 px-4 py-6 text-center">Yo&apos;q</p>
                      ) : (
                        <ul className="divide-y divide-rose-100 bg-white/80">
                          {screeningColumns.salbiy.map((row, idx) => (
                            <li key={idx} className="px-4 py-3 sm:px-4 hover:bg-rose-50/50 transition-colors">
                              {row.block && (
                                <span className="text-xs font-medium text-rose-600 uppercase tracking-wide">
                                  {row.block}
                                </span>
                              )}
                              <p className="text-sm text-gray-700 mt-0.5 leading-snug">{row.question}</p>
                              <p className="text-base text-rose-900 font-semibold mt-1">{row.answer}</p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {screeningColumns.neutral.length > 0 && (
                    <div className="mt-4 rounded-xl border border-gray-200 bg-white/90 overflow-hidden">
                      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
                        Boshqa ma&apos;lumotlar (demografiya va ko&apos;rsatkichlar)
                      </div>
                      <ul className="divide-y divide-gray-100">
                        {screeningColumns.neutral.map((row, idx) => (
                          <li key={idx} className="px-4 py-3 sm:px-5 hover:bg-gray-50/80 transition-colors">
                            {row.block && (
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                {row.block}
                              </span>
                            )}
                            <p className="text-sm text-gray-700 mt-0.5 leading-snug">{row.question}</p>
                            <p className="text-base text-gray-900 font-medium mt-1">{row.answer}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Xavf baholash + AI xulosa (bir kartochkada) */}
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
                <div className="mb-0">
                  <div className="text-sm text-gray-600 mb-2">Xavf vizualizatsiyasi</div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${riskBarColors[selectedPatient.riskLevel]}`}
                      style={{ width: `${Math.min(selectedPatient.score * 10, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h4 className="text-lg text-gray-900 mb-3">AI Xulosa</h4>
                  <p className="text-gray-700 leading-relaxed bg-white/90 p-4 rounded-xl border border-gray-200/80 shadow-sm">
                    {selectedPatient.summary}
                  </p>
                </div>
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

              {/* No red flags */}
              {selectedPatient.redFlags.length === 0 && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-800">Qizil bayroqchalar aniqlanmadi</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedPatient.acceptedAt) return;
                    void finalizeAcceptance(selectedPatient.id);
                    window.setTimeout(() => closeModal(), 450);
                  }}
                  disabled={!!selectedPatient.acceptedAt}
                  aria-pressed={!!selectedPatient.acceptedAt}
                  title={
                    selectedPatient.acceptedAt
                      ? "Qabul yakunlangan — tarixda saqlangan"
                      : "Bosilganda qabul tugaydi va tarixga yoziladi"
                  }
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all shadow-lg border-2 ${
                    selectedPatient.acceptedAt
                      ? "bg-emerald-600 text-white border-emerald-600 cursor-not-allowed opacity-90"
                      : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-transparent hover:from-emerald-600 hover:to-emerald-700"
                  }`}
                >
                  {selectedPatient.acceptedAt ? "Qabul qilindi" : "Qabul qilish"}
                </button>
                <button
                  type="button"
                  className="flex-1 px-6 py-3 bg-white text-emerald-600 border-2 border-emerald-500 rounded-xl hover:bg-emerald-50 transition-colors"
                >
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
