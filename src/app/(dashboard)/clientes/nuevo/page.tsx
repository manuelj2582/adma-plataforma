import { ClienteForm } from "@/components/cliente-form";
import { PageHeader } from "@/components/page-header";

export default function NuevoClientePage() {
  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Clientes", href: "/clientes" },
          { label: "Nuevo" },
        ]}
        title="Nuevo cliente"
        description="Registra una empresa cliente."
      />
      <ClienteForm />
    </div>
  );
}
