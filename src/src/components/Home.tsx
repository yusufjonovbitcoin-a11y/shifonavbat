import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { Lock, Heart } from "lucide-react";
import { apiUrl, setAuthToken } from "../lib/api";

const PROD_API_MISSING =
  import.meta.env.PROD && !(import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim());

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
            password: authPassword.trim(),
          }),
        });
        const data = (await r.json().catch(() => ({}))) as { error?: string; token?: string };
        if (!r.ok) {
          let msg = data.error;
          if (!msg) {
            if (r.status === 405) {
              msg =
                "API Vercelga ketib qolgan (405). Vercel → Environment Variables → VITE_API_BASE_URL = Railway URL (https://....up.railway.app), keyin Redeploy.";
            } else if (r.status === 404) {
              msg =
                "API topilmadi. Vercelda VITE_API_BASE_URL ni Railway backend manziliga qo'ying va qayta deploy qiling.";
            } else if (r.status === 503) {
              msg =
                data.error ||
                "Serverda shifokor login/parol sozlanmagan (DOCTOR_LOGIN, DOCTOR_PASSWORD).";
            } else {
              msg = "Kirish muvaffaqiyatsiz.";
            }
          }
          setAuthError(msg);
          return;
        }
        try {
          if (data.token) setAuthToken(data.token);
        } catch {
          setAuthError("Brauzer xotirasi bloklangan — sessionStorage ruxsat bering.");
          return;
        }
        navigate("/dashboard");
      } catch {
        setAuthError(
          "Serverga ulanib bo'lmadi. Railway ishlayaptimi? Lokal dev: npm run server (3000) + npm run dev (5173)."
        );
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
                {PROD_API_MISSING ? (
                  <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-left text-sm text-amber-950">
                    <strong>API ulangan emas.</strong> Vercel loyihasida{" "}
                    <code className="rounded bg-amber-100/80 px-1">VITE_API_BASE_URL</code> o‘zgaruvchisiga
                    Railway backend URL qo‘ying (masalan{" "}
                    <code className="rounded bg-amber-100/80 px-1 text-xs">https://xxx.up.railway.app</code>
                    ), so‘ng <strong>Redeploy</strong> qiling.
                  </div>
                ) : null}
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
