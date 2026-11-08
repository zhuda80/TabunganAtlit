import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { IksPiLogo } from '../common/IksPiLogo';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { LogOut, User, Bell, ShieldCheck, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <IksPiLogo size="sm" showSubtitle={false} />
            <div className="hidden sm:block">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold block">
                KOTA KEDIRI
              </span>
            </div>
          </Link>
        </div>

        {/* Right: User pill & actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* In-App Android / Mobile Install button */}
          <PWAInstallButton variant="navbar" />
          {/* Role badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs">
            {user?.role === 'ADMIN' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-amber-400">PENGURUS / ADMIN</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="font-semibold text-emerald-400">ATLIT IKS PI</span>
              </>
            )}
          </div>

          {/* User profile dropdown pill */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <Link
              to={user?.role === 'ADMIN' ? '/admin/profile' : '/athlete/profile'}
              title={user?.role === 'ADMIN' ? 'Buka Profil Administrator Cabang' : 'Buka Profil Atlit'}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800/80 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-xs ring-2 ring-slate-800 shadow overflow-hidden shrink-0 group-hover:ring-amber-500/50 transition-all">
                {user?.fotoUrl ? (
                  <img src={user.fotoUrl} alt={user.namaLengkap} className="w-full h-full object-cover" />
                ) : (
                  user?.namaLengkap ? user.namaLengkap.charAt(0).toUpperCase() : 'U'
                )}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-white leading-tight truncate max-w-[140px] group-hover:text-amber-400 transition-colors">
                  {user?.namaLengkap || user?.username}
                </p>
                <p className="text-[10px] text-slate-400">
                  {user?.jabatan || user?.unitRanting || (user?.role === 'ADMIN' ? 'Pengurus Cabang' : 'Atlit Aktif')}
                </p>
              </div>
            </Link>

            {/* Profile icon button */}
            <Link
              to={user?.role === 'ADMIN' ? '/admin/profile' : '/athlete/profile'}
              title={user?.role === 'ADMIN' ? 'Profil Administrator' : 'Profil Atlit'}
              className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
            >
              <User className="w-4 h-4" />
            </Link>

            {/* Settings button - ONLY FOR ADMIN */}
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin/settings"
                title="Pengaturan Sistem & Script (Hanya Admin)"
                className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </Link>
            )}

            {/* Logout button */}
            <button
              onClick={handleLogout}
              title="Keluar dari Akun"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
