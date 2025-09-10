# Configuración de PDF en el Proyecto

## Descripción

Este directorio contiene la configuración para el manejo de PDFs en el proyecto usando `react-pdf` y `pdf-lib`.

## Librerías Instaladas

- `react-pdf@^10.1.0` - Para visualizar PDFs
- `pdf-lib@^1.17.1` - Para manipular PDFs (firmas, modificaciones)
- `react-signature-canvas@1.1.0-alpha.2` - Para crear firmas digitales

## Componentes Disponibles

### PdfSignature

Componente completo para visualizar y firmar PDFs.

**Props:**
- `pdfUrl: string` - URL del PDF a mostrar
- `onPdfUpdated?: (newUrl: string) => void` - Callback cuando se actualiza el PDF
- `className?: string` - Clases CSS adicionales

**Características:**
- Visualización de PDF con navegación por páginas
- Sistema de firmas digitales con posicionamiento por clic
- Descarga local del PDF firmado
- Integración con backend para guardar PDFs firmados
- Proxy automático para evitar problemas de CORS

## Backend Integration

El componente `PdfSignature` usa:

1. **Proxy PDF**: `/api/pdf/proxy?url=...` para evitar CORS
2. **Endpoint de actualización**: `/api/file/update` para guardar PDFs firmados

## Consideraciones

- Las firmas se almacenan como imágenes PNG en el PDF
- Solo firmas visuales (no criptográficas)
- El proxy maneja automáticamente archivos de Google Cloud Storage
