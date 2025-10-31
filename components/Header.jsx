"use client";

export default function AppHeader({ down, right }) {
  return (
    <header className="sticky top-0 z-20 w-full border-b bg-gradient-to-r from-slate-700 to-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-3 md:py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img src="/logo-extense.png" className="w-[300px]" />
        </div>
        <div className="flex items-center gap-2">{right}</div>
      </div>
      <div>{down}</div>
    </header>
  );
}
