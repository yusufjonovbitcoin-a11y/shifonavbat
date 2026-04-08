import { Link } from "react-router";
import { Heart, FileQuestion } from "lucide-react";

export function NotFoundPage() {
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
        <div className="w-full max-w-md text-center">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 items-center justify-center mb-6">
            <FileQuestion className="w-8 h-8 text-emerald-700" aria-hidden />
          </div>
          <h1 className="text-2xl text-gray-900 tracking-tight">404 — Sahifa topilmadi</h1>
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">
            Ushbu havola noto‘g‘ri yoki sahifa olib tashlangan. Bosh sahifadan kirish yoki skrining boshidan foydalaning.
          </p>
          <Link
            to="/"
            className="inline-block mt-8 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm shadow-lg shadow-emerald-200/80 hover:from-emerald-600 hover:to-emerald-700 transition-all"
          >
            Bosh sahifa
          </Link>
        </div>
      </main>
    </div>
  );
}
