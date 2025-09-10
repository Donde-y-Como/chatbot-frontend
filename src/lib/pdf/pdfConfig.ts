import { pdfjs } from 'react-pdf';

/**
 * Configuración de PDF.js para react-pdf
 */
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

/**
 * Opciones por defecto para el componente Document
 */
export const defaultPdfOptions = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
};

// Función para manejar errores comunes de PDF.js
export function handlePdfError(error: Error): string {
  if (error.message.includes('does not match the Worker version')) {
    return 'Error de versiones incompatibles. Recargando la página...';
  }
  
  if (error.message.includes('Cannot read properties of undefined')) {
    return 'Error al cargar el worker de PDF.js. Verifica tu conexión a internet.';
  }
  
  if (error.message.includes('Loading of resource at') || error.message.includes('Failed to fetch')) {
    return 'No se pudo cargar el PDF. Verifica que el archivo existe y es accesible.';
  }
  
  if (error.message.includes('Invalid PDF structure')) {
    return 'El archivo PDF está dañado o no es válido.';
  }
  
  return `Error al procesar PDF: ${error.message}`;
}

export default pdfjs;
