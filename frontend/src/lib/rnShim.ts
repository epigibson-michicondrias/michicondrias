/**
 * Lo mínimo de `react-native` que usan las copias espejo de la app (`constants/design.ts`), para la web.
 * `Platform.select` siempre toma la rama `web` (o `default`); los tipos de estilo son objetos de estilo planos.
 */
type StyleValue = string | number | undefined | Record<string, unknown> | Array<unknown>;

export type ViewStyle = Record<string, StyleValue>;
export type TextStyle = Record<string, StyleValue>;

export const Platform = {
  OS: "web" as const,
  select<T>(options: { web?: T; default?: T; ios?: T; android?: T; native?: T }): T | undefined {
    return options.web ?? options.default;
  },
};
