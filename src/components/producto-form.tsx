"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FormSection, Field } from "@/components/form-section";
import type { Producto } from "@/types";

interface ProductoFormProps {
  producto?: Producto;
}

export function ProductoForm({ producto }: ProductoFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    codigo: producto?.codigo ?? "",
    nombre: producto?.nombre ?? "",
    presentacion: producto?.presentacion ?? "",
    factor_merma: producto ? Number(producto.factor_merma) * 100 : 3,
    lead_time_produccion_dias: producto?.lead_time_produccion_dias ?? 4,
    notas: producto?.notas ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const payload = {
      codigo: form.codigo,
      nombre: form.nombre,
      presentacion: form.presentacion || null,
      factor_merma: form.factor_merma / 100,
      lead_time_produccion_dias: form.lead_time_produccion_dias,
      notas: form.notas || null,
    };

    const { error: dbError } = producto
      ? await supabase.from("productos").update(payload).eq("id", producto.id)
      : await supabase.from("productos").insert(payload);

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    router.push("/productos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="card-padded">
        <FormSection
          title="Identificación"
          description="Código único interno y nombre del producto terminado."
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Código" required>
              <input
                required
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                className="w-full font-mono"
                placeholder="PROD-001"
              />
            </Field>
            <Field label="Presentación">
              <input
                value={form.presentacion}
                onChange={(e) => setForm({ ...form, presentacion: e.target.value })}
                className="w-full"
                placeholder="250ml"
              />
            </Field>
          </div>

          <Field label="Nombre" required>
            <input
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full"
              placeholder="Crema hidratante 250ml"
            />
          </Field>
        </FormSection>

        <FormSection
          title="Producción"
          description="Parámetros que aplica el sistema al simular o crear pedidos de este producto."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Factor de merma"
              hint="Insumos extra para compensar pérdidas. Ej: 3% significa producir 1030 para entregar 1000 unidades."
            >
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="20"
                  value={form.factor_merma}
                  onChange={(e) =>
                    setForm({ ...form, factor_merma: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full pr-8 font-mono tabular-nums text-right"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute text-sm pointer-events-none">
                  %
                </span>
              </div>
            </Field>
            <Field
              label="Lead time de producción"
              hint="Días que demora producir este producto desde liberación hasta entrega a bodega."
            >
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={form.lead_time_produccion_dias}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      lead_time_produccion_dias: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full pr-12 font-mono tabular-nums text-right"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute text-sm pointer-events-none">
                  días
                </span>
              </div>
            </Field>
          </div>
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
          {loading ? "Guardando..." : producto ? "Guardar cambios" : "Crear producto"}
        </button>
      </div>
    </form>
  );
}
