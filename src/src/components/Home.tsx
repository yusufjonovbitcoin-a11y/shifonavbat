import { useState, useCallback } from "react";
import { Link } from "react-router";
import {
  Activity,
  Shield,
  Clock,
  Globe,
  Users,
  FileText,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  ChevronRight,
  Lock,
  Zap,
  BarChart3,
  Heart,
  Sparkles,
  AlertCircle,
} from "lucide-react";

// Static class maps to avoid Tailwind purge issues with dynamic strings
const featureGradients: Record<string, string> = {
  emerald: "from-emerald-400 to-emerald-500",
  blue: "from-blue-400 to-blue-500",
  purple: "from-purple-400 to-purple-500",
  orange: "from-orange-400 to-orange-500",
  green: "from-green-400 to-green-500",
};

const featureIconColors: Record<string, string> = {
  green: "text-green-500",
  blue: "text-blue-500",
  purple: "text-purple-500",
};

const securityBgColors: Record<string, string> = {
  emerald: "from-emerald-100 to-emerald-200",
  blue: "from-blue-100 to-blue-200",
  purple: "from-purple-100 to-purple-200",
};

const securityIconColors: Record<string, string> = {
  emerald: "text-emerald-600",
  blue: "text-blue-600",
  purple: "text-purple-600",
};

const certIconColors: Record<string, string> = {
  emerald: "text-emerald-500",
  blue: "text-blue-500",
  purple: "text-purple-500",
  orange: "text-orange-500",
};

export function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-emerald-100 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl text-gray-900 block">Shifokor-LDA</span>
                <span className="text-xs text-emerald-600">AI Medical Assistant</span>
              </div>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-emerald-600 transition-colors">
                Imkoniyatlar
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-emerald-600 transition-colors">
                Qanday ishlaydi
              </a>
              <a href="#security" className="text-gray-600 hover:text-emerald-600 transition-colors">
                Xavfsizlik
              </a>
              <Link
                to="/questionnaire"
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-200 hover:shadow-xl"
              >
                Demo ko'rish
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              aria-label="Menu"
              className="md:hidden p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-emerald-100 shadow-lg">
            <nav className="px-4 py-4 space-y-3">
              <a
                href="#features"
                className="block py-2 text-gray-600 hover:text-emerald-600 transition-colors"
                onClick={closeMobileMenu}
              >
                Imkoniyatlar
              </a>
              <a
                href="#how-it-works"
                className="block py-2 text-gray-600 hover:text-emerald-600 transition-colors"
                onClick={closeMobileMenu}
              >
                Qanday ishlaydi
              </a>
              <a
                href="#security"
                className="block py-2 text-gray-600 hover:text-emerald-600 transition-colors"
                onClick={closeMobileMenu}
              >
                Xavfsizlik
              </a>
              <Link
                to="/questionnaire"
                className="block py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-center shadow-lg"
                onClick={closeMobileMenu}
              >
                Demo ko'rish
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 rounded-full text-sm mb-6 border border-emerald-200">
                <Sparkles className="w-4 h-4" />
                AI-asoslangan tibbiy skrening
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl text-gray-900 mb-6 leading-tight">
                Kliniкangizni{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">
                  Evropa standartlari
                </span>{" "}
                asosida raqamlashtiring
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
                Bemorlar qabulga kelishidan oldin AI-anamnezdan o'tishadi. Shifokr uchun tayyor
                tashxis loyihasi va halqaro protokollar asosidagi hisobot.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/questionnaire"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-xl shadow-emerald-200 hover:shadow-2xl hover:-translate-y-1"
                >
                  Demo versiyani ko'rish
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-600 border-2 border-emerald-200 rounded-2xl hover:bg-emerald-50 hover:border-emerald-300 transition-all shadow-lg"
                >
                  Shifokr dashboardi
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-200">
                <div>
                  <div className="text-3xl bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-1">
                    15 → 5
                  </div>
                  <div className="text-sm text-gray-600">Daqiqa/bemor</div>
                </div>
                <div>
                  <div className="text-3xl bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-1">
                    3x
                  </div>
                  <div className="text-sm text-gray-600">Ko'proq qabul</div>
                </div>
                <div>
                  <div className="text-3xl bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-1">
                    -40%
                  </div>
                  <div className="text-sm text-gray-600">Xatolar</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-3xl opacity-10 blur-3xl"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Activity className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Bemor ID: #12845</div>
                    <div className="text-lg text-gray-900">Anvar Usmanov</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <CheckCircle className="w-6 h-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-900 mb-1">AI Anamnez to'ldirildi</div>
                      <div className="text-xs text-gray-500">50 ta savol, 5 daqiqa</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <CheckCircle className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-900 mb-1">ESC protokol tahlili</div>
                      <div className="text-xs text-gray-500">Kardiovaskulyar xavf: past</div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm text-yellow-900">Qizil bayroqcha</span>
                    </div>
                    <p className="text-xs text-yellow-700">
                      Bemorning oilasida yurak-qon tomir kasalliklari tarixi aniqlandi
                    </p>
                  </div>

                  <div className="pt-4">
                    <div className="text-xs text-gray-500 mb-2">SCORE2 xavf darajasi</div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full w-1/4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"></div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Past (2.3%)</div>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-emerald-500" />
                  <div>
                    <div className="text-xs text-gray-500">HIPAA</div>
                    <div className="text-sm text-gray-900">Compliant</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl text-gray-900 mb-4">Qanday ishlaydi?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Bemor va shifokr o'rtasidagi zamonaviy jarayon
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                step: "Qadam 1",
                title: "Qabuldan oldin",
                desc: "Bemor Telegram yoki saytda so'rovnoma to'ldiradi. Jarayon 3-5 daqiqa davom etadi. Conditional logic orqali faqat zarur savollar beriladi.",
                gradientFrom: "from-emerald-50",
                gradientVia: "via-white",
                gradientTo: "to-blue-50",
                iconBg: "from-emerald-500 to-emerald-600",
                iconShadow: "shadow-emerald-200",
                border: "border-emerald-100",
                badge: "bg-emerald-100 text-emerald-700",
                chevron: "text-emerald-300",
              },
              {
                icon: Activity,
                step: "Qadam 2",
                title: "AI Tahlil",
                desc: "Tizim javoblarni ESC (Kardiologiya), EAU (Urologiya), WHO standartlari bilan solishtiradi va xavf darajasini aniqlaydi.",
                gradientFrom: "from-blue-50",
                gradientVia: "via-white",
                gradientTo: "to-emerald-50",
                iconBg: "from-blue-500 to-blue-600",
                iconShadow: "shadow-blue-200",
                border: "border-blue-100",
                badge: "bg-blue-100 text-blue-700",
                chevron: "text-blue-300",
              },
              {
                icon: Users,
                step: "Qadam 3",
                title: "Shifokrga hisobot",
                desc: "Doktor bemor kirishidan oldin uning \"qizil bayroqchalari\" va xavf darajasini ko'radi. Tayyor tashxis loyihasi va tavsiyalar.",
                gradientFrom: "from-emerald-50",
                gradientVia: "via-white",
                gradientTo: "to-blue-50",
                iconBg: "from-emerald-500 to-blue-500",
                iconShadow: "shadow-emerald-200",
                border: "border-emerald-100",
                badge: "bg-emerald-100 text-emerald-700",
                chevron: null,
              },
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-blue-400 rounded-3xl opacity-0 group-hover:opacity-10 blur-2xl transition-opacity"></div>
                <div
                  className={`relative bg-gradient-to-br ${item.gradientFrom} ${item.gradientVia} ${item.gradientTo} rounded-3xl p-8 border ${item.border} h-full hover:shadow-xl transition-all`}
                >
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${item.iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-lg ${item.iconShadow}`}
                  >
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className={`inline-block px-3 py-1 ${item.badge} rounded-full text-xs mb-4`}>
                    {item.step}
                  </div>
                  <h3 className="text-xl text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
                {item.chevron && (
                  <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                    <ChevronRight className={`w-8 h-8 ${item.chevron}`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl text-gray-900 mb-4">Funksional imkoniyatlar</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Zamonaviy texnologiya va tibbiy standartlarning uyg'unligi
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Globe,
                title: "Halqaro Protokollar",
                desc: "ESC, EAU, WHO standartlariga asoslangan 10+ yo'nalish",
                gradient: featureGradients.emerald,
              },
              {
                icon: Activity,
                title: "AI-Assistent",
                desc: "Bemor javoblarini inson tiliga o'girib, qisqa xulosa beradi",
                gradient: featureGradients.blue,
              },
              {
                icon: BarChart3,
                title: "Xavflarni baholash",
                desc: "SCORE2 va NYHA kabi shkalalarni avtomatik hisoblash",
                gradient: featureGradients.purple,
              },
              {
                icon: Zap,
                title: "Integratsiya",
                desc: "Mavjud CRM va MIS tizimlar bilan API orqali bog'lanish",
                gradient: featureGradients.orange,
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all"
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Additional Features */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              {
                icon: CheckCircle,
                title: "Conditional Logic",
                desc: "Javobga qarab keyingi savollar avtomatik tanlanadi",
                iconClass: featureIconColors.green,
              },
              {
                icon: Clock,
                title: "Vaqtni tejash",
                desc: "Har bir bemor uchun 10 daqiqa tejab, kuniga 3x ko'p qabul",
                iconClass: featureIconColors.blue,
              },
              {
                icon: FileText,
                title: "Tayyor hisobotlar",
                desc: "1 paragrafdagi xulosa va asosiy ko'rsatkichlar",
                iconClass: featureIconColors.purple,
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all"
              >
                <feature.icon className={`w-10 h-10 ${feature.iconClass} mb-3`} />
                <h4 className="text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl text-gray-900 mb-6">
                Xavfsizlik va{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">
                  ishonch
                </span>
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Tibbiy ma'lumotlar juda nozik. Shuning uchun biz halqaro standartlarni qat'iy
                rioya qilamiz.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: Lock,
                    title: "End-to-End Encryption",
                    desc: "Barcha ma'lumotlar shifrlangan holda saqlanadi va uzatiladi. Hatto bizning serverlarimiz ham ochiq matnni ko'rmaydi.",
                    bgGradient: securityBgColors.emerald,
                    iconColor: securityIconColors.emerald,
                  },
                  {
                    icon: Shield,
                    title: "HIPAA/GDPR Compliance",
                    desc: "Halqaro ma'lumotlarni saqlash standartlariga to'liq moslik. Muntazam audit va sertifikatlash.",
                    bgGradient: securityBgColors.blue,
                    iconColor: securityIconColors.blue,
                  },
                  {
                    icon: Users,
                    title: "Role-based Access",
                    desc: "Har bir foydalanuvchi faqat o'z vakolati doirasidagi ma'lumotlarni ko'radi. Barcha harakatlar loglanadi.",
                    bgGradient: securityBgColors.purple,
                    iconColor: securityIconColors.purple,
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${item.bgGradient} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}
                    >
                      <item.icon className={`w-7 h-7 ${item.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-lg text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-blue-400 rounded-3xl opacity-10 blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-emerald-50 to-blue-50 rounded-3xl p-8 border border-emerald-100">
                <h3 className="text-xl text-gray-900 mb-6">Sertifikatlar va standartlar</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Shield, label: "HIPAA", status: "Compliant", colorClass: certIconColors.emerald },
                    { icon: Shield, label: "GDPR", status: "Compliant", colorClass: certIconColors.blue },
                    { icon: Lock, label: "SSL/TLS", status: "256-bit", colorClass: certIconColors.purple },
                    { icon: Globe, label: "ISO 27001", status: "Certified", colorClass: certIconColors.orange },
                  ].map((cert, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl p-4 border border-gray-100 text-center hover:shadow-lg transition-all group"
                    >
                      <cert.icon
                        className={`w-12 h-12 ${cert.colorClass} mx-auto mb-2 group-hover:scale-110 transition-transform`}
                      />
                      <div className="text-sm text-gray-900">{cert.label}</div>
                      <div className="text-xs text-gray-500">{cert.status}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-white rounded-2xl border border-emerald-200">
                  <p className="text-sm text-gray-700">
                    <strong className="text-emerald-600">Ma'lumot:</strong> Barcha tibbiy ma'lumotlar
                    Evropa serverlarida saqlanadi va hech qachon uchinchi tomonlarga berilmaydi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-blue-600"></div>
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 10 0 L 0 0 0 10' fill='none' stroke='white' stroke-width='0.5' opacity='0.1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
          }}
        ></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl text-white mb-6">
            Kliniкangizni bugun raqamlashtirishni boshlang
          </h2>
          <p className="text-lg sm:text-xl text-emerald-50 mb-8">
            Bepul demo versiya bilan tanishing yoki shifokr dashboardini ko'ring
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/questionnaire"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-600 rounded-2xl hover:bg-gray-50 transition-all shadow-2xl hover:-translate-y-1"
            >
              Demo versiyani sinab ko'ring
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/analytics"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-700 text-white border-2 border-white/20 rounded-2xl hover:bg-emerald-600 transition-all"
            >
              Analytics ko'rish
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg text-white">Shifokor-LDA</span>
              </div>
              <p className="text-sm text-gray-400">AI-asoslangan tibbiy skrening va anamnez tizimi</p>
            </div>

            <div>
              <h4 className="text-white mb-4">Mahsulot</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="hover:text-emerald-400 transition-colors">
                    Imkoniyatlar
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">
                    Qanday ishlaydi
                  </a>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-emerald-400 transition-colors">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white mb-4">Kompaniya</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    Biz haqimizda
                  </a>
                </li>
                <li>
                  <a href="#security" className="hover:text-emerald-400 transition-colors">
                    Xavfsizlik
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    Aloqa
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white mb-4">Hujjatlar</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    Maxfiylik siyosati
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    Foydalanish shartlari
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    API Documentation
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2026 Shifokor-LDA. Barcha huquqlar himoyalangan.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
