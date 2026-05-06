"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Perfil, RolUsuario } from "@/types";
import { ROLES_LABEL, PAISES_LABEL } from "@/types";

interface UsuariosTableProps {
  perfiles: Perfil[];
}

const ROLES: RolUsuario[] = [
  "admin",
  "comercial",
  "bodega",
  "compras",
  "planificacion",
  "planta",
  "calidad",
  "empaque",
  "logistica",
];

export function UsuariosTable({ perfiles }: UsuariosTableProps) {
  const router = useRouter();
  const [savingId, setSavingId] = useState<string | null>(null);

  async function cambiarRol(id: string, nuevoRol: RolUsuario) {
    setSavingId(id);
    const supabase = createClient();
    await supabase.from("perfiles").update({ rol: nuevoRol }).eq("id", id);
    setSavingId(null);
    router.refresh();
  }

  async function toggleActivo(id: string, activo: boolean) {
    setSavingId(id);
    const supabase = createClient();
    await supabase.from("perfiles").update({ activo: !activo }).eq("id", id);
    setSavingId(null);
    router.refresh();
  }

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="text-left px-4 py-3 font-medium">Usuario</th>
            <th className="text-left px-4 py-3 font-medium">País</th>
            <th className="text-left px-4 py-3 font-medium">Rol</th>
            <th className="text-center px-4 py-3 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {perfiles.map((p) => (
            <tr key={p.id} className="hover:bg-muted/30">
              <td className="px-4 py-3">
                <div className="font-medium">{p.nombre}</div>
                <div className="text-xs text-muted-foreground">{p.email}</div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {PAISES_LABEL[p.pais]}
              </td>
              <td className="px-4 py-3">
                <select
                  value={p.rol}
                  disabled={savingId === p.id}
                  onChange={(e) => cambiarRol(p.id, e.target.value as RolUsuario)}
                  className="px-2 py-1 text-sm border rounded bg-background"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLES_LABEL[r]}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => toggleActivo(p.id, p.activo)}
                  disabled={savingId === p.id}
                  className={`px-2 py-0.5 text-xs font-medium rounded ${
                    p.activo
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {p.activo ? "Activo" : "Inactivo"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
