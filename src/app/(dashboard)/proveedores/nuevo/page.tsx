import { ProveedorForm } from "@/components/proveedor-form";
import { PageHeader } from "@/components/page-header";

export default function NuevoProveedorPage() {
  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Proveedores", href: "/proveedores" },
          { label: "Nuevo" },
        ]}
        title="Nuevo proveedor"
        description="Registra una empresa proveedora con su lead time típico."
      />
      <ProveedorForm />
    </div>
  );
}
