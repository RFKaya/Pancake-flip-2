import React, { useState } from 'react';
import { useGameAdmin } from '../../context/GameAdminContext';
import { KilometreTasi } from '../../types/game';
import { Milestone, Globe, Award, Coins } from 'lucide-react';

export const KilometreTaslariView: React.FC = () => {
  const { seviyeYapilandirmasi } = useGameAdmin();
  const [aktifDil, setAktifDil] = useState<'tr' | 'en' | 'ar' | 'fa'>('tr');

  const taslar = seviyeYapilandirmasi.kilometreTaslari;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--kenar)]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--yazi)]">
            Kilometre Taşları & Çok Dilli Başarımlar
          </h1>
          <p className="text-xs text-[var(--yazi-soluk)] mt-0.5">
            4 dilde (Türkçe, İngilizce, Arapça, Farsça) seviye dönüm noktaları ve ödül kurgusu
          </p>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center gap-1.5 bg-[var(--kenar)]/30 p-1 rounded-lg text-xs font-medium">
          {[
            { id: 'tr', ad: 'Türkçe' },
            { id: 'en', ad: 'English' },
            { id: 'ar', ad: 'العربية' },
            { id: 'fa', ad: 'فارسی' },
          ].map((lang) => (
            <button
              key={lang.id}
              onClick={() => setAktifDil(lang.id as any)}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                aktifDil === lang.id
                  ? 'bg-[var(--kart)] text-[var(--yazi)] font-semibold shadow-xs'
                  : 'text-[var(--yazi-soluk)] hover:text-[var(--yazi)]'
              }`}
            >
              {lang.ad}
            </button>
          ))}
        </div>
      </div>

      {/* Milestones Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {taslar.map((t) => (
          <div
            key={t.seviye}
            className="p-5 rounded-xl bg-[var(--kart)] border border-[var(--kenar)] shadow-xs flex flex-col justify-between space-y-4 hover:border-[var(--renk-ana)] transition-colors group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm px-2.5 py-1 rounded-lg bg-[var(--renk-ana)] text-white shadow-xs">
                  SEVİYE {t.seviye}
                </span>

                {t.odulCoin && (
                  <span className="flex items-center gap-1 text-xs font-mono font-bold text-[var(--basari)] bg-[var(--basari)]/10 px-2 py-0.5 rounded-full">
                    <Coins className="w-3.5 h-3.5" />
                    <span>+{t.odulCoin} Coin</span>
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-sm text-[var(--yazi)] leading-tight">
                  {t.baslik[aktifDil]}
                </h3>
                <p className="text-xs text-[var(--yazi-soluk)] mt-1.5 leading-relaxed">
                  {t.altMetin[aktifDil]}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--kenar)]/50 text-[11px] text-[var(--yazi-soluk)] flex items-center justify-between font-mono">
              <span>{t.seviye >= 100 ? 'Efsanevi Aşama' : 'Gelişim Aşaması'}</span>
              <span>4 Dil Senkronize</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
