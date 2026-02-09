import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

export default function ViewContent() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await api.get(`/api/content/${id}`, {
          responseType: "blob",
          validateStatus: () => true,
        });

        if (res.status === 403) {
          setError("This link is invalid or has expired.");
          return;
        }

        if (res.headers["content-type"]?.includes("application/json")) {
          const data = JSON.parse(await res.data.text());
          setText(data.content);
          return;
        }

        // File download
        const blob = new Blob([res.data]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "";
        a.click();
        window.URL.revokeObjectURL(url);

      } catch (err) {
        setError("Unable to access this link.");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded shadow text-center max-w-md">
          <h2 className="text-2xl font-semibold text-red-600 mb-2">
            Link Expired
          </h2>
          <p className="text-gray-600 mb-4">
            {error}
          </p>
          <Link
            to="/"
            className="text-blue-600 underline"
          >
            Go back to upload page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded shadow w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">
          Shared Text
        </h2>

        <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded border mb-4">
          {text}
        </pre>

        <button
          onClick={() => navigator.clipboard.writeText(text)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Copy to Clipboard
        </button>
      </div>
    </div>
  );
}
