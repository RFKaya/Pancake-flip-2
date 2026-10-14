import React from 'react';
import { useGameAdmin } from '../context/GameAdminContext';
import { Sun, Moon, Play, CheckCircle2, AlertCircle } from 'lucide-react';

export const Header: React.FC = () => {
  const { tema, toggleTema, degisiklikVarMi, setAktifSekme, surumler } = useGameAdmin();
  const aktifSurum = surumler.find((s) => s.durum === 'yayinlandi') || surumler[0];

  return (
    <header className="h-16 px-6 bg-[var(--kart)] border-b border-[var(--kenar)] flex items-center justify-between gap-8 sticky top-0 z-30 transition-colors">
      {/* Zone 1: Brand title, single element */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setAktifSekme('ozet');
          }}
          className="flex items-center gap-2 group text-decoration-none"
        >
          <div className="w-9 h-9 rounded-lg bg-[var(--renk-koyu)] flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
            🥞
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-base font-bold tracking-tight text-[var(--yazi)]">Pancake</span>
              <span className="text-base font-extrabold text-[var(--renk-logo)]">Flip!</span>
            </div>
            <span className="text-xs text-[var(--yazi-soluk)] mt-0.5">Yönetim & Denge Konsolu</span>
          </div>
        </a>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[var(--yazi-soluk)]">
        <button
          onClick={() => setAktifSekme('ozet')}
          className="hover:text-[var(--yazi)] transition-colors whitespace-nowrap cursor-pointer py-1"
        >
          Genel Bakış
        </button>
        <button
          onClick={() => setAktifSekme('malzemeler')}
          className="hover:text-[var(--yazi)] transition-colors whitespace-nowrap cursor-pointer py-1"
        >
          Menü Kataloğu
        </button>
        <button
          onClick={() => setAktifSekme('egri')}
          className="hover:text-[var(--yazi)] transition-colors whitespace-nowrap cursor-pointer py-1"
        >
          Seviye Eğrisi
        </button>
        <button
          onClick={() => setAktifSekme('denge')}
          className="hover:text-[var(--yazi)] transition-colors whitespace-nowrap cursor-pointer py-1"
        >
          Fizik & Ekonomi
        </button>
        <button
          onClick={() => setAktifSekme('simulator')}
          className="hover:text-[var(--yazi)] transition-colors whitespace-nowrap cursor-pointer py-1 flex items-center gap-1"
        >
          <Play className="w-3.5 h-3.5 text-[var(--renk-ana)]" />
          <span>Simülatör</span>
        </button>
      </nav>

      {/* Zone 3: Actions & Theme */}
      <div className="flex items-center gap-3 shrink-0">
        {degisiklikVarMi ? (
          <button
            onClick={() => setAktifSekme('denge')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--vurgu)]/10 text-[var(--vurgu)] border border-[var(--vurgu)]/30 hover:bg-[var(--vurgu)]/20 transition-colors cursor-pointer whitespace-nowrap"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Yayınlanmamış Taslak</span>
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--basari)] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="font-mono">{aktifSurum ? aktifSurum.surum : 'v1.0.1'}</span>
            <span className="text-[var(--yazi-soluk)]">· Canlı</span>
          </div>
        )}

        <button
          onClick={toggleTema}
          title={tema === 'gunduz' ? 'Gece Moduna Geç' : 'Gündüz Moduna Geç'}
          className="p-2 rounded-lg border border-[var(--kenar)] text-[var(--yazi)] hover:bg-[var(--kenar)]/30 transition-colors cursor-pointer"
        >
          {tema === 'gunduz' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setAktifSekme('simulator')}
          className="px-4 py-2 text-xs font-semibold text-[var(--renk-ana-yazi)] bg-[var(--renk-ana)] rounded-lg hover:opacity-95 transition-opacity shadow-xs cursor-pointer whitespace-nowrap"
        >
          Motoru Simüle Et
        </button>
      </div>
    </header>
  );
};
