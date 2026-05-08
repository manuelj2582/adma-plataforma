"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FormSection, Field } from "@/components/form-section";
import type { Insumo, CategoriaInsumo, Proveedor } from "@/types";

interface InsumoFormProps {
  insumo?: Insumo;
  categorias: CategoriaInsumo[];
  proveedores: Proveedor[];
}

export function InsumoForm({ insumo, categorias, proveedores }: InsumoFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    codigo: insumo?.codigo ?? "",
    nombre: insumo?.nombre ?? "",
    categoria_id: insumo?.categoria_id ?? "",
    unidad_medida: insumo?.unidad_medida ?? "kg",
    proveedor_principal_id: insumo?.proveedor_principal_id ?? "",
    stock_actual: insumo?.stock_actual ?? 0,
    stock_minimo: insumo?.stock_minimo ?? 0,
    notas: insumo?.notas ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const payload = {
      ...form,
      categoria_id: form.categoria_id || null,
      proveedor_principal_id: form.proveedor_principal_id || null,
      notas: form.notas || null,
    };

    const { error: dbError } = insumo
      ? await supabase.from("insumos").update(payload).eq("id", insumo.id)
      : await supabase.from("insumos").insert(payload);

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    router.push("/insumos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="card-padded">
        <FormSection
          title="Identificación"
          description="Código único interno y nombre del insumo."
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Código" required>
              <input
                required
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                className="w-full font-mono"
                placeholder="INS-001"
              />
            </Field>
            <Field label="Unidad de medida" required>
              <select
                value={form.unidad_medida}
                onChange={(e) => setForm({ ...form, unidad_medida: e.target.value })}
                className="w-full"
              >
                <option value="kg">Kilogramos (kg)</option>
                <option value="g">Gramos (g)</option>
                <option value="L">Litros (L)</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="u">Unidades (u)</option>
              </select>
            </Field>
          </div>

          <Field label="Nombre" required>
            <input
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full"
              placeholder="Glicerina USP"
            />
          </Field>
        </FormSection>

        <FormSection
          title="Clasificación"
          description="Categoría y proveedor habitual de este insumo."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Categoría">
              <select
                value={form.categoria_id}
                onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
                className="w-full"
              >
                <option value="">Sin categoría</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Proveedor principal">
              <select
                value={form.proveedor_principal_id}
                onChange={(e) =>
                  setForm({ ...form, proveedor_principal_id: e.target.value })
                }
                className="w-full"
              >
                <option value="">Sin proveedor</option>
                {proveedores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </FormSection>

        <FormSection
          title="Inventario"
          description="Stock actual en bodega y nivel mínimo para alertar reposición."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Stock actual" hint={`En ${form.unidad_medida}`}>
              <input
                type="number"
                step="0.0001"
                min="0"
                value={form.stock_actual}
                onChange={(e) =>
                  setForm({ ...form, stock_actual: parseFloat(e.target.value) || 0 })
                }
                className="w-full font-mono tabular-nums text-right"
              />
            </Field>
            <Field
              label="Stock mínimo"
              hint="El sistema marcará el insumo como bajo stock al cruzar este nivel"
            >
              <input
                type="number"
                step="0.0001"
                min="0"
                value={form.stock_minimo}
                onChange={(e) =>
                  setForm({ ...form, stock_minimo: parseFloat(e.target.value) || 0 })
                }
                className="w-full font-mono tabular-nums text-right"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Notas" description="Información adicional sobre el insumo.">
          <textarea
            rows={3}
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
            className="w-full resize-none"
            placeholder="Observaciones, alternativas, condiciones de almacenamiento..."
          />
        </FormSection>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-danger-bg border border-danger-line text-danger-fg text-sm rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Guardando..." : insumo ? "Guardar cambios" : "Crear insumo"}
        </button>
      </div>
    </form>
  );
}
