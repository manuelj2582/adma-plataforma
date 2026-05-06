import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UsuariosTable } from "@/components/usuarios-table";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Usuarios</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona los roles del equipo. Para crear nuevos usuarios usa
          Authentication → Users en Supabase, luego asígnales rol aquí.
        </p>
      </div>
      <UsuariosTable perfiles={(perfiles as Perfil[]) ?? []} />
    </div>
  );
}
