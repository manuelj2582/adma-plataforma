export type RolUsuario =
  | "admin"
  | "comercial"
  | "bodega"
  | "compras"
  | "planificacion"
  | "planta"
  | "calidad"
  | "empaque"
  | "logistica";

export type PaisCodigo = "CL" | "CO" | "PE" | "EC" | "AR" | "MX";

export interface Perfil {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  pais: PaisCodigo;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface CategoriaInsumo {
  id: string;
  nombre: string;
  descripcion: string | null;
}

export interface Proveedor {
  id: string;
  nombre: string;
  rut: string | null;
  contacto_nombre: string | null;
  contacto_email: string | null;
  contacto_telefono: string | null;
  lead_time_tipico_dias: number;
  pais: PaisCodigo;
  activo: boolean;
  notas: string | null;
}

export interface Insumo {
  id: string;
  codigo: string;
  nombre: string;
  categoria_id: string | null;
  unidad_medida: string;
  proveedor_principal_id: string | null;
  stock_actual: number;
  stock_reservado: number;
  stock_minimo: number;
  costo_promedio: number | null;
  ultimo_costo_compra: number | null;
  fecha_ultima_compra: string | null;
  pais: PaisCodigo;
  activo: boolean;
  notas: string | null;
}

export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  presentacion: string | null;
  factor_merma: number;
  lead_time_produccion_dias: number;
  pais: PaisCodigo;
  activo: boolean;
  notas: string | null;
}

export const ROLES_LABEL: Record<RolUsuario, string> = {
  admin: "Administrador",
  comercial: "Comercial",
  bodega: "Bodega",
  compras: "Compras",
  planificacion: "Planificación",
  planta: "Planta",
  calidad: "Calidad",
  empaque: "Empaque",
  logistica: "Logística",
};

export const PAISES_LABEL: Record<PaisCodigo, string> = {
  CL: "Chile",
  CO: "Colombia",
  PE: "Perú",
  EC: "Ecuador",
  AR: "Argentina",
  MX: "México",
};
