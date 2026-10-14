import React, { useState } from 'react';
import { Malzeme, MalzemeKategori, TokenRengi } from '../../types/game';
import { useGameAdmin } from '../../context/GameAdminContext';
import { X, AlertCircle, AlertTriangle, Check, Sparkles } from 'lucide-react';

interface Props {
  malzeme: Malzeme | null; // null if adding new
  onClose: () => void;
}

const TOKEN_RENK_SECENEKLERI: { token: TokenRengi; ad: string; hex: string }[] = [
  { token: '--renk-ana', ad: 'Karamel Ana (#B45309)', hex: '#B45309' },
  { token: '--renk-ana-koyu', ad: 'Koyu Karamel (#7C3A0A)', hex: '#7C3A0A' },
  { token: '--vurgu', ad: 'Çilek Kırmızısı (#BE123C)', hex: '#BE123C' },
  { token: '--basari', ad: 'Nane Yeşili (#0F766E)', hex: '#0F766E' },
  { token: '--krep-orta', ad: 'Altın Krep (#D99A2B)', hex: '#D99A2B' },
  { token: '--krep-az', ad: 'Az Pişmiş Krep (#F2D272)', hex: '#F2D272' },
  { token: '--krep-iyi', ad: 'İyi Pişmiş Krep (#A8641C)', hex: '#A8641C' },
  { token: '--krep-cig', ad: 'Çiğ Krep (#F3E3C3)', hex: '#F3E3C3' },
  { token: '--sahne-tabak', ad: 'Tabak Turkuazı (#5FD3C4)', hex: '#5FD3C4' },
  { token: '--sahne-tava', ad: 'Tava Grisi (#7A7F92)', hex: '#7A7F92' },
];

const HAZIR_EMOJILER = ['🥞', '🍫', '🍓', '🫗', '🧈', '🍌', '🍯', '🌰', '🫐', '🍒', '🥥', '🍦', '🥝', '🥜'];

export const MalzemeDuzenleModal: React.FC<Props> = ({ malzeme, onClose }) => {
  const { guncelleMalzeme, ekleMalzeme, malzemeler } = useGameAdmin();

  const [id, setId] = useState<string>(malzeme ? malzeme.id : '');
  const [ad, setAd] = useState<string>(malzeme ? malzeme.ad : '');
  const [kategori, setKategori] = useState<MalzemeKategori>(malzeme ? malzeme.kategori : 'topping');
  const [acilis, setAcilis] = useState<number>(malzeme ? malzeme.acilis : 1);
  const [maliyet, setMaliyet] = useState<number>(malzeme ? malzeme.maliyet : 1);
  const [deger, setDeger] = useState<number>(malzeme ? malzeme.deger : 5);
  const [ikon, setIkon] = useState<string>(malzeme ? malzeme.ikon : '🥞');
  const [renkDegiskeni, setRenkDegiskeni] = useState<TokenRengi>(
    malzeme ? malzeme.renkDegiskeni : '--renk-ana'
  );
  const [tatli, setTatli] = useState<boolean>(malzeme ? !!malzeme.tatli : false);
  const [hata, setHata] = useState<string>('');

  // Calculations & Warnings
  const kar = deger - maliyet;
  const karZararVarMi = maliyet >= deger;

  // Level overlap check
  const ayniSeviyedeBaskaVarMi = malzemeler.find(
    (m) => m.acilis === acilis && (!malzeme || m.id !== malzeme.id)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ad.trim()) {
      setHata('Malzeme adı boş bırakılamaz.');
      return;
    }
    const cleanId = id.trim() || ad.toLowerCase().replace(/[^a-z0-9]/g, '-');

    if (!malzeme && malzemeler.some((m) => m.id === cleanId)) {
      setHata('Bu ID ile kayıtlı bir malzeme zaten mevcut.');
      return;
    }

    const yeniMalzeme: Malzeme = {
      id: cleanId,
      ad: ad.trim(),
      kategori,
      acilis: Math.max(1, acilis),
      maliyet: Math.max(0, maliyet),
      deger: Math.max(1, deger),
      ikon,
      renkDegiskeni,
      tatli,
      aktif: true,
    };

    if (malzeme) {
      guncelleMalzeme(yeniMalzeme);
    } else {
      ekleMalzeme(yeniMalzeme);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[var(--kart)] border border-[var(--kenar)] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--kenar)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{ikon}</span>
            <div>
              <h3 className="text-base font-bold text-[var(--yazi)]">
                {malzeme ? `${malzeme.ad} Düzenle` : 'Yeni Malzeme Ekle'}
              </h3>
              <p className="text-xs text-[var(--yazi-soluk)]">
                Restoran krep menüsü içerik parametreleri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--yazi-soluk)] hover:text-[var(--yazi)] hover:bg-[var(--kenar)]/30 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Profit Warning Box (Section 7.2) */}
          {karZararVarMi && (
            <div className="p-3 rounded-lg bg-[var(--vurgu)]/10 border border-[var(--vurgu)]/40 text-xs text-[var(--vurgu)] flex items-start gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>KÂR UYARISI:</strong> Malzeme maliyeti ({maliyet} coin), satış değerine (
                {deger} coin) eşit veya daha yüksek! Bu malzeme siparişe konduğunda oyuncu zarar
                edecektir (Net kâr: {kar} coin).
              </div>
            </div>
          )}

          {/* Level Overlap Warning Box (Section 7.4) */}
          {ayniSeviyedeBaskaVarMi && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/40 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Açılış Seviyesi Çakışması:</strong> {acilis}. seviyede zaten{' '}
                <strong>{ayniSeviyedeBaskaVarMi.ad}</strong> malzemesi açılıyor. Aynı seviyede iki
                yeni malzeme açılması oyuncuyu bunaltabilir.
              </div>
            </div>
          )}

          {/* ID & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--yazi)] mb-1">
                Malzeme ID (Benzersiz)
              </label>
              <input
                type="text"
                disabled={!!malzeme}
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="cilek-dilimi"
                className="w-full px-3 py-1.5 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)] text-xs font-mono text-[var(--yazi)] disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--yazi)] mb-1">
                Görünen Ad <span className="text-[var(--vurgu)]">*</span>
              </label>
              <input
                type="text"
                required
                value={ad}
                onChange={(e) => setAd(e.target.value)}
                placeholder="Çilek Dilimi"
                className="w-full px-3 py-1.5 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)] text-xs text-[var(--yazi)]"
              />
            </div>
          </div>

          {/* Category & Emoji */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--yazi)] mb-1">Kategori</label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value as MalzemeKategori)}
                className="w-full px-3 py-1.5 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)] text-xs text-[var(--yazi)] cursor-pointer"
              >
                <option value="krep">Krep Tabanı</option>
                <option value="dolgu">Dolgu (Krema / Çikolata)</option>
                <option value="sos">Sos (Bal / Reçel)</option>
                <option value="topping">Topping (Meyve / Fındık)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--yazi)] mb-1">
                İkon Emoji: <span className="text-base">{ikon}</span>
              </label>
              <div className="flex flex-wrap gap-1">
                {HAZIR_EMOJILER.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIkon(emoji)}
                    className={`w-7 h-7 rounded-md text-sm flex items-center justify-center border cursor-pointer ${
                      ikon === emoji
                        ? 'border-[var(--renk-ana)] bg-[var(--renk-ana)]/15 scale-110'
                        : 'border-[var(--kenar)] hover:bg-[var(--kenar)]/30'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Economics: Level, Cost, Value */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-[var(--kenar)]/15 border border-[var(--kenar)]/40">
            <div>
              <label className="block text-xs font-medium text-[var(--yazi)] mb-1">
                Açılış Seviyesi
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={acilis}
                onChange={(e) => setAcilis(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-1.5 rounded-lg border border-[var(--kenar)] bg-[var(--kart)] text-xs font-mono text-[var(--yazi)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--yazi)] mb-1">
                Maliyet (Düşülen)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={maliyet}
                onChange={(e) => setMaliyet(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-lg border border-[var(--kenar)] bg-[var(--kart)] text-xs font-mono text-[var(--yazi)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--yazi)] mb-1">
                Değer (Fiyat)
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={deger}
                onChange={(e) => setDeger(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-1.5 rounded-lg border border-[var(--kenar)] bg-[var(--kart)] text-xs font-mono text-[var(--yazi)]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-[var(--yazi-soluk)]">Net Katkı (Kâr / Marj):</span>
            <span
              className={`font-mono font-bold ${
                kar > 0 ? 'text-[var(--basari)]' : 'text-[var(--vurgu)]'
              }`}
            >
              {kar > 0 ? `+${kar}` : kar} Coin
            </span>
          </div>

          {/* Color Token Selector (Strictly Defined Tokens) */}
          <div>
            <label className="block text-xs font-medium text-[var(--yazi)] mb-1.5">
              Tasarım Token Rengi (Yalnız Marka Paleti)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TOKEN_RENK_SECENEKLERI.map((item) => (
                <button
                  key={item.token}
                  type="button"
                  onClick={() => setRenkDegiskeni(item.token)}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs text-left cursor-pointer transition-colors ${
                    renkDegiskeni === item.token
                      ? 'border-[var(--renk-ana)] bg-[var(--renk-ana)]/10 font-bold'
                      : 'border-[var(--kenar)] hover:bg-[var(--kenar)]/20'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full shrink-0 border border-black/10"
                    style={{ backgroundColor: item.hex }}
                  />
                  <span className="truncate text-[11px] text-[var(--yazi)]">{item.ad}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sweet checkbox */}
          <div className="flex items-center gap-2 p-2 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)]">
            <input
              type="checkbox"
              id="tatli"
              checked={tatli}
              onChange={(e) => setTatli(e.target.checked)}
              className="rounded border-[var(--kenar)] text-[var(--renk-ana)] cursor-pointer"
            >
            </input>
            <label htmlFor="tatli" className="text-xs text-[var(--yazi)] cursor-pointer select-none">
              <strong>Tatlı Malzeme</strong> (Çocuk müşteriler yalnızca tatlı malzeme sipariş eder)
            </label>
          </div>

          {hata && <p className="text-xs text-[var(--vurgu)]">{hata}</p>}

          {/* Submit */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--kenar)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs rounded-lg border border-[var(--kenar)] text-[var(--yazi-soluk)] hover:bg-[var(--kenar)]/20 cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-[var(--renk-ana)] text-[var(--renk-ana-yazi)] hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              {malzeme ? 'Değişiklikleri Kaydet' : 'Malzemeyi Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
