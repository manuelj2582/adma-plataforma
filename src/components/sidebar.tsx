"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
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

  const admin = perfil.rol === "admin"
    ? [{ href: "/usuarios", label: "Usuarios", icon: Users }]
    : [];

  function NavSection({ items, label }: { items: typeof principal; label?: string }) {
    return (
      <div className="space-y-0.5">
        {label && (
          <p className="px-3 pt-3 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
        )}
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-secondary text-secondary-foreground font-medium"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    );
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-60 border-r bg-card flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-medium text-sm tracking-tight">ADMA</h2>
        <p className="text-xs text-muted-foreground">
          {PAISES_LABEL[perfil.pais]}
        </p>
      </div>

      <nav className="flex-1 p-2 overflow-y-auto">
        <NavSection items={principal} />
        <NavSection items={maestras} label="Maestras" />
        {admin.length > 0 && <NavSection items={admin} label="Admin" />}
      </nav>

      <div className="p-3 border-t">
        <div className="px-2 py-1.5 mb-2">
          <p className="text-xs font-medium truncate">{perfil.nombre}</p>
          <p className="text-xs text-muted-foreground truncate">
            {ROLES_LABEL[perfil.rol]}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Salir
        </button>
      </div>
    </aside>
  );
}
