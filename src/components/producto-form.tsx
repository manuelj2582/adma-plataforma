"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Código</label>
          <input
            required
            value={form.codigo}
            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
            className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="PROD-001"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Presentación</label>
          <input
            value={form.presentacion}
            onChange={(e) => setForm({ ...form, presentacion: e.target.value })}
            className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="250ml"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Nombre</label>
        <input
          required
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Crema hidratante 250ml"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Factor de merma (%)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="20"
            value={form.factor_merma}
            onChange={(e) =>
              setForm({ ...form, factor_merma: parseFloat(e.target.value) || 0 })
            }
            className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Insumos extra para compensar pérdidas (ej: 3% = produces 1030 para entregar 1000)
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Lead time producción (días)
          </label>
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
          {loading ? "Guardando..." : producto ? "Guardar cambios" : "Crear producto"}
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
