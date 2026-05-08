"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, GitBranch, FlaskConical } from "lucide-react";
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

    const ids = items.map((i) => i.insumo_id);
    if (new Set(ids).size !== ids.length) {
      setError("Hay insumos duplicados. Cada insumo debe aparecer solo una vez.");
      return;
    }

    if (items.some((i) => i.cantidad_por_unidad <= 0)) {
      setError("Todas las cantidades deben ser mayores a 0.");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();

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
      {/* Banner del producto + versión */}
      <div className="card-padded bg-paper-warm/40 border-paper-line">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-md bg-paper-card border border-paper-edge flex items-center justify-center shrink-0">
            <FlaskConical className="h-4 w-4 text-olive-700" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-ink">{producto.nombre}</h3>
              {producto.presentacion && (
                <span className="text-sm text-ink-mute">· {producto.presentacion}</span>
              )}
              {formulaActual && (
                <span className="badge-success font-mono ml-1">
                  <GitBranch className="h-3 w-3" />
                  v{formulaActual.version}
                </span>
              )}
            </div>
            <p className="text-xs text-ink-mute mt-1.5 leading-relaxed">
              Las cantidades son <strong className="text-ink">por unidad de producto</strong>.
              La merma del{" "}
              <strong className="text-ink">
                {(Number(producto.factor_merma) * 100).toFixed(1)}%
              </strong>{" "}
              se aplica automáticamente al simular o crear pedidos.
              {formulaActual && (
                <>
                  {" "}
                  Al guardar se creará la versión{" "}
                  <strong className="text-ink">{formulaActual.version + 1}</strong> y la
                  actual quedará en histórico.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Tabla de items */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-paper-edge flex items-center justify-between">
          <h3 className="font-medium text-[15px] text-ink">Insumos de la fórmula</h3>
          <button
            type="button"
            onClick={agregarInsumo}
            className="btn-secondary py-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar insumo
          </button>
        </div>

        {items.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm text-ink-mute">
              La fórmula aún no tiene insumos. Agrega el primero para comenzar.
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Insumo</th>
                <th className="text-right">Cantidad por unidad</th>
                <th>Notas</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const insumo = insumosDisponibles.find((i) => i.id === item.insumo_id);
                return (
                  <tr key={idx}>
                    <td>
                      <select
                        value={item.insumo_id}
                        onChange={(e) =>
                          actualizarItem(idx, "insumo_id", e.target.value)
                        }
                        className="w-full"
                      >
                        {insumosDisponibles.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.codigo} · {i.nombre}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
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
                          className="w-32 font-mono tabular-nums text-right"
                        />
                        <span className="text-xs font-mono text-ink-mute w-8">
                          {insumo?.unidad_medida ?? ""}
                        </span>
                      </div>
                    </td>
                    <td>
                      <input
                        value={item.notas}
                        onChange={(e) => actualizarItem(idx, "notas", e.target.value)}
                        placeholder="(opcional)"
                        className="w-full"
                      />
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        onClick={() => eliminarItem(idx)}
                        className="text-ink-subtle hover:text-danger-fg transition-colors p-1"
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

      {/* Notas de la versión */}
      <div className="card-padded">
        <label className="block text-sm font-medium text-ink mb-1.5">
          Notas de esta versión
        </label>
        <textarea
          rows={2}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="¿Por qué cambias la fórmula? Ej: cambio de proveedor de tensoactivo, ajuste de proporción..."
          className="w-full resize-none"
        />
      </div>

      {error && (
        <div className="p-3 bg-danger-bg border border-danger-line text-danger-fg text-sm rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancelar
        </button>
        <button onClick={handleGuardar} disabled={loading} className="btn-primary">
          {loading
            ? "Guardando..."
            : formulaActual
              ? `Guardar como versión ${formulaActual.version + 1}`
              : "Crear fórmula"}
        </button>
      </div>
    </div>
  );
}
