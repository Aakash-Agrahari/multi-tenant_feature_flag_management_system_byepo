import React, { useEffect, useState } from 'react';
import { HiOutlinePlus, HiOutlineUsers } from 'react-icons/hi';
import { listEndUsers } from '../services/userService.js';
import CreateEndUserModal from '../components/CreateEndUserModal.jsx';

const EndUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    listEndUsers()
      .then((res) => setUsers(res.data.users))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">End Users</h1>
          <p className="mt-1 text-sm text-slate-500">People in your organization who can check feature availability.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <HiOutlinePlus className="h-4 w-4" /> New End User
        </button>
      </div>

      <div className="card mt-6 overflow-hidden !p-0">
        {loading ? (
          <p className="p-6 text-sm text-slate-400">Loading…</p>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <HiOutlineUsers className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">No end users yet.</p>
            <button onClick={() => setShowModal(true)} className="btn-primary mt-4">Create the first one</button>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-800">{u.name}</td>
                  <td className="px-6 py-4 text-slate-600">{u.email}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <CreateEndUserModal onClose={() => setShowModal(false)} onCreated={(u) => setUsers((prev) => [u, ...prev])} />
      )}
    </div>
  );
};

export default EndUsers;
