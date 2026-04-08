import { useMemo } from "react";
import { Link } from "react-router";
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

const monthlyData = [
  { month: "Okt",  bemorlar: 45, yuqoriXavf: 8,  ortacha: 12 },
  { month: "Noy",  bemorlar: 52, yuqoriXavf: 11, ortacha: 15 },
  { month: "Dek",  bemorlar: 61, yuqoriXavf: 9,  ortacha: 18 },
  { month: "Yan",  bemorlar: 58, yuqoriXavf: 13, ortacha: 16 },
  { month: "Fev",  bemorlar: 67, yuqoriXavf: 15, ortacha: 19 },
  { month: "Mar",  bemorlar: 72, yuqoriXavf: 12, ortacha: 21 },
];

const riskDistribution = [
  { name: "Past xavf",    value: 156, color: "#10b981" },
  { name: "O'rtacha xavf", value: 101, color: "#f59e0b" },
  { name: "Yuqori xavf",  value: 68,  color: "#ef4444" },
];

const conditionsData = [
  { kasallik: "Gipertoniya",  soni: 89 },
  { kasallik: "Qandli diabet", soni: 56 },
  { kasallik: "IYuK",         soni: 34 },
  { kasallik: "Aritmiya",     soni: 28 },
  { kasallik: "Yurak yet.",   soni: 21 },
];

const ageGroups = [
  { guruh: "20-30", soni: 42 },
  { guruh: "31-40", soni: 68 },
  { guruh: "41-50", soni: 95 },
  { guruh: "51-60", soni: 78 },
  { guruh: "61+",   soni: 42 },
];

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  },
};

const TOTAL_PATIENTS = 325;
const HIGH_RISK = 68;
const AVG_SCORE = 4.8;
const SCREENINGS_THIS_MONTH = 72;

export function Analytics() {
  const kpiCards = useMemo(
    () => [
      {
        icon: Users,
        value: TOTAL_PATIENTS,
        label: "Jami skrining o'tganlar",
        badge: "+12% so'nggi oyda",
        badgeColor: "text-green-600",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        trend: <TrendingUp className="w-5 h-5 text-green-500" />,
      },
      {
        icon: AlertCircle,
        value: HIGH_RISK,
        label: "Yuqori xavfli bemorlar",
        badge: `${((HIGH_RISK / TOTAL_PATIENTS) * 100).toFixed(1)}% jami`,
        badgeColor: "text-red-600",
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        trend: <AlertCircle className="w-5 h-5 text-red-400" />,
      },
      {
        icon: BarChart3,
        value: `${AVG_SCORE}%`,
        label: "O'rtacha SCORE2",
        badge: "Normal diapazon",
        badgeColor: "text-green-600",
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
        trend: <Activity className="w-5 h-5 text-green-500" />,
      },
      {
        icon: Calendar,
        value: SCREENINGS_THIS_MONTH,
        label: "Bu oyda skrining",
        badge: "+18% o'sish",
        badgeColor: "text-green-600",
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
        trend: <TrendingUp className="w-5 h-5 text-green-500" />,
      },
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
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md">
              <Download className="w-4 h-4" />
              Eksport
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">Analytics va Statistika</h1>
          <p className="text-gray-600">
            Klinika faoliyati va bemorlar holati haqida to'liq ma'lumot
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {kpiCards.map((card, idx) => (
            <div key={idx} className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
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

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly Trend */}
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
                  name="Jami bemorlar"
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

          {/* Risk Distribution */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg text-gray-900 mb-6">Xavf darajasi taqsimoti</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
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

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Top Conditions */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg text-gray-900 mb-6">Eng ko'p uchraydigan kasalliklar</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={conditionsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="kasallik" stroke="#9ca3af" width={90} tick={{ fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="soni" fill="#10b981" radius={[0, 6, 6, 0]} name="Bemorlar soni" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Age Distribution */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg text-gray-900 mb-6">Yosh guruhlari bo'yicha</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ageGroups}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="guruh" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="soni" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Bemorlar soni" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-br from-emerald-50 via-white to-blue-50 rounded-xl p-8 border border-emerald-100 shadow-sm">
          <h3 className="text-xl text-gray-900 mb-6">Asosiy xulosalar</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: TrendingUp,
                bgColor: "bg-green-100",
                iconColor: "text-green-600",
                title: "Ijobiy tendensiya",
                desc: "So'nggi 3 oyda skrining o'tkazilayotgan bemorlar soni 28% ga oshdi. Bu profilaktik tibbiyotga e'tiborning oshganidan dalolat beradi.",
              },
              {
                icon: AlertCircle,
                bgColor: "bg-red-100",
                iconColor: "text-red-600",
                title: "E'tibor talab etadi",
                desc: "41-50 yosh oralig'idagi bemorlar orasida yuqori xavf darajasi boshqa guruhlarga nisbatan 15% yuqori. Maqsadli kampaniya zarur.",
              },
              {
                icon: BarChart3,
                bgColor: "bg-purple-100",
                iconColor: "text-purple-600",
                title: "Xizmat samaradorligi",
                desc: "AI-skrining tizimi orqali har bir bemorga sarflanadigan vaqt 15 daqiqadan 5 daqiqagacha qisqardi. Bu kuniga 3x ko'proq qabul qilish imkonini beradi.",
              },
              {
                icon: Activity,
                bgColor: "bg-blue-100",
                iconColor: "text-blue-600",
                title: "Sifat yaxshilanishi",
                desc: "Erta diagnostika natijasida komplikatsiyalar 40% ga kamaydi. Bemorlar ehtiyoji va xavf darajasiga qarab individual yondashuvlar qo'llanmoqda.",
              },
            ].map((insight, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 ${insight.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}
                >
                  <insight.icon className={`w-5 h-5 ${insight.iconColor}`} />
                </div>
                <div>
                  <h4 className="text-gray-900 mb-1">{insight.title}</h4>
                  <p className="text-sm text-gray-600">{insight.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
