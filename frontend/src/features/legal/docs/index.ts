import { LEGAL, type LegalConfig } from '../legalConfig';
import type { LegalDoc } from '../types';
import { adopcionesPerdidas } from './adopciones-perdidas';
import { avisoMedicoIa } from './aviso-medico-ia';
import { cookies } from './cookies';
import { derechosArco } from './derechos-arco';
import { pagosReembolsos } from './pagos-reembolsos';
import { privacidad, privacidadSimplificado } from './privacidad';
import { profesionales } from './profesionales';
import { terminos } from './terminos';
import { usoAceptable } from './uso-aceptable';

const BUILDERS: Array<(c: LegalConfig) => LegalDoc> = [
  terminos,
  privacidad,
  privacidadSimplificado,
  derechosArco,
  avisoMedicoIa,
  usoAceptable,
  adopcionesPerdidas,
  pagosReembolsos,
  profesionales,
  cookies,
];

export const LEGAL_DOCS: LegalDoc[] = BUILDERS.map((build) => build(LEGAL));

export const getLegalDoc = (slug: string) => LEGAL_DOCS.find((d) => d.slug === slug);
