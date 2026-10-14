import React, { useState } from 'react';
import { useGameAdmin } from '../../context/GameAdminContext';
import { IcerikSurum } from '../../types/game';
import {
  GitBranch,
  RotateCcw,
  CheckCircle2,
  Clock,
  User,
  ArrowRight,
  FileCode,
  AlertCircle,
} from 'lucide-react';

export const SurumlerView: React.FC = () => {
  const { surumler, surumeDon } = useGameAdmin();
  const [secilenSurum, setSecilenSurum] = useState<IcerikSurum>(surumler[0]);

  const handleRollback = (s: IcerikSurum) => {
    if (confirm(`'${s.surum}' sürümündeki konfigürasyona dönmek istediğinizden emin misiniz?`)) {
      surumeDon(s.id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--kenar)]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--yazi)]">
            İçerik Sürümleri & Parametre Değişiklik Farkı (Diff)
          </h1>
          <p className="text-xs text-[var(--yazi-soluk)] mt-0.5">
            Denge ayarları, malzemeler ve seviye eğrilerinin sürüm geçmişi ve anında geri alma (Rollback)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Version Timeline List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-[var(--yazi-soluk)] uppercase tracking-wider">
            Sürüm Geçmişi
          </div>

          <div className="space-y-2">
            {surumler.map((s) => {
              const isSelected = secilenSurum.id === s.id;
              const isLive = s.durum === 'yayinlandi';

              return (
                <div
                  key={s.id}
                  onClick={() => setSecilenSurum(s)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[var(--renk-ana)] bg-[var(--kart)] shadow-sm'
                      : 'border-[var(--kenar)] bg-[var(--kart)] hover:border-[var(--renk-ana)]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[var(--yazi)]">
                        {s.surum}
                      </span>
                      {isLive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--basari)] text-white">
                          CANLI
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[var(--yazi-soluk)] font-mono">
                      {new Date(s.yayinTarihi).toLocaleDateString('tr-TR')}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--yazi)] mt-1.5 font-medium">{s.not}</p>

                  <div className="flex items-center justify-between text-[11px] text-[var(--yazi-soluk)] mt-3 pt-2 border-t border-[var(--kenar)]/40">
                    <span>Yayınlayan: {s.yayinlayan}</span>
                    {!isLive && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRollback(s);
                        }}
                        className="text-xs font-semibold text-[var(--renk-ana)] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Bu Sürüme Dön</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Version Details & JSON Inspection (7 cols) */}
        <div className="lg:col-span-7 bg-[var(--kart)] p-5 rounded-xl border border-[var(--kenar)] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--kenar)]">
            <div>
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[var(--renk-ana)]" />
                <h2 className="text-sm font-bold text-[var(--yazi)]">
                  {secilenSurum.surum} Yapılandırma Özeti
                </h2>
              </div>
              <p className="text-xs text-[var(--yazi-soluk)]">
                Yayın Tarihi: {new Date(secilenSurum.yayinTarihi).toLocaleString('tr-TR')}
              </p>
            </div>

            {secilenSurum.durum !== 'yayinlandi' && (
              <button
                onClick={() => handleRollback(secilenSurum)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--renk-ana)] text-white hover:opacity-90 cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Bu Sürüme Geri Al</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-center">
            <div className="p-2.5 rounded-lg bg-[var(--kenar)]/15">
              <div className="text-[10px] text-[var(--yazi-soluk)] font-sans">Malzeme Sayısı</div>
              <div className="font-bold text-[var(--yazi)]">{secilenSurum.veri.malzemeler.length}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--kenar)]/15">
              <div className="text-[10px] text-[var(--yazi-soluk)] font-sans">Müşteri Tipleri</div>
              <div className="font-bold text-[var(--yazi)]">{secilenSurum.veri.musteriTipleri.length}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--kenar)]/15">
              <div className="text-[10px] text-[var(--yazi-soluk)] font-sans">Pişme Süresi</div>
              <div className="font-bold text-[var(--yazi)]">{secilenSurum.veri.ayarlar.pismeSuresi}s</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--kenar)]/15">
              <div className="text-[10px] text-[var(--yazi-soluk)] font-sans">Seviye Sınırı</div>
              <div className="font-bold text-[var(--yazi)]">1B</div>
            </div>
          </div>

          {/* JSON Inspector */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-[var(--yazi-soluk)]">
              Ham Denge Yapılandırması (JSON Snapshot):
            </div>
            <pre className="p-3.5 rounded-xl bg-[var(--zemin)] border border-[var(--kenar)]/60 text-[11px] font-mono text-[var(--yazi)] max-h-72 overflow-y-auto leading-relaxed">
              {JSON.stringify(
                {
                  surum: secilenSurum.surum,
                  ayarlar: secilenSurum.veri.ayarlar,
                  seviyeNoktalari: secilenSurum.veri.seviye.gerekenMusteriNoktalari,
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
