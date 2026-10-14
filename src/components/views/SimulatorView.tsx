import React, { useState, useEffect } from 'react';
import { useGameAdmin } from '../../context/GameAdminContext';
import {
  hesaplaSeviyeAyari,
  degerlendirSiparis,
  rastgeleSiparisUret,
  formatCompact,
  formatTamSayi,
  uretFisKodu,
} from '../../lib/gameEngine';
import {
  Siparis,
  TabakParcasi,
  MusteriTipi,
  PismeBolgesi,
  Kalinlik,
  DegerlendirmeDetay,
  ServisSonucu,
} from '../../types/game';
import {
  Play,
  RotateCcw,
  Sparkles,
  Award,
  AlertCircle,
  CheckCircle2,
  Receipt,
  UtensilsCrossed,
  Layers,
  Flame,
  HelpCircle,
  ArrowRight,
  GitCompare,
} from 'lucide-react';

export const SimulatorView: React.FC = () => {
  const {
    malzemeler,
    musteriTipleri,
    seviyeYapilandirmasi,
    ayarlar,
    taslakAyarlar,
    degisiklikVarMi,
  } = useGameAdmin();

  const [seviye, setSeviye] = useState<number>(15);
  const [abModu, setAbModu] = useState<'canli' | 'taslak'>('canli');

  // Active config based on A/B mode
  const aktifOyunAyarlari = abModu === 'taslak' ? taslakAyarlar : ayarlar;

  // Compute SeviyeAyari
  const seviyeAyari = hesaplaSeviyeAyari(
    seviye,
    seviyeYapilandirmasi,
    malzemeler,
    musteriTipleri
  );

  // Runtime order state
  const [aktifMusteriTipi, setAktifMusteriTipi] = useState<MusteriTipi>(musteriTipleri[0]);
  const [aktifSiparis, setAktifSiparis] = useState<Siparis>({
    parcalar: ['krep', 'cikolata'],
    d: 2,
    tercih: 'normal',
  });

  // Simulated player plate
  const [tabak, setTabak] = useState<TabakParcasi[]>([
    { malzeme: 'krep', pisme: 'orta', kalinlik: 'normal', usta: true },
    { malzeme: 'cikolata' },
  ]);

  // Simulation controls
  const [comboSayisi, setComboSayisi] = useState<number>(1);
  const [kalanSabirOrani, setKalanSabirOrani] = useState<number>(0.85);

  // Evaluation outcome
  const [sonuc, setSonuc] = useState<DegerlendirmeDetay | null>(null);

  // Run evaluation whenever plate, order, settings, or sliders change
  useEffect(() => {
    const res = degerlendirSiparis(
      aktifSiparis,
      tabak,
      aktifOyunAyarlari,
      aktifMusteriTipi,
      seviye,
      comboSayisi,
      kalanSabirOrani,
      malzemeler
    );
    setSonuc(res);
  }, [aktifSiparis, tabak, aktifOyunAyarlari, aktifMusteriTipi, seviye, comboSayisi, kalanSabirOrani, malzemeler]);

  // New random order generator
  const handleYeniSiparis = () => {
    const { musteriTipi, siparis } = rastgeleSiparisUret(seviyeAyari, musteriTipleri);
    setAktifMusteriTipi(musteriTipi);
    setAktifSiparis(siparis);

    // Auto-fill plate matching the order perfectly initially
    setTabak(
      siparis.parcalar.map((id) => {
        if (id === 'krep') {
          return {
            malzeme: 'krep',
            pisme: 'orta',
            kalinlik: siparis.tercih || 'normal',
            usta: true,
          };
        }
        return { malzeme: id };
      })
    );
  };

  const handleTabagaEkle = (malzemeId: string) => {
    if (tabak.length >= aktifOyunAyarlari.tabakMax) {
      alert(`Tabak kapasitesi dolu (Max ${aktifOyunAyarlari.tabakMax})`);
      return;
    }
    if (malzemeId === 'krep') {
      setTabak([...tabak, { malzeme: 'krep', pisme: 'orta', kalinlik: 'normal' }]);
    } else {
      setTabak([...tabak, { malzeme: malzemeId }]);
    }
  };

  const handleTabaktanCikar = (index: number) => {
    setTabak(tabak.filter((_, idx) => idx !== index));
  };

  const handleKrepPismeDegistir = (index: number, pisme: PismeBolgesi) => {
    setTabak(
      tabak.map((p, idx) => (idx === index ? { ...p, pisme } : p))
    );
  };

  const handleKrepKalinlikDegistir = (index: number, kalinlik: Kalinlik) => {
    setTabak(
      tabak.map((p, idx) => (idx === index ? { ...p, kalinlik } : p))
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Level Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--kenar)]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--yazi)]">
            Oyun Motoru & Değerlendirme Simülatörü
          </h1>
          <p className="text-xs text-[var(--yazi-soluk)] mt-0.5">
            Damerau-Levenshtein hata mesafesi, dinamik katsayılar ve ekonomi çıktısı simülasyonu
          </p>
        </div>

        {/* A/B Switcher if draft exists */}
        <div className="flex items-center gap-2">
          {degisiklikVarMi && (
            <div className="flex items-center bg-[var(--kenar)]/30 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setAbModu('canli')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  abModu === 'canli'
                    ? 'bg-[var(--kart)] text-[var(--yazi)] font-semibold shadow-xs'
                    : 'text-[var(--yazi-soluk)]'
                }`}
              >
                Canlı Denge
              </button>
              <button
                onClick={() => setAbModu('taslak')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                  abModu === 'taslak'
                    ? 'bg-[var(--renk-ana)] text-white font-semibold shadow-xs'
                    : 'text-[var(--yazi-soluk)]'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Taslak Denge</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Level Selection Bar & Quick Presets */}
      <div className="p-4 rounded-xl bg-[var(--kart)] border border-[var(--kenar)] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--yazi)]">Simüle Edilen Seviye:</span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-sm font-bold text-[var(--renk-ana)]">L</span>
              <input
                type="number"
                min="1"
                max="1000000000"
                value={seviye}
                onChange={(e) => setSeviye(parseInt(e.target.value) || 1)}
                className="w-28 px-3 py-1.5 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)] text-xs font-mono font-bold text-[var(--yazi)]"
              />
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[var(--yazi-soluk)] mr-1">Hızlı Atlama:</span>
            {[1, 10, 15, 20, 30, 50, 75, 100, 250, 500, 1000].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSeviye(lvl)}
                className={`px-2 py-1 rounded font-mono text-[11px] cursor-pointer transition-colors ${
                  seviye === lvl
                    ? 'bg-[var(--renk-ana)] text-white font-bold'
                    : 'bg-[var(--kenar)]/30 text-[var(--yazi)] hover:bg-[var(--kenar)]/60'
                }`}
              >
                L{lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Computed SeviyeAyari Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 border-t border-[var(--kenar)]/40 text-center font-mono">
          <div className="p-2 rounded-lg bg-[var(--kenar)]/15">
            <div className="text-[10px] text-[var(--yazi-soluk)]">Zorluk Katsayısı</div>
            <div className="text-xs font-bold text-[var(--renk-ana)]">
              %{(seviyeAyari.zorluk * 100).toFixed(1)}
            </div>
          </div>

          <div className="p-2 rounded-lg bg-[var(--kenar)]/15">
            <div className="text-[10px] text-[var(--yazi-soluk)]">Gereken Müşteri</div>
            <div className="text-xs font-bold text-[var(--yazi)]">
              {seviyeAyari.gerekenMusteri}
            </div>
          </div>

          <div className="p-2 rounded-lg bg-[var(--kenar)]/15">
            <div className="text-[10px] text-[var(--yazi-soluk)]">Tava Sayısı</div>
            <div className="text-xs font-bold text-[var(--basari)]">
              {seviyeAyari.tavaSayisi} Tava
            </div>
          </div>

          <div className="p-2 rounded-lg bg-[var(--kenar)]/15">
            <div className="text-[10px] text-[var(--yazi-soluk)]">Eşzamanlı Müşteri</div>
            <div className="text-xs font-bold text-[var(--renk-logo)]">
              {seviyeAyari.esZamanliMusteri} Slot
            </div>
          </div>

          <div className="p-2 rounded-lg bg-[var(--kenar)]/15">
            <div className="text-[10px] text-[var(--yazi-soluk)]">Çevir Penceresi</div>
            <div className="text-xs font-bold text-[var(--yazi)]">
              {seviyeAyari.cevirPencere.toFixed(2)} sn
            </div>
          </div>

          <div className="p-2 rounded-lg bg-[var(--kenar)]/15">
            <div className="text-[10px] text-[var(--yazi-soluk)]">Pişme Hızı</div>
            <div className="text-xs font-bold text-[var(--yazi)]">
              {seviyeAyari.pismeHizi.toFixed(2)}x
            </div>
          </div>

          <div className="p-2 rounded-lg bg-[var(--kenar)]/15">
            <div className="text-[10px] text-[var(--yazi-soluk)]">Açık Menü</div>
            <div className="text-xs font-bold text-[var(--basari)]">
              {seviyeAyari.menu.length} Malzeme
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Workbench: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Order & Plate Workbench (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Order Card */}
          <div className="p-5 rounded-xl bg-[var(--kart)] border border-[var(--kenar)] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{aktifMusteriTipi.ikon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[var(--yazi)]">
                      {aktifMusteriTipi.ad}
                    </span>
                    <span className="text-xs text-[var(--yazi-soluk)]">siparişi bekliyor</span>
                  </div>
                  <div className="text-[11px] text-[var(--yazi-soluk)] font-mono">
                    Sabır: {aktifMusteriTipi.sabir}x · Ödeme: {aktifMusteriTipi.odeme}x · Ceza:{' '}
                    {aktifMusteriTipi.ceza}x
                  </div>
                </div>
              </div>

              <button
                onClick={handleYeniSiparis}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--renk-ana)] text-white hover:opacity-90 cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rastgele Sipariş</span>
              </button>
            </div>

            {/* Expected Order Diagram (Bottom to Top) */}
            <div className="p-3.5 rounded-xl bg-[var(--kenar)]/20 border border-[var(--kenar)]/50 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--yazi)]">
                <span>Beklenen Sipariş (Aşağıdan Yukarı):</span>
                {aktifSiparis.tercih && (
                  <span className="text-[var(--renk-ana)] font-mono">
                    Tercih: {aktifSiparis.tercih.toUpperCase()} KREP
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {aktifSiparis.parcalar.map((id, idx) => {
                  const m = malzemeler.find((item) => item.id === id);
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--kart)] border border-[var(--kenar)] text-xs shadow-xs font-medium"
                    >
                      <span className="font-mono text-[10px] text-[var(--yazi-soluk)]">
                        #{idx + 1}
                      </span>
                      <span>{m ? m.ikon : '🥞'}</span>
                      <span className="text-[var(--yazi)]">{m ? m.ad : id}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Simulation Sliders (Patience & Combo) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[var(--yazi-soluk)]">Kalan Sabır Oranı:</span>
                  <span className="font-mono font-bold text-[var(--renk-ana)]">
                    %{(kalanSabirOrani * 100).toFixed(0)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.0"
                  step="0.05"
                  value={kalanSabirOrani}
                  onChange={(e) => setKalanSabirOrani(parseFloat(e.target.value))}
                  className="w-full accent-[var(--renk-ana)] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[var(--yazi-soluk)]">Aktif Combo Serisi:</span>
                  <span className="font-mono font-bold text-[var(--basari)]">
                    {comboSayisi}x Combo
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={comboSayisi}
                  onChange={(e) => setComboSayisi(parseInt(e.target.value))}
                  className="w-full accent-[var(--basari)] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Interactive Plate Stack */}
          <div className="p-5 rounded-xl bg-[var(--kart)] border border-[var(--kenar)] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[var(--yazi)] flex items-center gap-1.5">
                  <UtensilsCrossed className="w-4 h-4 text-[var(--renk-ana)]" />
                  <span>Oyuncunun Servis Tabağı ({tabak.length}/{aktifOyunAyarlari.tabakMax})</span>
                </h2>
                <p className="text-xs text-[var(--yazi-soluk)]">
                  Parçaları tabağa ekleyin, pişme ve kalınlık hatalarını simüle edin
                </p>
              </div>

              <button
                onClick={() => setTabak([])}
                className="text-xs text-[var(--vurgu)] hover:underline cursor-pointer"
              >
                Tabağı Temizle
              </button>
            </div>

            {/* Current Plate Items List */}
            <div className="space-y-2 min-h-32 p-3 rounded-xl bg-[var(--kenar)]/15 border border-[var(--kenar)]/40">
              {tabak.length === 0 ? (
                <div className="text-center py-8 text-xs text-[var(--yazi-soluk)] italic">
                  Tabak şu an boş. Aşağıdaki menüden malzeme ekleyin.
                </div>
              ) : (
                tabak.map((parca, idx) => {
                  const m = malzemeler.find((item) => item.id === parca.malzeme);
                  const isKrep = parca.malzeme === 'krep';

                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-[var(--kart)] border border-[var(--kenar)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-[var(--yazi-soluk)] font-bold">
                          #{idx + 1}
                        </span>
                        <span className="text-lg">{m ? m.ikon : '🥞'}</span>
                        <span className="font-semibold text-[var(--yazi)]">{m ? m.ad : parca.malzeme}</span>
                      </div>

                      {/* If pancake, allow changing doneness and thickness */}
                      {isKrep ? (
                        <div className="flex items-center gap-2">
                          {/* Doneness Selector */}
                          <select
                            value={parca.pisme || 'orta'}
                            onChange={(e) =>
                              handleKrepPismeDegistir(idx, e.target.value as PismeBolgesi)
                            }
                            className="px-2 py-0.5 rounded border border-[var(--kenar)] bg-[var(--zemin)] text-xs text-[var(--yazi)] cursor-pointer"
                          >
                            <option value="cig">Çiğ</option>
                            <option value="az">Az Pişmiş</option>
                            <option value="orta">Orta (Altın)</option>
                            <option value="iyi">İyi Pişmiş</option>
                            <option value="fazla">Fazla Pişmiş</option>
                            <option value="yanik">Yanık</option>
                          </select>

                          {/* Thickness Selector */}
                          <select
                            value={parca.kalinlik || 'normal'}
                            onChange={(e) =>
                              handleKrepKalinlikDegistir(idx, e.target.value as Kalinlik)
                            }
                            className="px-2 py-0.5 rounded border border-[var(--kenar)] bg-[var(--zemin)] text-xs text-[var(--yazi)] cursor-pointer"
                          >
                            <option value="ince">İnce</option>
                            <option value="normal">Normal</option>
                            <option value="kalın">Kalın</option>
                          </select>

                          <button
                            onClick={() => handleTabaktanCikar(idx)}
                            className="text-[var(--vurgu)] hover:opacity-80 px-1 cursor-pointer font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleTabaktanCikar(idx)}
                          className="text-[var(--vurgu)] hover:opacity-80 px-1 cursor-pointer font-bold self-end sm:self-auto"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Add Palette from Open Menu */}
            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-semibold text-[var(--yazi-soluk)]">
                Tabağa Ekle (Açık Seviye Menüsü):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {seviyeAyari.menu.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleTabagaEkle(m.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--kenar)] bg-[var(--kart)] hover:bg-[var(--kenar)]/30 text-xs text-[var(--yazi)] cursor-pointer transition-colors shadow-xs"
                  >
                    <span>{m.ikon}</span>
                    <span>{m.ad}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Rating & Economics Engine (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {sonuc && (
            <div className="p-5 rounded-xl bg-[var(--kart)] border border-[var(--kenar)] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--kenar)]">
                <div>
                  <h2 className="text-sm font-semibold text-[var(--yazi)]">
                    Değerlendirme & Servis Kararı
                  </h2>
                  <p className="text-xs text-[var(--yazi-soluk)]">
                    Damerau-Levenshtein puanlama motoru çıktısı
                  </p>
                </div>

                {/* Score Outcome Badge */}
                <div
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-xs ${
                    sonuc.sonuc === 'perfect'
                      ? 'bg-[var(--basari)] text-white'
                      : sonuc.sonuc === 'great'
                      ? 'bg-teal-600 text-white'
                      : sonuc.sonuc === 'good'
                      ? 'bg-amber-600 text-white'
                      : 'bg-[var(--vurgu)] text-white'
                  }`}
                >
                  {sonuc.sonuc.toUpperCase()} (Puan: {sonuc.netKalite})
                </div>
              </div>

              {/* Penalty Breakdown */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-[var(--yazi)]">
                  Hata ve Ceza Detayı ({sonuc.cezaDetay.length} kalem):
                </div>

                {sonuc.cezaDetay.length === 0 ? (
                  <div className="p-3 rounded-lg bg-[var(--basari)]/10 text-xs text-[var(--basari)] flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Sıralama ve pişme kusursuz! Sıfır hata cezası.</span>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {sonuc.cezaDetay.map((c, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-[var(--vurgu)]/10 text-xs text-[var(--vurgu)] flex items-center justify-between"
                      >
                        <span>{c.aciklama}</span>
                        <span className="font-mono font-bold">-{c.miktar}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Economics Calculation Breakdown (§4) */}
              <div className="p-4 rounded-xl bg-[var(--kenar)]/15 border border-[var(--kenar)]/40 space-y-2 text-xs font-mono">
                <div className="text-xs font-bold text-[var(--yazi)] pb-1 border-b border-[var(--kenar)]/40 font-sans">
                  Ekonomi & Kasa Gelir Formülü
                </div>

                <div className="flex items-center justify-between text-[var(--yazi-soluk)]">
                  <span>Temel Sipariş Değeri:</span>
                  <span>{sonuc.fiyat} coin</span>
                </div>

                <div className="flex items-center justify-between text-[var(--yazi-soluk)]">
                  <span>Malzeme Maliyeti:</span>
                  <span className="text-[var(--vurgu)]">-{sonuc.maliyet} coin</span>
                </div>

                <div className="flex items-center justify-between text-[var(--yazi-soluk)]">
                  <span>Ödeme (Sonuç × Tip Çarpanı):</span>
                  <span>+{sonuc.odeme} coin</span>
                </div>

                <div className="flex items-center justify-between text-[var(--yazi-soluk)]">
                  <span>Bahşiş (Ruh Hali × Tip Bahşişi):</span>
                  <span>+{sonuc.bahsis} coin</span>
                </div>

                {seviye >= aktifOyunAyarlari.combo.baslangicSeviyesi && (
                  <div className="flex items-center justify-between text-[var(--yazi-soluk)]">
                    <span>Combo Kazancı ({comboSayisi}x seri):</span>
                    <span className="text-[var(--basari)]">+{sonuc.comboKazanci} coin</span>
                  </div>
                )}

                {sonuc.perfectBonus > 0 && (
                  <div className="flex items-center justify-between text-[var(--basari)]">
                    <span>PERFECT Bonusu:</span>
                    <span>+{sonuc.perfectBonus} coin</span>
                  </div>
                )}

                <div className="pt-2 border-t border-[var(--kenar)]/50 flex items-center justify-between font-bold text-sm text-[var(--basari)]">
                  <span>NET SERVİS KAZANCI:</span>
                  <span>+{sonuc.netKazanc} COIN</span>
                </div>
              </div>

              {/* Simulated Receipt Preview */}
              <div className="p-3 rounded-lg border border-dashed border-[var(--kenar)] bg-[var(--zemin)] text-center space-y-1">
                <div className="text-[10px] text-[var(--yazi-soluk)] uppercase tracking-wider font-mono">
                  Otomatik Üretilen Fiş Kodu
                </div>
                <div className="font-mono font-bold text-xs tracking-widest text-[var(--yazi)]">
                  {uretFisKodu(seviye, sonuc.sonuc === 'perfect' ? 3 : sonuc.sonuc === 'great' ? 2 : sonuc.sonuc === 'good' ? 1 : 0)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
