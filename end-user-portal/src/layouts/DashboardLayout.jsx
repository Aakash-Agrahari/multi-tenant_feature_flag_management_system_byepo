import React from 'react';
import { HiOutlineSparkles, HiOutlineLogout } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext.jsx';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <HiOutlineSparkles className="h-6 w-6 text-brand-600" />
            <span className="font-display text-base font-bold text-slate-900">My Features</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-800">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
            <button onClick={logout} className="text-slate-400 hover:text-red-600" title="Sign out">
              <HiOutlineLogout className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
    </div>
  );
};

export default DashboardLayout;
