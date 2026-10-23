/**
 * A dónde llevan «Entrar» y «Crear cuenta».
 * - Dentro de la web app (frontend/) son rutas de la misma app.
 * - En la landing publicada aparte (repo michicondrias-landing) se define NEXT_PUBLIC_WEB_APP_URL; si aún no hay web
 *   app publicada (NEXT_PUBLIC_LANDING_STANDALONE=1 sin URL), los botones bajan a la sección de la app.
 */
const WEB_APP = process.env.NEXT_PUBLIC_WEB_APP_URL ?? "";
const STANDALONE = process.env.NEXT_PUBLIC_LANDING_STANDALONE === "1";

const to = (path: string) => (WEB_APP ? `${WEB_APP}${path}` : STANDALONE ? "#app" : path);

export const LOGIN_URL = to("/login");
export const REGISTER_URL = to("/register");
