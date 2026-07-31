/**
 * Valida que la URL sea una URL pública de Credly (badges, perfiles de
 * usuario o enlaces cortos "go"). No se aceptan archivos adjuntos ni
 * capturas de pantalla — solo esta forma de acreditación.
 */
const CREDLY_URL_REGEX = /^https:\/\/(www\.)?credly\.com\/[a-zA-Z0-9\-_/]+\/?$/;

export function isValidCredlyUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  return CREDLY_URL_REGEX.test(url.trim());
}
