import React, { useState } from 'react';
import { useGameAdmin } from '../../context/GameAdminContext';
import { formatCompact, formatTamSayi } from '../../lib/gameEngine';
import {
  Users,
  Award,
  Zap,
  Coins,
  TrendingDown,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export const PanelOzetiView: React.FC = () => {
  const { oyuncular, fisler, setAktifSekme } = useGameAdmin();
  const [tarihAraligi, setTarihAraligi] = useState<'24h' | '7d' | '30d' | 'all'>('7d');

  // KPI Calculations
  const toplamOyuncu = oyuncular.length;
  const aktifOyuncu = oyuncular.filter((p) => p.durum === 'aktif').length;
  const seviyeler = oyuncular.map((p) => p.ilerleme.seviye).sort((a, b) => a - b);
  const ortalamaSeviye =
    seviyeler.length > 0 ? Math.round(seviyeler.reduce((a, b) => a + b, 0) / seviyeler.length) : 0;
  const medyanSeviye =
    seviyeler.length > 0
      ? seviyeler[Math.floor(seviyeler.length / 2)]
      : 0;
  const enYuksekSeviye =
    oyuncular.length > 0 ? Math.max(...oyuncular.map((p) => p.ilerleme.enYuksekSeviye)) : 0;

  const toplamServis = oyuncular.reduce((sum, p) => sum + p.ilerleme.toplamMusteri, 0);
  const toplamMukemmel = oyuncular.reduce((sum, p) => sum + p.ilerleme.toplamMukemmel, 0);
  const perfectOrani = toplamServis > 0 ? Math.round((toplamMukemmel / toplamServis) * 100) : 0;
  const toplamCoin = oyuncular.reduce((sum, p) => sum + p.ilerleme.toplamCoin, 0);

  // Histogram Data
  const histogramAraliklari = [
    { aralik: 'L1 - 10', min: 1, max: 10, sayi: 0 },
    { aralik: 'L11 - 25', min: 11, max: 25, sayi: 0 },
    { aralik: 'L26 - 50', min: 26, max: 50, sayi: 0 },
    { aralik: 'L51 - 100', min: 51, max: 100, sayi: 0 },
    { aralik: 'L101 - 250', min: 101, max: 250, sayi: 0 },
    { aralik: 'L251 - 500', min: 251, max: 500, sayi: 0 },
    { aralik: 'L500+', min: 501, max: 1_000_000_000, sayi: 0 },
  ];

  oyuncular.forEach((p) => {
    const lvl = p.ilerleme.seviye;
    const h = histogramAraliklari.find((item) => lvl >= item.min && lvl <= item.max);
    if (h) h.sayi++;
  });

  const maxHistogramSayisi = Math.max(...histogramAraliklari.map((h) => h.sayi), 1);

  // Churn / Drop-off points data
  const dropOffNoktalari = [
    { seviye: 'L5', sebep: 'Çikolata açılışı (ilk çoklu malzeme)', terkOrani: 14 },
    { seviye: 'L15', sebep: 'Çift tava ve 2. müşteri slotu eşzamanlılığı', terkOrani: 28 },
    { seviye: 'L20', sebep: 'Kalınlık tercihi mekaniği', terkOrani: 19 },
    { seviye: 'L30', sebep: 'Gurme Eleştirmen (düşük sabır & ağır ceza)', terkOrani: 32 },
    { seviye: 'L50', sebep: 'VIP müşteri & 7 malzeme kombinasyonu', terkOrani: 22 },
  ];

  // Export handlers
  const handleExportJSON = () => {
    const data = {
      tarih: new Date().toISOString(),
      kpi: {
        toplamOyuncu,
        aktifOyuncu,
        ortalamaSeviye,
        medyanSeviye,
        enYuksekSeviye,
        toplamServis,
        perfectOrani,
        toplamCoin,
      },
      histogram: histogramAraliklari,
      dropOff: dropOffNoktalari,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pancake-flip-ozet-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    let csv = 'Metrik,Deger\n';
    csv += `Toplam Oyuncu,${toplamOyuncu}\n`;
    csv += `Aktif Oyuncu,${aktifOyuncu}\n`;
    csv += `Ortalama Seviye,${ortalamaSeviye}\n`;
    csv += `Medyan Seviye,${medyanSeviye}\n`;
    csv += `En Yuksek Seviye,${enYuksekSeviye}\n`;
    csv += `Toplam Servis,${toplamServis}\n`;
    csv += `PERFECT Orani,${perfectOrani}%\n`;
    csv += `Toplam Coin Hacmi,${toplamCoin}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pancake-flip-kpi-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--kenar)]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--yazi)]">
            Restoran Panel Özeti & KPI
          </h1>
          <p className="text-xs text-[var(--yazi-soluk)] mt-0.5">
            Sonsuz seviye krep restoranı küresel oyuncu istatistikleri ve servis metrikleri
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented Date Filter */}
          <div className="flex items-center bg-[var(--kenar)]/40 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setTarihAraligi('24h')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                tarihAraligi === '24h'
                  ? 'bg-[var(--kart)] text-[var(--yazi)] shadow-xs font-semibold'
                  : 'text-[var(--yazi-soluk)] hover:text-[var(--yazi)]'
              }`}
            >
              24 Saat
            </button>
            <button
              onClick={() => setTarihAraligi('7d')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                tarihAraligi === '7d'
                  ? 'bg-[var(--kart)] text-[var(--yazi)] shadow-xs font-semibold'
                  : 'text-[var(--yazi-soluk)] hover:text-[var(--yazi)]'
              }`}
            >
              7 Gün
            </button>
            <button
              onClick={() => setTarihAraligi('30d')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                tarihAraligi === '30d'
                  ? 'bg-[var(--kart)] text-[var(--yazi)] shadow-xs font-semibold'
                  : 'text-[var(--yazi-soluk)] hover:text-[var(--yazi)]'
              }`}
            >
              30 Gün
            </button>
            <button
              onClick={() => setTarihAraligi('all')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                tarihAraligi === 'all'
                  ? 'bg-[var(--kart)] text-[var(--yazi)] shadow-xs font-semibold'
                  : 'text-[var(--yazi-soluk)] hover:text-[var(--yazi)]'
              }`}
            >
              Tümü
            </button>
          </div>

          {/* Export Dropdown */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleExportCSV}
              title="CSV Olarak İndir"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--kart)] border border-[var(--kenar)] hover:bg-[var(--kenar)]/20 transition-colors cursor-pointer text-[var(--yazi)]"
            >
              <Download className="w-3.5 h-3.5 text-[var(--yazi-soluk)]" />
              <span>CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              title="JSON Olarak İndir"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--kart)] border border-[var(--kenar)] hover:bg-[var(--kenar)]/20 transition-colors cursor-pointer text-[var(--yazi)]"
            >
              <Download className="w-3.5 h-3.5 text-[var(--yazi-soluk)]" />
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Card 1: Active Players */}
        <div className="bg-[var(--kart)] p-4 rounded-xl border border-[var(--kenar)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--yazi-soluk)] text-xs font-medium">
            <span>Aktif Oyuncular</span>
            <Users className="w-4 h-4 text-[var(--renk-ana)]" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tabular-nums text-[var(--yazi)]">
              {aktifOyuncu}
            </div>
            <div className="text-[11px] text-[var(--yazi-soluk)] mt-0.5">
              Toplam: <span className="font-mono">{toplamOyuncu}</span> kayıtlı
            </div>
          </div>
        </div>

        {/* Card 2: Average & Median Level */}
        <div className="bg-[var(--kart)] p-4 rounded-xl border border-[var(--kenar)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--yazi-soluk)] text-xs font-medium">
            <span>Ort. / Medyan Seviye</span>
            <Layers className="w-4 h-4 text-[var(--renk-ana)]" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tabular-nums text-[var(--yazi)]">
              L{ortalamaSeviye} <span className="text-sm font-normal text-[var(--yazi-soluk)]">/ L{medyanSeviye}</span>
            </div>
            <div className="text-[11px] text-[var(--yazi-soluk)] mt-0.5">
              İlerleme doyum hızı: <span className="text-[var(--basari)] font-medium">Nominal</span>
            </div>
          </div>
        </div>

        {/* Card 3: Top Level */}
        <div className="bg-[var(--kart)] p-4 rounded-xl border border-[var(--kenar)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--yazi-soluk)] text-xs font-medium">
            <span>En Yüksek Seviye</span>
            <Award className="w-4 h-4 text-[var(--renk-logo)]" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tabular-nums text-[var(--yazi)]">
              L{formatTamSayi(enYuksekSeviye)}
            </div>
            <div className="text-[11px] text-[var(--yazi-soluk)] mt-0.5">
              Hedef tavan: <span className="font-mono">1B</span>
            </div>
          </div>
        </div>

        {/* Card 4: Total Orders Served */}
        <div className="bg-[var(--kart)] p-4 rounded-xl border border-[var(--kenar)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--yazi-soluk)] text-xs font-medium">
            <span>Toplam Servis</span>
            <Zap className="w-4 h-4 text-[var(--renk-ana)]" />
          </div>
          <div className="mt-2" title={`${formatTamSayi(toplamServis)} müşteri siparişi`}>
            <div className="text-2xl font-bold font-mono tabular-nums text-[var(--yazi)]">
              {formatCompact(toplamServis)}
            </div>
            <div className="text-[11px] text-[var(--yazi-soluk)] mt-0.5">
              Fiş adisyon hacmi: <span className="font-mono">{fisler.length}</span>
            </div>
          </div>
        </div>

        {/* Card 5: PERFECT Rate */}
        <div className="bg-[var(--kart)] p-4 rounded-xl border border-[var(--kenar)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--yazi-soluk)] text-xs font-medium">
            <span>PERFECT Oranı</span>
            <div className="text-xs font-bold text-[var(--basari)]">★ 100</div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tabular-nums text-[var(--basari)]">
              %{perfectOrani}
            </div>
            <div className="text-[11px] text-[var(--yazi-soluk)] mt-0.5">
              Kusursuz servis: <span className="font-mono">{formatCompact(toplamMukemmel)}</span>
            </div>
          </div>
        </div>

        {/* Card 6: Total Economy Volume */}
        <div className="bg-[var(--kart)] p-4 rounded-xl border border-[var(--kenar)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--yazi-soluk)] text-xs font-medium">
            <span>Kasa Hacmi</span>
            <Coins className="w-4 h-4 text-[var(--renk-logo)]" />
          </div>
          <div className="mt-2" title={`${formatTamSayi(toplamCoin)} coin dolaşımda`}>
            <div className="text-2xl font-bold font-mono tabular-nums text-[var(--yazi)]">
              {formatCompact(toplamCoin)}
            </div>
            <div className="text-[11px] text-[var(--yazi-soluk)] mt-0.5">
              Kazanılan toplam coin
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Level Bracket Histogram (7 cols) */}
        <div className="lg:col-span-7 bg-[var(--kart)] p-5 rounded-xl border border-[var(--kenar)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[var(--yazi)]">
                Seviye Dağılımı Histogramı
              </h2>
              <p className="text-xs text-[var(--yazi-soluk)]">
                Oyuncuların bulundukları seviye aralıkları (1 → 1 Milyar)
              </p>
            </div>
            <button
              onClick={() => setAktifSekme('oyuncular')}
              className="text-xs text-[var(--renk-ana)] hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>Oyuncuları Gör</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 pt-2">
            {histogramAraliklari.map((h, idx) => {
              const yuzde = maxHistogramSayisi > 0 ? (h.sayi / maxHistogramSayisi) * 100 : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[var(--yazi)] font-mono">{h.aralik}</span>
                    <span className="text-[var(--yazi-soluk)] font-mono tabular-nums">
                      {h.sayi} oyuncu ({oyuncular.length > 0 ? Math.round((h.sayi / oyuncular.length) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[var(--kenar)]/30 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-[var(--renk-ana)] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(4, yuzde)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[var(--kenar)] text-xs text-[var(--yazi-soluk)] flex items-center justify-between">
            <span>En yoğun dilim: L1 - 100 (Başlangıç ve orta ustalık)</span>
            <span className="font-mono">Toplam {oyuncular.length} Örneklem</span>
          </div>
        </div>

        {/* Right: Churn / Drop-Off Points (5 cols) */}
        <div className="lg:col-span-5 bg-[var(--kart)] p-5 rounded-xl border border-[var(--kenar)] shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[var(--yazi)] flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-[var(--vurgu)]" />
                  <span>Kritik Terk / Zorluk Eşikleri</span>
                </h2>
                <p className="text-xs text-[var(--yazi-soluk)]">
                  Oyuncuların oyunu en çok bıraktığı zorluk ve mekanik kırılımları
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              {dropOffNoktalari.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[var(--kenar)]/15 border border-[var(--kenar)]/40 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-[var(--yazi)]">
                        {item.seviye}
                      </span>
                      <span className="text-xs font-semibold text-[var(--vurgu)] font-mono">
                        %{item.terkOrani} Terk
                      </span>
                    </div>
                    <p className="text-xs text-[var(--yazi-soluk)] mt-0.5 truncate">
                      {item.sebep}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--kenar)]">
            <button
              onClick={() => setAktifSekme('denge')}
              className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-[var(--kart)] border border-[var(--kenar)] text-[var(--renk-ana)] hover:bg-[var(--kenar)]/20 transition-colors cursor-pointer text-center"
            >
              Denge Ayarlarından Sabır ve Ceza Çarpanlarını Ayarla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
