import { useMemo, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Activity,
  AlertCircle,
  BarChart3,
  Calendar,
  Download,
  Heart,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { apiUrl, authJsonHeaders, getAuthToken } from "../lib/api";

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  },
};

type AnalyticsPayload = {
  total: number;
  highRisk: number;
  avgScore2: number;
  thisMonth: number;
  riskDistribution: { name: string; value: number; color: string }[];
  monthlyTrend: { month: string; bemorlar: number; yuqoriXavf: number; ortacha: number }[];
  conditionsTop: { kasallik: string; soni: number }[];
  ageGroups: { guruh: string; soni: number }[];
};

const emptyPayload: AnalyticsPayload = {
  total: 0,
  highRisk: 0,
  avgScore2: 0,
  thisMonth: 0,
  riskDistribution: [
    { name: "Past xavf", value: 0, color: "#10b981" },
    { name: "O'rtacha xavf", value: 0, color: "#f59e0b" },
    { name: "Yuqori xavf", value: 0, color: "#ef4444" },
  ],
  monthlyTrend: [],
  conditionsTop: [],
  ageGroups: [],
};

export function Analytics() {
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsPayload>(emptyPayload);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getAuthToken()) {
      navigate("/", { replace: true });
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(apiUrl("/api/analytics/summary"), { headers: authJsonHeaders() })
      .then(async (r) => {
        if (r.status === 401) {
          navigate("/", { replace: true });
          return;
        }
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Xato");
        if (!cancelled && j.ok) {
          setData({
            total: j.total ?? 0,
            highRisk: j.highRisk ?? 0,
            avgScore2: j.avgScore2 ?? 0,
            thisMonth: j.thisMonth ?? 0,
            riskDistribution: j.riskDistribution?.length ? j.riskDistribution : emptyPayload.riskDistribution,
            monthlyTrend: j.monthlyTrend ?? [],
            conditionsTop: j.conditionsTop ?? [],
            ageGroups: j.ageGroups ?? [],
          });
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message || "Yuklanmadi");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const kpiCards = useMemo(
    () => [
      {
        icon: Users,
        value: data.total,
        label: "Jami skrining",
        badge: data.thisMonth ? `Bu oy: ${data.thisMonth}` : "Ma'lumot yo'q",
        badgeColor: "text-gray-600",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        trend: <TrendingUp className="w-5 h-5 text-green-500" />,
      },
      {
        icon: AlertCircle,
        value: data.highRisk,
        label: "Yuqori xavf (jami)",
        badge:
          data.total > 0 ? `${((data.highRisk / data.total) * 100).toFixed(1)}% jami` : "—",
        badgeColor: "text-red-600",
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        trend: <AlertCircle className="w-5 h-5 text-red-400" />,
      },
      {
        icon: BarChart3,
        value: data.total ? `${data.avgScore2}%` : "—",
        label: "O'rtacha SCORE2",
        badge: "Barcha skrininglar",
        badgeColor: "text-green-600",
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
        trend: <Activity className="w-5 h-5 text-green-500" />,
      },
      {
        icon: Calendar,
        value: data.thisMonth,
        label: "Bu oyda skrining",
        badge: "Haqiqiy ma'lumot",
        badgeColor: "text-green-600",
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
        trend: <TrendingUp className="w-5 h-5 text-green-500" />,
      },
    ],
    [data]
  );

  const monthlyData =
    data.monthlyTrend.length > 0
      ? data.monthlyTrend
      : [{ month: "—", bemorlar: 0, yuqoriXavf: 0, ortacha: 0 }];

  const riskDistribution = data.riskDistribution;
  const conditionsData =
    data.conditionsTop.length > 0 ? data.conditionsTop : [{ kasallik: "—", soni: 0 }];
  const ageGroups =
    data.ageGroups.length > 0
      ? data.ageGroups
      : [
          { guruh: "20-30", soni: 0 },
          { guruh: "31-40", soni: 0 },
          { guruh: "41-50", soni: 0 },
          { guruh: "51-60", soni: 0 },
          { guruh: "61+", soni: 0 },
        ];

  return (
    <div className="min-h-screen bg-gray-50">
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
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md opacity-60 cursor-not-allowed"
              disabled
              title="Tez orada"
            >
              <Download className="w-4 h-4" />
              Eksport
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">Analytics va Statistika</h1>
          <p className="text-gray-600">
            Klinika faoliyati va bemorlar holati (serverdagi skrininglar bo&apos;yicha)
          </p>
          {loading ? <p className="text-sm text-gray-500 mt-2">Yuklanmoqda...</p> : null}
          {error ? (
            <p className="text-sm text-red-600 mt-2" role="alert">
              {error}
            </p>
          ) : null}
          {!loading && !error && data.total === 0 ? (
            <p className="text-sm text-amber-700 mt-2">
              Hozircha skrining yo&apos;q. Bemorlar skrining topshirgach, grafiklar to&apos;ldiriladi.
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {kpiCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center`}>
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                {card.trend}
              </div>
              <div className="text-3xl text-gray-900 mb-1">{card.value}</div>
              <div className="text-sm text-gray-600 mb-1">{card.label}</div>
              <div className={`text-xs ${card.badgeColor}`}>{card.badge}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg text-gray-900 mb-6">Oylik dinamika</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="bemorlar"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#10b981" }}
                  name="Jami skrining"
                />
                <Line
                  type="monotone"
                  dataKey="yuqoriXavf"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#ef4444" }}
                  name="Yuqori xavf"
                />
                <Line
                  type="monotone"
                  dataKey="ortacha"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#f59e0b" }}
                  name="O'rtacha xavf"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg text-gray-900 mb-6">Xavf darajasi taqsimoti</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  innerRadius={40}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {riskDistribution.map((item, idx) => (
                <div key={idx} className="text-center">
                  <div
                    className="w-3 h-3 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="text-xl text-gray-900">{item.value}</div>
                  <div className="text-xs text-gray-500">{item.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg text-gray-900 mb-6">Eng ko&apos;p qayd etilgan holatlar</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={conditionsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="kasallik"
                  stroke="#9ca3af"
                  width={90}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="soni" fill="#10b981" radius={[0, 6, 6, 0]} name="Soni" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg text-gray-900 mb-6">Yosh guruhlari bo&apos;yicha</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ageGroups}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="guruh" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="soni" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Skrininglar" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 via-white to-blue-50 rounded-xl p-8 border border-emerald-100 shadow-sm">
          <h3 className="text-xl text-gray-900 mb-4">Eslatma</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Grafiklar faqat ushbu serverda saqlangan skrininglar asosida hisoblanadi. Vercel faqat frontend
            bo&apos;lsa, statistika sizning Node API serveringiz (masalan, Railway / VPS) bilan ishlaydi —
            <code className="mx-1 text-gray-800">VITE_API_BASE_URL</code>
            ni sozlang.
          </p>
        </div>
      </div>
    </div>
  );
}
