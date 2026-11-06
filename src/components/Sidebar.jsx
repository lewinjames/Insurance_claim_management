import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard,
  FileCheck2,
  ScrollText,
  Users2,
  FileSearch,
  BadgeDollarSign,
  UserCog,
  BarChart3,
  Network,
  BookOpenCheck
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role || 'Policyholder';

  const navLinks = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['Admin', 'Claim Officer', 'Policyholder']
    },
    {
      to: '/claims',
      label: role === 'Policyholder' ? 'My Claims' : 'Claims Workflow',
      icon: FileCheck2,
      roles: ['Admin', 'Claim Officer', 'Policyholder']
    },
    {
      to: '/policies',
      label: 'Policies',
      icon: ScrollText,
      roles: ['Admin', 'Claim Officer', 'Policyholder']
    },
    {
      to: '/policyholders',
      label: 'Policyholders',
      icon: Users2,
      roles: ['Admin', 'Claim Officer', 'Policyholder']
    },
    {
      to: '/reviews',
      label: 'Claim Reviews',
      icon: FileSearch,
      roles: ['Admin', 'Claim Officer']
    },
    {
      to: '/settlements',
      label: 'Settlements',
      icon: BadgeDollarSign,
      roles: ['Admin', 'Policyholder', 'Claim Officer']
    },
    {
      to: '/users',
      label: 'User Accounts',
      icon: UserCog,
      roles: ['Admin']
    },
    {
      to: '/reports',
      label: 'Reports & Stats',
      icon: BarChart3,
      roles: ['Admin', 'Claim Officer', 'Policyholder']
    },
    {
      to: '/er-diagram',
      label: 'ER Diagram (7 Models)',
      icon: Network,
      roles: ['Admin', 'Claim Officer', 'Policyholder']
    },
    {
      to: '/docs',
      label: 'Postman & Project Spec',
      icon: BookOpenCheck,
      roles: ['Admin', 'Claim Officer', 'Policyholder']
    }
  ];

  const visibleLinks = navLinks.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div>
        <div className="px-3 py-2 mb-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {role} Portal
          </p>
        </div>
        <nav className="space-y-1">
          {visibleLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* College Project Stamp */}
      <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-500 shadow-xs space-y-1">
        <p className="font-semibold text-slate-800">Project 29: Insurance Claim</p>
        <p className="text-[11px] text-slate-500">MERN Stack • Vite • React Router</p>
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-emerald-700">
          <span className="flex items-center gap-1 font-mono">● All 7 APIs Ready</span>
        </div>
      </div>
    </aside>
  );
}
