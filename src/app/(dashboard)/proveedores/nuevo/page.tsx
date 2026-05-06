import { ProveedorForm } from "@/components/proveedor-form";

export default function NuevoProveedorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Nuevo proveedor</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Registra una empresa proveedora
        </p>
      </div>
      <ProveedorForm />
    </div>
  );
}
