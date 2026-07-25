import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { HiOutlinePlus, HiOutlineSearch, HiOutlinePencil, HiOutlineTrash, HiOutlineFlag, HiOutlineClock } from 'react-icons/hi';
import { listFlags, toggleFlag, deleteFlag } from '../services/flagService.js';
import FlagFormModal from '../components/FlagFormModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const StatusBadge = ({ flag }) => {
  const now = new Date();
  const isScheduled = flag.scheduledReleaseAt && new Date(flag.scheduledReleaseAt) > now;
  if (!flag.isEnabled) return <span className="badge bg-slate-100 text-slate-500">Disabled</span>;
  if (isScheduled) return <span className="badge bg-amber-100 text-amber-700">Scheduled</span>;
  return <span className="badge bg-emerald-100 text-emerald-700">Live</span>;
};

const Flags = () => {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFlag, setEditingFlag] = useState(null);
  const [deletingFlag, setDeletingFlag] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchFlags = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listFlags({ search: search || undefined, status: status || undefined });
      setFlags(res.data.flags);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const t = setTimeout(fetchFlags, 300); // debounce search
    return () => clearTimeout(t);
  }, [fetchFlags]);

  const handleToggle = async (flag) => {
    try {
      const res = await toggleFlag(flag._id);
      setFlags((prev) => prev.map((f) => (f._id === flag._id ? res.data.flag : f)));
      toast.success(`Flag ${res.data.flag.isEnabled ? 'enabled' : 'disabled'}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle flag');
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteFlag(deletingFlag._id);
      setFlags((prev) => prev.filter((f) => f._id !== deletingFlag._id));
      toast.success('Feature flag deleted');
      setDeletingFlag(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete flag');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Feature Flags</h1>
          <p className="mt-1 text-sm text-slate-500">Create, roll out, and schedule flags for your organization.</p>
        </div>
        <button onClick={() => { setEditingFlag(null); setShowModal(true); }} className="btn-primary">
          <HiOutlinePlus className="h-4 w-4" /> New Flag
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <HiOutlineSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input-field pl-9"
            placeholder="Search by key or name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input-field sm:w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="enabled">Enabled</option>
          <option value="disabled">Disabled</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      <div className="card mt-4 overflow-hidden !p-0">
        {loading ? (
          <p className="p-6 text-sm text-slate-400">Loading…</p>
        ) : flags.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <HiOutlineFlag className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">No feature flags match your filters.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Flag</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Rollout</th>
                <th className="px-6 py-3">Schedule</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {flags.map((flag) => (
                <tr key={flag._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800">{flag.name}</p>
                    <p className="font-mono text-xs text-slate-400">{flag.key}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <StatusBadge flag={flag} />
                      <button
                        onClick={() => handleToggle(flag)}
                        className={`relative h-5 w-9 rounded-full transition ${flag.isEnabled ? 'bg-brand-600' : 'bg-slate-300'}`}
                        title="Toggle enabled"
                      >
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${flag.isEnabled ? 'left-4.5 translate-x-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{flag.rolloutPercentage}%</td>
                  <td className="px-6 py-4 text-slate-500">
                    {flag.scheduledReleaseAt ? (
                      <span className="inline-flex items-center gap-1 text-xs">
                        <HiOutlineClock className="h-3.5 w-3.5" /> {new Date(flag.scheduledReleaseAt).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => { setEditingFlag(flag); setShowModal(true); }} className="text-slate-400 hover:text-brand-600" title="Edit">
                        <HiOutlinePencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeletingFlag(flag)} className="text-slate-400 hover:text-red-600" title="Delete">
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <FlagFormModal
          flag={editingFlag}
          onClose={() => setShowModal(false)}
          onSaved={(flag) => {
            setFlags((prev) => {
              const exists = prev.some((f) => f._id === flag._id);
              return exists ? prev.map((f) => (f._id === flag._id ? flag : f)) : [flag, ...prev];
            });
          }}
        />
      )}
      {deletingFlag && (
        <ConfirmDialog
          title="Delete feature flag?"
          message={`This will permanently remove "${deletingFlag.name}". This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeletingFlag(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default Flags;
