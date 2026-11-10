"use client";

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, X, AlertCircle, Loader2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { auth } from '@/lib/firebase';

interface FileUploaderProps {
  label: string;
  accept?: string;
  folder?: 'documents' | 'products' | 'machinery';
  currentValue?: string;
  onUploadComplete: (url: string) => void;
  onClear?: () => void;
  helperText?: string;
  allowManualUrl?: boolean;
}

export default function FileUploader({
  label,
  accept = 'image/jpeg,image/png,image/webp,application/pdf',
  folder = 'documents',
  currentValue = '',
  onUploadComplete,
  onClear,
  helperText = 'Upload photo or PDF scan (Max 5MB)',
  allowManualUrl = true,
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentValue);
  const [fileName, setFileName] = useState<string>('');
  const [showManualUrl, setShowManualUrl] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPdf = previewUrl.startsWith('data:application/pdf') || previewUrl.toLowerCase().endsWith('.pdf') || fileName.toLowerCase().endsWith('.pdf');
  const isImage = previewUrl && !isPdf;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size on client
    if (file.size > 5 * 1024 * 1024) {
      setError('File size 5MB se zyada hai. Kripya choti file chunein.');
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(15);
    setFileName(file.name);

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error('Authentication required: Kripya pehle login karein.');
      }

      setProgress(40);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      setProgress(80);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setProgress(100);
      setPreviewUrl(data.url);
      onUploadComplete(data.url);
    } catch (err: any) {
      console.error('[FileUploader] Error:', err);
      setError(err?.message || 'File upload nahi ho saki. Kripya punah prayas karein.');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setPreviewUrl('');
    setFileName('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onClear) onClear();
    else onUploadComplete('');
  };

  const handleApplyManualUrl = () => {
    if (!manualInput.trim()) return;
    setPreviewUrl(manualInput.trim());
    onUploadComplete(manualInput.trim());
    setShowManualUrl(false);
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.86rem', color: '#334155', marginBottom: '6px' }}>
        {label}
      </label>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Uploaded State: Preview Card */}
      {previewUrl ? (
        <div
          style={{
            background: '#f0fdf4',
            border: '1.5px solid #86efac',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
            {isPdf ? (
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={22} />
              </div>
            ) : isImage ? (
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', background: '#e2e8f0', flexShrink: 0 }}>
                <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle2 size={22} />
              </div>
            )}

            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#14532d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color="#16a34a" /> File Uploaded Successfully
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }}>
                {fileName || (previewUrl.startsWith('data:') ? 'Document attached' : previewUrl)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: '#ffffff',
                border: '1px solid #bbf7d0',
                color: '#15803d',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: '#fee2e2',
                border: 'none',
                color: '#dc2626',
                padding: '6px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Remove file"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      ) : (
        /* Empty / Dropzone State */
        <div>
          {!showManualUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '24px 16px',
                textAlign: 'center',
                background: '#f8fafc',
                cursor: uploading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {uploading ? (
                <div>
                  <Loader2 size={26} className="spin" color="#15803d" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#15803d' }}>
                    Uploading file ({progress}%)…
                  </div>
                  <div style={{ width: '160px', height: '4px', background: '#e2e8f0', borderRadius: '4px', margin: '8px auto 0', overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: '#16a34a', transition: 'width 0.2s ease' }} />
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#e2e8f0', color: '#475569', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                    <Upload size={20} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginBottom: '2px' }}>
                    Click or Drag to Upload Document / Photo
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                    {helperText}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Manual URL Input Fallback */
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '14px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="url"
                  placeholder="https://example.com/document.pdf"
                  value={manualInput}
                  onChange={e => setManualInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.86rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={handleApplyManualUrl}
                  style={{
                    background: '#15803d',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          )}

          {/* Toggle between File Upload and Manual URL */}
          {allowManualUrl && !uploading && (
            <div style={{ marginTop: '6px', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setShowManualUrl(!showManualUrl)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#15803d',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <LinkIcon size={11} />
                {showManualUrl ? 'Switch to direct file upload' : 'Or paste document link manually'}
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{ marginTop: '8px', color: '#dc2626', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
