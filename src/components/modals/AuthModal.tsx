"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/context/AppContext";

type Step = "form" | "verify";

export function AuthModal() {
  const { authModalOpen, setAuthModalOpen, showToast, refreshProfile } = useApp();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [step, setStep] = useState<Step>("form");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!authModalOpen) return null;

  function close() {
    setAuthModalOpen(false);
    setStep("form");
    setError("");
    setUsername("");
    setEmail("");
    setPassword("");
    setCode("");
  }

  async function submit() {
    setError("");
    setSubmitting(true);
    const supabase = createClient();
    if (mode === "register") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username || email.split("@")[0] } },
      });
      setSubmitting(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      setStep("verify");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    await refreshProfile();
    close();
  }

  async function submitVerify() {
    setError("");
    setSubmitting(true);
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "signup",
    });
    setSubmitting(false);
    if (verifyError) {
      setError(verifyError.message);
      return;
    }
    showToast("Correo verificado. ¡Bienvenido!");
    await refreshProfile();
    close();
  }

  async function googleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4">
      <div className="my-auto max-h-[90vh] w-80 overflow-y-auto rounded-xl border border-white/12 bg-[#0d0d0d] p-[26px]">
        {step === "form" ? (
          <>
            <div className="mb-[18px] flex gap-[18px] border-b border-white/10">
              <button
                onClick={() => setMode("login")}
                className={`border-b-2 pb-[10px] text-[13.5px] font-semibold ${
                  mode === "login" ? "border-white text-white" : "border-transparent text-[#808080]"
                }`}
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => setMode("register")}
                className={`border-b-2 pb-[10px] text-[13.5px] font-semibold ${
                  mode === "register" ? "border-white text-white" : "border-transparent text-[#808080]"
                }`}
              >
                Registrarse
              </button>
            </div>

            <button
              onClick={googleLogin}
              className="mb-4 flex w-full items-center justify-center gap-[10px] rounded-[7px] border border-black/10 bg-white py-[10px] text-[13.5px] font-semibold text-[#1f1f1f] hover:bg-[#f2f2f2]"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.94v2.33A9 9 0 0 0 9 18z" />
                <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.96H.94A9 9 0 0 0 0 9c0 1.45.35 2.83.94 4.04l3.01-2.34z" />
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .94 4.96l3.01 2.34C4.66 5.17 6.65 3.58 9 3.58z" />
              </svg>
              Continuar con Google
            </button>

            {mode === "register" && (
              <>
                <div className="mb-1.5 text-[11.5px] text-[#808080]">Nombre de usuario</div>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tu nombre"
                  className="mb-3 w-full rounded-[7px] border border-white/15 bg-[#181818] px-3 py-2.5 text-[13.5px] text-white outline-none"
                />
              </>
            )}

            <div className="mb-1.5 text-[11.5px] text-[#808080]">Correo</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="mb-3 w-full rounded-[7px] border border-white/15 bg-[#181818] px-3 py-2.5 text-[13.5px] text-white outline-none"
            />

            <div className="mb-1.5 text-[11.5px] text-[#808080]">Contraseña</div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mb-2 w-full rounded-[7px] border border-white/15 bg-[#181818] px-3 py-2.5 text-[13.5px] text-white outline-none"
            />

            {error && <div className="mb-2 text-[12.5px] text-[#f06a6a]">{error}</div>}

            <div className="mt-2 flex gap-2">
              <button
                onClick={close}
                className="flex-1 rounded-[7px] border border-white/12 bg-[#181818] py-2.5 text-[13px] text-[#c0c0c0]"
              >
                Cancelar
              </button>
              <button
                onClick={submit}
                disabled={submitting}
                className="flex-1 rounded-[7px] bg-white py-2.5 text-[13px] font-bold text-black disabled:opacity-50"
              >
                {mode === "login" ? "Entrar" : "Registrarse"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-2 text-[15px] font-semibold text-[#f0f0f0]">Verificá tu correo</div>
            <div className="mb-4 text-[12.5px] text-[#a0a0a0]">
              Te enviamos un código de 6 dígitos a <span className="text-[#e0e0e0]">{email}</span>. Ingresalo para
              activar tu cuenta.
            </div>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Código de 6 dígitos"
              maxLength={6}
              className="mb-2 w-full rounded-[7px] border border-white/15 bg-[#181818] px-3 py-2.5 text-center text-[13.5px] tracking-[2px] text-white outline-none"
            />
            {error && <div className="mb-2 text-[12.5px] text-[#f06a6a]">{error}</div>}
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => setStep("form")}
                className="flex-1 rounded-[7px] border border-white/12 bg-[#181818] py-2.5 text-[13px] text-[#c0c0c0]"
              >
                Volver
              </button>
              <button
                onClick={submitVerify}
                disabled={submitting || code.length !== 6}
                className="flex-1 rounded-[7px] bg-white py-2.5 text-[13px] font-bold text-black disabled:opacity-50"
              >
                Verificar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
