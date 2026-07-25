import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { HiOutlineFlag, HiOutlineViewGrid, HiOutlineClipboardList, HiOutlineUsers, HiOutlineLogout } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext.jsx';

const navItems = [
  { to: '/', label: 'Overview', icon: HiOutlineViewGrid, end: true },
  { to: '/flags', label: 'Feature Flags', icon: HiOutlineFlag },
  { to: '/audit-logs', label: 'Audit Logs', icon: HiOutlineClipboardList },
  { to: '/end-users', label: 'End Users', icon: HiOutlineUsers },
];

const DashboardLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-2.5 border-b border-slate-200 px-6 py-5">
          <HiOutlineFlag className="h-7 w-7 text-brand-600" />
          <div>
            <p className="font-display text-sm font-bold leading-tight text-slate-900">Org Admin</p>
            <p className="truncate text-xs text-slate-400">{user?.organization ? 'Feature Flag Manager' : ''}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800">{user?.name}</p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-red-600">
            <HiOutlineLogout className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
