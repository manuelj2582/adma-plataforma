"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2 } from "lucide-react";
import type { Producto, Insumo, FormulaItemConInsumo } from "@/types";

interface FormulaEditorProps {
  producto: Producto;
  formulaActual: {
    id: string;
    version: number;
    vigente_desde: string;
    notas: string | null;
  } | null;
  itemsActuales: FormulaItemConInsumo[];
  insumosDisponibles: Insumo[];
}

interface ItemEditable {
  insumo_id: string;
  cantidad_por_unidad: number;
  notas: string;
}

export function FormulaEditor({
  producto,
  formulaActual,
  itemsActuales,
  insumosDisponibles,
}: FormulaEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notas, setNotas] = useState(formulaActual?.notas ?? "");

  const [items, setItems] = useState<ItemEditable[]>(
    itemsActuales.map((it) => ({
      insumo_id: it.insumo_id,
      cantidad_por_unidad: Number(it.cantidad_por_unidad),
      notas: it.notas ?? "",
    }))
  );

  function agregarInsumo() {
    const yaUsados = new Set(items.map((i) => i.insumo_id));
    const primerLibre = insumosDisponibles.find((i) => !yaUsados.has(i.id));
    if (!primerLibre) {
      setError("Ya agregaste todos los insumos disponibles.");
      return;
    }
    setItems([
      ...items,
      { insumo_id: primerLibre.id, cantidad_por_unidad: 0, notas: "" },
    ]);
    setError(null);
  }

  function eliminarItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx));
  }

  function actualizarItem(idx: number, campo: keyof ItemEditable, valor: string | number) {
    const nuevos = [...items];
    nuevos[idx] = { ...nuevos[idx], [campo]: valor };
    setItems(nuevos);
  }

  async function handleGuardar() {
    if (items.length === 0) {
      setError("La fórmula debe tener al menos un insumo.");
      return;
    }

    // Validar que no haya insumos duplicados
    const ids = items.map((i) => i.insumo_id);
    if (new Set(ids).size !== ids.length) {
      setError("Hay insumos duplicados. Cada insumo debe aparecer solo una vez.");
      return;
    }

    // Validar cantidades positivas
    if (items.some((i) => i.cantidad_por_unidad <= 0)) {
      setError("Todas las cantidades deben ser mayores a 0.");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();

    // Si ya hay fórmula vigente, cerrarla (poner vigente_hasta = now)
    if (formulaActual) {
      const { error: closeError } = await supabase
        .from("formulas")
        .update({ vigente_hasta: new Date().toISOString() })
        .eq("id", formulaActual.id);

      if (closeError) {
        setError(closeError.message);
        setLoading(false);
        return;
      }
    }

    // Crear nueva versión
    const nuevaVersion = (formulaActual?.version ?? 0) + 1;
    const { data: nuevaFormula, error: insertError } = await supabase
      .from("formulas")
      .insert({
        producto_id: producto.id,
        version: nuevaVersion,
        notas: notas || null,
      })
      .select()
      .single();

    if (insertError || !nuevaFormula) {
      setError(insertError?.message ?? "Error creando fórmula");
      setLoading(false);
      return;
    }

    // Insertar items de la fórmula
    const { error: itemsError } = await supabase.from("formula_items").insert(
      items.map((it) => ({
        formula_id: nuevaFormula.id,
        insumo_id: it.insumo_id,
        cantidad_por_unidad: it.cantidad_por_unidad,
        notas: it.notas || null,
      }))
    );

    if (itemsError) {
      setError(itemsError.message);
      setLoading(false);
      return;
    }

    router.push("/formulas");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="bg-muted/30 border rounded-lg p-4">
        <p className="text-sm">
          <span className="font-medium">{producto.nombre}</span>
          {producto.presentacion && (
            <span className="text-muted-foreground"> · {producto.presentacion}</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Las cantidades son <strong>por unidad de producto</strong>. La merma del{" "}
          {(Number(producto.factor_merma) * 100).toFixed(1)}% se aplica automáticamente
          al simular o crear pedidos.
        </p>
        {formulaActual && (
          <p className="text-xs text-muted-foreground mt-2">
            Editando versión {formulaActual.version}. Al guardar se creará la
            versión {formulaActual.version + 1} y la actual quedará en histórico.
          </p>
        )}
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-medium text-sm">Insumos de la fórmula</h3>
          <button
            type="button"
            onClick={agregarInsumo}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar insumo
          </button>
        </div>

        {items.length === 0 ? (
          <div className="px-4 py-12 text-center text-muted-foreground text-sm">
            La fórmula no tiene insumos. Agrega el primero.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Insumo</th>
                <th className="text-right px-4 py-2 font-medium">Cantidad por unidad</th>
                <th className="text-left px-4 py-2 font-medium">Notas</th>
                <th className="px-4 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item, idx) => {
                const insumo = insumosDisponibles.find((i) => i.id === item.insumo_id);
                return (
                  <tr key={idx}>
                    <td className="px-4 py-2">
                      <select
                        value={item.insumo_id}
                        onChange={(e) =>
                          actualizarItem(idx, "insumo_id", e.target.value)
                        }
                        className="w-full px-2 py-1 text-sm border rounded bg-background"
                      >
                        {insumosDisponibles.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.codigo} · {i.nombre}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="number"
                          step="0.000001"
                          min="0"
                          value={item.cantidad_por_unidad}
                          onChange={(e) =>
                            actualizarItem(
                              idx,
                              "cantidad_por_unidad",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-32 px-2 py-1 text-sm border rounded bg-background text-right tabular-nums"
                        />
                        <span className="text-xs text-muted-foreground w-10">
                          {insumo?.unidad_medida ?? ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={item.notas}
                        onChange={(e) =>
                          actualizarItem(idx, "notas", e.target.value)
                        }
                        placeholder="(opcional)"
                        className="w-full px-2 py-1 text-sm border rounded bg-background"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => eliminarItem(idx)}
                        className="text-muted-foreground hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Notas de esta versión</label>
        <textarea
          rows={2}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="¿Por qué cambias la fórmula? Ej: cambio de proveedor de tensoactivo"
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
          type="button"
          onClick={handleGuardar}
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading
            ? "Guardando..."
            : formulaActual
              ? `Guardar como versión ${formulaActual.version + 1}`
              : "Crear fórmula"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
