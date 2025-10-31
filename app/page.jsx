"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import Header from "@/components/Header";
import ProjectFormModal from "@/components/ProjectFormModal";
import DescriptionModal from "@/components/DescriptionModal";
import { Power, NotepadText, Shield, Settings, Trash, ExternalLink } from "lucide-react";


export default function LandingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [projetos, setProjetos] = useState([]);
  const [busca, setBusca] = useState("");

  const [descOpen, setDescOpen] = useState(false);
  const [descData, setDescData] = useState({ title: "", text: "" });

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);

  // auth guard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.replace("/login");
      setUser(u);
    });
    return () => unsub();
  }, [router]);

  // realtime list
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "projetos"), orderBy("nome"));
    const unsub = onSnapshot(q, (snap) => {
      const arr = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setProjetos(arr);
    });
    return () => unsub();
  }, [user]);

  const filtrados = useMemo(() => {
    const t = busca.trim().toLowerCase();
    if (!t) return projetos;
    return projetos.filter((p) =>
      [p.nome, p.url, p.url_admin, p.descricao, p.grupo]
        .some((v) => (v || "").toLowerCase().includes(t))
    );
  }, [projetos, busca]);

  function safeURL(u) {
    try {
      return new URL(u).href;
    } catch {
      return null;
    }
  }

  async function handleLogout() {
    await signOut(auth);
    router.replace("/login");
  }

  // CREATE / UPDATE  (agora inclui descricao e grupo)
  async function submitProject(data, id) {
    if (id) {
      await updateDoc(doc(db, "projetos", id), {
        nome: data.nome,
        url: data.url,
        url_admin: data.url_admin,
        descricao: data.descricao ?? "",
        grupo: data.grupo ?? "Todos",
        updated_at: serverTimestamp(),
      });
    } else {
      await addDoc(collection(db, "projetos"), {
        nome: data.nome,
        url: data.url,
        url_admin: data.url_admin,
        descricao: data.descricao ?? "",
        grupo: data.grupo ?? "Todos",
        created_at: serverTimestamp(),
      });
    }
  }

  // DELETE
  async function removeProject(id, nome) {
    const ok = window.confirm(
      `Excluir o projeto "${nome || id}"? Essa ação não pode ser desfeita.`
    );
    if (!ok) return;
    await deleteDoc(doc(db, "projetos", id));
  }

  if (!user) return <div className="p-6 text-slate-600">Carregando…</div>;

  const rightActions = (
    <>
      <div className="hidden md:flex items-center gap-2 bg-white/10 rounded-xl px-2 py-1">
        <input
          placeholder="Buscar por nome, URL, grupo ou descrição…"
          className="w-64 md:w-80 bg-transparent placeholder-white/80 text-white outline-none px-2 py-1"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>
      <button
        onClick={() => {
          setEditing(null);
          setOpenModal(true);
        }}
        className="rounded-xl bg-white text-slate-700 font-medium px-3 py-2 hover:shadow cursor-pointer"
      >
        + Adicionar
      </button>
      <div className="hidden sm:block text-white/90 text-sm">
        {user?.email}
      </div>
      <button
        onClick={handleLogout}
        className="rounded-xl bg-slate-500/30 text-red-600 px-3 py-2 border border-slate-700 hover:border-red-600 duration-700 cursor-pointer"
        title="Sair"
      >
        <Power size={16} />
      </button>
    </>
  );

  function getGrupoImage(grupo) {
    switch ((grupo || "").toLowerCase()) {
      case "chiaperini":
        return "/logos/chiaperini.png";
      case "techto":
        return "/logos/techto.png";
      case "mercadão lojista":
      case "mercadao lojista":
        return "/logos/mercadao.png";
      case "desenvolvimento":
        return "/logos/desenvolvimento.png";
      default:
        return "/logos/todos.png";
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Projetos CHP" right={rightActions} />

      <main className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        {filtrados.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
            Nenhum projeto encontrado.
          </div>
        )}
        <div className="flex flex-row justify-start items-center gap-2">
          {(() => {
            const groups = [...new Set(projetos.map((p) => (p.grupo || "Todos")))].sort();
            const selected = groups.includes(busca) ? busca : "Todos";

            return (
              <div className="w-fit rounded-lg mb-4 flex flex-wrap items-center gap-3">
                <label className="text-md text-slate-800">Filtrar por grupo:</label>

                <select
                  value={selected}
                  onChange={(e) => setBusca(e.target.value === "Todos" ? "" : e.target.value)}
                  className="rounded-xl bg-slate-200 text-slate-800 border-1 border-gray-400 px-3 py-2 cursor-pointer"
                >
                  <option value="Todos">Todos</option>
                  {groups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            );
          })()}

          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={(e) => {
                const list = document.getElementById("list");
                if (!list) return;
                const has = list.classList.toggle("grid");
                e.currentTarget.textContent = has ? "Ampliar Itens" : "Reduzir Itens";
              }}
              className="text-sm rounded-xl bg-slate-200 text-slate-800 font-medium p-2 border-1 border-gray-400 cursor-pointer"
              title="Alternar grid"
            >
              {typeof document !== "undefined" && document.getElementById("list")?.classList.contains("grid")
                ? "Ampliar Itens"
                : "Reduzir Itens"
              }
            </button>
          </div>
        </div>

        <div id="list" className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtrados.map((p) => {
            const mainURL = safeURL(p.url);
            const adminURL = safeURL(p.url_admin);

            return (
              <div
                key={p.id}
                className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg overflow-hidden"
              >
                <div className="flex items-start justify-between p-4 border-b border-slate-200 bg-slate-50">
                  <div className="flex flex-row justify-center items-center min-w-0 gap-4">
                    <img
                      src={getGrupoImage(p.grupo)}
                      alt={p.grupo}
                      className="w-fit h-10 object-contain rounded-full bg-slate-100"
                    />
                    <h2 className="font-semibold text-slate-800 truncate">
                      {p.nome || "(sem nome)"}
                    </h2>
                    <a href={p.url} target="_blank" className="text-blue-400">
                      <ExternalLink size={18} />
                    </a>
                  </div>
                </div>

                <div className="aspect-[16/10] bg-slate-100 relative">
                  {mainURL ? (
                    <iframe
                      src={mainURL}
                      title={p.nome || "projeto"}
                      className="absolute inset-0 w-full h-full border-0 overflow-hidden"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      referrerPolicy="no-referrer"
                      scrolling="no"
                    />
                  ) : (
                    <img
                      src={getGrupoImage(p.grupo)}
                      alt={p.grupo}
                      className="w-full h-20 object-contain bg-slate-100"
                    />
                  )}
                </div>

                <div className="flex flex-row items-center justify-start gap-2 p-2">
                  <div className="flex items-start gap-2">
                    <button
                      onClick={() => {
                        setDescData({
                          title: p.nome || "Descrição",
                          text: p.descricao || "",
                        });
                        setDescOpen(true);
                      }}
                      className="flex flex-row gap-1 rounded-lg bg-gray-200 text-slate-800 hover:text-blue-500 text-xs px-3 py-2 cursor-pointer"
                      title="Ver descrição"
                    >
                      <NotepadText size={14} /> Descrição

                    </button>
                    {adminURL && (
                      <a
                        href={adminURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-row gap-1 rounded-lg bg-gray-200 text-slate-800 hover:text-yellow-600 text-xs px-3 py-2 cursor-pointer"
                        title="Abrir admin"
                      >
                        <Shield size={14} /> Admin
                      </a>
                    )}
                  </div>
                  <div className="flex items-start gap-2">
                    <button
                      onClick={() => {
                        setEditing(p);
                        setOpenModal(true);
                      }}
                      className="flex flex-row gap-1 rounded-lg bg-gray-200 text-slate-800 hover:text-green-400 text-xs px-3 py-2 cursor-pointer"
                      title="Editar"
                    >
                      <Settings size={14} /> Editar
                    </button>
                    <button
                      onClick={() => removeProject(p.id, p.nome)}
                      className="flex flex-row gap-1 rounded-lg bg-gray-200 text-slate-800 hover:text-red-600 text-xs px-3 py-2 cursor-pointer"
                      title="Excluir"
                    >
                      <Trash size={14} /> Excluir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <ProjectFormModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={submitProject}
        initialData={
          editing
            ? {
              id: editing.id,
              nome: editing.nome || "",
              url: editing.url || "",
              url_admin: editing.url_admin || "",
              descricao: editing.descricao || "",
              grupo: editing.grupo || "Todos",
            }
            : null
        }
      />
      <DescriptionModal
        open={descOpen}
        onClose={() => setDescOpen(false)}
        title={descData.title}
        text={descData.text}
      />
    </div>
  );
}
