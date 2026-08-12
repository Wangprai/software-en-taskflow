"use client";

import { api } from "@/lib/axios";
import { useState } from "react";

export default function TestApiPage() {
  const [result, setResult] = useState("");

  const testApi = async () => {
    try {
      const response = await api.get("/auth/me");

      setResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      if (error instanceof Error) {
        setResult(error.message);
      } else {
        setResult("Unknown error");
      }
    }
  };

  return (
    <main className="p-8">
      <h1 className="text-xl font-bold">API Test</h1>

      <button
        onClick={testApi}
        className="mt-4 rounded bg-black px-4 py-2 text-white"
      >
        Test API
      </button>

      <pre className="mt-4 whitespace-pre-wrap">
        {result}
      </pre>
    </main>
  );
}