import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Building2,
  Megaphone,
  User,
  Users,
  ShieldCheck,
  CheckSquare,
  LogOut,
  X,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Badge from './Badge';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'faculty') return '/dashboard/faculty';
    return '/dashboard/student';
  };

  const navLinks = [
    {
      label: 'Dashboard',
      path: getDashboardPath(),
      icon: LayoutDashboard,
    },
    {
      label: 'Campus Events',
      path: '/events',
      icon: Calendar,
    },
    {
      label: 'Resource Booking',
      path: '/resources',
      icon: Building2,
    },
    {
      label: 'Announcements',
      path: '/announcements',
      icon: Megaphone,
    },
    {
      label: 'My Profile',
      path: '/profile',
      icon: User,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-slate-900 text-slate-300 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto flex flex-col border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-white font-extrabold tracking-tight text-base leading-none">
                CampusFlow
              </h1>
              <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">
                Academic ERP
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white lg:hidden rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        {user && (
          <div className="p-4 mx-3 my-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-500/30 overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.department}</p>
              <div className="mt-1">
                <Badge value={user.role} size="xs" />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Core Portal
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* Role specific quick shortcuts */}
          {user?.role === 'admin' && (
            <>
              <div className="pt-4 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Administration
              </div>
              <NavLink
                to="/dashboard/admin"
                onClick={() => onClose && onClose()}
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-purple-300 hover:bg-purple-950/40 transition"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Admin Operations</span>
              </NavLink>
            </>
          )}

          {user?.role === 'faculty' && (
            <>
              <div className="pt-4 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Faculty Workspace
              </div>
              <NavLink
                to="/dashboard/faculty"
                onClick={() => onClose && onClose()}
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-indigo-300 hover:bg-indigo-950/40 transition"
              >
                <CheckSquare className="w-4 h-4 text-indigo-400" />
                <span>Department Portal</span>
              </NavLink>
            </>
          )}
        </div>

        {/* Footer Logout */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
