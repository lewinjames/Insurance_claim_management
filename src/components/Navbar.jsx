import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldCheck, LogOut, UserCircle, Database, FileText, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { user, logout, quickLogin } = useAuth();

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Project Tag */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg hover:text-blue-300 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="leading-tight">ClaimGuard</span>
                <span className="text-[10px] text-blue-300 font-mono tracking-wider">PROJECT #29 • COLLEGE INTERNAL</span>
              </div>
            </Link>
          </div>

          {/* Quick Role Switcher for Internal Mark Evaluation */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Quick Switch:
            </span>
            <button
              onClick={() => quickLogin('Admin')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                user?.role === 'Admin'
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => quickLogin('Claim Officer')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                user?.role === 'Claim Officer'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              Claim Officer
            </button>
            <button
              onClick={() => quickLogin('Policyholder')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                user?.role === 'Policyholder'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              Policyholder
            </button>
          </div>

          {/* Navigation Links & User Profile */}
          <div className="flex items-center gap-3">
            <Link
              to="/er-diagram"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-blue-400" />
              ER Diagram
            </Link>
            <Link
              to="/docs"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              Postman & Docs
            </Link>

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-700">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-white truncate max-w-[140px]">{user.name}</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded w-fit self-end bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-xs font-medium text-white rounded-lg transition-colors"
              >
                <UserCircle className="w-4 h-4" />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
