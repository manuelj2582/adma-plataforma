import { ProductoForm } from "@/components/producto-form";
import { PageHeader } from "@/components/page-header";

export default function NuevoProductoPage() {
  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Productos", href: "/productos" },
          { label: "Nuevo" },
        ]}
        title="Nuevo producto"
        description="Define un producto terminado con su factor de merma y lead time."
      />
      <ProductoForm />
    </div>
  );
}
