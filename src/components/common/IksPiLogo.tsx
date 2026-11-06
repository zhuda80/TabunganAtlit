import React, { useState, useEffect } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  customLogoUrl?: string;
}

export const IksPiLogo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  customLogoUrl,
}) => {
  const [logoSrc, setLogoSrc] = useState<string | null>(customLogoUrl || null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (customLogoUrl) {
      setLogoSrc(customLogoUrl);
      setImageError(false);
      return;
    }

    const loadSettingsLogo = () => {
      try {
        const raw = localStorage.getItem('ikspi_kediri_tabungan_settings');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.logoUrl) {
            setLogoSrc(parsed.logoUrl);
            setImageError(false);
            return;
          }
        }
        setLogoSrc(null);
      } catch {
        setLogoSrc(null);
      }
    };

    loadSettingsLogo();

    // Listen for custom settings update event
    const handleUpdate = () => loadSettingsLogo();
    window.addEventListener('ikspi_settings_updated', handleUpdate);
    return () => {
      window.removeEventListener('ikspi_settings_updated', handleUpdate);
    };
  }, [customLogoUrl]);

  const sizeMap = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-lg',
  };

  const currentSizeClass = sizeMap[size];

  return (
    <div className="flex items-center gap-3">
      {/* Insignia / Crest */}
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 shadow-lg shadow-amber-500/20 p-0.5 shrink-0 ${currentSizeClass.split(' ')[0]} ${currentSizeClass.split(' ')[1]}`}
      >
        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden border border-amber-400/40">
          {logoSrc && !imageError ? (
            <img
              src={logoSrc}
              alt="Logo Tabungan IKS PI"
              className="w-full h-full object-contain p-0.5 rounded-[9px]"
              onError={() => setImageError(true)}
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-radial from-amber-500/20 to-transparent"></div>
              <span className="font-serif font-black text-amber-400 tracking-tighter drop-shadow-md select-none">
                IKS
              </span>
            </>
          )}
        </div>
      </div>

      {/* Typography */}
      <div>
        <div className="flex items-center gap-1.5">
          <h1 className="font-extrabold tracking-tight text-white leading-tight font-serif text-sm md:text-base">
            TABUNGAN ATLIT <span className="text-amber-400">IKS PI</span>
          </h1>
        </div>
        {showSubtitle && (
          <p className="text-[10px] md:text-xs font-medium text-amber-400/90 tracking-wider uppercase font-mono">
            KERA SAKTI • CABANG KOTA KEDIRI
          </p>
        )}
      </div>
    </div>
  );
};
