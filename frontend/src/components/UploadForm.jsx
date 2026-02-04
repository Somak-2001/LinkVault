import { useState } from "react";
import api from "../services/api";

export default function UploadForm() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [expiry, setExpiry] = useState("");
  const [link, setLink] = useState("");

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
      const formData = new FormData();
      if (text) formData.append("text", text);
      if (file) formData.append("file", file);
      if (expiry) formData.append("expiry", expiry);

      const res = await api.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setLink(res.data.url);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div className="w-full max-w-md">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow mb-4"
      >
        <h2 className="text-xl font-semibold mb-4">
          Upload Content
        </h2>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste text here..."
          rows={5}
          className="w-full border rounded p-2 mb-3"
        />

        <div className="text-center text-gray-500 my-2">OR</div>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full mb-3"
        />

        <input
          type="datetime-local"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          className="w-full border rounded p-2 mb-4"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Upload
        </button>
      </form>

      {link && (
        <div className="bg-green-50 border border-green-300 p-3 rounded">
          <p className="text-sm mb-1">Shareable Link:</p>
          <a
            href={link}
            className="text-blue-600 break-all underline"
            target="_blank"
          >
            {link}
          </a>
        </div>
      )}
    </div>
  );
}
