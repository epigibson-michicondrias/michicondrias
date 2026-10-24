// Ruta vieja: la pantalla de analíticas ahora vive en /admin/stats (igual que en la app).
import { redirect } from "next/navigation";

export default function AdminAnalyticsRedirect() {
  redirect("/admin/stats");
}
