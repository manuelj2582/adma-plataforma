"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Cliente } from "@/types";

interface ClienteFormProps {
  cliente?: Cliente;
}

export function ClienteForm({ cliente }: ClienteFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    nombre: cliente?.nombre ?? "",
    rut: cliente?.rut ?? "",
    contacto_nombre: cliente?.contacto_nombre ?? "",
    contacto_email: cliente?.contacto_email ?? "",
    contacto_telefono: cliente?.contacto_telefono ?? "",
    notas: cliente?.notas ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const payload = {
      ...form,
      rut: form.rut || null,
      contacto_nombre: form.contacto_nombre || null,
      contacto_email: form.contacto_email || null,
      contacto_telefono: form.contacto_telefono || null,
      notas: form.notas || null,
    };

    const { error: dbError } = cliente
      ? await supabase.from("clientes").update(payload).eq("id", cliente.id)
      : await supabase.from("clientes").insert(payload);

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    router.push("/clientes");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Nombre</label>
          <input
            required
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">RUT</label>
          <input
            value={form.rut}
            onChange={(e) => setForm({ ...form, rut: e.target.value })}
            className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="76.xxx.xxx-x"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Contacto</label>
          <input
            value={form.contacto_nombre}
            onChange={(e) => setForm({ ...form, contacto_nombre: e.target.value })}
            className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Teléfono</label>
          <input
            value={form.contacto_telefono}
            onChange={(e) => setForm({ ...form, contacto_telefono: e.target.value })}
            className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Email contacto</label>
        <input
          type="email"
          value={form.contacto_email}
          onChange={(e) => setForm({ ...form, contacto_email: e.target.value })}
          className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Notas</label>
        <textarea
          rows={3}
          value={form.notas}
          onChange={(e) => setForm({ ...form, notas: e.target.value })}
          className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded-md">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Guardando..." : cliente ? "Guardar cambios" : "Crear cliente"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
