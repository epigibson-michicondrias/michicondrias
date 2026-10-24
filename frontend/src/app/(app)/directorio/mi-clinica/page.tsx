import { redirect } from "next/navigation";

/** Ruta anterior del panel de clínica: el panel completo vive en `/mi-clinica` (igual que en la app). */
export default function DirectorioMiClinicaRedirect() {
  redirect("/mi-clinica");
}
