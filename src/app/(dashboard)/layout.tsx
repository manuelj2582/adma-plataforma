import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import type { Perfil } from "@/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-paper">
        <div className="max-w-md text-center">
          <h2 className="font-display text-3xl text-ink mb-3">
            Perfil no encontrado
          </h2>
          <p className="text-sm text-ink-mute leading-relaxed">
            Tu usuario aún no tiene perfil asignado en el sistema. Por favor contacta
            al administrador para activar tu cuenta.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-paper">
      <Sidebar perfil={perfil as Perfil} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8 lg:px-10 lg:py-10 animate-fade-up">
          {children}
        </div>
      </main>
    </div>
  );
}
