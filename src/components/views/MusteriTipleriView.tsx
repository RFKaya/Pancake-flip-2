import React, { useState } from 'react';
import { useGameAdmin } from '../../context/GameAdminContext';
import { MusteriTipi } from '../../types/game';
import {
  UserCheck,
  Sliders,
  Sparkles,
  Heart,
  Coins,
  AlertTriangle,
  Smile,
  Shield,
  Layers,
} from 'lucide-react';

export const MusteriTipleriView: React.FC = () => {
  const { musteriTipleri, guncelleMusteriTipi } = useGameAdmin();
  const [secilenTipId, setSecilenTipId] = useState<string>('normal');

  const secilenTip = musteriTipleri.find((t) => t.id === secilenTipId) || musteriTipleri[0];

  // Weight distribution calculation
  const toplamAgirlik = musteriTipleri.reduce((sum, t) => sum + t.agirlik, 0);

  const handleSliderChange = (alan: keyof MusteriTipi, deger: number | boolean) => {
    if (!secilenTip) return;
    const guncel = { ...secilenTip, [alan]: deger };
    guncelleMusteriTipi(guncel);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--kenar)]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--yazi)]">
            Müşteri Tipleri & Çarpan Dengesi (`musteriler.json`)
          </h1>
          <p className="text-xs text-[var(--yazi-soluk)] mt-0.5">
            Müşteri psikolojisi, sabır toleransı, ödeme & bahşiş katsayıları ve sipariş boyutu
          </p>
        </div>
      </div>

      {/* Weight Distribution Multi-Segment Bar */}
      <div className="p-4 rounded-xl bg-[var(--kart)] border border-[var(--kenar)] shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[var(--yazi)]">
            Müşteri Görülme Ağırlık Dengesi (Toplam Havuz Dağılımı)
          </span>
          <span className="text-[var(--yazi-soluk)] font-mono">
            Toplam Ağırlık: {toplamAgirlik.toFixed(2)}
          </span>
        </div>

        {/* Visual Bar */}
        <div className="w-full h-4 rounded-full overflow-hidden flex bg-[var(--kenar)]/30">
          {musteriTipleri.map((t, idx) => {
            const yuzde = toplamAgirlik > 0 ? (t.agirlik / toplamAgirlik) * 100 : 0;
            const renkler = [
              'bg-[#B45309]', // normal
              'bg-[#D99A2B]', // cocuk
              'bg-[#0F766E]', // elestirmen
              'bg-[#BE123C]', // vip
            ];
            return (
              <div
                key={t.id}
                title={`${t.ad}: %${yuzde.toFixed(1)}`}
                className={`h-full ${renkler[idx % renkler.length]} transition-all duration-300 relative group cursor-pointer`}
                style={{ width: `${yuzde}%` }}
                onClick={() => setSecilenTipId(t.id)}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          {musteriTipleri.map((t, idx) => {
            const yuzde = toplamAgirlik > 0 ? (t.agirlik / toplamAgirlik) * 100 : 0;
            const isSelected = t.id === secilenTipId;
            return (
              <button
                key={t.id}
                onClick={() => setSecilenTipId(t.id)}
                className={`flex items-center gap-2 p-2 rounded-lg border text-left cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-[var(--renk-ana)] bg-[var(--renk-ana)]/10 font-bold'
                    : 'border-[var(--kenar)] hover:bg-[var(--kenar)]/20'
                }`}
              >
                <span className="text-xl">{t.ikon}</span>
                <div className="min-w-0">
                  <div className="truncate text-[var(--yazi)] text-xs">{t.ad}</div>
                  <div className="font-mono text-[10px] text-[var(--yazi-soluk)]">
                    %{yuzde.toFixed(1)} (Ağ: {t.agirlik})
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Customer Multipliers Editor */}
      {secilenTip && (
        <div className="p-6 rounded-xl bg-[var(--kart)] border border-[var(--kenar)] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--kenar)]">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2 bg-[var(--kenar)]/30 rounded-xl">{secilenTip.ikon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[var(--yazi)]">{secilenTip.ad}</h2>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-[var(--kenar)]/40 text-[var(--yazi-soluk)]">
                    {secilenTip.id}
                  </span>
                  <span className="text-xs font-bold text-[var(--renk-ana)] font-mono">
                    L{secilenTip.acilis} Açılış
                  </span>
                </div>
                <p className="text-xs text-[var(--yazi-soluk)] mt-0.5">
                  {secilenTip.tatliMi
                    ? 'Yalnızca tatlı malzemeler talep eder (Çocuk kuralı)'
                    : 'Tüm menü malzemelerini talep edebilir'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[var(--yazi-soluk)]">Açılış Seviyesi:</span>
              <input
                type="number"
                min="1"
                max="500"
                value={secilenTip.acilis}
                onChange={(e) => handleSliderChange('acilis', parseInt(e.target.value) || 1)}
                className="w-20 px-2 py-1 rounded-md border border-[var(--kenar)] bg-[var(--zemin)] text-xs font-mono text-[var(--yazi)]"
              />
            </div>
          </div>

          {/* 7 Multipliers Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Slider 1: Ağırlık */}
            <div className="p-4 rounded-xl bg-[var(--kenar)]/15 border border-[var(--kenar)]/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--yazi)] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[var(--renk-ana)]" />
                  <span>Görülme Ağırlığı</span>
                </span>
                <span className="font-mono font-bold text-sm text-[var(--renk-ana)]">
                  {secilenTip.agirlik.toFixed(2)}x
                </span>
              </div>
              <p className="text-[11px] text-[var(--yazi-soluk)]">
                Kuyrukta müşteri tipi seçilirken kullanılan çekiliş payı.
              </p>
              <input
                type="range"
                min="0.05"
                max="2.0"
                step="0.05"
                value={secilenTip.agirlik}
                onChange={(e) => handleSliderChange('agirlik', parseFloat(e.target.value))}
                className="w-full accent-[var(--renk-ana)] cursor-pointer"
              />
            </div>

            {/* Slider 2: Sabır */}
            <div className="p-4 rounded-xl bg-[var(--kenar)]/15 border border-[var(--kenar)]/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--yazi)] flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-[var(--vurgu)]" />
                  <span>Sabır Çarpanı</span>
                </span>
                <span className="font-mono font-bold text-sm text-[var(--renk-ana)]">
                  {secilenTip.sabir.toFixed(2)}x
                </span>
              </div>
              <p className="text-[11px] text-[var(--yazi-soluk)]">
                Müşterinin bekleme süresi çarpanı (Örn: Çocuk 1.4x çok sabırlı, VIP 0.75x aceleci).
              </p>
              <input
                type="range"
                min="0.4"
                max="2.5"
                step="0.05"
                value={secilenTip.sabir}
                onChange={(e) => handleSliderChange('sabir', parseFloat(e.target.value))}
                className="w-full accent-[var(--renk-ana)] cursor-pointer"
              />
            </div>

            {/* Slider 3: Ödeme Çarpanı */}
            <div className="p-4 rounded-xl bg-[var(--kenar)]/15 border border-[var(--kenar)]/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--yazi)] flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-[var(--basari)]" />
                  <span>Ödeme Çarpanı</span>
                </span>
                <span className="font-mono font-bold text-sm text-[var(--basari)]">
                  {secilenTip.odeme.toFixed(2)}x
                </span>
              </div>
              <p className="text-[11px] text-[var(--yazi-soluk)]">
                Temel sipariş tutarına uygulanan katsayı (VIP 2.0x, Çocuk 0.8x).
              </p>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.05"
                value={secilenTip.odeme}
                onChange={(e) => handleSliderChange('odeme', parseFloat(e.target.value))}
                className="w-full accent-[var(--basari)] cursor-pointer"
              />
            </div>

            {/* Slider 4: Bahşiş Çarpanı */}
            <div className="p-4 rounded-xl bg-[var(--kenar)]/15 border border-[var(--kenar)]/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--yazi)] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[var(--renk-logo)]" />
                  <span>Bahşiş Çarpanı</span>
                </span>
                <span className="font-mono font-bold text-sm text-[var(--renk-logo)]">
                  {secilenTip.bahsis.toFixed(2)}x
                </span>
              </div>
              <p className="text-[11px] text-[var(--yazi-soluk)]">
                Ruh haline göre verilen bahşişin katsayısı (VIP 2.0x cömert bahşiş).
              </p>
              <input
                type="range"
                min="0.5"
                max="3.5"
                step="0.05"
                value={secilenTip.bahsis}
                onChange={(e) => handleSliderChange('bahsis', parseFloat(e.target.value))}
                className="w-full accent-[var(--renk-logo)] cursor-pointer"
              />
            </div>

            {/* Slider 5: Ceza Çarpanı */}
            <div className="p-4 rounded-xl bg-[var(--kenar)]/15 border border-[var(--kenar)]/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--yazi)] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[var(--vurgu)]" />
                  <span>Hata Cezası Çarpanı</span>
                </span>
                <span className="font-mono font-bold text-sm text-[var(--vurgu)]">
                  {secilenTip.ceza.toFixed(2)}x
                </span>
              </div>
              <p className="text-[11px] text-[var(--yazi-soluk)]">
                Eksik/yanlış malzeme konduğunda kalite düşüş çarpanı (Eleştirmen 1.4x titiz).
              </p>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.05"
                value={secilenTip.ceza}
                onChange={(e) => handleSliderChange('ceza', parseFloat(e.target.value))}
                className="w-full accent-[var(--vurgu)] cursor-pointer"
              />
            </div>

            {/* Slider 6 & 7: dKaydirma and dMax */}
            <div className="p-4 rounded-xl bg-[var(--kenar)]/15 border border-[var(--kenar)]/40 space-y-3">
              <div className="text-xs font-semibold text-[var(--yazi)]">
                Sipariş Uzunluğu (d) Sınırları
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[var(--yazi-soluk)] mb-1">
                    d Kaydırma (Delta): <span className="font-bold font-mono">+{secilenTip.dKaydirma}</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="3"
                    value={secilenTip.dKaydirma}
                    onChange={(e) => handleSliderChange('dKaydirma', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 rounded border border-[var(--kenar)] bg-[var(--kart)] font-mono text-[var(--yazi)]"
                  />
                </div>
                <div>
                  <label className="block text-[var(--yazi-soluk)] mb-1">
                    d Max Tavanı: <span className="font-bold font-mono">{secilenTip.dMax || 'Sınırsız'}</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="Sınırsız"
                    value={secilenTip.dMax || ''}
                    onChange={(e) =>
                      handleSliderChange(
                        'dMax',
                        e.target.value ? parseInt(e.target.value) : (undefined as any)
                      )
                    }
                    className="w-full px-2 py-1 rounded border border-[var(--kenar)] bg-[var(--kart)] font-mono text-[var(--yazi)]"
                  />
                </div>
              </div>

              {/* Sweet checkbox */}
              <div className="flex items-center gap-2 pt-2 border-t border-[var(--kenar)]/40">
                <input
                  type="checkbox"
                  id="musteriTatli"
                  checked={!!secilenTip.tatliMi}
                  onChange={(e) => handleSliderChange('tatliMi', e.target.checked)}
                  className="rounded border-[var(--kenar)] text-[var(--renk-ana)] cursor-pointer"
                />
                <label htmlFor="musteriTatli" className="text-xs text-[var(--yazi)] cursor-pointer">
                  Yalnız tatlı malzeme ister (Çocuk koşulu)
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
