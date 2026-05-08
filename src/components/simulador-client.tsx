"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Producto, AnalisisViabilidad } from "@/types";
import { useRouter } from "next/navigation";

interface SimuladorClientProps {
  productos: Producto[];
}

type Modo = "cotizacion" | "pedido";

export function SimuladorClient({ productos }: SimuladorClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [productoId, setProductoId] = useState(productos[0]?.id ?? "");
  const [cantidad, setCantidad] = useState(1000);
  const [modo, setModo] = useState<Modo>("cotizacion");
  const [resultado, setResultado] = useState<AnalisisViabilidad[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const productoSel = productos.find((p) => p.id === productoId);
  const cantidadConMerma = productoSel
    ? Math.ceil(cantidad * (1 + Number(productoSel.factor_merma)))
    : 0;

  async function simular() {
    setError(null);
    if (!productoId || cantidad <= 0) return;

    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("analizar_viabilidad", {
      p_producto_id: productoId,
      p_cantidad: cantidad,
      p_modo: modo,
    });

    if (rpcError) {
      setError(rpcError.message);
      setResultado(null);
      return;
    }

    setResultado(data as AnalisisViabilidad[]);
  }

  async function crearCotizacion() {
    if (!productoSel || !resultado) return;

    startTransition(async () => {
      const supabase = createClient();

      // Obtener número correlativo
      const { data: numero, error: numError } = await supabase.rpc(
        "siguiente_numero_cotizacion",
        { p_pais: "CL" }
      );

      if (numError || !numero) {
        setError(numError?.message ?? "Error generando número");
        return;
      }

      // Obtener formula vigente para snapshot
      const { data: formula } = await supabase
        .from("formulas")
        .select("id")
        .eq("producto_id", productoSel.id)
        .is("vigente_hasta", null)
        .single();

      const { data: cot, error: cotError } = await supabase
        .from("cotizaciones")
        .insert({
          numero,
          producto_id: productoSel.id,
          formula_id: formula?.id ?? null,
          cantidad,
          factor_merma_aplicado: productoSel.factor_merma,
          estado: "borrador",
        })
        .select()
        .single();

      if (cotError || !cot) {
        setError(cotError?.message ?? "Error creando cotización");
        return;
      }

      router.push(`/cotizaciones/${cot.id}`);
    });
  }

  const okCount = resultado?.filter((r) => r.estado === "disponible").length ?? 0;
  const buyCount = resultado?.filter((r) => r.estado === "comprar").length ?? 0;
  const maxLead = resultado
    ?.filter((r) => r.estado === "comprar")
    .reduce((max, r) => Math.max(max, r.lead_time_dias), 0) ?? 0;
  const insumoCritico = resultado?.find(
    (r) => r.estado === "comprar" && r.lead_time_dias === maxLead
  );

  return (
    <div className="space-y-6">
      <div className="bg-card border rounded-lg p-5 space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Tipo de solicitud
          </p>
          <div className="flex">
            <button
              onClick={() => setModo("cotizacion")}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-l-md border transition-colors ${
                modo === "cotizacion"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              Cotización · solo simulación
            </button>
            <button
              onClick={() => setModo("pedido")}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-r-md border-y border-r transition-colors ${
                modo === "pedido"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              Pedido · descuenta reservados
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Producto</label>
            <select
              value={productoId}
              onChange={(e) => {
                setProductoId(e.target.value);
                setResultado(null);
              }}
              className="w-full px-3 py-2 text-sm border rounded-md bg-background"
            >
              {productos.length === 0 ? (
                <option value="">No hay productos</option>
              ) : (
                productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} · {p.nombre}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Unidades</label>
            <input
              type="number"
              min={1}
              step={100}
              value={cantidad}
              onChange={(e) => {
                setCantidad(Math.max(1, parseInt(e.target.value) || 0));
                setResultado(null);
              }}
              className="w-full px-3 py-2 text-sm border rounded-md bg-background tabular-nums"
            />
          </div>
        </div>

        <button
          onClick={simular}
          disabled={!productoId || cantidad <= 0}
          className="w-full md:w-auto px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          Simular viabilidad
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded-md">
          {error}
        </div>
      )}

      {resultado && productoSel && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-muted/50 rounded-md p-3">
              <p className="text-xs text-muted-foreground">A producir (con merma)</p>
              <p className="text-lg font-medium tabular-nums">
                {cantidadConMerma.toLocaleString("es-CL")} u
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Merma {(Number(productoSel.factor_merma) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-muted/50 rounded-md p-3">
              <p className="text-xs text-muted-foreground">Insumos OK</p>
              <p className="text-lg font-medium text-green-700 tabular-nums">
                {okCount}
              </p>
            </div>
            <div className="bg-muted/50 rounded-md p-3">
              <p className="text-xs text-muted-foreground">Por comprar</p>
              <p className="text-lg font-medium text-red-700 tabular-nums">
                {buyCount}
              </p>
            </div>
            <div className="bg-muted/50 rounded-md p-3">
              <p className="text-xs text-muted-foreground">Lead time crítico</p>
              <p className="text-lg font-medium tabular-nums">
                {buyCount > 0 ? `${maxLead} días` : "—"}
              </p>
            </div>
          </div>

          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-medium text-sm">Insumos requeridos</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Insumo</th>
                  <th className="text-right px-4 py-2 font-medium">Requerido</th>
                  <th className="text-right px-4 py-2 font-medium">Disponible</th>
                  <th className="text-right px-4 py-2 font-medium">Falta</th>
                  <th className="text-center px-4 py-2 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {resultado.map((r) => (
                  <tr key={r.insumo_id}>
                    <td className="px-4 py-2">
                      <div className="font-medium">{r.insumo_nombre}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.proveedor_nombre ?? "Sin proveedor"} · {r.lead_time_dias}{" "}
                        días
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {Number(r.cantidad_requerida).toLocaleString("es-CL", {
                        maximumFractionDigits: 4,
                      })}{" "}
                      {r.unidad_medida}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                      {Number(r.stock_disponible).toLocaleString("es-CL", {
                        maximumFractionDigits: 4,
                      })}{" "}
                      {r.unidad_medida}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {r.faltante > 0 ? (
                        <span className="text-red-700 font-medium">
                          {Number(r.faltante).toLocaleString("es-CL", {
                            maximumFractionDigits: 4,
                          })}{" "}
                          {r.unidad_medida}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {r.estado === "disponible" ? (
                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                          Disponible
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
                          Comprar
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            className={`p-4 rounded-md text-sm ${
              buyCount === 0
                ? "bg-green-50 border border-green-200 text-green-900"
                : "bg-amber-50 border border-amber-200 text-amber-900"
            }`}
          >
            {buyCount === 0 ? (
              <>
                <p className="font-medium">Viable de inmediato</p>
                <p className="text-xs mt-1 opacity-90">
                  Stock suficiente para todos los insumos. Lead time de producción:{" "}
                  {productoSel.lead_time_produccion_dias} días desde la confirmación.
                </p>
              </>
            ) : (
              <>
                <p className="font-medium">Requiere compra previa</p>
                <p className="text-xs mt-1 opacity-90">
                  Insumo crítico: {insumoCritico?.insumo_nombre} ({maxLead} días).
                  Plazo total estimado: ~
                  {maxLead + productoSel.lead_time_produccion_dias} días desde la
                  confirmación.
                </p>
              </>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={crearCotizacion}
              disabled={pending}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Creando..." : "Crear cotización"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
