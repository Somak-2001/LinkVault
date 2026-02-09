import { useState } from "react";
import api from "../services/api";

export default function UploadForm() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [expiry, setExpiry] = useState("");
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text && !file) {
      alert("Please provide either text or a file");
      return;
    }

    if (text && file) {
      alert("Please choose only one: text or file");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      if (text) formData.append("text", text);
      if (file) formData.append("file", file);
      if (expiry) formData.append("expiry", expiry);

      const res = await api.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setLink(res.data.url);
      setCopied(false);

      // Reset form
      setText("");
      setFile(null);
      setExpiry("");

    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // Helper text logic
  let helperText = "You can upload either text or a file, not both.";
  if (text.length > 0) helperText = "Clear the text to upload a file instead.";
  if (file) helperText = "Remove the file to paste text instead.";

  const fileDisabled = loading || text.length > 0;

  return (
    <div className="w-full max-w-md">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow mb-4"
      >
        <h2 className="text-xl font-semibold mb-4">
          Upload Content
        </h2>

        {/* TEXT INPUT */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste text here..."
          rows={5}
          disabled={loading || file !== null}
          className={`w-full border rounded p-2 mb-2 ${
            file ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
        />

        <p className="text-sm text-gray-500 mb-3">
          {helperText}
        </p>

        <div className="text-center text-gray-400 my-2">OR</div>

        {/* FILE UPLOAD FIELD */}
        <div
          className={`border rounded-md px-3 py-2 flex items-center justify-between mb-3 ${
            fileDisabled
              ? "bg-gray-100 border-gray-200"
              : "border-gray-300"
          }`}
        >
          <span className="text-sm text-gray-600 truncate">
            {file ? file.name : "No file selected"}
          </span>

          <div className="flex items-center gap-3">
            {file && !loading && (
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            )}

            <input
              id="file-input"
              type="file"
              className="hidden"
              disabled={fileDisabled}
              onChange={(e) => setFile(e.target.files[0])}
            />

            <label
              htmlFor="file-input"
              className={`px-3 py-1 text-sm rounded cursor-pointer ${
                fileDisabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Choose File
            </label>
          </div>
        </div>

        {/* EXPIRY FIELD */}
        <input
          type="datetime-local"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          disabled={loading}
          className="w-full border rounded p-2 mb-2"
        />

        <p className="text-sm text-gray-500 mb-4">
          Optional. If not selected, content expires 10 minutes after upload.
        </p>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {/* SUCCESS CARD */}
      {link && (
        <div className="mt-4 border border-green-300 bg-green-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <span className="text-green-600 text-lg mr-2">✔</span>
            <h3 className="text-green-700 font-semibold">
              Upload successful
            </h3>
          </div>

          <div className="bg-white border rounded p-2 text-sm break-all mb-3">
            {link}
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(link);
              setCopied(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}
