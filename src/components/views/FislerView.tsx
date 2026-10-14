import React, { useState } from 'react';
import { useGameAdmin } from '../../context/GameAdminContext';
import { Fis } from '../../types/game';
import { dogrulaFisKodu, formatCompact, formatTamSayi } from '../../lib/gameEngine';
import { FisDetayModal } from '../modals/FisDetayModal';
import {
  Search,
  Receipt,
  ShieldCheck,
  ShieldAlert,
  Star,
  Copy,
  Check,
} from 'lucide-react';

export const FislerView: React.FC = () => {
  const { fisler, oyuncular } = useGameAdmin();

  const [arama, setArama] = useState<string>('');
  const [yildizFiltresi, setYildizFiltresi] = useState<string>('all');
  const [durumFiltresi, setDurumFiltresi] = useState<string>('all');
  const [secilenFis, setSecilenFis] = useState<Fis | null>(null);
  const [kopyalananId, setKopyalananId] = useState<string | null>(null);

  const handleKopyala = (e: React.MouseEvent, fis: Fis) => {
    e.stopPropagation();
    navigator.clipboard.writeText(fis.kod);
    setKopyalananId(fis.id);
    setTimeout(() => setKopyalananId(null), 1500);
  };

  const filtrelenmisFisler = fisler.filter((f) => {
    // Search
    const searchMatch =
      f.kod.toLowerCase().includes(arama.toLowerCase()) ||
      f.bolum.toString().includes(arama) ||
      f.playerId.toLowerCase().includes(arama.toLowerCase());
    if (!searchMatch) return false;

    // Star filter
    if (yildizFiltresi !== 'all' && f.yildiz.toString() !== yildizFiltresi) return false;

    // Suspicious filter
    if (durumFiltresi === 'supheli' && !f.supheli) return false;
    if (durumFiltresi === 'gecerli' && f.supheli) return false;

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--kenar)]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--yazi)]">
            Adisyon Fişleri & Sipariş Kayıt Defteri
          </h1>
          <p className="text-xs text-[var(--yazi-soluk)] mt-0.5">
            Rust motoru ile üretilen resmi KRP formatlı kriptografik restoran adisyonları
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--yazi-soluk)] font-mono">
            Toplam <strong>{fisler.length}</strong> Fiş Kaydı
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-[var(--kart)] border border-[var(--kenar)] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[var(--yazi-soluk)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Fiş kodu (KRP-...), seviye veya oyuncu ara..."
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)] text-xs text-[var(--yazi)] placeholder:text-[var(--yazi-soluk)]/60 focus:outline-hidden font-mono"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Star Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--yazi-soluk)]">
            <span>Yıldız:</span>
            <select
              value={yildizFiltresi}
              onChange={(e) => setYildizFiltresi(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)] text-xs text-[var(--yazi)] font-medium cursor-pointer"
            >
              <option value="all">Tümü (0 - 3 ★)</option>
              <option value="3">3 ★★★ (Kusursuz)</option>
              <option value="2">2 ★★</option>
              <option value="1">1 ★</option>
              <option value="0">0 (Başarısız)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--yazi-soluk)]">
            <span>Güvenlik:</span>
            <select
              value={durumFiltresi}
              onChange={(e) => setDurumFiltresi(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)] text-xs text-[var(--yazi)] font-medium cursor-pointer"
            >
              <option value="all">Tümü</option>
              <option value="gecerli">Yalnız Geçerli Fişler</option>
              <option value="supheli">Şüpheli / Hileli Fişler</option>
            </select>
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-[var(--kart)] rounded-xl border border-[var(--kenar)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--kenar)]/20 text-[var(--yazi-soluk)] font-semibold border-b border-[var(--kenar)]">
              <tr>
                <th className="py-3 px-4">Fiş Kodu</th>
                <th className="py-3 px-4">Seviye</th>
                <th className="py-3 px-4">Oyuncu</th>
                <th className="py-3 px-4 text-center">Yıldız Değerlendirmesi</th>
                <th className="py-3 px-4 text-right">Net Kazanç</th>
                <th className="py-3 px-4 text-right">Kasa Bakiyesi</th>
                <th className="py-3 px-4">Tarih</th>
                <th className="py-3 px-4 text-center">Doğrulama</th>
                <th className="py-3 px-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--kenar)]/50">
              {filtrelenmisFisler.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[var(--yazi-soluk)] italic">
                    Arama kriterlerine uygun adisyon fişi bulunamadı.
                  </td>
                </tr>
              ) : (
                filtrelenmisFisler.map((f) => {
                  const formatGecerli = dogrulaFisKodu(f.kod);
                  const oyuncu = oyuncular.find((p) => p.id === f.playerId);

                  return (
                    <tr
                      key={f.id}
                      onClick={() => setSecilenFis(f)}
                      className="hover:bg-[var(--kart-hover)] transition-colors cursor-pointer group"
                    >
                      {/* Kod */}
                      <td className="py-3 px-4 font-mono font-bold text-[var(--yazi)] flex items-center gap-2">
                        <span>{f.kod}</span>
                        <button
                          onClick={(e) => handleKopyala(e, f)}
                          title="Kodu kopyala"
                          className="opacity-0 group-hover:opacity-100 text-[var(--yazi-soluk)] hover:text-[var(--yazi)] transition-opacity cursor-pointer p-0.5"
                        >
                          {kopyalananId === f.id ? (
                            <Check className="w-3.5 h-3.5 text-[var(--basari)]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>

                      {/* Seviye */}
                      <td className="py-3 px-4 font-mono font-semibold text-[var(--renk-ana)]">
                        L{f.bolum}
                      </td>

                      {/* Oyuncu */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-[var(--yazi)]">
                          {oyuncu ? oyuncu.ad : f.playerId}
                        </span>
                      </td>

                      {/* Yıldız */}
                      <td className="py-3 px-4 text-center">
                        <span className="text-[var(--renk-logo)] font-bold tracking-wider">
                          {'★'.repeat(f.yildiz)}
                          <span className="text-[var(--kenar)]">
                            {'☆'.repeat(Math.max(0, 3 - f.yildiz))}
                          </span>
                        </span>
                      </td>

                      {/* Net Coin */}
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-[var(--basari)]">
                        +{f.net} coin
                      </td>

                      {/* Kasa */}
                      <td
                        className="py-3 px-4 text-right font-mono tabular-nums text-[var(--yazi-soluk)]"
                        title={`${formatTamSayi(f.kasa)} coin`}
                      >
                        {formatCompact(f.kasa)}
                      </td>

                      {/* Tarih */}
                      <td className="py-3 px-4 text-[var(--yazi-soluk)] font-mono text-[11px]">
                        {new Date(f.tarih).toLocaleDateString('tr-TR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Doğrulama Durumu */}
                      <td className="py-3 px-4 text-center">
                        {f.supheli ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--vurgu)] bg-[var(--vurgu)]/15 px-2 py-0.5 rounded-full">
                            <ShieldAlert className="w-3 h-3" />
                            <span>ŞÜPHELİ</span>
                          </span>
                        ) : formatGecerli ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--basari)] bg-[var(--basari)]/15 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" />
                            <span>GEÇERLİ</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--vurgu)] bg-[var(--vurgu)]/15 px-2 py-0.5 rounded-full">
                            <ShieldAlert className="w-3 h-3" />
                            <span>BOZUK KOD</span>
                          </span>
                        )}
                      </td>

                      {/* İşlem */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSecilenFis(f);
                          }}
                          className="px-2.5 py-1 text-xs font-medium rounded-md bg-[var(--kenar)]/30 hover:bg-[var(--renk-ana)] hover:text-white transition-colors cursor-pointer text-[var(--yazi)]"
                        >
                          Fişi Gör
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {secilenFis && <FisDetayModal fis={secilenFis} onClose={() => setSecilenFis(null)} />}
    </div>
  );
};
