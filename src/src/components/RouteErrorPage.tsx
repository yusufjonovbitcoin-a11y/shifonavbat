import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import { AlertCircle, Heart } from "lucide-react";

const API_VERCEL_HINT =
  "API so‘rovi Vercelga tushib qolgan bo‘lishi mumkin. Vercel → Environment Variables → VITE_API_BASE_URL = Railway URL (https://....up.railway.app), keyin Redeploy.";

export function RouteErrorPage() {
  const error = useRouteError();
  let title = "Kutilmagan xato";
  let description = "Sahifani yangilang yoki bosh sahifaga qayting.";

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = "Sahifa topilmadi";
      description =
        "Bu manzil uchun sahifa yo‘q yoki havola eskirgan. URL ni tekshiring yoki bosh sahifadan davom eting.";
    } else if (error.status === 405) {
      title = "So‘rov usuli ruxsat etilmagan (405)";
      description = API_VERCEL_HINT;
    } else {
      title = `Xato ${error.status}`;
      const data = typeof error.data === "string" ? error.data : error.statusText;
      if (data) description = data;
    }
  } else if (error instanceof Error) {
    description = error.message;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex flex-col">
      <header className="shrink-0 border-b border-emerald-100 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <Heart className="w-6 h-6 text-white" aria-hidden />
          </div>
          <span className="text-lg text-gray-900">ShifokorLDA</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          <div className="relative">
            <div
              className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-amber-400/10 rounded-3xl blur-2xl"
              aria-hidden
            />
            <div className="relative bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-red-100/80 p-8 sm:p-10 text-center">
              <div className="inline-flex w-14 h-14 rounded-2xl bg-red-50 border border-red-100 items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-7 h-7 text-red-600" aria-hidden />
              </div>
              <h1 className="text-xl sm:text-2xl text-gray-900 tracking-tight">{title}</h1>
              <p className="text-sm text-gray-600 mt-3 leading-relaxed whitespace-pre-line">{description}</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-5 py-3 rounded-xl border border-gray-200 text-gray-800 text-sm hover:bg-gray-50 transition-colors"
                >
                  Sahifani yangilash
                </button>
                <Link
                  to="/"
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm text-center shadow-lg shadow-emerald-200/80 hover:from-emerald-600 hover:to-emerald-700 transition-all"
                >
                  Bosh sahifa
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
