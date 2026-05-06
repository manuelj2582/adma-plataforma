import { ProductoForm } from "@/components/producto-form";

export default function NuevoProductoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Nuevo producto</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Define un producto terminado
        </p>
      </div>
      <ProductoForm />
    </div>
  );
}
