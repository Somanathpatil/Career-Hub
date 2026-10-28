import { useState } from "react";
import api from "../api/api";

export default function BackendTest() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testBackend = async () => {
    try {
      setLoading(true);
      setResult("");

      // Replace this with an existing GET endpoint
      // that your current JWT configuration permits.
      const response = await api.get("/api/matching/user/1/jobs");

      setResult(
        `Connection successful!\n${JSON.stringify(
          response.data,
          null,
          2
        )}`
      );
    } catch (error) {
      setResult(
        `Request failed: ${
          error.response?.status ?? error.message
        }\n${
          JSON.stringify(error.response?.data ?? {}, null, 2)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">CareerHub API Test</h1>

        <p className="my-3 text-slate-600">
          Test the connection between React and Spring Boot.
        </p>

        <button
          onClick={testBackend}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Connecting..." : "Test Backend"}
        </button>

        {result && (
          <pre className="mt-5 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-100 p-4 text-sm">
            {result}
          </pre>
        )}
      </div>
    </div>
  );
}
