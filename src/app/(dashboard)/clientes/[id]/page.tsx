import { createClient } from "@/lib/supabase/server";
import { ClienteForm } from "@/components/cliente-form";
import { PageHeader } from "@/components/page-header";
import { notFound } from "next/navigation";
import type { Cliente } from "@/types";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: cliente } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .single();

  if (!cliente) notFound();

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Clientes", href: "/clientes" },
          { label: cliente.nombre },
        ]}
        title={cliente.nombre}
      />
      <ClienteForm cliente={cliente as Cliente} />
    </div>
  );
}
