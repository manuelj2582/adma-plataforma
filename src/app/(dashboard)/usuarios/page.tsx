import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UsuariosTable } from "@/components/usuarios-table";
import { PageHeader } from "@/components/page-header";
import type { Perfil } from "@/types";

export default async function UsuariosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: miPerfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user!.id)
    .single();

  if (miPerfil?.rol !== "admin") redirect("/");

  const { data: perfiles } = await supabase
    .from("perfiles")
    .select("*")
    .order("nombre");

  return (
    <div>
      <PageHeader
        label="Admin"
        title="Usuarios"
        description="Gestiona los roles del equipo. Para crear nuevos usuarios usa Authentication → Users en Supabase, luego asígnales rol aquí."
      />
      <UsuariosTable perfiles={(perfiles as Perfil[]) ?? []} />
    </div>
  );
}
