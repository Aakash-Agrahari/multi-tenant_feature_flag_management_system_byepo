import React, { useEffect, useState } from 'react';
import { HiOutlineOfficeBuilding, HiOutlineUsers, HiOutlineFlag } from 'react-icons/hi';
import { getDashboardStats, listOrganizations } from '../services/orgService.js';

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="card flex items-center gap-4">
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent}`}>
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-display text-2xl font-bold text-slate-900">{value ?? '—'}</p>
    </div>
  </div>
);

const Overview = () => {
  const [stats, setStats] = useState(null);
  const [recentOrgs, setRecentOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, orgsRes] = await Promise.all([getDashboardStats(), listOrganizations()]);
        setStats(statsRes.data.stats);
        setRecentOrgs(orgsRes.data.organizations.slice(0, 5));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-bold text-slate-900">Platform Overview</h1>
      <p className="mt-1 text-sm text-slate-500">A bird's-eye view of every organization on the platform.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={HiOutlineOfficeBuilding} label="Organizations" value={stats?.organizations} accent="bg-brand-100 text-brand-700" />
        <StatCard icon={HiOutlineUsers} label="Total Users" value={stats?.users} accent="bg-teal-100 text-teal-700" />
        <StatCard icon={HiOutlineFlag} label="Feature Flags" value={stats?.featureFlags} accent="bg-amber-100 text-amber-700" />
      </div>

      <div className="card mt-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-slate-900">Recently Created Organizations</h2>
        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : recentOrgs.length === 0 ? (
          <p className="text-sm text-slate-400">No organizations yet. Create the first one to get started.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentOrgs.map((org) => (
              <div key={org._id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{org.name}</p>
                  <p className="text-xs text-slate-400">{org.userCount} users · {org.flagCount} flags</p>
                </div>
                <span className="text-xs text-slate-400">{new Date(org.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Overview;
