import { createClient } from "@/lib/supabase/server";
import { CotizacionDetalleClient } from "@/components/cotizacion-detalle-client";
import { PageHeader } from "@/components/page-header";
import { notFound } from "next/navigation";
import {
  ESTADOS_COTIZACION_LABEL,
  type Cliente,
  type Cotizacion,
  type AnalisisViabilidad,
} from "@/types";

export default async function CotizacionDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: cotizacion } = await supabase
    .from("cotizaciones")
    .select(
      "*, productos(nombre, presentacion, factor_merma, lead_time_produccion_dias)"
    )
    .eq("id", id)
    .single();

  if (!cotizacion) notFound();

  const { data: clientes } = await supabase
    .from("clientes")
    .select("*")
    .eq("activo", true)
    .order("nombre");

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
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Cotizaciones", href: "/cotizaciones" },
          { label: cotizacion.numero },
        ]}
        label={ESTADOS_COTIZACION_LABEL[cotizacion.estado as keyof typeof ESTADOS_COTIZACION_LABEL]}
        title={cotizacion.numero}
        description={`Cotización creada el ${new Date(cotizacion.fecha_cotizacion).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}.`}
      />

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
