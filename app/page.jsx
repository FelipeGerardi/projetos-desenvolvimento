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
import { Power, NotepadText, Shield, Settings, Trash } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [projetos, setProjetos] = useState([]);
  const [busca, setBusca] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);

  // novo: modal de descrição
  const [descOpen, setDescOpen] = useState(false);
  const [descData, setDescData] = useState({ title: "", text: "" });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.replace("/login");
      setUser(u);
    });
    return () => unsub();
  }, [router]);

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
      [p.nome, p.url, p.url_admin, p.descricao].some((v) =>
        (v || "").toLowerCase().includes(t)
      )
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

  // CREATE / UPDATE — agora inclui descricao
  async function submitProject(data, id) {
    if (id) {
      await updateDoc(doc(db, "projetos", id), {
        nome: data.nome,
        url: data.url,
        url_admin: data.url_admin,
        descricao: data.descricao,
        updated_at: serverTimestamp(),
      });
    } else {
      await addDoc(collection(db, "projetos"), {
        nome: data.nome,
        url: data.url,
        url_admin: data.url_admin,
        descricao: data.descricao,
        created_at: serverTimestamp(),
      });
    }
  }

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
          placeholder="Buscar por nome, URL ou descrição…"
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Projetos CHP" right={rightActions} />

      <main className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        {filtrados.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
            Nenhum projeto encontrado.
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtrados.map((p) => {
            const mainURL = safeURL(p.url);
            const adminURL = safeURL(p.url_admin);

            return (
              <div
                key={p.id}
                className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg overflow-hidden"
              >
                <div className="flex items-start justify-between p-4 border-b border-slate-200 bg-slate-50">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-slate-800 truncate">
                      {p.nome || "(sem nome)"}
                    </h2>
                    <a href={p.url} target="_blank" className="text-xs text-slate-500 truncate max-w-[24rem] cursor-pointer">
                      {p.url}
                    </a>
                  </div>
                </div>

                <div className="aspect-[16/10] bg-slate-100">
                  {mainURL ? (
                    <iframe
                      src={mainURL}
                      title={p.nome || "projeto"}
                      className="w-full h-full"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-full grid place-items-center text-sm text-slate-500 p-4">
                      URL inválida ou não informada
                    </div>
                  )}
                </div>

                <div className="flex flex-row items-center justify-around gap-2 p-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setDescData({
                          title: p.nome || "Descrição",
                          text: p.descricao || "",
                        });
                        setDescOpen(true);
                      }}
                      className="flex flex-row gap-1 rounded-lg bg-blue-600 text-white text-xs px-3 py-2 hover:bg-blue-700 cursor-pointer"
                      title="Ver descrição"
                    >
                      <NotepadText size={14} /> Descrição
                    </button>
                    {adminURL && (
                      <a
                        href={adminURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-row gap-1 rounded-lg bg-slate-800 text-white text-xs px-3 py-2 hover:bg-slate-700"
                        title="Abrir admin"
                      >
                        <Shield size={14} /> Admin
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditing(p);
                        setOpenModal(true);
                      }}
                      className="flex flex-row gap-1 rounded-lg bg-slate-200 text-slate-800 text-xs px-3 py-2 hover:bg-slate-300 cursor-pointer"
                      title="Editar"
                    >
                      <Settings size={14} /> Editar
                    </button>
                    <button
                      onClick={() => removeProject(p.id, p.nome)}
                      className="flex flex-row gap-1 rounded-lg bg-red-600 text-white text-xs px-3 py-2 hover:brightness-95 cursor-pointer"
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