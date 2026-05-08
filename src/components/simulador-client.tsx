"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Calculator, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import type { Producto, AnalisisViabilidad } from "@/types";

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

      const { data: numero, error: numError } = await supabase.rpc(
        "siguiente_numero_cotizacion",
        { p_pais: "CL" }
      );

      if (numError || !numero) {
        setError(numError?.message ?? "Error generando número");
        return;
      }

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
  const maxLead =
    resultado
      ?.filter((r) => r.estado === "comprar")
      .reduce((max, r) => Math.max(max, r.lead_time_dias), 0) ?? 0;
  const insumoCritico = resultado?.find(
    (r) => r.estado === "comprar" && r.lead_time_dias === maxLead
  );

  return (
    <div className="space-y-6">
      {/* Card de inputs */}
      <div className="card-padded">
        {/* Toggle modo */}
        <div className="mb-6">
          <p className="section-label mb-2.5">Tipo de solicitud</p>
          <div className="inline-flex rounded-lg bg-paper-warm p-1 border border-paper-line">
            <button
              onClick={() => {
                setModo("cotizacion");
                setResultado(null);
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                modo === "cotizacion"
                  ? "bg-paper-card text-ink shadow-soft"
                  : "text-ink-mute hover:text-ink"
              }`}
            >
              Cotización
            </button>
            <button
              onClick={() => {
                setModo("pedido");
                setResultado(null);
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                modo === "pedido"
                  ? "bg-paper-card text-ink shadow-soft"
                  : "text-ink-mute hover:text-ink"
              }`}
            >
              Pedido
            </button>
          </div>
          <p className="text-xs text-ink-mute mt-2 leading-relaxed">
            {modo === "cotizacion"
              ? "Solo simulación. No reserva inventario ni descuenta stock."
              : "Descuenta el stock ya reservado por otros pedidos confirmados."}
          </p>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Producto</label>
            <select
              value={productoId}
              onChange={(e) => {
                setProductoId(e.target.value);
                setResultado(null);
              }}
              className="w-full"
            >
              {productos.length === 0 ? (
                <option value="">No hay productos con fórmula</option>
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
            <label className="block text-sm font-medium text-ink mb-1.5">Cantidad</label>
            <div className="relative">
              <input
                type="number"
                min={1}
                step={100}
                value={cantidad}
                onChange={(e) => {
                  setCantidad(Math.max(1, parseInt(e.target.value) || 0));
                  setResultado(null);
                }}
                className="w-full pr-12 font-mono tabular-nums text-right"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute text-sm pointer-events-none">
                unid
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={simular}
          disabled={!productoId || cantidad <= 0}
          className="btn-primary mt-5 w-full md:w-auto"
        >
          <Calculator className="h-4 w-4" />
          Simular viabilidad
        </button>
      </div>

      {error && (
        <div className="p-3 bg-danger-bg border border-danger-line text-danger-fg text-sm rounded-md flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {resultado && productoSel && (
        <div className="space-y-6 animate-fade-up">
          {/* Métricas resultado */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard
              label="A producir"
              value={`${cantidadConMerma.toLocaleString("es-CL")} u`}
              hint={`Merma ${(Number(productoSel.factor_merma) * 100).toFixed(1)}%`}
            />
            <MetricCard
              label="Insumos OK"
              value={String(okCount)}
              accent={okCount > 0 ? "success" : "neutral"}
            />
            <MetricCard
              label="Por comprar"
              value={String(buyCount)}
              accent={buyCount > 0 ? "danger" : "success"}
            />
            <MetricCard
              label="Lead time crítico"
              value={buyCount > 0 ? `${maxLead} días` : "—"}
            />
          </div>

          {/* Tabla de insumos */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-paper-edge">
              <h3 className="font-medium text-[15px] text-ink">
                Insumos requeridos
              </h3>
              <p className="text-xs text-ink-mute mt-0.5">
                Cálculo según fórmula vigente y merma del producto
              </p>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Insumo</th>
                  <th className="text-right">Requerido</th>
                  <th className="text-right">Disponible</th>
                  <th className="text-right">Falta</th>
                  <th className="text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {resultado.map((r) => (
                  <tr key={r.insumo_id}>
                    <td>
                      <div className="font-medium text-ink">{r.insumo_nombre}</div>
                      <div className="text-xs text-ink-mute mt-0.5">
                        {r.proveedor_nombre ?? "Sin proveedor"} ·{" "}
                        <span className="font-mono">{r.lead_time_dias} días</span>
                      </div>
                    </td>
                    <td className="text-right">
                      <span className="font-mono text-sm text-ink tabular-nums">
                        {Number(r.cantidad_requerida).toLocaleString("es-CL", {
                          maximumFractionDigits: 4,
                        })}{" "}
                        {r.unidad_medida}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className="font-mono text-sm text-ink-mute tabular-nums">
                        {Number(r.stock_disponible).toLocaleString("es-CL", {
                          maximumFractionDigits: 4,
                        })}{" "}
                        {r.unidad_medida}
                      </span>
                    </td>
                    <td className="text-right">
                      {r.faltante > 0 ? (
                        <span className="font-mono text-sm font-medium text-danger-fg tabular-nums">
                          {Number(r.faltante).toLocaleString("es-CL", {
                            maximumFractionDigits: 4,
                          })}{" "}
                          {r.unidad_medida}
                        </span>
                      ) : (
                        <span className="text-ink-subtle">—</span>
                      )}
                    </td>
                    <td className="text-center">
                      {r.estado === "disponible" ? (
                        <span className="badge-success">
                          <CheckCircle2 className="h-3 w-3" />
                          Disponible
                        </span>
                      ) : (
                        <span className="badge-danger">
                          <AlertCircle className="h-3 w-3" />
                          Comprar
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resumen y acción */}
          <div
            className={`rounded-lg p-5 border ${
              buyCount === 0
                ? "bg-success-bg border-success-line"
                : "bg-warn-bg border-warn-line"
            }`}
          >
            <div className="flex items-start gap-3">
              {buyCount === 0 ? (
                <CheckCircle2 className="h-5 w-5 text-success-fg mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-warn-fg mt-0.5 shrink-0" />
              )}
              <div className="flex-1">
                <p
                  className={`font-medium text-sm ${
                    buyCount === 0 ? "text-success-fg" : "text-warn-fg"
                  }`}
                >
                  {buyCount === 0 ? "Viable de inmediato" : "Requiere compra previa"}
                </p>
                <p
                  className={`text-xs mt-1 leading-relaxed ${
                    buyCount === 0 ? "text-success-fg/80" : "text-warn-fg/80"
                  }`}
                >
                  {buyCount === 0 ? (
                    <>
                      Stock suficiente para todos los insumos. Lead time de producción:{" "}
                      <strong>{productoSel.lead_time_produccion_dias} días</strong> desde
                      la confirmación.
                    </>
                  ) : (
                    <>
                      Insumo crítico: <strong>{insumoCritico?.insumo_nombre}</strong> (
                      {maxLead} días). Plazo total estimado: ~
                      <strong>
                        {maxLead + productoSel.lead_time_produccion_dias} días
                      </strong>{" "}
                      desde la confirmación.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* CTA crear cotización */}
          <div className="flex justify-end">
            <button onClick={crearCotizacion} disabled={pending} className="btn-primary">
              {pending ? "Creando..." : "Crear cotización"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "success" | "danger" | "neutral";
}) {
  const valueClass =
    accent === "success"
      ? "text-success-fg"
      : accent === "danger"
        ? "text-danger-fg"
        : "text-ink";

  return (
    <div className="card p-4">
      <p className="section-label mb-2">{label}</p>
      <p className={`font-display text-3xl tracking-tightest tabular-nums leading-none ${valueClass}`}>
        {value}
      </p>
      {hint && <p className="text-[11px] text-ink-mute mt-2">{hint}</p>}
    </div>
  );
}
