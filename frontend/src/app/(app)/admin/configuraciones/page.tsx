// Ruta vieja: la configuración del sistema ahora vive en /admin/config (igual que en la app).
import { redirect } from "next/navigation";

export default function AdminConfigRedirect() {
  redirect("/admin/config");
}
