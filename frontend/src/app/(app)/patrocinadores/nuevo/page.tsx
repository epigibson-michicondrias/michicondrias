import { redirect } from "next/navigation";

/** `/patrocinadores/nuevo` duplicaba la alta de campaña de la app: se conserva la ruta y redirige a la canónica. */
export default function NuevoPatrocinadorPage() {
  redirect("/patrocinadores/nueva-campana");
}
