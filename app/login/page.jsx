"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import Header from "@/components/Header";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) router.replace("/");
    });
    return () => unsub();
  }, [router]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), senha);
      router.replace("/");
    } catch (err) {
      setMsg(err.message || "Falha no login");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp() {
    setLoading(true);
    setMsg("");
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), senha);
      router.replace("/");
    } catch (err) {
      setMsg(err.message || "Falha ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Projetos CHP — Acesso" />
      <main className="mx-auto max-w-7xl px-4">
        <div className="grid min-h-[70vh] place-items-center">
          <form
            onSubmit={handleLogin}
            className="flex flex-col itens-center justify-center w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200 p-6 md:p-8"
          >
            <h1 className="text-2xl font-semibold text-slate-800">
              Acesse sua conta
            </h1>

            <label className="mt-5 block text-sm font-medium text-slate-700">
              E-mail
            </label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Senha
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-500"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              minLength={6}
              required
            />

            {msg && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {msg}
              </p>
            )}

            <button
              disabled={loading}
              className="mt-5 w-full rounded-lg bg-slate-800 py-2.5 font-medium text-white hover:bg-slate-700 focus:ring-4 focus:ring-slate-200 disabled:opacity-70 cursor-pointer"
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </div>
      </main>
      <footer className="py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Projetos CHP
      </footer>
    </div>
  );
}
