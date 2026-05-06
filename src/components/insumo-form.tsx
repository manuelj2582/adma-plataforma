"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Código</label>
          <input
            required
            value={form.codigo}
            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
            className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="INS-001"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Unidad de medida</label>
          <select
            value={form.unidad_medida}
            onChange={(e) => setForm({ ...form, unidad_medida: e.target.value })}
            className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="kg">kg (kilogramos)</option>
            <option value="g">g (gramos)</option>
            <option value="L">L (litros)</option>
            <option value="ml">ml (mililitros)</option>
            <option value="u">u (unidades)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Nombre</label>
        <input
          required
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Glicerina USP"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Categoría</label>
          <select
            value={form.categoria_id}
            onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
            className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Sin categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Proveedor principal</label>
          <select
            value={form.proveedor_principal_id}
            onChange={(e) =>
              setForm({ ...form, proveedor_principal_id: e.target.value })
            }
            className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Sin proveedor</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Stock actual</label>
          <input
            type="number"
            step="0.0001"
            value={form.stock_actual}
            onChange={(e) =>
              setForm({ ...form, stock_actual: parseFloat(e.target.value) || 0 })
            }
            className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Stock mínimo</label>
          <input
            type="number"
            step="0.0001"
            value={form.stock_minimo}
            onChange={(e) =>
              setForm({ ...form, stock_minimo: parseFloat(e.target.value) || 0 })
            }
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
          {loading ? "Guardando..." : insumo ? "Guardar cambios" : "Crear insumo"}
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
