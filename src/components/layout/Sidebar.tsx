import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  ArrowDownLeft,
  ArrowUpRight,
  ReceiptText,
  BookOpen,
  FileSpreadsheet,
  History,
  Settings,
  User,
  PlusCircle,
  MinusCircle,
  HelpCircle,
} from 'lucide-react';
import { IksPiLogo } from '../common/IksPiLogo';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const adminNav = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Persetujuan Setoran', path: '/admin/deposit-approvals', icon: ArrowDownLeft },
    { name: 'Persetujuan Penarikan', path: '/admin/withdrawal-approvals', icon: ArrowUpRight },
    { name: 'Verifikasi Registrasi', path: '/admin/registration-approvals', icon: UserCheck },
    { name: 'Data Atlit', path: '/admin/athletes', icon: Users },
    { name: 'Semua Transaksi', path: '/admin/transactions', icon: ReceiptText },
    { name: 'Laporan Keuangan', path: '/admin/reports', icon: FileSpreadsheet },
    { name: 'Log Aktivitas', path: '/admin/activity-logs', icon: History },
    { name: 'Pengaturan & Script', path: '/admin/settings', icon: Settings },
    { name: 'Profil Admin', path: '/admin/profile', icon: User },
  ];

  const athleteNav = [
    { name: 'Dashboard', path: '/athlete/dashboard', icon: LayoutDashboard },
    { name: 'Setor Tabungan', path: '/athlete/deposit', icon: PlusCircle },
    { name: 'Tarik Tabungan', path: '/athlete/withdraw', icon: MinusCircle },
    { name: 'Buku Tabungan Digital', path: '/athlete/passbook', icon: BookOpen },
    { name: 'Riwayat Transaksi', path: '/athlete/transactions', icon: ReceiptText },
    { name: 'Profil Saya', path: '/athlete/profile', icon: User },
  ];

  const items = isAdmin ? adminNav : athleteNav;

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-950 border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <IksPiLogo size="sm" showSubtitle={true} />
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-amber-500 font-mono">
          {isAdmin ? 'MENU PENGURUS CABANG' : 'MENU TABUNGAN ATLIT'}
        </div>

        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/10 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                }`
              }
            >
              <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Info Widget */}
      <div className="p-3 m-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>IKS PI Peduli Atlit</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          Disiplin menabung untuk masa depan dan prestasi pesilat IKS PI Kera Sakti.
        </p>
      </div>

      {/* Footer Branch Tag */}
      <div className="p-3 border-t border-slate-800/80 text-center">
        <p className="text-[10px] font-mono text-slate-500">
          © 2026 IKS PI CABANG KOTA KEDIRI
        </p>
      </div>
    </aside>
  );
};
