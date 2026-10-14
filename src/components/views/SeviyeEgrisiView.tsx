import React, { useState } from 'react';
import { useGameAdmin } from '../../context/GameAdminContext';
import { hesaplaGerekenMusteri, hesaplaZorluk } from '../../lib/gameEngine';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  Layers,
  Sparkles,
  Clock,
  Compass,
} from 'lucide-react';

export const SeviyeEgrisiView: React.FC = () => {
  const {
    seviyeYapilandirmasi,
    guncelleSeviyeNoktasi,
    ekleSeviyeNoktasi,
    silSeviyeNoktasi,
  } = useGameAdmin();

  const [yeniSeviye, setYeniSeviye] = useState<number>(150);
  const [yeniMusteri, setYeniMusteri] = useState<number>(12);
  const [formHata, setFormHata] = useState<string>('');

  const noktalar = seviyeYapilandirmasi.gerekenMusteriNoktalari;

  // Validation Check 1: Monotonicity (§7.4)
  let monotonMu = true;
  let monotonHataIndex = -1;
  for (let i = 1; i < noktalar.length; i++) {
    if (noktalar[i].musteri < noktalar[i - 1].musteri) {
      monotonMu = false;
      monotonHataIndex = i;
      break;
    }
  }

  // Validation Check 2: 40 ceiling (§7.4)
  const tavanAsimi = noktalar.some((p) => p.musteri > 40);

  const handleNoktaEkle = (e: React.FormEvent) => {
    e.preventDefault();
    if (yeniSeviye < 1) {
      setFormHata('Seviye 1 veya daha büyük olmalıdır.');
      return;
    }
    if (yeniMusteri < 1 || yeniMusteri > 40) {
      setFormHata('Gereken müşteri 1 ile 40 arasında olmalıdır.');
      return;
    }
    if (noktalar.some((p) => p.seviye === yeniSeviye)) {
      setFormHata('Bu seviye için zaten bir kontrol noktası tanımlı.');
      return;
    }
    ekleSeviyeNoktasi(yeniSeviye, yeniMusteri);
    setFormHata('');
    setYeniSeviye(yeniSeviye + 50);
  };

  // Generate curve plot coordinates for SVG
  const sampleLevels = [1, 5, 10, 20, 50, 100, 200, 300, 500, 750, 1000];
  const chartWidth = 700;
  const chartHeight = 220;
  const padding = 35;

  const points = sampleLevels.map((lvl) => {
    const musteri = hesaplaGerekenMusteri(lvl, seviyeYapilandirmasi);
    const zorluk = hesaplaZorluk(lvl, seviyeYapilandirmasi.zorlukOlcek);
    const x = padding + (Math.log10(lvl) / Math.log10(1000)) * (chartWidth - padding * 2);
    const yMusteri = chartHeight - padding - (musteri / 40) * (chartHeight - padding * 2);
    const yZorluk = chartHeight - padding - zorluk * (chartHeight - padding * 2);
    return { lvl, musteri, zorluk, x, yMusteri, yZorluk };
  });

  const pathMusteri = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yMusteri.toFixed(1)}`)
    .join(' ');

  const pathZorluk = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yZorluk.toFixed(1)}`)
    .join(' ');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--kenar)]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--yazi)]">
            Seviye Eğrisi & İlerleme Doyumu (`seviye.json`)
          </h1>
          <p className="text-xs text-[var(--yazi-soluk)] mt-0.5">
            Kontrol noktaları, monoton artış kontrolü, kademeler ve mekanik kilitleri
          </p>
        </div>

        {/* Validation Status Badge */}
        <div className="flex items-center gap-2">
          {monotonMu && !tavanAsimi ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--basari)]/15 text-[var(--basari)] text-xs font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Monoton Artış Doğrulandı</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--vurgu)]/15 text-[var(--vurgu)] text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Eğri Doğrulama Hatası!</span>
            </span>
          )}
        </div>
      </div>

      {/* Validation Warnings Box (§7.4) */}
      {!monotonMu && (
        <div className="p-4 rounded-xl bg-[var(--vurgu)]/10 border border-[var(--vurgu)]/40 text-xs text-[var(--vurgu)] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <div className="font-bold text-sm">MONOTONLUK İHLALİ!</div>
            <p className="mt-0.5">
              Kontrol noktalarında seviye arttıkça gereken müşteri sayısı azalmış! (
              {noktalar[monotonHataIndex - 1]?.seviye}. seviyede{' '}
              {noktalar[monotonHataIndex - 1]?.musteri} müşteri istenirken,{' '}
              {noktalar[monotonHataIndex]?.seviye}. seviyede {noktalar[monotonHataIndex]?.musteri}{' '}
              müşteri isteniyor). Gereken müşteri sayısı asla geriye gidemez.
            </p>
          </div>
        </div>
      )}

      {tavanAsimi && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <div className="font-bold">TAVAN 40 UYARISI</div>
            <p className="mt-0.5">
              Oyun tasarım kuralına göre tek bir seviyede gereken müşteri tavanı 40'tır. Bazı kontrol
              noktaları 40'ın üzerinde ayarlanmış.
            </p>
          </div>
        </div>
      )}

      {/* Interactive SVG Curve Chart */}
      <div className="p-5 rounded-xl bg-[var(--kart)] border border-[var(--kenar)] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-[var(--yazi)] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[var(--renk-ana)]" />
              <span>Etkileşimli İlerleme Eğrisi Grafiği (Logaritmik Seviye 1 → 1000)</span>
            </h2>
            <p className="text-xs text-[var(--yazi-soluk)]">
              Seviye arttıkça gereken müşteri sayısı (turuncu çizgi) ve sistem zorluk katsayısı
              (yeşil çizgi)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[var(--renk-ana)] rounded" />
              <span className="text-[var(--yazi)] font-medium">Gereken Müşteri (0-40)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[var(--basari)] rounded" />
              <span className="text-[var(--yazi)] font-medium">Zorluk (0 - 1.0)</span>
            </div>
          </div>
        </div>

        {/* SVG Plot */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-56 bg-[var(--zemin)] rounded-lg border border-[var(--kenar)]/50 select-none"
          >
            {/* Grid Lines */}
            {[0, 10, 20, 30, 40].map((val) => {
              const y = chartHeight - padding - (val / 40) * (chartHeight - padding * 2);
              return (
                <g key={val}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity={0.1}
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padding - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[9px] fill-[var(--yazi-soluk)] font-mono"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Level X Labels */}
            {[1, 10, 50, 100, 500, 1000].map((lvl) => {
              const x =
                padding + (Math.log10(lvl) / Math.log10(1000)) * (chartWidth - padding * 2);
              return (
                <g key={lvl}>
                  <line
                    x1={x}
                    y1={padding}
                    x2={x}
                    y2={chartHeight - padding}
                    stroke="currentColor"
                    strokeOpacity={0.08}
                  />
                  <text
                    x={x}
                    y={chartHeight - padding + 15}
                    textAnchor="middle"
                    className="text-[9px] fill-[var(--yazi-soluk)] font-mono"
                  >
                    L{lvl}
                  </text>
                </g>
              );
            })}

            {/* Müşteri Curve */}
            <path
              d={pathMusteri}
              fill="none"
              stroke="var(--renk-ana)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Zorluk Curve */}
            <path
              d={pathZorluk}
              fill="none"
              stroke="var(--basari)"
              strokeWidth="2"
              strokeDasharray="4 2"
              strokeLinecap="round"
            />

            {/* Points */}
            {points.map((p, idx) => (
              <g key={idx}>
                <circle
                  cx={p.x}
                  cy={p.yMusteri}
                  r="4"
                  className="fill-[var(--renk-ana)] hover:scale-125 transition-transform cursor-pointer"
                >
                  <title>{`L${p.lvl}: ${p.musteri} müşteri (Zorluk: %${Math.round(
                    p.zorluk * 100
                  )})`}</title>
                </circle>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Two Columns: Checkpoints Table + Mechanics & Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Checkpoints Table & Add Form (6 cols) */}
        <div className="lg:col-span-6 bg-[var(--kart)] p-5 rounded-xl border border-[var(--kenar)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--yazi)]">
              Kontrol Noktaları Tablosu (`gerekenMusteri`)
            </h2>
            <span className="text-xs text-[var(--yazi-soluk)] font-mono">
              {noktalar.length} Eşik Tanımlı
            </span>
          </div>

          <div className="border border-[var(--kenar)] rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--kenar)]/20 text-[var(--yazi-soluk)] font-semibold border-b border-[var(--kenar)]">
                <tr>
                  <th className="py-2.5 px-3">Seviye Eşiği</th>
                  <th className="py-2.5 px-3">Gereken Müşteri (Atlama)</th>
                  <th className="py-2.5 px-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--kenar)]/50">
                {noktalar.map((pt, idx) => (
                  <tr key={idx} className="hover:bg-[var(--kart-hover)]">
                    <td className="py-2 px-3 font-mono font-bold text-[var(--renk-ana)]">
                      L{pt.seviye}
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="1"
                        max="40"
                        value={pt.musteri}
                        onChange={(e) =>
                          guncelleSeviyeNoktasi(idx, pt.seviye, parseInt(e.target.value) || 1)
                        }
                        className="w-24 px-2 py-1 rounded border border-[var(--kenar)] bg-[var(--zemin)] font-mono text-xs text-[var(--yazi)]"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      {idx > 0 && idx < noktalar.length - 1 && (
                        <button
                          onClick={() => silSeviyeNoktasi(idx)}
                          className="text-[var(--vurgu)] hover:opacity-80 p-1 cursor-pointer"
                          title="Noktayı Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add New Checkpoint Form */}
          <form onSubmit={handleNoktaEkle} className="p-3 rounded-lg bg-[var(--kenar)]/15 space-y-2">
            <div className="text-xs font-semibold text-[var(--yazi)]">Yeni Kontrol Noktası Ekle</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-[var(--yazi-soluk)] mb-0.5">Seviye</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={yeniSeviye}
                  onChange={(e) => setYeniSeviye(parseInt(e.target.value) || 1)}
                  className="w-full px-2 py-1 rounded border border-[var(--kenar)] bg-[var(--kart)] font-mono text-xs text-[var(--yazi)]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[var(--yazi-soluk)] mb-0.5">
                  Gereken Müşteri
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={yeniMusteri}
                  onChange={(e) => setYeniMusteri(parseInt(e.target.value) || 1)}
                  className="w-full px-2 py-1 rounded border border-[var(--kenar)] bg-[var(--kart)] font-mono text-xs text-[var(--yazi)]"
                />
              </div>
            </div>

            {formHata && <p className="text-xs text-[var(--vurgu)]">{formHata}</p>}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--renk-ana)] text-white hover:opacity-90 cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Noktayı Ekle</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Kademeler & Mekanikler (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Kademeler Tablosu */}
          <div className="bg-[var(--kart)] p-5 rounded-xl border border-[var(--kenar)] shadow-xs space-y-3">
            <h2 className="text-sm font-semibold text-[var(--yazi)]">
              Kademeler Tablosu (`kademeler`)
            </h2>
            <div className="border border-[var(--kenar)] rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--kenar)]/20 text-[var(--yazi-soluk)] font-semibold border-b border-[var(--kenar)]">
                  <tr>
                    <th className="py-2 px-2.5">Eşik</th>
                    <th className="py-2 px-2.5">Krep Adet</th>
                    <th className="py-2 px-2.5">d Boyutu</th>
                    <th className="py-2 px-2.5 text-center">Tava</th>
                    <th className="py-2 px-2.5 text-center">Müşteri Slot</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--kenar)]/50 font-mono">
                  {seviyeYapilandirmasi.kademeler.map((k, idx) => (
                    <tr key={idx} className="hover:bg-[var(--kart-hover)]">
                      <td className="py-2 px-2.5 font-bold text-[var(--renk-ana)]">L{k.seviye}</td>
                      <td className="py-2 px-2.5 text-[var(--yazi)]">
                        {k.krepMin} - {k.krepMax}
                      </td>
                      <td className="py-2 px-2.5 text-[var(--yazi)]">
                        {k.dMin} - {k.dMax}
                      </td>
                      <td className="py-2 px-2.5 text-center font-bold text-[var(--basari)]">
                        {k.tavaSayisi}
                      </td>
                      <td className="py-2 px-2.5 text-center font-bold text-[var(--renk-logo)]">
                        {k.esZamanliMusteri}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mekanik Açılışları */}
          <div className="bg-[var(--kart)] p-5 rounded-xl border border-[var(--kenar)] shadow-xs space-y-3">
            <h2 className="text-sm font-semibold text-[var(--yazi)]">
              Mekanik Açılış Zaman Çizelgesi
            </h2>
            <div className="space-y-2">
              {seviyeYapilandirmasi.mekanikler.map((m, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-[var(--kenar)]/15 border border-[var(--kenar)]/40 flex items-start gap-3"
                >
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[var(--renk-ana)] text-white shrink-0">
                    L{m.seviye}
                  </span>
                  <div>
                    <div className="font-semibold text-xs text-[var(--yazi)]">{m.baslik}</div>
                    <div className="text-[11px] text-[var(--yazi-soluk)]">{m.aciklama}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
