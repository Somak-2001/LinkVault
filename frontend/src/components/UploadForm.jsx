import { useState } from "react";
import api from "../services/api";
import { useToast } from "../contexts/ToastContext";

export default function UploadForm() {
  const { showSuccess, showError, showWarning } = useToast();

  // State management
  const [uploadType, setUploadType] = useState("text"); // 'text' or 'file'
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Advanced settings
  const [expiry, setExpiry] = useState("");
  const [password, setPassword] = useState("");
  const [maxViews, setMaxViews] = useState("");

  // Upload state
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle file upload
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (uploadType === "text" && !text) {
      showWarning("Please enter some text");
      return;
    }

    if (uploadType === "file" && !file) {
      showWarning("Please select a file");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      if (uploadType === "text") formData.append("text", text);
      if (uploadType === "file") formData.append("file", file);
      if (expiry) formData.append("expiry", expiry);
      if (password) formData.append("password", password);
      if (maxViews) formData.append("maxViews", maxViews);

      const res = await api.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setLink(res.data.url);
      setCopied(false);
      showSuccess("Content uploaded successfully!");

      // Reset form
      setText("");
      setFile(null);
      setExpiry("");
      setPassword("");
      setMaxViews("");

    } catch (err) {
      console.error(err);
      showError("Upload failed: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setUploadType("file");
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Get file icon based on type
  const getFileIcon = (fileType) => {
    if (!fileType) return "📄";
    if (fileType.startsWith("image/")) return "🖼️";
    if (fileType.startsWith("video/")) return "🎬";
    if (fileType.includes("pdf")) return "📕";
    if (fileType.includes("zip") || fileType.includes("rar")) return "🗜️";
    if (fileType.includes("sheet") || fileType.includes("csv")) return "📊";
    return "📄";
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // If upload is successful, show success card
  if (link) {
    return (
      <div className="vault-gradient-bg">
        <div className="vault-hero">
          <h1 style={{
            fontSize: '48px',
            fontWeight: '800',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <span style={{
              fontSize: '56px',
              filter: 'drop-shadow(0 4px 20px rgba(139, 92, 246, 0.6))',
              animation: 'vault-pulse 2s ease-in-out infinite',
              color: '#fff',
              WebkitTextFillColor: '#fff'
            }}>🔒</span>
            <span style={{
              background: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 50%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'vault-gradient 3s ease infinite',
              backgroundSize: '200% 200%',
              letterSpacing: '-1px'
            }}>LinkVault</span>
          </h1>
          <style>{`
            @keyframes vault-gradient {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            @keyframes vault-pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
          `}</style>
          <p>Share files and text with confidence. Auto-expiring, password-protected links.</p>
        </div>

        <div className="vault-container">
          <div className="glass-card vault-success-card">
            <div className="vault-success-icon">✓</div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
              Link Created Successfully!
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0' }}>
              Your content is secure and ready to share
            </p>

            <div className="vault-link-display">
              <input
                type="text"
                readOnly
                value={link}
                className="vault-link-input"
              />
              <button
                onClick={copyToClipboard}
                className="vault-btn vault-btn-success"
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  transform: copied ? 'scale(0.98)' : 'scale(1)'
                }}
              >
                {copied ? "✅ Copied!" : "Copy"}
              </button>
            </div>

            <button
              onClick={() => {
                setLink("");
                setText("");
                setFile(null);
              }}
              className="vault-btn vault-btn-secondary"
              style={{ marginTop: '16px' }}
            >
              ← Upload Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main upload form
  return (
    <div className="vault-gradient-bg">
      {/* Hero Section */}
      <div className="vault-hero">
        <h1 style={{
          fontSize: '48px',
          fontWeight: '800',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <span style={{
            fontSize: '56px',
            filter: 'drop-shadow(0 4px 20px rgba(139, 92, 246, 0.6))',
            animation: 'vault-pulse 2s ease-in-out infinite',
            color: '#fff',
            WebkitTextFillColor: '#fff'
          }}>🔒</span>
          <span style={{
            background: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 50%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'vault-gradient 3s ease infinite',
            backgroundSize: '200% 200%',
            letterSpacing: '-1px'
          }}>LinkVault</span>
        </h1>
        <style>{`
          @keyframes vault-gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes vault-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}</style>
        <p>Share files and text with confidence. Auto-expiring, password-protected links.</p>
      </div>

      {/* Upload Form */}
      <div className="vault-container">
        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '32px' }}>
          {/* Tabs for Text vs File */}
          <div className="vault-tabs">
            <button
              type="button"
              className={`vault-tab ${uploadType === "text" ? "active" : ""}`}
              onClick={() => setUploadType("text")}
            >
              📝 Text
            </button>
            <button
              type="button"
              className={`vault-tab ${uploadType === "file" ? "active" : ""}`}
              onClick={() => setUploadType("file")}
            >
              📁 File
            </button>
          </div>

          {/* TEXT UPLOAD */}
          {uploadType === "text" && (
            <div className="vault-form-group">
              <label className="vault-label">Your Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your text here..."
                rows={8}
                disabled={loading}
                className="glass-input"
                style={{
                  resize: 'vertical',
                  minHeight: '150px',
                  fontFamily: 'monospace',
                  fontSize: '16px'
                }}
              />
            </div>
          )}

          {/* FILE UPLOAD */}
          {uploadType === "file" && (
            <div className="vault-form-group">
              <label className="vault-label">Your File</label>

              {!file ? (
                /* Drag and Drop Zone */
                <div
                  className={`vault-dropzone ${isDragging ? "dragging" : ""}`}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("file-input").click()}
                >
                  <div className="vault-dropzone-icon">☁️</div>
                  <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                    Drop your file here
                  </p>
                  <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '16px' }}>
                    or click to browse
                  </p>
                  <button
                    type="button"
                    className="vault-btn vault-btn-secondary"
                    style={{ pointerEvents: 'none' }}
                  >
                    Choose File
                  </button>
                  <input
                    id="file-input"
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    style={{ display: 'none' }}
                    disabled={loading}
                  />
                </div>
              ) : (
                /* File Preview */
                <div className="vault-file-preview">
                  <div className="vault-file-icon">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="vault-file-info">
                    <div className="vault-file-name">{file.name}</div>
                    <div className="vault-file-size">{formatFileSize(file.size)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="vault-file-remove"
                    disabled={loading}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Advanced Settings (Collapsible) */}
          <details className="vault-advanced">
            <summary>⚙️ Advanced Settings</summary>
            <div className="vault-advanced-content">
              {/* Password */}
              <div className="vault-form-group">
                <label className="vault-label">🔐 Password Protection</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Optional password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="glass-input"
                    style={{ paddingRight: '50px' }}
                  />
                  {password && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle-btn"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  )}
                </div>
              </div>

              {/* Max Views */}
              <div className="vault-form-group">
                <label className="vault-label">👁️ View Limit</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Max views (optional)"
                  value={maxViews}
                  onChange={(e) => setMaxViews(e.target.value)}
                  disabled={loading}
                  className="glass-input"
                />
              </div>

              {/* Expiry */}
              <div className="vault-form-group" style={{ marginBottom: '0' }}>
                <label className="vault-label">⏰ Expiration Time</label>
                <input
                  type="datetime-local"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  disabled={loading}
                  className="glass-input"
                />
                <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '8px' }}>
                  Default: 10 minutes from upload
                </p>
              </div>
            </div>
          </details>

          {/* Upload Button */}
          {loading ? (
            <div className="vault-progress">
              <div className="vault-progress-bar">
                <div className="vault-progress-fill"></div>
              </div>
              <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                ⏳ Uploading...
              </p>
            </div>
          ) : (
            <button
              type="submit"
              className="vault-btn vault-btn-primary"
              style={{ width: '100%', marginTop: '24px', justifyContent: 'center' }}
            >
              🚀 Upload
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
