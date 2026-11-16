export type Language = 'en' | 'es';

export function formatNumberLocale(value: number, lang: Language): string {
  return value.toLocaleString(lang === 'es' ? 'es-ES' : 'en-US');
}
