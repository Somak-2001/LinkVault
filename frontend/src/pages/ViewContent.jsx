import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../contexts/ToastContext";

export default function ViewContent() {
  const { id } = useParams();
  const { showSuccess, showError, showInfo } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [text, setText] = useState("");
  const [fileInfo, setFileInfo] = useState(null);

  const [passwordRequired, setPasswordRequired] = useState(false);
  const [password, setPassword] = useState("");

  const fetchContent = async (providedPassword = null) => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(`/api/content/${id}`, {
        headers: providedPassword
          ? { "x-content-password": providedPassword }
          : {},
      });

      if (res.data.type === "text") {
        setText(res.data.content);
        setFileInfo(null);
      }

      if (res.data.type === "file") {
        setFileInfo(res.data);
        setText("");
      }

      setPasswordRequired(false);
    } catch (err) {
      if (err.response?.status === 401) {
        setPasswordRequired(true);
      } else {
        setError("This link is invalid or has expired.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
    // eslint-disable-next-line
  }, [id]);

  const handlePasswordSubmit = () => {
    if (!password) return;
    fetchContent(password);
  };

  // Copy text to clipboard
  const copyText = () => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        showSuccess('Text copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        showError('Failed to copy text to clipboard');
      });
  };

  // Get file icon based on filename/type
  const getFileIcon = (filename) => {
    if (!filename) return "📄";
    const lower = filename.toLowerCase();
    if (lower.match(/\.(jpg|jpeg|png|gif|bmp|svg|webp)$/)) return "🖼️";
    if (lower.match(/\.(mp4|avi|mov|wmv|flv|webm)$/)) return "🎬";
    if (lower.match(/\.pdf$/)) return "📕";
    if (lower.match(/\.(zip|rar|7z|tar|gz)$/)) return "🗜️";
    if (lower.match(/\.(xls|xlsx|csv)$/)) return "📊";
    if (lower.match(/\.(doc|docx)$/)) return "📘";
    if (lower.match(/\.(ppt|pptx)$/)) return "📙";
    return "📄";
  };

  // Download file with save dialog using File System Access API
  const handleDownloadWithDialog = async () => {
    if (!fileInfo?.downloadUrl) return;

    try {
      // Check if File System Access API is supported (Chrome, Edge, Opera)
      if ('showSaveFilePicker' in window) {
        // Fetch the file as a Blob
        const response = await fetch(fileInfo.downloadUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();

        // Get file extension from filename
        const fileName = fileInfo.originalFileName || 'download';
        const fileExtension = fileName.includes('.') ? fileName.split('.').pop() : '';

        // Prepare file picker options
        const opts = {
          suggestedName: fileName,
          types: fileExtension ? [{
            description: `${fileExtension.toUpperCase()} File`,
            accept: {
              [`${blob.type || 'application/octet-stream'}`]: [`.${fileExtension}`]
            }
          }] : []
        };

        // Show save file picker
        const fileHandle = await window.showSaveFilePicker(opts);

        // Create a writable stream
        const writableStream = await fileHandle.createWritable();

        // Write the blob to the file
        await writableStream.write(blob);

        // Close the stream
        await writableStream.close();

        showSuccess(`File saved successfully! (${(blob.size / 1024).toFixed(1)} KB)`);
      } else {
        // Fallback for browsers that don't support File System Access API
        showInfo('Your browser doesn\'t support custom save location. Downloading to default folder...');

        // Use the regular download method as fallback
        await handleDownload();
      }

    } catch (error) {
      // User cancelled the save dialog
      if (error.name === 'AbortError') {
        showInfo('Save cancelled');
        return;
      }

      console.error('Save dialog failed:', error);
      showError(`Failed to save file: ${error.message}`);
    }
  };

  // Download file using Blob
  const handleDownload = async () => {
    if (!fileInfo?.downloadUrl) return;

    try {
      // Fetch the file from Cloudinary as a Blob
      const response = await fetch(fileInfo.downloadUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the content type from response headers
      const contentType = response.headers.get('content-type') || 'application/octet-stream';

      // Get the blob data
      const blob = await response.blob();

      // Create a new blob with the correct MIME type
      const typedBlob = new Blob([blob], { type: contentType });

      // Create an object URL for the blob
      const blobUrl = URL.createObjectURL(typedBlob);

      // Create a temporary anchor and trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileInfo.originalFileName; // Use original filename
      link.style.display = 'none';

      // Add to DOM and trigger click
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      showSuccess(`Downloaded ${fileInfo.originalFileName} (${(blob.size / 1024).toFixed(1)} KB)`);
    } catch (error) {
      console.error('Download failed:', error);
      showError(`Failed to download file: ${error.message}`);
    }
  };

  // ------------------------
  // LOADING
  // ------------------------
  if (loading) {
    return (
      <div className="vault-gradient-bg">
        <div className="vault-container" style={{ paddingTop: '100px', textAlign: 'center' }}>
          <div className="vault-lock-icon">🔒</div>
          <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.7)' }}>
            Loading secure content...
          </p>
        </div>
      </div>
    );
  }

  // ------------------------
  // ERROR
  // ------------------------
  if (error) {
    return (
      <div className="vault-gradient-bg">
        <div className="vault-container" style={{ paddingTop: '100px' }}>
          <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '24px', opacity: '0.6' }}>🔒</div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>
              Access Denied
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '32px' }}>
              {error}
            </p>
            <a href="/" className="vault-btn vault-btn-primary">
              ← Go Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------
  // PASSWORD REQUIRED
  // ------------------------
  if (passwordRequired) {
    return (
      <div className="vault-gradient-bg">
        <div className="vault-container" style={{ paddingTop: '100px' }}>
          <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
            <div className="vault-lock-icon" style={{ fontSize: '64px', marginBottom: '24px' }}>
              🔐
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>
              Password Required
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '32px' }}>
              This content is protected. Please enter the password to unlock.
            </p>

            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                className="glass-input"
                style={{ marginBottom: '16px' }}
                autoFocus
              />
              <button
                onClick={handlePasswordSubmit}
                className="vault-btn vault-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                🔓 Unlock Content
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------
  // TEXT CONTENT
  // ------------------------
  if (text) {
    return (
      <div className="vault-gradient-bg">
        <div className="vault-container" style={{ paddingTop: '60px' }}>
          <div className="glass-card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--vault-purple-600), var(--vault-purple-500))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                📝
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
                  Secure Text
                </h2>
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', margin: '0' }}>
                  This content will auto-delete after expiry
                </p>
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--vault-glass-border)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              fontFamily: 'monospace',
              fontSize: '14px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              {text}
            </div>

            <button
              onClick={copyText}
              className="vault-btn vault-btn-success"
              style={{
                width: '100%',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: copied ? 'scale(0.98)' : 'scale(1)'
              }}
            >
              {copied ? '✅ Copied!' : '📋 Copy to Clipboard'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------
  // FILE CONTENT (FORCED DOWNLOAD)
  // ------------------------
  if (fileInfo) {
    return (
      <div className="vault-gradient-bg">
        <div className="vault-container" style={{ paddingTop: '60px' }}>
          <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{
              width: '96px',
              height: '96px',
              margin: '0 auto 24px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, var(--vault-purple-600), var(--vault-purple-500))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              boxShadow: '0 8px 30px rgba(139, 92, 246, 0.3)',
            }}>
              {getFileIcon(fileInfo.originalFileName)}
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
              File Ready for Download
            </h2>

            <p style={{
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '8px',
              fontWeight: '600'
            }}>
              {fileInfo.originalFileName || "Shared file"}
            </p>

            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '24px' }}>
              Choose your download option below
            </p>


            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handleDownload}
                className="vault-btn vault-btn-primary"
                style={{
                  fontSize: '16px',
                  padding: '16px 32px',
                  boxShadow: '0 8px 30px rgba(139, 92, 246, 0.4)',
                }}
              >
                ⬇️ Quick Download
              </button>

              <button
                onClick={handleDownloadWithDialog}
                className="vault-btn vault-btn-secondary"
                style={{
                  fontSize: '16px',
                  padding: '16px 32px',
                  boxShadow: '0 8px 30px rgba(139, 92, 246, 0.4)',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(37, 99, 235, 0.8))',
                }}
              >
                📁 Save As...
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
