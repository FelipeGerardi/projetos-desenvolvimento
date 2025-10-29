"use client";

export default function DescriptionModal({ open, onClose, title, text }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{title || "Descrição"}</h3>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg text-sm bg-neutral-100 cursor-pointer"
          >
            Fechar
          </button>
        </div>
        <div className="prose max-w-none text-slate-800 whitespace-pre-wrap">
          {text || "Sem descrição."}
        </div>
      </div>
    </div>
  );
}
