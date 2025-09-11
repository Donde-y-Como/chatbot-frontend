import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { PDFDocument } from 'pdf-lib';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, PenTool, Download, Save, X, RotateCcw } from 'lucide-react';
import { defaultPdfOptions, handlePdfError } from '@/lib/pdf/pdfConfig';
import { api } from '@/api/axiosInstance';
import { useAuth } from '@/stores/authStore';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface PdfSignatureProps {
  pdfUrl: string;
  onPdfUpdated?: (newUrl: string) => void;
  className?: string;
  clientId?: string; // Nuevo parámetro opcional
}

interface SignaturePosition {
  x: number;
  y: number;
  page: number;
  signatureData: string; // Store the actual signature image data
}

export default function PdfSignature({ pdfUrl, onPdfUpdated, className, clientId }: PdfSignatureProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfLoadError, setPdfLoadError] = useState<string | null>(null);
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false);
  const [pendingPosition, setPendingPosition] = useState<{ x: number; y: number; page: number } | null>(null);
  const [signaturePositions, setSignaturePositions] = useState<SignaturePosition[]>([]);
  const [proxiedPdfUrl, setProxiedPdfUrl] = useState<string>('');
  const [forceRefresh, setForceRefresh] = useState<number>(0); // Para forzar recarga del PDF
  const [documentKey, setDocumentKey] = useState<string>(`doc-${Date.now()}`); // Key única para el Document
  const [tempPdfBlob, setTempPdfBlob] = useState<string | null>(null); // URL blob temporal para bypasear cache
  const signatureRef = useRef<SignatureCanvas>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Verify PDF.js configuration on mount and setup proxy URL
  useEffect(() => {
    // Intentar usar proxy si la URL es de Google Cloud Storage
    if (pdfUrl.includes('storage.googleapis.com')) {
      // Intentar con proxy primero para evitar CORS
      const proxyUrl = `/api/pdf/proxy?url=${encodeURIComponent(pdfUrl)}`;
      setProxiedPdfUrl(proxyUrl);
    } else {
      // Usar URL directa si no es de GCS
      setProxiedPdfUrl(pdfUrl);
    }
    
    // Reset force refresh cuando cambia la URL del PDF
    setForceRefresh(0);
    setDocumentKey(`doc-${Date.now()}`); // Nueva key para forzar re-mount del Document
    
    // Limpiar blob temporal anterior
    if (tempPdfBlob) {
      URL.revokeObjectURL(tempPdfBlob);
      setTempPdfBlob(null);
    }
  }, [pdfUrl, tempPdfBlob]);

  // Cleanup del blob al desmontar el componente
  useEffect(() => {
    return () => {
      if (tempPdfBlob) {
        URL.revokeObjectURL(tempPdfBlob);
      }
    };
  }, [tempPdfBlob]);

  // Handle PDF load success
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    console.log('PDF loaded successfully:', { numPages, forceRefresh, documentKey });
    setNumPages(numPages);
    setPdfLoadError(null);
  }

  // Handle PDF load error with fallback to direct URL
  function onDocumentLoadError(error: Error) {
    const errorMessage = handlePdfError(error);
    setPdfLoadError(errorMessage);
    
    // Si el proxy falla y estamos usando proxy, intentar URL directa
    if (proxiedPdfUrl.includes('/api/pdf/proxy') && !proxiedPdfUrl.includes('fallback=true')) {
      setProxiedPdfUrl(pdfUrl + '?fallback=true');
      setPdfLoadError(null);
      return;
    }
    
    // Auto-reload if it's a version mismatch error
    if (error.message.includes('does not match the Worker version')) {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }

  // Handle page click to set signature position
  const handlePageClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!pageRef.current) return;

    const rect = pageRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert to PDF coordinates (standard A4: 595 x 842 points)
    const pdfX = (x / rect.width) * 595;
    const pdfY = 842 - (y / rect.height) * 842; // Inverted Y coordinate
    
    setPendingPosition({ x: pdfX, y: pdfY, page: pageNumber });
    setIsSignatureDialogOpen(true);
  }, [pageNumber]);

  // Clear signature canvas
  const clearSignature = useCallback(() => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  }, []);

  // Add signature to PDF
  const addSignature = useCallback(async () => {
    if (!signatureRef.current || !pendingPosition || signatureRef.current.isEmpty()) {
      toast.info('Por favor, dibuja tu firma antes de continuar.');
      return;
    }

    // Get the signature as data URL
    const signatureData = signatureRef.current.toDataURL('image/png');

    // Create signature position with the actual signature data
    const signaturePosition: SignaturePosition = {
      ...pendingPosition,
      signatureData
    };

    // Add to positions list
    setSignaturePositions(prev => [...prev, signaturePosition]);
    setIsSignatureDialogOpen(false);
    setPendingPosition(null);
    clearSignature();
  }, [pendingPosition, clearSignature]);

  // Helper function to get the correct PDF URL (proxy or direct)
  const getPdfUrl = useCallback(() => {
    // Si es de Google Cloud Storage, usar proxy
    if (pdfUrl.includes('storage.googleapis.com')) {
      return `/api/pdf/proxy?url=${encodeURIComponent(pdfUrl)}`;
    }
    // Si no, usar URL directa
    return pdfUrl;
  }, [pdfUrl]);

  // Helper function to get PDF URL with cache busting
  const getPdfUrlWithCacheBusting = useCallback(() => {
    const baseUrl = proxiedPdfUrl || pdfUrl;
    // Siempre agregar cache busting, no solo cuando forceRefresh > 0
    const separator = baseUrl.includes('?') ? '&' : '?';
    const timestamp = Date.now();
    const cacheBuster = `${separator}v=${forceRefresh}&t=${timestamp}&nocache=${Math.random()}`;
    const finalUrl = `${baseUrl}${cacheBuster}`;
    console.log('PDF URL with cache busting:', finalUrl);
    return finalUrl;
  }, [proxiedPdfUrl, pdfUrl, forceRefresh]);

  // Helper function to fetch PDF with no-cache headers
  const fetchPdfWithNoCache = useCallback(async (url: string) => {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store'
    });
    return response.arrayBuffer();
  }, []);

  // Remove signature position
  const removeSignaturePosition = useCallback((index: number) => {
    setSignaturePositions(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Save signed PDF
  const saveSignedPdf = useCallback(async () => {
    if (signaturePositions.length === 0) {
      toast.info('Agrega al menos una firma antes de guardar.');
      return;
    }

    if (!isAuthenticated()) {
      toast.error('Debes estar autenticado para guardar el PDF.');
      return;
    }

    // Solo permitir firma de PDFs si tenemos un clientId (cliente existente)
    if (!clientId) {
      toast.warning('Solo se pueden firmar PDFs de clientes existentes. Por favor, guarda el cliente primero.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Fetch the original PDF using proxy if needed with no-cache headers
      const correctPdfUrl = getPdfUrl();
      const pdfBytes = await fetchPdfWithNoCache(correctPdfUrl);
      
      // Load PDF with pdf-lib
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      
      // Add each signature to the PDF
      for (const position of signaturePositions) {
        // Convert signature data URL to array buffer
        const signatureImage = await fetch(position.signatureData).then(res => res.arrayBuffer());
        const signaturePng = await pdfDoc.embedPng(signatureImage);
        
        // Add signature to the corresponding page
        const page = pages[position.page - 1];
        if (page) {
          const { width, height } = signaturePng.scale(0.3);
          page.drawImage(signaturePng, {
            x: position.x - width / 2,
            y: position.y - height / 2,
            width,
            height,
          });
        }
      }
      
      // Save modified PDF
      const modifiedPdfBytes = await pdfDoc.save();
      
      // Create blob and upload - Use axios instance with proper auth
      const blob = new Blob([new Uint8Array(modifiedPdfBytes)], { type: 'application/pdf' });
      const formData = new FormData();
      
      // Extract filename from URL
      const originalFilename = pdfUrl.split('/').pop() || 'document.pdf';
      formData.append('file', blob, originalFilename);
      formData.append('existingUrl', pdfUrl);
      
      // Add clientId if provided
      if (clientId) {
        formData.append('clientId', clientId);
      }
      
      // Upload to backend using configured axios instance
      console.log('Token from store:', accessToken);
      console.log('Is authenticated:', isAuthenticated());
      console.log('ClientId:', clientId);
      
      const response = await api.post('/file/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const { url: newUrl } = response.data;
      
      // Callback to update parent component
      if (onPdfUpdated) {
        onPdfUpdated(newUrl);
      }
      
      // Invalidar queries para refrescar datos en el frontend
      if (clientId) {
        await queryClient.invalidateQueries({ queryKey: ['clients'] });
        await queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      }
      
      // Forzar actualización del visor de PDF
      setForceRefresh(prev => prev + 1);
      setDocumentKey(`doc-${Date.now()}`); // Nueva key para forzar re-mount
      
      // También resetear el estado del PDF viewer
      setNumPages(0);
      setPdfLoadError(null);
      
      // Crear blob temporal del PDF actualizado para bypasear cache
      setTimeout(async () => {
        try {
          const updatedPdfBytes = await fetchPdfWithNoCache(newUrl);
          const blob = new Blob([updatedPdfBytes], { type: 'application/pdf' });
          const blobUrl = URL.createObjectURL(blob);
          
          // Limpiar blob anterior si existe
          if (tempPdfBlob) {
            URL.revokeObjectURL(tempPdfBlob);
          }
          
          setTempPdfBlob(blobUrl);
          setDocumentKey(`doc-blob-${Date.now()}`);
          console.log('Using temporary blob for updated PDF:', blobUrl);
        } catch (error) {
          console.error('Error creating PDF blob:', error);
        }
      }, 500);
      
      toast.success('PDF firmado y guardado exitosamente.');
      setSignaturePositions([]);
      
    } catch (error: any) {
      console.error('Error signing PDF:', error);
      
      // More detailed error logging
      if (error.response) {
        console.error('Response error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
        
        if (error.response.status === 403) {
          toast.error('Error de autorización: No tienes permisos para realizar esta acción. Por favor, inicia sesión nuevamente.');
        } else if (error.response.status === 401) {
          toast.error('Error de autenticación: Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        } else {
          toast.error(`Error al firmar el PDF: ${error.response.data?.message || error.message}`);
        }
      } else {
        toast.error('Error al firmar el PDF. Por favor intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [pdfUrl, signaturePositions, onPdfUpdated, getPdfUrl, accessToken, isAuthenticated, fetchPdfWithNoCache]);

  // Download signed PDF locally
  const downloadSignedPdf = useCallback(async () => {
    if (signaturePositions.length === 0) {
      toast.info('Agrega al menos una firma antes de descargar.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Fetch the original PDF using proxy if needed with no-cache headers
      const correctPdfUrl = getPdfUrl();
      const pdfBytes = await fetchPdfWithNoCache(correctPdfUrl);
      
      // Load PDF with pdf-lib
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      
      // Add signatures
      for (const position of signaturePositions) {
        const signatureImage = await fetch(position.signatureData).then(res => res.arrayBuffer());
        const signaturePng = await pdfDoc.embedPng(signatureImage);
        
        const page = pages[position.page - 1];
        if (page) {
          const { width, height } = signaturePng.scale(0.3);
          page.drawImage(signaturePng, {
            x: position.x - width / 2,
            y: position.y - height / 2,
            width,
            height,
          });
        }
      }
      
      // Save and download
      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(modifiedPdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `signed-${pdfUrl.split('/').pop() || 'document.pdf'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading signed PDF:', error);
      toast.error('Error al descargar el PDF firmado.');
    } finally {
      setIsLoading(false);
    }
  }, [pdfUrl, signaturePositions, getPdfUrl, fetchPdfWithNoCache]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Visualizador y Firmador de PDF
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadSignedPdf}
              disabled={isLoading || signaturePositions.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>
            <Button
              size="sm"
              onClick={saveSignedPdf}
              disabled={isLoading || signaturePositions.length === 0 || !clientId}
              title={!clientId ? 'Solo disponible para clientes existentes' : undefined}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Guardando...' : 'Guardar Firmado'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* PDF Viewer */}
        {/* PDF Error Display */}
        {pdfLoadError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <X className="h-5 w-5" />
              <span className="font-semibold">Error cargando PDF</span>
            </div>
            <p className="text-red-700 dark:text-red-300 mt-2 text-sm">{pdfLoadError}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => {
                setPdfLoadError(null);
                window.location.reload();
              }}
            >
              Reintentar
            </Button>
          </div>
        )}

        {/* PDF Viewer */}
        {!pdfLoadError && (
          <div className="border rounded-lg overflow-hidden">
            <Document
              key={documentKey}
              file={tempPdfBlob || getPdfUrlWithCacheBusting()}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Cargando PDF...</p>
                </div>
              }
              error={
                <div className="p-8 text-center text-red-500">
                  <X className="h-8 w-8 mx-auto mb-2" />
                  <p>Error al cargar PDF</p>
                </div>
              }
              options={defaultPdfOptions}
            >
            <div 
              ref={pageRef}
              className="relative cursor-crosshair"
              onClick={handlePageClick}
            >
              <Page 
                pageNumber={pageNumber} 
                renderTextLayer={false}
                renderAnnotationLayer={false}
                width={600}
              />
              
              {/* Show signature positions on current page */}
              {signaturePositions
                .filter(pos => pos.page === pageNumber)
                .map((pos, index) => (
                  <div
                    key={index}
                    className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:bg-red-500"
                    style={{
                      left: `${(pos.x / 595) * 100}%`,
                      top: `${(1 - pos.y / 842) * 100}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSignaturePosition(signaturePositions.indexOf(pos));
                    }}
                    title="Click para eliminar firma"
                  />
                ))}
            </div>
            </Document>
          </div>
        )}

        {/* Page Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
              disabled={pageNumber <= 1}
            >
              Anterior
            </Button>
            <span className="text-sm">
              Página {pageNumber} de {numPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPageNumber(prev => Math.min(numPages, prev + 1))}
              disabled={pageNumber >= numPages}
            >
              Siguiente
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            {signaturePositions.length} firma(s) agregada(s)
            {proxiedPdfUrl.includes('/api/pdf/proxy') && (
              <span className="ml-2 text-green-600">• Proxy activo</span>
            )}
            {proxiedPdfUrl.includes('fallback=true') && (
              <span className="ml-2 text-orange-600">• URL directa</span>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg text-sm">
          <p className="font-semibold text-blue-900 dark:text-blue-100">Instrucciones:</p>
          <p className="text-blue-800 dark:text-blue-200">1. Haz clic en el PDF donde quieras agregar una firma</p>
          <p className="text-blue-800 dark:text-blue-200">2. Dibuja tu firma en el cuadro que aparecerá</p>
          <p className="text-blue-800 dark:text-blue-200">3. Repite para agregar más firmas</p>
          <p className="text-blue-800 dark:text-blue-200">4. Guarda o descarga el PDF firmado</p>
          <p className="text-red-600 dark:text-red-400 mt-2">
            <strong>Nota:</strong> Los puntos azules indican las firmas. Haz clic en ellos para eliminar.
          </p>
          {!clientId && (
            <p className="text-orange-600 dark:text-orange-400 mt-2">
              <strong>Aviso:</strong> La opción "Guardar Firmado" solo está disponible para clientes existentes. Puedes descargar el PDF firmado.
            </p>
          )}
        </div>

        {/* Signature Dialog */}
        <Dialog open={isSignatureDialogOpen} onOpenChange={setIsSignatureDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5" />
                Agregar Firma
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg bg-background p-2">
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    width: 400,
                    height: 200,
                    className: 'signature-canvas w-full h-full rounded'
                  }}
                  backgroundColor="white"
                  penColor="black"
                />
              </div>
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={clearSignature}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Limpiar
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSignatureDialogOpen(false);
                      setPendingPosition(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={addSignature}>
                    Agregar Firma
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
