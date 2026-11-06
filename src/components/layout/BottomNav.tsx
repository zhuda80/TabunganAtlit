import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  PlusCircle,
  MinusCircle,
  BookOpen,
  Users,
  User,
  Settings,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const adminTabs = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Setoran', path: '/admin/deposit-approvals', icon: ArrowDownLeft },
    { name: 'Penarikan', path: '/admin/withdrawal-approvals', icon: ArrowUpRight },
    { name: 'Atlit', path: '/admin/athletes', icon: Users },
    { name: 'Profil', path: '/admin/profile', icon: User },
  ];

  const athleteTabs = [
    { name: 'Beranda', path: '/athlete/dashboard', icon: LayoutDashboard },
    { name: 'Setor', path: '/athlete/deposit', icon: PlusCircle },
    { name: 'Tarik', path: '/athlete/withdraw', icon: MinusCircle },
    { name: 'Buku', path: '/athlete/passbook', icon: BookOpen },
    { name: 'Profil', path: '/athlete/profile', icon: User },
  ];

  const tabs = isAdmin ? adminTabs : athleteTabs;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1 safe-area-pb">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive
                    ? 'text-amber-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{tab.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
