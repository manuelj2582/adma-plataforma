"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Proveedor } from "@/types";

interface ProveedorFormProps {
  proveedor?: Proveedor;
}

export function ProveedorForm({ proveedor }: ProveedorFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    nombre: proveedor?.nombre ?? "",
    rut: proveedor?.rut ?? "",
    contacto_nombre: proveedor?.contacto_nombre ?? "",
    contacto_email: proveedor?.contacto_email ?? "",
    contacto_telefono: proveedor?.contacto_telefono ?? "",
    lead_time_tipico_dias: proveedor?.lead_time_tipico_dias ?? 7,
    notas: proveedor?.notas ?? "",
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

    const { error: dbError } = proveedor
      ? await supabase.from("proveedores").update(payload).eq("id", proveedor.id)
      : await supabase.from("proveedores").insert(payload);

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    router.push("/proveedores");
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
            placeholder="Quimanic SA"
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
          <label className="block text-sm font-medium mb-1.5">
            Lead time típico (días)
          </label>
          <input
            type="number"
            min="1"
            value={form.lead_time_tipico_dias}
            onChange={(e) =>
              setForm({
                ...form,
                lead_time_tipico_dias: parseInt(e.target.value) || 1,
              })
            }
            className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
          <label className="block text-sm font-medium mb-1.5">Teléfono</label>
          <input
            value={form.contacto_telefono}
            onChange={(e) => setForm({ ...form, contacto_telefono: e.target.value })}
            className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
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
          {loading ? "Guardando..." : proveedor ? "Guardar cambios" : "Crear proveedor"}
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
