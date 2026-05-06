import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ count: insumosCount }, { count: productosCount }, { count: proveedoresCount }] =
    await Promise.all([
      supabase.from("insumos").select("*", { count: "exact", head: true }).eq("activo", true),
      supabase.from("productos").select("*", { count: "exact", head: true }).eq("activo", true),
      supabase.from("proveedores").select("*", { count: "exact", head: true }).eq("activo", true),
    ]);

  const stats = [
    { label: "Insumos activos", value: insumosCount ?? 0, href: "/insumos" },
    { label: "Productos", value: productosCount ?? 0, href: "/productos" },
    { label: "Proveedores", value: proveedoresCount ?? 0, href: "/proveedores" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Inicio</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Resumen de tu operación
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="p-5 bg-card border rounded-lg hover:border-foreground/20 transition-colors"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {s.label}
            </p>
            <p className="text-3xl font-medium mt-2">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="bg-muted/30 border rounded-lg p-6">
        <h3 className="font-medium">Estás en la Fase 1 — Fundación</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Carga las maestras de insumos, productos y proveedores. En la próxima
          fase se habilitarán las fórmulas y el simulador de viabilidad.
        </p>
      </div>
    </div>
  );
}
