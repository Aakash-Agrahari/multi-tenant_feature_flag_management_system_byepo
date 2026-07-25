import React, { useEffect, useState } from 'react';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineRefresh } from 'react-icons/hi';
import { evaluateAllFlags } from '../services/flagService.js';
import DashboardLayout from '../layouts/DashboardLayout.jsx';

const REASON_LABEL = {
  disabled: 'This feature is currently turned off for your organization.',
  scheduled: 'This feature is scheduled to release soon.',
  rollout_included: "You're in the rollout group for this feature.",
  rollout_excluded: "This feature is rolling out gradually and hasn't reached you yet.",
};

const FeatureCard = ({ flag }) => (
  <div className="card flex items-start gap-4">
    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${flag.enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
      {flag.enabled ? <HiOutlineCheckCircle className="h-5 w-5" /> : <HiOutlineXCircle className="h-5 w-5" />}
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium text-slate-800">{flag.name}</p>
        <span className={`badge shrink-0 ${flag.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
          {flag.enabled ? 'Available' : 'Not available'}
        </span>
      </div>
      <p className="mt-1 font-mono text-xs text-slate-400">{flag.key}</p>
      <p className="mt-1.5 text-sm text-slate-500">{REASON_LABEL[flag.reason] || ''}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFlags = async () => {
    setLoading(true);
    try {
      const res = await evaluateAllFlags();
      setFlags(res.data.flags);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFlags(); }, []);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Your Features</h1>
          <p className="mt-1 text-sm text-slate-500">Real-time availability, personalized just for you.</p>
        </div>
        <button onClick={fetchFlags} className="btn-secondary">
          <HiOutlineRefresh className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : flags.length === 0 ? (
          <div className="card text-center text-sm text-slate-500">No features have been configured for your organization yet.</div>
        ) : (
          flags.map((flag) => <FeatureCard key={flag.key} flag={flag} />)
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
