import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { Lock, Heart } from "lucide-react";
import { apiUrl, setAuthToken } from "../lib/api";

export function Home() {
  const navigate = useNavigate();
  const [authLogin, setAuthLogin] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAuthSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError(null);
      setSubmitting(true);
      try {
        const r = await fetch(apiUrl("/api/auth/login"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            login: authLogin.trim(),
            password: authPassword,
          }),
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          setAuthError(data.error || "Kirish muvaffaqiyatsiz.");
          return;
        }
        if (data.token) setAuthToken(data.token);
        navigate("/dashboard");
      } catch {
        setAuthError("Serverga ulanib bo'lmadi. Internet yoki API manzilini tekshiring.");
      } finally {
        setSubmitting(false);
      }
    },
    [navigate, authLogin, authPassword]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-emerald-100 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl text-gray-900 block">ShifokorLDA</span>
                <span className="text-xs text-emerald-600">Shifokor kabineti</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-3xl blur-2xl" aria-hidden />
            <div className="relative bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-emerald-100/80 p-8 sm:p-10">
              <div className="text-center mb-8">
                <div className="inline-flex w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl items-center justify-center shadow-lg shadow-emerald-200/50 mx-auto">
                  <Lock className="w-7 h-7 text-white" aria-hidden />
                </div>
                <h1 className="text-2xl sm:text-3xl text-gray-900 mt-5 tracking-tight">Tizimga kirish</h1>
                <p className="text-sm text-gray-500 mt-2">Shifokor kabineti — ShifokorLDA</p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-5">
                <div>
                  <label htmlFor="auth-login" className="block text-sm text-gray-600 mb-1.5">
                    Email yoki login
                  </label>
                  <input
                    id="auth-login"
                    name="login"
                    type="text"
                    autoComplete="username"
                    value={authLogin}
                    onChange={(e) => {
                      setAuthLogin(e.target.value);
                      setAuthError(null);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                    placeholder="misol@klinika.uz"
                  />
                </div>
                <div>
                  <label htmlFor="auth-password" className="block text-sm text-gray-600 mb-1.5">
                    Parol
                  </label>
                  <input
                    id="auth-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={authPassword}
                    onChange={(e) => {
                      setAuthPassword(e.target.value);
                      setAuthError(null);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                    placeholder="••••••••"
                  />
                </div>
                {authError ? (
                  <p className="text-sm text-red-600 text-center" role="alert">
                    {authError}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-base shadow-lg shadow-emerald-200/80 hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-60"
                >
                  {submitting ? "Kutilmoqda..." : "Kirish"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
