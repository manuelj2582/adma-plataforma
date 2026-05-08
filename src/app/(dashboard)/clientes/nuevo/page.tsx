import { ClienteForm } from "@/components/cliente-form";

export default function NuevoClientePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Nuevo cliente</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Registra una empresa cliente
        </p>
      </div>
      <ClienteForm />
    </div>
  );
}
