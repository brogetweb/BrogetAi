"use client";

import { useEffect, useMemo, useState } from "react";
import { useDesk } from "@/components/admin-shell";
import { deleteKycDocument, listKycDocuments, type KycDocumentRow } from "@/lib/api";

const tones: Record<string, string> = {
  Verified: "bg-[#e8f8ee] text-[#16a34a]",
  "In review": "bg-[#eaf1ff] text-[#2f6bff]",
  Pending: "bg-[#fff6e5] text-[#d97706]",
};

export function KycDesk() {
  const { notify } = useDesk();
  const [rows, setRows] = useState<KycDocumentRow[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<KycDocumentRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    listKycDocuments()
      .then((documents) => {
        if (active) setRows(documents);
      })
      .catch((caught) => {
        if (active) setError(caught instanceof Error ? caught.message : "Could not load KYC documents.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((file) => [file.agentName, file.agentId, file.kind, file.fileName, file.status].join(" ").toLowerCase().includes(needle));
  }, [query, rows]);
  const open = rows.find((file) => file.id === openId) ?? null;

  async function remove(file: KycDocumentRow) {
    setDeleting(true);
    try {
      await deleteKycDocument(file.id);
      setRows((current) => current.filter((row) => row.id !== file.id));
      if (openId === file.id) setOpenId(null);
      setPendingDelete(null);
      notify("ok", "Document deleted", file.fileName);
    } catch (caught) {
      notify("bad", "Could not delete the document", caught instanceof Error ? caught.message : "Try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Submitted" value={rows.length} className="bg-white" />
        <Stat label="In review" value={rows.filter((file) => file.status === "In review").length} className="bg-[#eaf1ff]" />
        <Stat label="Verified" value={rows.filter((file) => file.status === "Verified").length} className="bg-[#e8f8ee]" />
      </div>
      <section className="overflow-hidden rounded-2xl border border-[#eef1f6] bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-[#eef1f6] px-4 py-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search documents"
            aria-label="Search documents"
            className="w-full max-w-xs rounded-xl border border-[#eef1f6] bg-[#f8fafc] px-3 py-2 text-sm font-semibold outline-none focus:border-[#2f6bff]"
          />
          <p className="shrink-0 text-xs font-bold text-[#8b95a7]">{loading ? "Loading" : `${visible.length} shown`}</p>
        </div>
        {error ? <p className="px-4 py-6 text-sm font-bold text-[#dc2626]">{error}</p> : null}
        {!error && loading ? <p className="px-4 py-10 text-center text-sm font-semibold text-[#8b95a7]">Loading documents</p> : null}
        {!error && !loading && visible.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm font-semibold text-[#8b95a7]">No KYC documents yet. They appear here when an agent uploads them.</p>
        ) : null}
        {!error && visible.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[#f8fafc] text-[11px] font-extrabold tracking-wide text-[#8b95a7]">
                <tr>
                  {["Agent", "Document", "File", "Status", ""].map((column) => (
                    <th key={column || "view"} className="px-4 py-3 font-extrabold">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((file) => (
                  <tr key={file.id} className="border-t border-[#f1f4f8]">
                    <td className="px-4 py-3">
                      <p className="font-extrabold text-[#12182b]">{file.agentName}</p>
                      <p className="text-xs font-bold text-[#8b95a7]">{file.agentId}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#3d4658]">{file.kind}</td>
                    <td className="px-4 py-3 font-semibold text-[#3d4658]">{file.fileName}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${tones[file.status] ?? "bg-[#f4f7fc] text-[#5c677a]"}`}>{file.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setOpenId(file.id)} className="rounded-xl border border-[#d6e4ff] bg-[#eaf1ff] px-3 py-1.5 text-xs font-extrabold text-[#2f6bff]">
                          View
                        </button>
                        <button type="button" onClick={() => setPendingDelete(file)} className="rounded-xl border border-[#fecaca] px-3 py-1.5 text-xs font-extrabold text-[#dc2626]">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
      {open ? (
        <div className="fixed inset-0 z-50">
          <button type="button" aria-label="Close document" onClick={() => setOpenId(null)} className="absolute inset-0 bg-[#0e1b33]/45" />
          <aside className="drawer-in absolute inset-y-0 right-0 w-full bg-white p-5 shadow-2xl sm:max-w-[420px] sm:rounded-l-[28px]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold tracking-[0.12em] text-[#8b95a7]">{open.kind}</p>
                <h2 className="text-xl font-extrabold">{open.fileName}</h2>
              </div>
              <button type="button" onClick={() => setOpenId(null)} className="grid h-10 w-10 place-items-center rounded-xl border border-[#eef1f6]" aria-label="Close">×</button>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <Item label="Agent" value={`${open.agentName} · ${open.agentId}`} />
              <Item label="Status" value={open.status} />
              <Item label="File" value={open.stored ? "Stored privately" : open.fileName} />
            </dl>
            <p className="mt-4 text-sm font-semibold leading-6 text-[#5c677a]">The file stays on the server. This view shows the document the agent uploaded, not a sample card.</p>
            <button type="button" onClick={() => setPendingDelete(open)} className="mt-6 w-full rounded-xl border border-[#fecaca] py-3 text-sm font-extrabold text-[#dc2626]">
              Delete document
            </button>
          </aside>
        </div>
      ) : null}
      {pendingDelete ? (
        <div className="fixed inset-0 z-[70]">
          <button type="button" aria-label="Cancel delete" onClick={() => { if (!deleting) setPendingDelete(null); }} className="absolute inset-0 bg-[#0e1b33]/45" />
          <div className="absolute left-1/2 top-1/2 w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#e6ebf5] bg-white p-5 shadow-[0_18px_50px_rgba(18,24,43,0.16)]">
            <p className="text-xs font-extrabold tracking-[0.12em] text-[#8b95a7]">DELETE DOCUMENT</p>
            <h2 className="mt-1 text-xl font-extrabold">Delete {pendingDelete.fileName}?</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#5c677a]">This removes the {pendingDelete.kind} document uploaded by {pendingDelete.agentName}.</p>
            <div className="mt-5 flex gap-3">
              <button type="button" disabled={deleting} onClick={() => setPendingDelete(null)} className="flex-1 rounded-xl border border-[#e6ebf5] py-3 text-sm font-extrabold disabled:opacity-60">Keep</button>
              <button type="button" disabled={deleting} onClick={() => void remove(pendingDelete)} className="flex-1 rounded-xl bg-[#dc2626] py-3 text-sm font-extrabold text-white disabled:opacity-60">{deleting ? "Deleting" : "Delete"}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <article className={`rounded-2xl border border-[#eef1f6] p-4 ${className}`}>
      <p className="text-3xl font-extrabold tracking-tight">{value}</p>
      <p className="mt-1 text-sm font-extrabold">{label}</p>
    </article>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-extrabold text-[#8b95a7]">{label}</dt>
      <dd className="font-extrabold text-[#12182b]">{value}</dd>
    </div>
  );
}
