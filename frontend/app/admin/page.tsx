"use client";
import { useEffect, useState } from "react";
import { getRefunds } from "../lib/api";
export default function AdminPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    getRefunds()
      .then(setRequests)
      .catch((err) => setError(err.message));
  }, []);
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-coral">
            Operations
          </p>
          <h1 className="mt-2 text-4xl font-bold">Refund requests</h1>
        </div>
        <p className="text-sm text-ink/60">{requests.length} logged</p>
      </div>
      {error && <p className="mt-8 text-red-700">{error}</p>}
      <div className="mt-8 overflow-x-auto rounded border border-ink/10 bg-white/70">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="border-b border-ink/10 text-xs uppercase tracking-wider text-ink/60">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Customer / order</th>
              <th className="p-4">Complaint</th>
              <th className="p-4">Status</th>
              <th className="p-4">Decision</th>
              <th className="p-4">AI reasoning</th>
            </tr>
          </thead>
          <tbody>
            {requests
              .slice()
              .reverse()
              .map((request) => (
                <tr
                  key={request.id}
                  className="border-b border-ink/10 align-top last:border-0"
                >
                  <td className="p-4 whitespace-nowrap">
                    {new Date(request.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4">
                    {request.customerId}
                    <br />
                    {request.orderId}
                  </td>
                  <td className="max-w-sm p-4">{request.message}</td>
                  <td className="p-4">
                    <span
                      className={`rounded px-2 py-1 text-xs font-bold uppercase ${request.finalStatus === "approved" ? "bg-mint" : request.finalStatus === "denied" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-900"}`}
                    >
                      {request.finalStatus}
                    </span>
                  </td>
                  <td className="max-w-xs p-4">{request.ruleFired}</td>
                  <td className="max-w-sm p-4 text-ink/70">
                    {request.ai.reasoning}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {!requests.length && !error && (
          <p className="p-8 text-center text-ink/60">No requests yet.</p>
        )}
      </div>
    </main>
  );
}
