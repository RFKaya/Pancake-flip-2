import React, { useState } from 'react';
import { useGameAdmin } from '../../context/GameAdminContext';
import { Oyuncu } from '../../types/game';
import { formatCompact, formatTamSayi } from '../../lib/gameEngine';
import { OyuncuDuzenleModal } from '../modals/OyuncuDuzenleModal';
import {
  Search,
  Filter,
  User,
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert,
  Flame,
  Award,
} from 'lucide-react';

export const OyuncularView: React.FC = () => {
  const { oyuncular } = useGameAdmin();

  const [arama, setArama] = useState<string>('');
  const [durumFiltresi, setDurumFiltresi] = useState<string>('all');
  const [seviyeFiltresi, setSeviyeFiltresi] = useState<string>('all');
  const [secilenOyuncu, setSecilenOyuncu] = useState<Oyuncu | null>(null);

  // Filter logic
  const filtrelenmisOyuncular = oyuncular.filter((p) => {
    // Search
    const searchMatch =
      p.ad.toLowerCase().includes(arama.toLowerCase()) ||
      p.id.toLowerCase().includes(arama.toLowerCase()) ||
      (p.eposta && p.eposta.toLowerCase().includes(arama.toLowerCase()));
    if (!searchMatch) return false;

    // Status filter
    if (durumFiltresi !== 'all' && p.durum !== durumFiltresi) return false;

    // Level bracket filter
    if (seviyeFiltresi === '1-10' && (p.ilerleme.seviye < 1 || p.ilerleme.seviye > 10)) return false;
    if (seviyeFiltresi === '11-50' && (p.ilerleme.seviye < 11 || p.ilerleme.seviye > 50)) return false;
    if (seviyeFiltresi === '51-100' && (p.ilerleme.seviye < 51 || p.ilerleme.seviye > 100)) return false;
    if (seviyeFiltresi === '100+' && p.ilerleme.seviye <= 100) return false;

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--kenar)]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--yazi)]">
            Oyuncu Yönetimi & İlerleme
          </h1>
          <p className="text-xs text-[var(--yazi-soluk)] mt-0.5">
            Merkezi oyuncu profilleri, seviye ayarı, şüphe denetimi ve fiş kayıtları
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--yazi-soluk)]">
            Toplam: <strong className="text-[var(--yazi)] font-mono">{oyuncular.length}</strong> oyuncu
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[var(--kart)] border border-[var(--kenar)] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[var(--yazi-soluk)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Oyuncu adı, ID veya e-posta ara..."
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)] text-xs text-[var(--yazi)] placeholder:text-[var(--yazi-soluk)]/60 focus:outline-hidden"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--yazi-soluk)]">
            <span>Durum:</span>
            <select
              value={durumFiltresi}
              onChange={(e) => setDurumFiltresi(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)] text-xs text-[var(--yazi)] font-medium cursor-pointer"
            >
              <option value="all">Tümü</option>
              <option value="aktif">Aktif</option>
              <option value="supheli">Şüpheli</option>
              <option value="engelli">Engelli</option>
            </select>
          </div>

          {/* Level Bracket Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--yazi-soluk)]">
            <span>Seviye Aralığı:</span>
            <select
              value={seviyeFiltresi}
              onChange={(e) => setSeviyeFiltresi(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)] text-xs text-[var(--yazi)] font-medium cursor-pointer"
            >
              <option value="all">Tüm Seviyeler</option>
              <option value="1-10">L1 - L10</option>
              <option value="11-50">L11 - L50</option>
              <option value="51-100">L51 - L100</option>
              <option value="100+">L100+</option>
            </select>
          </div>
        </div>
      </div>

      {/* Players Data Table */}
      <div className="bg-[var(--kart)] rounded-xl border border-[var(--kenar)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--kenar)]/20 text-[var(--yazi-soluk)] font-semibold border-b border-[var(--kenar)]">
              <tr>
                <th className="py-3 px-4">Oyuncu</th>
                <th className="py-3 px-4">Seviye</th>
                <th className="py-3 px-4">En Yüksek</th>
                <th className="py-3 px-4 text-right">Toplam Servis</th>
                <th className="py-3 px-4 text-right">Kasa (Coin)</th>
                <th className="py-3 px-4 text-center">En İyi Seri</th>
                <th className="py-3 px-4">Son Oyun</th>
                <th className="py-3 px-4 text-center">Durum</th>
                <th className="py-3 px-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--kenar)]/50">
              {filtrelenmisOyuncular.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[var(--yazi-soluk)] italic">
                    Arama kriterlerine uygun oyuncu bulunamadı.
                  </td>
                </tr>
              ) : (
                filtrelenmisOyuncular.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSecilenOyuncu(p)}
                    className="hover:bg-[var(--kart-hover)] transition-colors cursor-pointer group"
                  >
                    {/* Oyuncu Adı & ID */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[var(--kenar)]/40 flex items-center justify-center font-bold text-xs text-[var(--renk-ana)] shrink-0">
                          {p.ad.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-[var(--yazi)] flex items-center gap-1.5 truncate">
                            <span>{p.ad}</span>
                            {p.durum === 'supheli' && (
                              <ShieldAlert className="w-3.5 h-3.5 text-[var(--vurgu)] shrink-0" />
                            )}
                          </div>
                          <div className="text-[10px] text-[var(--yazi-soluk)] font-mono truncate">
                            {p.id} {p.eposta ? `· ${p.eposta}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Seviye */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-[var(--renk-ana)] text-sm">
                        L{p.ilerleme.seviye}
                      </span>
                    </td>

                    {/* En Yüksek */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-[var(--yazi-soluk)]">
                        L{p.ilerleme.enYuksekSeviye}
                      </span>
                    </td>

                    {/* Toplam Müşteri */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      <span title={`${formatTamSayi(p.ilerleme.toplamMusteri)} müşteri`}>
                        {formatCompact(p.ilerleme.toplamMusteri)}
                      </span>
                    </td>

                    {/* Kasa Coin (With Tooltip) */}
                    <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-[var(--yazi)]">
                      <span title={`${formatTamSayi(p.ilerleme.toplamCoin)} coin`}>
                        {formatCompact(p.ilerleme.toplamCoin)}
                      </span>
                    </td>

                    {/* Seri */}
                    <td className="py-3 px-4 text-center font-mono">
                      <span className="inline-flex items-center gap-1 text-[var(--basari)] font-medium">
                        <Flame className="w-3 h-3" />
                        <span>{p.ilerleme.enIyiSeri}</span>
                      </span>
                    </td>

                    {/* Son Oyun */}
                    <td className="py-3 px-4 text-[var(--yazi-soluk)] font-mono text-[11px]">
                      {new Date(p.sonOyun).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Durum */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          p.durum === 'aktif'
                            ? 'bg-[var(--basari)]/15 text-[var(--basari)]'
                            : p.durum === 'engelli'
                            ? 'bg-[var(--vurgu)]/15 text-[var(--vurgu)]'
                            : 'bg-amber-500/15 text-amber-600'
                        }`}
                      >
                        {p.durum.toUpperCase()}
                      </span>
                    </td>

                    {/* İşlem */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSecilenOyuncu(p);
                        }}
                        className="px-2.5 py-1 text-xs font-medium rounded-md bg-[var(--kenar)]/30 hover:bg-[var(--renk-ana)] hover:text-white transition-colors cursor-pointer text-[var(--yazi)]"
                      >
                        Yönet
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {secilenOyuncu && (
        <OyuncuDuzenleModal
          oyuncu={secilenOyuncu}
          onClose={() => setSecilenOyuncu(null)}
        />
      )}
    </div>
  );
};
