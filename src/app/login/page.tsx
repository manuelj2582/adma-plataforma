"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: dbError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (dbError) {
      setError(dbError.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex bg-paper">
      {/* Panel izquierdo decorativo */}
      <div className="hidden lg:flex flex-1 relative bg-olive-900 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-olive-800/0 via-olive-900/40 to-olive-900"></div>

        {/* Marca de agua tipográfica */}
        <div className="absolute -bottom-32 -right-12 select-none pointer-events-none">
          <span className="font-display text-[28rem] leading-none text-olive-700/30 tracking-tightest">
            A
          </span>
        </div>

        {/* Contenido del panel */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-paper">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded bg-paper text-olive-900 flex items-center justify-center font-display text-xl leading-none pb-0.5">
              a
            </div>
            <span className="font-medium tracking-tight">ADMA</span>
          </div>

          <div className="max-w-md">
            <p className="font-display text-5xl leading-[1.05] tracking-tightest text-balance">
              Producir con datos,<br />
              <em className="text-olive-200">no con suposiciones.</em>
            </p>
            <p className="mt-6 text-olive-200/80 text-sm leading-relaxed">
              Plataforma de gestión de producción · Chile
            </p>
          </div>

          <div className="text-xs text-olive-300/60 font-mono">
            v1.0 · adma-plataforma
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="lg:hidden flex items-center gap-2.5 mb-12">
            <div className="h-7 w-7 rounded bg-ink text-paper flex items-center justify-center font-display text-xl leading-none pb-0.5">
              a
            </div>
            <span className="font-medium tracking-tight">ADMA</span>
          </div>

          {!sent ? (
            <>
              <h1 className="text-3xl text-ink mb-2">Bienvenido</h1>
              <p className="text-ink-mute text-sm mb-8 leading-relaxed">
                Ingresa tu correo y te enviaremos un enlace de acceso. Sin contraseñas.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="section-label block mb-2">Correo electrónico</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@adma.cl"
                    className="w-full"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="btn-primary w-full"
                >
                  {loading ? (
                    "Enviando..."
                  ) : (
                    <>
                      Recibir enlace de acceso
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                {error && (
                  <div className="p-3 bg-danger-bg border border-danger-line text-danger-fg text-sm rounded-md">
                    {error}
                  </div>
                )}
              </form>

              <p className="mt-12 pt-8 border-t border-paper-edge text-xs text-ink-subtle leading-relaxed">
                Al ingresar aceptas las políticas internas de uso del sistema. Tu sesión es
                personal y queda registrada.
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-success-bg flex items-center justify-center mb-6">
                <CheckCircle2 className="h-6 w-6 text-success-fg" />
              </div>
              <h1 className="text-3xl text-ink mb-2">Revisa tu correo</h1>
              <p className="text-ink-mute text-sm leading-relaxed">
                Te enviamos un enlace de acceso a <strong className="text-ink">{email}</strong>.
                Haz clic en el enlace para entrar al sistema.
              </p>
              <p className="mt-8 text-xs text-ink-subtle">
                Si no llega en unos minutos, revisa tu carpeta de spam.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
