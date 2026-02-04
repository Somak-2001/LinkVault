import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

        // If backend says expired
        if (res.status === 403) {
          setError("Invalid or expired link");
          return;
        }

        // If response is JSON → text content
        if (res.headers["content-type"]?.includes("application/json")) {
          const data = JSON.parse(await res.data.text());
          setText(data.content);
          return;
        }

        // Otherwise → file download
        const blob = new Blob([res.data]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "";
        document.body.appendChild(a);
        a.click();
        a.remove();

      } catch (err) {
        setError("Invalid or expired link");
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
        <div className="bg-white p-6 rounded shadow text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">{error}</p>
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
