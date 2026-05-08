"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Package,
  FlaskConical,
  Truck,
  Users,
  LogOut,
  ClipboardList,
  Calculator,
  Building2,
  BookOpen,
} from "lucide-react";
import type { Perfil } from "@/types";
import { ROLES_LABEL, PAISES_LABEL } from "@/types";

interface SidebarProps {
  perfil: Perfil;
}

export function Sidebar({ perfil }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const principal = [
    { href: "/", label: "Inicio", icon: LayoutDashboard },
    { href: "/simulador", label: "Simulador", icon: Calculator },
    { href: "/cotizaciones", label: "Cotizaciones", icon: ClipboardList },
  ];

  const maestras = [
    { href: "/productos", label: "Productos", icon: FlaskConical },
    { href: "/formulas", label: "Fórmulas", icon: BookOpen },
    { href: "/insumos", label: "Insumos", icon: Package },
    { href: "/proveedores", label: "Proveedores", icon: Truck },
    { href: "/clientes", label: "Clientes", icon: Building2 },
  ];

  const admin =
    perfil.rol === "admin"
      ? [{ href: "/usuarios", label: "Usuarios", icon: Users }]
      : [];

  function NavItem({
    item,
  }: {
    item: { href: string; label: string; icon: typeof LayoutDashboard };
  }) {
    const Icon = item.icon;
    const active =
      pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(item.href));

    return (
      <Link
        href={item.href}
        className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-md text-[13.5px] transition-all duration-150 ${
          active
            ? "bg-paper-card text-ink font-medium shadow-soft"
            : "text-ink-mute hover:text-ink hover:bg-paper-card/50"
        }`}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 bg-olive-600 rounded-r-full -ml-2.5" />
        )}
        <Icon
          className={`h-4 w-4 ${active ? "text-olive-700" : "text-ink-subtle group-hover:text-ink-mute"}`}
          strokeWidth={2}
        />
        {item.label}
      </Link>
    );
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-60 shrink-0 border-r border-paper-edge bg-paper-warm/40 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-paper-edge">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-7 w-7 rounded bg-ink text-paper flex items-center justify-center font-display text-xl leading-none pb-0.5 group-hover:bg-olive-700 transition-colors">
            a
          </div>
          <div>
            <p className="font-medium tracking-tight text-[15px] leading-tight text-ink">
              ADMA
            </p>
            <p className="text-[10.5px] text-ink-subtle font-mono uppercase tracking-wider leading-tight">
              {PAISES_LABEL[perfil.pais]}
            </p>
          </div>
        </Link>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-0.5">
          {principal.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </div>

        <div className="mt-6">
          <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
            Maestras
          </p>
          <div className="space-y-0.5">
            {maestras.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>
        </div>

        {admin.length > 0 && (
          <div className="mt-6">
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
              Admin
            </p>
            <div className="space-y-0.5">
              {admin.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Usuario + logout */}
      <div className="border-t border-paper-edge p-3">
        <div className="px-3 py-2.5 mb-1">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-olive-100 text-olive-800 flex items-center justify-center font-medium text-sm shrink-0">
              {perfil.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-ink truncate leading-tight">
                {perfil.nombre}
              </p>
              <p className="text-[11px] text-ink-mute truncate leading-tight mt-0.5">
                {ROLES_LABEL[perfil.rol]}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] text-ink-mute hover:text-ink hover:bg-paper-card transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
