"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FormSection, Field } from "@/components/form-section";
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
    <form onSubmit={handleSubmit}>
      <div className="card-padded">
        <FormSection title="Empresa" description="Datos legales del proveedor.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nombre" required>
              <input
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full"
                placeholder="Quimanic SA"
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

        <FormSection title="Contacto" description="Persona o email principal de contacto.">
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

        <FormSection
          title="Operación"
          description="Tiempo típico de respuesta del proveedor desde OC hasta entrega."
        >
          <Field label="Lead time típico" hint="Días promedio que demora una compra a este proveedor">
            <div className="relative max-w-[200px]">
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
                className="w-full pr-12 font-mono tabular-nums text-right"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute text-sm pointer-events-none">
                días
              </span>
            </div>
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
          {loading ? "Guardando..." : proveedor ? "Guardar cambios" : "Crear proveedor"}
        </button>
      </div>
    </form>
  );
}
