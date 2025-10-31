"use client";

import { useEffect, useRef, useState } from "react";

const GRUPOS = [
  "Chiaperini",
  "Techto",
  "Mercadão Lojista",
  "Desenvolvimento",
  "Todos",
];

export default function ProjectFormModal({
  open,
  onClose,
  onSubmit,              // (data, id?) => Promise<void>
  initialData = null,    // { id?, nome, url, url_admin, descricao?, grupo? }
}) {
  const dialogRef = useRef(null);
  const [nome, setNome] = useState("");
  const [url, setUrl] = useState("");
  const [urlAdmin, setUrlAdmin] = useState("");
  const [descricao, setDescricao] = useState("");
  const [grupo, setGrupo] = useState("Todos");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) return;
    setErr("");
    setLoading(false);
    setNome(initialData?.nome ?? "");
    setUrl(initialData?.url ?? "");
    setUrlAdmin(initialData?.url_admin ?? "");
    setDescricao(initialData?.descricao ?? "");
    setGrupo(initialData?.grupo ?? "Todos");
    setTimeout(() => dialogRef.current?.focus(), 10);
  }, [open, initialData]);

  function normalizeURL(u) {
    if (!u) return "";
    try {
      const hasProto = /^https?:\/\//i.test(u);
      const final = hasProto ? u : `https://${u}`;
      return new URL(final).href;
    } catch {
      return u;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");

    const payload = {
      nome: nome.trim(),
      url: normalizeURL(url.trim()),
      url_admin: normalizeURL(urlAdmin.trim()),
      descricao: descricao.trim(),
      grupo: grupo || "Todos",
    };

    if (!payload.nome) return setErr("Informe o nome do projeto.");
    try {
      if (payload.url) new URL(payload.url);
      if (payload.url_admin) new URL(payload.url_admin);
    } catch {
      return setErr("URL inválida. Use algo como https://dominio.com");
    }

    try {
      setLoading(true);
      await onSubmit(payload, initialData?.id);
      onClose();
    } catch (e) {
      setErr(e?.message || "Falha ao salvar.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-lg bg-white rounded-2xl p-5 shadow-xl"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">
            {initialData?.id ? "Editar projeto" : "Novo projeto"}
          </h2>
          <button
            className="px-3 py-1 rounded-lg text-sm bg-neutral-100"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Nome</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">URL principal</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                value={url}
                placeholder="https://meu-projeto.com"
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">URL admin</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                value={urlAdmin}
                placeholder="https://meu-projeto.com/admin"
                onChange={(e) => setUrlAdmin(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Grupo</label>
            <select
              className="w-full border rounded-lg px-3 py-2 bg-white"
              value={grupo}
              onChange={(e) => setGrupo(e.target.value)}
            >
              {GRUPOS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Descrição</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 min-h-[120px]"
              value={descricao}
              placeholder="Breve descrição do projeto, stack, objetivo, links úteis..."
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}

          <button
            disabled={loading}
            className="w-full rounded-lg py-2 font-medium bg-slate-900 text-white"
          >
            {loading
              ? "Salvando…"
              : initialData?.id
              ? "Salvar alterações"
              : "Adicionar projeto"}
          </button>
        </form>
      </div>
    </div>
  );
}
