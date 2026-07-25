import React, { useEffect, useState } from 'react';
import { HiOutlinePlus, HiOutlineOfficeBuilding, HiOutlineChartBar } from 'react-icons/hi';
import { listOrganizations } from '../services/orgService.js';
import CreateOrgModal from '../components/CreateOrgModal.jsx';
import OrgStatsDrawer from '../components/OrgStatsDrawer.jsx';

const Organizations = () => {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const res = await listOrganizations();
      setOrgs(res.data.organizations);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrgs(); }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Organizations</h1>
          <p className="mt-1 text-sm text-slate-500">Every tenant provisioned on the platform.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <HiOutlinePlus className="h-4 w-4" /> New Organization
        </button>
      </div>

      <div className="card mt-6 overflow-hidden !p-0">
        {loading ? (
          <p className="p-6 text-sm text-slate-400">Loading…</p>
        ) : orgs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <HiOutlineOfficeBuilding className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">No organizations yet.</p>
            <button onClick={() => setShowModal(true)} className="btn-primary mt-4">Create the first one</button>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Organization</th>
                <th className="px-6 py-3">Users</th>
                <th className="px-6 py-3">Feature Flags</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orgs.map((org) => (
                <tr key={org._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800">{org.name}</p>
                    <p className="text-xs text-slate-400">{org.slug}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{org.userCount}</td>
                  <td className="px-6 py-4 text-slate-600">{org.flagCount}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(org.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelectedOrg(org)} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-800">
                      <HiOutlineChartBar className="h-4 w-4" /> View stats
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <CreateOrgModal onClose={() => setShowModal(false)} onCreated={(org) => setOrgs((prev) => [{ ...org, userCount: 0, flagCount: 0 }, ...prev])} />
      )}
      {selectedOrg && <OrgStatsDrawer org={selectedOrg} onClose={() => setSelectedOrg(null)} />}
    </div>
  );
};

export default Organizations;
