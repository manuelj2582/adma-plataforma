import { createClient } from "@/lib/supabase/server";
import { ClienteForm } from "@/components/cliente-form";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">{cliente.nombre}</h1>
      </div>
      <ClienteForm cliente={cliente as Cliente} />
    </div>
  );
}
