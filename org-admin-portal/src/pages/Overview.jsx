import React, { useEffect, useState } from 'react';
import { HiOutlineFlag, HiOutlineCheckCircle, HiOutlineClock, HiOutlineUsers } from 'react-icons/hi';
import { getDashboardStats } from '../services/statsService.js';

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

  useEffect(() => {
    getDashboardStats().then((res) => setStats(res.data.stats));
  }, []);

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-bold text-slate-900">Overview</h1>
      <p className="mt-1 text-sm text-slate-500">A snapshot of your organization's feature flags.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={HiOutlineFlag} label="Total Flags" value={stats?.totalFlags} accent="bg-brand-100 text-brand-700" />
        <StatCard icon={HiOutlineCheckCircle} label="Enabled Flags" value={stats?.enabledFlags} accent="bg-emerald-100 text-emerald-700" />
        <StatCard icon={HiOutlineClock} label="Scheduled Releases" value={stats?.scheduledFlags} accent="bg-amber-100 text-amber-700" />
        <StatCard icon={HiOutlineUsers} label="End Users" value={stats?.endUserCount} accent="bg-indigo-100 text-indigo-700" />
      </div>
    </div>
  );
};

export default Overview;
