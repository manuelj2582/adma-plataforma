"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { FormSection, Field } from "@/components/form-section";
import type { Cotizacion, Cliente, EstadoCotizacion, AnalisisViabilidad } from "@/types";
import { ESTADOS_COTIZACION_LABEL } from "@/types";

interface CotizacionDetalleClientProps {
  cotizacion: Cotizacion;
  clientes: Cliente[];
  productoNombre: string;
  productoPresentacion: string | null;
  factorMermaProducto: number;
  leadTimeProduccion: number;
  analisis: AnalisisViabilidad[];
}

const ESTADOS_DISPONIBLES: EstadoCotizacion[] = [
  "borrador",
  "enviada",
  "aprobada",
  "rechazada",
  "expirada",
];

export function CotizacionDetalleClient({
  cotizacion,
  clientes,
  productoNombre,
  productoPresentacion,
  factorMermaProducto,
  leadTimeProduccion,
  analisis,
}: CotizacionDetalleClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [clienteId, setClienteId] = useState(cotizacion.cliente_id ?? "");
  const [estado, setEstado] = useState<EstadoCotizacion>(cotizacion.estado);
  const [fechaVigencia, setFechaVigencia] = useState(cotizacion.fecha_vigencia ?? "");
  const [notas, setNotas] = useState(cotizacion.notas ?? "");

  const cantidadConMerma = Math.ceil(
    cotizacion.cantidad * (1 + Number(factorMermaProducto))
  );
  const buyCount = analisis.filter((r) => r.estado === "comprar").length;
  const okCount = analisis.length - buyCount;
  const maxLead = analisis
    .filter((r) => r.estado === "comprar")
    .reduce((m, r) => Math.max(m, r.lead_time_dias), 0);

  function guardar() {
    startTransition(async () => {
      setError(null);
      const supabase = createClient();
      const { error: dbError } = await supabase
        .from("cotizaciones")
        .update({
          cliente_id: clienteId || null,
          estado,
          fecha_vigencia: fechaVigencia || null,
          notas: notas || null,
        })
        .eq("id", cotizacion.id);

      if (dbError) {
        setError(dbError.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Resumen de la cotización */}
      <div className="card-padded bg-paper-warm/40 border-paper-line">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <p className="section-label mb-1.5">Producto</p>
            <p className="font-medium text-ink">
              {productoNombre}
              {productoPresentacion && (
                <span className="text-ink-mute font-normal">
                  {" "}
                  · {productoPresentacion}
                </span>
              )}
            </p>
          </div>
          <div>
            <p className="section-label mb-1.5">Cantidad solicitada</p>
            <p className="font-mono text-base font-medium text-ink tabular-nums">
              {cotizacion.cantidad.toLocaleString("es-CL")} u
            </p>
          </div>
          <div>
            <p className="section-label mb-1.5">A producir</p>
            <p className="font-mono text-base font-medium text-ink tabular-nums">
              {cantidadConMerma.toLocaleString("es-CL")} u
            </p>
            <p className="text-[11px] text-ink-mute mt-0.5">
              merma {(Number(cotizacion.factor_merma_aplicado) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Datos editables */}
      <div className="card-padded">
        <h3 className="font-medium text-[15px] text-ink mb-1">Datos de la cotización</h3>
        <p className="text-xs text-ink-mute mb-5">
          Asigna el cliente, fija la vigencia y actualiza el estado según evoluciona la
          cotización.
        </p>

        <FormSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Cliente">
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full"
              >
                <option value="">— Sin cliente asignado —</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Estado">
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoCotizacion)}
                className="w-full"
              >
                {ESTADOS_DISPONIBLES.map((e) => (
                  <option key={e} value={e}>
                    {ESTADOS_COTIZACION_LABEL[e]}
                  </option>
                ))}
                {cotizacion.estado === "convertida" && (
                  <option value="convertida">Convertida en pedido</option>
                )}
              </select>
            </Field>
          </div>
          <Field label="Fecha de vigencia" hint="Hasta cuándo es válida esta cotización para el cliente">
            <input
              type="date"
              value={fechaVigencia}
              onChange={(e) => setFechaVigencia(e.target.value)}
              className="w-full md:max-w-xs"
            />
          </Field>
          <Field label="Notas">
            <textarea
              rows={3}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full resize-none"
            />
          </Field>
        </FormSection>

        {error && (
          <div className="mt-4 p-3 bg-danger-bg border border-danger-line text-danger-fg text-sm rounded-md">
            {error}
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button onClick={guardar} disabled={pending} className="btn-primary">
            {pending ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

      {/* Análisis de viabilidad */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-paper-edge">
          <h3 className="font-medium text-[15px] text-ink">Análisis de viabilidad</h3>
          <p className="text-xs text-ink-mute mt-0.5">
            <span className="text-success-fg font-medium">{okCount} disponibles</span>
            <span className="text-ink-subtle"> · </span>
            <span className="text-danger-fg font-medium">{buyCount} requieren compra</span>
            {buyCount > 0 && (
              <>
                <span className="text-ink-subtle"> · Plazo total estimado: </span>
                <span className="font-medium text-ink">
                  ~{maxLead + leadTimeProduccion} días
                </span>
              </>
            )}
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
            {analisis.map((r) => (
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

      {/* Próxima fase */}
      <div className="rounded-lg p-5 bg-paper-warm/60 border border-paper-line">
        <p className="text-sm font-medium text-ink">Próximamente</p>
        <p className="text-xs text-ink-mute mt-1 leading-relaxed">
          En la Fase 3 podrás convertir esta cotización en un pedido formal, lo que
          reservará el inventario y disparará el flujo de producción con timeline de 6
          etapas.
        </p>
      </div>
    </div>
  );
}
