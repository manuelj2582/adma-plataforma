"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
  const [fechaVigencia, setFechaVigencia] = useState(
    cotizacion.fecha_vigencia ?? ""
  );
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
      <div className="bg-card border rounded-lg p-5 space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">Producto</p>
          <p className="font-medium">
            {productoNombre}
            {productoPresentacion && (
              <span className="text-muted-foreground"> · {productoPresentacion}</span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Cantidad</p>
            <p className="font-medium tabular-nums">
              {cotizacion.cantidad.toLocaleString("es-CL")} u
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">A producir</p>
            <p className="font-medium tabular-nums">
              {cantidadConMerma.toLocaleString("es-CL")} u
            </p>
            <p className="text-xs text-muted-foreground">
              merma {(Number(cotizacion.factor_merma_aplicado) * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Plazo estimado</p>
            <p className="font-medium tabular-nums">
              ~{maxLead + leadTimeProduccion} días
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-5 space-y-4">
        <h3 className="font-medium text-sm">Datos de la cotización</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Cliente</label>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-md bg-background"
            >
              <option value="">— Sin cliente asignado —</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Estado</label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value as EstadoCotizacion)}
              className="w-full px-3 py-2 text-sm border rounded-md bg-background"
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
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Fecha de vigencia
            </label>
            <input
              type="date"
              value={fechaVigencia}
              onChange={(e) => setFechaVigencia(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-md bg-background"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Hasta cuándo es válida esta cotización para el cliente
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Notas</label>
          <textarea
            rows={3}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="w-full px-3 py-2 text-sm border rounded-md bg-background"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded-md">
            {error}
          </div>
        )}

        <button
          onClick={guardar}
          disabled={pending}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-medium text-sm">Análisis de viabilidad</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {okCount} insumos disponibles · {buyCount} requieren compra
          </p>
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
            {analisis.map((r) => (
              <tr key={r.insumo_id}>
                <td className="px-4 py-2">
                  <div className="font-medium">{r.insumo_nombre}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.proveedor_nombre ?? "Sin proveedor"} · {r.lead_time_dias} días
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

      <div className="bg-muted/30 border rounded-lg p-4 text-sm">
        <p className="font-medium">Próximamente: convertir en pedido</p>
        <p className="text-muted-foreground text-xs mt-1">
          En la Fase 3 podrás convertir esta cotización en un pedido formal, lo
          que reservará el inventario y disparará el flujo de producción con
          timeline.
        </p>
      </div>
    </div>
  );
}
