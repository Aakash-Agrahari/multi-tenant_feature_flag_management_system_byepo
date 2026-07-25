import React, { useEffect, useState } from 'react';
import { HiOutlineClipboardList, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import { listAuditLogs } from '../services/auditService.js';

const ACTION_STYLES = {
  CREATE: 'bg-emerald-100 text-emerald-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  ENABLE: 'bg-brand-100 text-brand-700',
  DISABLE: 'bg-slate-100 text-slate-500',
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1 });

  useEffect(() => {
    setLoading(true);
    listAuditLogs({ page, limit: 15 })
      .then((res) => {
        setLogs(res.data.logs);
        setMeta(res.meta);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-bold text-slate-900">Audit Logs</h1>
      <p className="mt-1 text-sm text-slate-500">A full history of every change made to your organization's feature flags.</p>

      <div className="card mt-6 overflow-hidden !p-0">
        {loading ? (
          <p className="p-6 text-sm text-slate-400">Loading…</p>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <HiOutlineClipboardList className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">No audit history yet.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Feature</th>
                <th className="px-6 py-3">Performed By</th>
                <th className="px-6 py-3">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <span className={`badge ${ACTION_STYLES[log.action] || 'bg-slate-100 text-slate-500'}`}>{log.action}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-600">{log.featureKey}</td>
                  <td className="px-6 py-4 text-slate-700">{log.performedByName}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary !px-2.5 !py-1.5 disabled:opacity-40">
            <HiOutlineChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-slate-500">Page {page} of {meta.totalPages}</span>
          <button disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary !px-2.5 !py-1.5 disabled:opacity-40">
            <HiOutlineChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
