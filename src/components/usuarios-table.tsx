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
    <div className="card overflow-hidden">
      <table className="data-table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>País</th>
            <th>Rol</th>
            <th className="text-center">Estado</th>
          </tr>
        </thead>
        <tbody>
          {perfiles.map((p) => (
            <tr key={p.id}>
              <td>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-olive-100 text-olive-800 flex items-center justify-center font-medium text-sm shrink-0">
                    {p.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-ink truncate">{p.nombre}</div>
                    <div className="text-xs text-ink-mute truncate">{p.email}</div>
                  </div>
                </div>
              </td>
              <td className="text-ink-mute text-sm">{PAISES_LABEL[p.pais]}</td>
              <td>
                <select
                  value={p.rol}
                  disabled={savingId === p.id}
                  onChange={(e) => cambiarRol(p.id, e.target.value as RolUsuario)}
                  className="text-sm py-1.5"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLES_LABEL[r]}
                    </option>
                  ))}
                </select>
              </td>
              <td className="text-center">
                <button
                  onClick={() => toggleActivo(p.id, p.activo)}
                  disabled={savingId === p.id}
                  className={p.activo ? "badge-success" : "badge-neutral"}
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
