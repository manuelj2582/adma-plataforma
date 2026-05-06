"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage({ type: "err", text: error.message });
    } else {
      setMessage({
        type: "ok",
        text: "Listo. Revisa tu correo para entrar al sistema.",
      });
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm bg-card border rounded-lg p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-medium tracking-tight">ADMA Plataforma</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sistema de gestión de producción
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@adma.cl"
              className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Recibir link de acceso"}
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-3 rounded-md text-sm ${
              message.type === "ok"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center mt-6">
          Te enviaremos un link al correo para entrar sin contraseña.
        </p>
      </div>
    </div>
  );
}
