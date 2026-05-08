import { createClient } from "@/lib/supabase/server";
import { CotizacionDetalleClient } from "@/components/cotizacion-detalle-client";
import { notFound } from "next/navigation";
import type { Cliente, Cotizacion, AnalisisViabilidad } from "@/types";

export default async function CotizacionDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: cotizacion } = await supabase
    .from("cotizaciones")
    .select("*, productos(nombre, presentacion, factor_merma, lead_time_produccion_dias)")
    .eq("id", id)
    .single();

  if (!cotizacion) notFound();

  const { data: clientes } = await supabase
    .from("clientes")
    .select("*")
    .eq("activo", true)
    .order("nombre");

  // Re-ejecutar análisis de viabilidad con los datos actuales
  const { data: analisis } = await supabase.rpc("analizar_viabilidad", {
    p_producto_id: cotizacion.producto_id,
    p_cantidad: cotizacion.cantidad,
    p_modo: "cotizacion",
  });

  const producto = cotizacion.productos as {
    nombre: string;
    presentacion: string | null;
    factor_merma: number;
    lead_time_produccion_dias: number;
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Cotización
        </p>
        <h1 className="text-2xl font-medium tracking-tight font-mono">
          {cotizacion.numero}
        </h1>
      </div>

      <CotizacionDetalleClient
        cotizacion={cotizacion as Cotizacion}
        clientes={(clientes as Cliente[]) ?? []}
        productoNombre={producto.nombre}
        productoPresentacion={producto.presentacion}
        factorMermaProducto={Number(producto.factor_merma)}
        leadTimeProduccion={producto.lead_time_produccion_dias}
        analisis={(analisis as AnalisisViabilidad[]) ?? []}
      />
    </div>
  );
}
