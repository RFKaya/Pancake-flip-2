import React, { useState } from 'react';
import { useGameAdmin } from '../../context/GameAdminContext';
import { SupheliKayit } from '../../types/game';
import {
  ShieldAlert,
  ShieldCheck,
  Ban,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  User,
  Search,
} from 'lucide-react';

export const SupheliKayitlarView: React.FC = () => {
  const { supheliKayitlar, supheliKayitCoz, oyuncular } = useGameAdmin();

  const [secilenKayit, setSecilenKayit] = useState<SupheliKayit | null>(null);
  const [aksiyonGerekcesi, setAksiyonGerekcesi] = useState<string>('');

  const bekleyenKayitlar = supheliKayitlar.filter((k) => k.durum === 'bekliyor');

  const handleIslem = (aksiyon: 'temizle' | 'engelle' | 'seviye_dusur') => {
    if (!secilenKayit) return;
    const gerekce = aksiyonGerekcesi.trim() || `Yönetici anti-cheat paneli aksiyonu: ${aksiyon}`;
    supheliKayitCoz(secilenKayit.id, aksiyon, gerekce);
    setSecilenKayit(null);
    setAksiyonGerekcesi('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--kenar)]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--yazi)] flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[var(--vurgu)]" />
            <span>Şüpheli Kayıtlar & Anti-Cheat Denetimi</span>
          </h1>
          <p className="text-xs text-[var(--yazi-soluk)] mt-0.5">
            İmkânsız seviye sıçramaları, bozuk adisyon fişleri ve kasa manipülasyonu tespitleri
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--vurgu)]/15 text-[var(--vurgu)]">
            {bekleyenKayitlar.length} İncelenmeyi Bekleyen Olay
          </span>
        </div>
      </div>

      {/* Main List */}
      <div className="grid grid-cols-1 gap-4">
        {supheliKayitlar.map((kayit) => {
          const isPending = kayit.durum === 'bekliyor';
          return (
            <div
              key={kayit.id}
              className={`p-5 rounded-xl border bg-[var(--kart)] shadow-xs space-y-3 transition-colors ${
                isPending ? 'border-[var(--vurgu)]/40' : 'border-[var(--kenar)] opacity-75'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-sm text-[var(--yazi)]">{kayit.oyuncuAdi}</span>
                  <span className="font-mono text-xs text-[var(--yazi-soluk)]">({kayit.playerId})</span>
                  <span className="font-mono text-xs font-bold text-[var(--renk-ana)]">
                    L{kayit.seviye}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isPending
                        ? 'bg-[var(--vurgu)] text-white'
                        : kayit.durum === 'temizlendi'
                        ? 'bg-[var(--basari)]/15 text-[var(--basari)]'
                        : 'bg-stone-500/15 text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    {kayit.durum === 'bekliyor'
                      ? 'İNCELEME BEKLİYOR'
                      : kayit.durum === 'temizlendi'
                      ? 'ŞÜPHE TEMİZLENDİ'
                      : 'İŞLEM YAPILDI'}
                  </span>
                </div>

                <span className="text-xs text-[var(--yazi-soluk)] font-mono">
                  {new Date(kayit.tarih).toLocaleString('tr-TR')}
                </span>
              </div>

              {/* Neden & Kanıt */}
              <div className="space-y-1 text-xs">
                <div className="font-bold text-[var(--vurgu)]">İhlal Nedeni: {kayit.neden}</div>
                <div className="p-3 rounded-lg bg-[var(--kenar)]/15 font-mono text-[11px] text-[var(--yazi)] border border-[var(--kenar)]/40">
                  {kayit.kanit}
                </div>
              </div>

              {/* Actions if pending */}
              {isPending && (
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[var(--kenar)]/40">
                  <button
                    onClick={() => {
                      setSecilenKayit(kayit);
                      handleIslem('temizle');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--basari)]/15 text-[var(--basari)] hover:bg-[var(--basari)]/25 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Şüpheyi Temizle (Yanlış Alarm)</span>
                  </button>

                  <button
                    onClick={() => {
                      setSecilenKayit(kayit);
                      handleIslem('seviye_dusur');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Seviyeyi Geri Çek (L10)</span>
                  </button>

                  <button
                    onClick={() => {
                      setSecilenKayit(kayit);
                      handleIslem('engelle');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--vurgu)] text-white hover:opacity-90 cursor-pointer shadow-xs"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Oyuncuyu Engelle</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
