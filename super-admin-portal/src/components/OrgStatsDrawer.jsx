import React, { useEffect, useState } from 'react';
import { HiOutlineX, HiOutlinePlus, HiOutlineUserCircle } from 'react-icons/hi';
import { getOrganizationStats, listOrgAdmins } from '../services/orgService.js';
import CreateOrgAdminModal from './CreateOrgAdminModal.jsx';

const StatRow = ({ label, value }) => (
  <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm font-semibold text-slate-800">{value}</span>
  </div>
);

const OrgStatsDrawer = ({ org, onClose }) => {
  const [stats, setStats] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const fetchAdmins = () => {
    setLoadingAdmins(true);
    listOrgAdmins(org._id)
      .then((res) => setAdmins(res.data.admins))
      .finally(() => setLoadingAdmins(false));
  };

  useEffect(() => {
    getOrganizationStats(org._id).then((res) => setStats(res.data.stats));
    fetchAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org._id]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
      <div className="h-full w-full max-w-sm overflow-y-auto bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Organization Stats</p>
            <h3 className="font-display text-lg font-semibold text-slate-900">{org.name}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        {!stats ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : (
          <div className="card">
            <StatRow label="Org Admins" value={stats.orgAdminCount} />
            <StatRow label="End Users" value={stats.endUserCount} />
            <StatRow label="Total Users" value={stats.totalUsers} />
            <StatRow label="Total Feature Flags" value={stats.totalFlags} />
            <StatRow label="Enabled Flags" value={stats.enabledFlags} />
            <StatRow label="Disabled Flags" value={stats.disabledFlags} />
            <StatRow label="Scheduled Releases" value={stats.scheduledFlags} />
          </div>
        )}

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-display text-sm font-semibold text-slate-900">Organization Admins</h4>
            <button onClick={() => setShowAdminModal(true)} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800">
              <HiOutlinePlus className="h-3.5 w-3.5" /> Add Admin
            </button>
          </div>

          {loadingAdmins ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : admins.length === 0 ? (
            <div className="card flex flex-col items-center py-6 text-center">
              <HiOutlineUserCircle className="h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">No admin account exists for this organization yet.</p>
              <p className="mt-1 text-xs text-slate-400">Create one so someone can log into the Org Admin Portal.</p>
              <button onClick={() => setShowAdminModal(true)} className="btn-primary mt-3">Add Admin</button>
            </div>
          ) : (
            <div className="card divide-y divide-slate-100 !p-0">
              {admins.map((admin) => (
                <div key={admin._id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                    {admin.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{admin.name}</p>
                    <p className="truncate text-xs text-slate-400">{admin.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAdminModal && (
        <CreateOrgAdminModal
          org={org}
          onClose={() => setShowAdminModal(false)}
          onCreated={(admin) => setAdmins((prev) => [admin, ...prev])}
        />
      )}
    </div>
  );
};

export default OrgStatsDrawer;