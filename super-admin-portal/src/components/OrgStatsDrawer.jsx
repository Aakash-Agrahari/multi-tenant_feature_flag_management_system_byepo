import React, { useEffect, useState } from 'react';
import { HiOutlineX } from 'react-icons/hi';
import { getOrganizationStats } from '../services/orgService.js';

const StatRow = ({ label, value }) => (
  <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm font-semibold text-slate-800">{value}</span>
  </div>
);

const OrgStatsDrawer = ({ org, onClose }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getOrganizationStats(org._id).then((res) => setStats(res.data.stats));
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
      </div>
    </div>
  );
};

export default OrgStatsDrawer;
