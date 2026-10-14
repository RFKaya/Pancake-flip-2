import React, { useState } from 'react';
import { useGameAdmin } from '../../context/GameAdminContext';
import { OyunAyarlari } from '../../types/game';
import { YayinlaModal } from '../modals/YayinlaModal';
import {
  Sliders,
  Flame,
  Clock,
  Award,
  Zap,
  RotateCcw,
  Upload,
  Play,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const DengeAyarlariView: React.FC = () => {
  const {
    ayarlar,
    taslakAyarlar,
    degisiklikVarMi,
    taslagiGuncelle,
    taslagiSifirla,
    setAktifSekme,
  } = useGameAdmin();

  const [aktifGrup, setAktifGrup] = useState<string>('pisme');
  const [yayinModalAcik, setYayinModalAcik] = useState<boolean>(false);

  const handleSayisalGuncelle = (path: string, deger: number) => {
    const keys = path.split('.');
    if (keys.length === 1) {
      taslagiGuncelle({ [keys[0]]: deger });
    } else if (keys.length === 2) {
      const parent = (taslakAyarlar as any)[keys[0]];
      taslagiGuncelle({
        [keys[0]]: {
          ...parent,
          [keys[1]]: deger,
        },
      });
    }
  };

  // Six-step doneness band data
  const pismeBant = [
    { harf: 'Ç', ad: 'Çiğ', token: 'var(--krep-cig)', esik: `0 - ${taslakAyarlar.pismeBolgeleri.cig.toFixed(2)}x` },
    { harf: 'A', ad: 'Az Pişmiş', token: 'var(--krep-az)', esik: `${taslakAyarlar.pismeBolgeleri.cig.toFixed(2)} - ${taslakAyarlar.pismeBolgeleri.az.toFixed(2)}x` },
    { harf: 'O', ad: 'Orta (Altın)', token: 'var(--krep-orta)', esik: `${taslakAyarlar.pismeBolgeleri.az.toFixed(2)} - ${taslakAyarlar.pismeBolgeleri.orta.toFixed(2)}x` },
    { harf: 'İ', ad: 'İyi Pişmiş', token: 'var(--krep-iyi)', esik: `${taslakAyarlar.pismeBolgeleri.orta.toFixed(2)} - ${taslakAyarlar.pismeBolgeleri.iyi.toFixed(2)}x` },
    { harf: 'F', ad: 'Fazla Pişmiş', token: 'var(--krep-fazla)', esik: `${taslakAyarlar.pismeBolgeleri.iyi.toFixed(2)} - ${taslakAyarlar.pismeBolgeleri.fazla.toFixed(2)}x` },
    { harf: 'Y', ad: 'Yanık', token: 'var(--krep-yanik)', esik: `>${taslakAyarlar.pismeBolgeleri.fazla.toFixed(2)}x` },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--kenar)]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--yazi)]">
            Oyun Fiziği ve Ekonomi Dengesi (`ayarlar.json`)
          </h1>
          <p className="text-xs text-[var(--yazi-soluk)] mt-0.5">
            Pişme toleransları, süreler, hata cezaları, combo basamakları ve puan çarpanları
          </p>
        </div>

        {/* Draft Actions Strip */}
        <div className="flex items-center gap-2">
          {degisiklikVarMi && (
            <button
              onClick={taslagiSifirla}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--kenar)] text-[var(--yazi-soluk)] hover:bg-[var(--kenar)]/20 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Taslağı Geri Al</span>
            </button>
          )}

          <button
            onClick={() => setAktifSekme('simulator')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--kart)] border border-[var(--renk-ana)] text-[var(--renk-ana)] hover:bg-[var(--renk-ana)]/10 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simülatörde Dene</span>
          </button>

          <button
            onClick={() => setYayinModalAcik(true)}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg text-white shadow-xs cursor-pointer ${
              degisiklikVarMi
                ? 'bg-[var(--basari)] hover:opacity-90 animate-pulse'
                : 'bg-[var(--renk-ana)] hover:opacity-90'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{degisiklikVarMi ? 'Taslağı Canlıya Yayınla' : 'Yayında (Değişiklik Yok)'}</span>
          </button>
        </div>
      </div>

      {/* Group Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'pisme', ad: 'Pişirme & Pişme Bölgeleri', icon: Flame },
          { id: 'hamur', ad: 'Hamur & Süreler', icon: Clock },
          { id: 'kalite', ad: 'Kalite & Hata Cezaları', icon: Award },
          { id: 'combo', ad: 'Combo & Ruh Hali Bahşişleri', icon: Zap },
        ].map((g) => {
          const Icon = g.icon;
          const isSelected = aktifGrup === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setAktifGrup(g.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-[var(--renk-ana)] text-white shadow-xs font-semibold'
                  : 'bg-[var(--kart)] text-[var(--yazi-soluk)] border border-[var(--kenar)] hover:text-[var(--yazi)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{g.ad}</span>
            </button>
          );
        })}
      </div>

      {/* Group 1: Pişirme & Pişme Bölgeleri */}
      {aktifGrup === 'pisme' && (
        <div className="space-y-6">
          {/* Section 8 Mandate: Six-step doneness band with letters Ç, A, O, İ, F, Y */}
          <div className="p-5 rounded-xl bg-[var(--kart)] border border-[var(--kenar)] shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--yazi)] flex items-center gap-2">
                <Flame className="w-4 h-4 text-[var(--renk-ana)]" />
                <span>6 Basamaklı Pişme Bölgesi Renk Şeridi (Marka Rehberi §8)</span>
              </h2>
              <p className="text-xs text-[var(--yazi-soluk)] mt-0.5">
                Krep pişirme seviyeleri harf etiketleriyle ve resmi krep tonlarıyla gösterilir: Çiğ, Az, Orta, İyi, Fazla, Yanık.
              </p>
            </div>

            {/* Visual Color Strip */}
            <div className="grid grid-cols-6 gap-2">
              {pismeBant.map((b) => (
                <div
                  key={b.harf}
                  className="flex flex-col items-center p-3 rounded-xl border border-[var(--kenar)]/50 shadow-xs space-y-2 text-center"
                  style={{ backgroundColor: b.token }}
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-xs ${
                      b.harf === 'Y' || b.harf === 'F' ? 'text-white bg-black/40' : 'text-stone-900 bg-white/70'
                    }`}
                  >
                    {b.harf}
                  </span>
                  <div>
                    <div
                      className={`text-xs font-bold leading-tight ${
                        b.harf === 'Y' || b.harf === 'F' ? 'text-white' : 'text-stone-900'
                      }`}
                    >
                      {b.ad}
                    </div>
                    <div
                      className={`text-[10px] font-mono mt-0.5 ${
                        b.harf === 'Y' || b.harf === 'F' ? 'text-white/80' : 'text-stone-800/80'
                      }`}
                    >
                      {b.esik}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cooking Durations & Thresholds */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[var(--kart)] border border-[var(--kenar)] shadow-xs space-y-2">
              <label className="block text-xs font-medium text-[var(--yazi)]">
                Temel Pişme Süresi (sn)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="2.0"
                  max="15.0"
                  value={taslakAyarlar.pismeSuresi}
                  onChange={(e) => handleSayisalGuncelle('pismeSuresi', parseFloat(e.target.value) || 6)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)] text-xs font-mono text-[var(--yazi)]"
                />
                <span className="text-xs text-[var(--yazi-soluk)] font-mono">sn</span>
              </div>
              <p className="text-[11px] text-[var(--yazi-soluk)]">Tavada tam kıvam pişirme referans süresi.</p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--kart)] border border-[var(--kenar)] shadow-xs space-y-2">
              <label className="block text-xs font-medium text-[var(--yazi)]">
                Yüz Süresi (Çevirme Aralığı)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="8.0"
                  value={taslakAyarlar.yuzSuresi}
                  onChange={(e) => handleSayisalGuncelle('yuzSuresi', parseFloat(e.target.value) || 3)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)] text-xs font-mono text-[var(--yazi)]"
                />
                <span className="text-xs text-[var(--yazi-soluk)] font-mono">sn</span>
              </div>
              <p className="text-[11px] text-[var(--yazi-soluk)]">İlk yüzün çevrilmesi gereken süre.</p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--kart)] border border-[var(--kenar)] shadow-xs space-y-2">
              <label className="block text-xs font-medium text-[var(--yazi)]">
                İkinci Yüz Pişme Hızı Çarpanı
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.05"
                  min="0.8"
                  max="2.5"
                  value={taslakAyarlar.ikinciYuzHizi}
                  onChange={(e) => handleSayisalGuncelle('ikinciYuzHizi', parseFloat(e.target.value) || 1.2)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)] text-xs font-mono text-[var(--yazi)]"
                />
                <span className="text-xs text-[var(--yazi-soluk)] font-mono">x</span>
              </div>
              <p className="text-[11px] text-[var(--yazi-soluk)]">Çevrildikten sonra tava sıcaklığı artış hızı.</p>
            </div>
          </div>
        </div>
      )}

      {/* Group 2: Hamur & Süreler */}
      {aktifGrup === 'hamur' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[var(--kart)] border border-[var(--kenar)] shadow-xs space-y-2">
            <label className="block text-xs font-medium text-[var(--yazi)]">Hamur Döküm Süresi</label>
            <input
              type="number"
              step="0.1"
              value={taslakAyarlar.dokumSuresi}
              onChange={(e) => handleSayisalGuncelle('dokumSuresi', parseFloat(e.target.value) || 1.2)}
              className="w-full px-3 py-1.5 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)] text-xs font-mono text-[var(--yazi)]"
            />
            <span className="text-[11px] text-[var(--yazi-soluk)]">Döküm animasyonu süresi (sn)</span>
          </div>

          <div className="p-4 rounded-xl bg-[var(--kart)] border border-[var(--kenar)] shadow-xs space-y-2">
            <label className="block text-xs font-medium text-[var(--yazi)]">Maksimum Tabak Kapasitesi</label>
            <input
              type="number"
              value={taslakAyarlar.tabakMax}
              onChange={(e) => handleSayisalGuncelle('tabakMax', parseInt(e.target.value) || 12)}
              className="w-full px-3 py-1.5 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)] text-xs font-mono text-[var(--yazi)]"
            />
            <span className="text-[11px] text-[var(--yazi-soluk)]">Bir tabaktaki maksimum malzeme (tabakMax = 12)</span>
          </div>

          <div className="p-4 rounded-xl bg-[var(--kart)] border border-[var(--kenar)] shadow-xs space-y-2">
            <label className="block text-xs font-medium text-[var(--yazi)]">Sos Koyma Süresi</label>
            <input
              type="number"
              step="0.05"
              value={taslakAyarlar.sosSuresi}
              onChange={(e) => handleSayisalGuncelle('sosSuresi', parseFloat(e.target.value) || 0.4)}
              className="w-full px-3 py-1.5 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)] text-xs font-mono text-[var(--yazi)]"
            />
            <span className="text-[11px] text-[var(--yazi-soluk)]">Sos dökülme animasyon süresi (sn)</span>
          </div>

          <div className="p-4 rounded-xl bg-[var(--kart)] border border-[var(--kenar)] shadow-xs space-y-2">
            <label className="block text-xs font-medium text-[var(--yazi)]">Yanık Bekleme Süresi</label>
            <input
              type="number"
              step="0.1"
              value={taslakAyarlar.yanikBekleme}
              onChange={(e) => handleSayisalGuncelle('yanikBekleme', parseFloat(e.target.value) || 1.5)}
              className="w-full px-3 py-1.5 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)] text-xs font-mono text-[var(--yazi)]"
            />
            <span className="text-[11px] text-[var(--yazi-soluk)]">Tavada yandıktan sonra çöpe gitme toleransı (sn)</span>
          </div>
        </div>
      )}

      {/* Group 3: Kalite & Hata Cezaları */}
      {aktifGrup === 'kalite' && (
        <div className="space-y-6">
          {/* Quality Thresholds */}
          <div className="p-5 rounded-xl bg-[var(--kart)] border border-[var(--kenar)] shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-[var(--yazi)] flex items-center gap-2">
              <Award className="w-4 h-4 text-[var(--renk-logo)]" />
              <span>Kalite Puanlama Eşikleri ve Ödeme Çarpanları</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[var(--basari)]/10 border border-[var(--basari)]/30 space-y-1">
                <div className="font-bold text-[var(--basari)]">PERFECT (★ 100)</div>
                <div className="text-[11px]">Eşik: {taslakAyarlar.kalitePuanlari.perfect} puan</div>
                <div className="text-[11px] font-mono">Ödeme: {taslakAyarlar.odemeCarpani.perfect * 100}%</div>
                <div className="text-[11px] font-bold text-[var(--basari)]">+{taslakAyarlar.perfectBonusu} coin bonus</div>
              </div>

              <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/30 space-y-1">
                <div className="font-bold text-teal-700 dark:text-teal-300">GREAT (★★ 80)</div>
                <div className="text-[11px]">Eşik: {taslakAyarlar.kalitePuanlari.great} puan</div>
                <div className="text-[11px] font-mono">Ödeme: {taslakAyarlar.odemeCarpani.great * 100}%</div>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-1">
                <div className="font-bold text-amber-700 dark:text-amber-300">GOOD (★ 50)</div>
                <div className="text-[11px]">Eşik: {taslakAyarlar.kalitePuanlari.good} puan</div>
                <div className="text-[11px] font-mono">Ödeme: {taslakAyarlar.odemeCarpani.good * 100}%</div>
              </div>

              <div className="p-3 rounded-lg bg-[var(--vurgu)]/10 border border-[var(--vurgu)]/30 space-y-1">
                <div className="font-bold text-[var(--vurgu)]">OLMADI (&lt; 50)</div>
                <div className="text-[11px]">Başarısız Servis</div>
                <div className="text-[11px] font-mono">Ödeme: {taslakAyarlar.odemeCarpani.olmadi * 100}%</div>
              </div>
            </div>
          </div>

          {/* Fault Penalties Grid */}
          <div className="p-5 rounded-xl bg-[var(--kart)] border border-[var(--kenar)] shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-[var(--yazi)]">
              Hata Türü Kalite Düşüş Cezaları (100 Puan Üzerinden)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { key: 'eksik', ad: 'Eksik Malzeme', varsayilan: 25 },
                { key: 'fazla', ad: 'Fazla Malzeme', varsayilan: 20 },
                { key: 'yanlis', ad: 'Yanlış Malzeme', varsayilan: 25 },
                { key: 'sira', ad: 'Sıralama Hatası', varsayilan: 10 },
                { key: 'pisme', ad: 'Pişme Hatası (Çiğ/Yanık)', varsayilan: 25 },
                { key: 'tercih', ad: 'Kalınlık Uyumsuzluğu', varsayilan: 10 },
              ].map((h) => (
                <div key={h.key} className="p-3 rounded-lg bg-[var(--kenar)]/15 border border-[var(--kenar)]/40 space-y-1.5">
                  <div className="text-xs font-semibold text-[var(--yazi)]">{h.ad}</div>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={(taslakAyarlar.hataCezalari as any)[h.key]}
                    onChange={(e) => handleSayisalGuncelle(`hataCezalari.${h.key}`, parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 rounded border border-[var(--kenar)] bg-[var(--kart)] font-mono text-xs text-[var(--vurgu)] font-bold"
                  />
                  <div className="text-[10px] text-[var(--yazi-soluk)]">Puan düşüşü</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Group 4: Combo & Ruh Hali */}
      {aktifGrup === 'combo' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Combo Multipliers */}
          <div className="p-5 rounded-xl bg-[var(--kart)] border border-[var(--kenar)] shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-[var(--yazi)] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[var(--renk-ana)]" />
              <span>Combo Kuralları (L15+)</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--yazi)] mb-1">Combo Başlangıç Seviyesi</label>
                <input
                  type="number"
                  value={taslakAyarlar.combo.baslangicSeviyesi}
                  onChange={(e) => handleSayisalGuncelle('combo.baslangicSeviyesi', parseInt(e.target.value) || 15)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)] font-mono text-xs text-[var(--yazi)]"
                />
                <span className="text-[10px] text-[var(--yazi-soluk)]">Combo mekaniğinin aktif olduğu seviye eşiği</span>
              </div>

              <div>
                <label className="block text-[var(--yazi)] mb-1">Combo Adım Artışı (Step)</label>
                <input
                  type="number"
                  step="0.01"
                  value={taslakAyarlar.combo.adim}
                  onChange={(e) => handleSayisalGuncelle('combo.adim', parseFloat(e.target.value) || 0.1)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)] font-mono text-xs text-[var(--yazi)]"
                />
                <span className="text-[10px] text-[var(--yazi-soluk)]">Her ardışık başarılı serviste eklenen kazanç oranı</span>
              </div>

              <div>
                <label className="block text-[var(--yazi)] mb-1">Combo Üst Sınır Tavanı (Cap)</label>
                <input
                  type="number"
                  step="0.05"
                  value={taslakAyarlar.combo.ustSinir}
                  onChange={(e) => handleSayisalGuncelle('combo.ustSinir', parseFloat(e.target.value) || 0.5)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)] font-mono text-xs text-[var(--yazi)]"
                />
                <span className="text-[10px] text-[var(--yazi-soluk)]">Maksimum combo kazancı çarpanı (Örn: %50)</span>
              </div>
            </div>
          </div>

          {/* Mood Tip Rates */}
          <div className="p-5 rounded-xl bg-[var(--kart)] border border-[var(--kenar)] shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-[var(--yazi)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--renk-logo)]" />
              <span>Ruh Hali & Bahşiş Tablosu</span>
            </h2>

            <div className="space-y-2 text-xs">
              {[
                { key: 'mutlu', ikon: '😋', ad: 'Çok Mutlu (Sabır ≥ %80)', bahsis: '%30 Bahşiş' },
                { key: 'iyi', ikon: '🙂', ad: 'Memnun (Sabır ≥ %60)', bahsis: '%20 Bahşiş' },
                { key: 'notr', ikon: '😐', ad: 'Nötr (Sabır ≥ %40)', bahsis: '%10 Bahşiş' },
                { key: 'kizgin', ikon: '😠', ad: 'Kızgın (Sabır ≥ %20)', bahsis: 'Bahşiş Yok (%0)' },
                { key: 'ofkeli', ikon: '🤬', ad: 'Öfkeli (Sabır < %20)', bahsis: 'Bahşiş Yok (%0)' },
              ].map((m) => (
                <div
                  key={m.key}
                  className="p-2.5 rounded-lg bg-[var(--kenar)]/15 border border-[var(--kenar)]/40 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{m.ikon}</span>
                    <span className="font-medium text-[var(--yazi)]">{m.ad}</span>
                  </div>
                  <span className="font-mono font-bold text-[var(--basari)]">{m.bahsis}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Publish Modal */}
      {yayinModalAcik && <YayinlaModal onClose={() => setYayinModalAcik(false)} />}
    </div>
  );
};
