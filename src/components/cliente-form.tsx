"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FormSection, Field } from "@/components/form-section";
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
    <form onSubmit={handleSubmit}>
      <div className="card-padded">
        <FormSection title="Empresa" description="Datos legales del cliente.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nombre" required>
              <input
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full"
              />
            </Field>
            <Field label="RUT">
              <input
                value={form.rut}
                onChange={(e) => setForm({ ...form, rut: e.target.value })}
                className="w-full font-mono"
                placeholder="76.xxx.xxx-x"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Contacto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nombre del contacto">
              <input
                value={form.contacto_nombre}
                onChange={(e) => setForm({ ...form, contacto_nombre: e.target.value })}
                className="w-full"
              />
            </Field>
            <Field label="Teléfono">
              <input
                value={form.contacto_telefono}
                onChange={(e) =>
                  setForm({ ...form, contacto_telefono: e.target.value })
                }
                className="w-full"
              />
            </Field>
          </div>
          <Field label="Email">
            <input
              type="email"
              value={form.contacto_email}
              onChange={(e) => setForm({ ...form, contacto_email: e.target.value })}
              className="w-full"
            />
          </Field>
        </FormSection>

        <FormSection title="Notas">
          <textarea
            rows={3}
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
            className="w-full resize-none"
          />
        </FormSection>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-danger-bg border border-danger-line text-danger-fg text-sm rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 mt-6">
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Guardando..." : cliente ? "Guardar cambios" : "Crear cliente"}
        </button>
      </div>
    </form>
  );
}
