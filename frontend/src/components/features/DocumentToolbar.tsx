import { useState } from 'react';
import { Button } from '../ui/Button';
import { useExportDocument } from '../../hooks/useDocuments';
import type { Document } from '../../../../shared/types/entities';

interface DocumentToolbarProps {
  document: Document;
  onVersionHistory?: () => void;
  onShare?: () => void;
}

/**
 * DocumentToolbar Component
 *
 * Action toolbar for document operations.
 * Includes export to PDF/DOCX, version history, and sharing.
 *
 * Features:
 * - Export to PDF
 * - Export to DOCX
 * - View version history
 * - Share document (future)
 * - Loading states during export
 */
export function DocumentToolbar({
  document,
  onVersionHistory,
  onShare,
}: DocumentToolbarProps) {
  const { exportToPDF, exportToDOCX, isExporting, error } = useExportDocument();
  const [exportType, setExportType] = useState<'pdf' | 'docx' | null>(null);

  const handleExportPDF = async () => {
    setExportType('pdf');
    try {
      const filename = `${sanitizeFilename(document.title)}.pdf`;
      await exportToPDF(document.id, filename);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExportType(null);
    }
  };

  const handleExportDOCX = async () => {
    setExportType('docx');
    try {
      const filename = `${sanitizeFilename(document.title)}.docx`;
      await exportToDOCX(document.id, filename);
    } catch (err) {
      console.error('DOCX export failed:', err);
    } finally {
      setExportType(null);
    }
  };

  return (
    <div className="border-b border-gray-200 bg-white px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Primary actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportPDF}
            disabled={isExporting}
            variant="secondary"
            size="sm"
          >
            {isExporting && exportType === 'pdf' ? (
              <>
                <SpinnerIcon />
                <span>Exportando...</span>
              </>
            ) : (
              <>
                <PDFIcon />
                <span>Exportar PDF</span>
              </>
            )}
          </Button>

          <Button
            onClick={handleExportDOCX}
            disabled={isExporting}
            variant="secondary"
            size="sm"
          >
            {isExporting && exportType === 'docx' ? (
              <>
                <SpinnerIcon />
                <span>Exportando...</span>
              </>
            ) : (
              <>
                <DOCXIcon />
                <span>Exportar DOCX</span>
              </>
            )}
          </Button>
        </div>

        {/* Right side - Secondary actions */}
        <div className="flex items-center gap-2">
          {onVersionHistory && (
            <Button onClick={onVersionHistory} variant="ghost" size="sm">
              <HistoryIcon />
              <span>Histórico</span>
            </Button>
          )}

          {onShare && (
            <Button onClick={onShare} variant="ghost" size="sm">
              <ShareIcon />
              <span>Compartilhar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * Sanitize filename for safe download
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
}

/**
 * PDF Icon
 */
function PDFIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  );
}

/**
 * DOCX Icon
 */
function DOCXIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  );
}

/**
 * History Icon
 */
function HistoryIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

/**
 * Share Icon
 */
function ShareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
      />
    </svg>
  );
}

/**
 * Spinner Icon
 */
function SpinnerIcon() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
