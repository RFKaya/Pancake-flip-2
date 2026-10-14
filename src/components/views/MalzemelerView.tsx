import React, { useState } from 'react';
import { useGameAdmin } from '../../context/GameAdminContext';
import { Malzeme, MalzemeKategori } from '../../types/game';
import { MalzemeDuzenleModal } from '../modals/MalzemeDuzenleModal';
import {
  UtensilsCrossed,
  Plus,
  AlertCircle,
  CheckCircle,
  Tag,
  Sparkles,
  Edit2,
  Trash2,
} from 'lucide-react';

export const MalzemelerView: React.FC = () => {
  const { malzemeler, silMalzeme } = useGameAdmin();

  const [kategoriFiltresi, setKategoriFiltresi] = useState<string>('all');
  const [duzenlenecekMalzeme, setDuzenlenecekMalzeme] = useState<Malzeme | null | undefined>(
    undefined // undefined = modal closed, null = add new, Malzeme = edit
  );

  // Filter
  const filtrelenmisMalzemeler = malzemeler
    .filter((m) => (kategoriFiltresi === 'all' ? true : m.kategori === kategoriFiltresi))
    .sort((a, b) => a.acilis - b.acilis);

  // Check for any unprofitable materials
  const zararEdenler = malzemeler.filter((m) => m.maliyet >= m.deger);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--kenar)]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--yazi)]">
            Krep Malzemeleri Kataloğu (`malzemeler.json`)
          </h1>
          <p className="text-xs text-[var(--yazi-soluk)] mt-0.5">
            Sipariş parçaları, maliyet, fiyatlandırma, çocuk tatlı şartı ve açılış seviyeleri
          </p>
        </div>

        <button
          onClick={() => setDuzenlenecekMalzeme(null)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--renk-ana)] text-[var(--renk-ana-yazi)] hover:opacity-95 transition-opacity cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Malzeme Ekle</span>
        </button>
      </div>

      {/* Global Warnings Banner if any item is unprofitable */}
      {zararEdenler.length > 0 && (
        <div className="p-3.5 rounded-xl bg-[var(--vurgu)]/10 border border-[var(--vurgu)]/30 text-xs text-[var(--vurgu)] flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">KRİTİK KÂR UYARISI:</span> {zararEdenler.length} malzemenin (
            {zararEdenler.map((z) => z.ad).join(', ')}) maliyeti değerine eşit veya büyük! Lütfen
            fiyatlandırmayı düzenleyiniz.
          </div>
        </div>
      )}

      {/* Filters & Tabs */}
      <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-[var(--kart)] border border-[var(--kenar)]">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[var(--yazi-soluk)] font-medium mr-2">Kategori:</span>
          {['all', 'krep', 'dolgu', 'sos', 'topping'].map((kat) => (
            <button
              key={kat}
              onClick={() => setKategoriFiltresi(kat)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap capitalize ${
                kategoriFiltresi === kat
                  ? 'bg-[var(--renk-ana)] text-white shadow-xs font-semibold'
                  : 'text-[var(--yazi-soluk)] hover:bg-[var(--kenar)]/30 hover:text-[var(--yazi)]'
              }`}
            >
              {kat === 'all' ? 'Tüm Malzemeler' : kat}
            </button>
          ))}
        </div>

        <span className="text-xs text-[var(--yazi-soluk)] font-mono shrink-0">
          {filtrelenmisMalzemeler.length} Malzeme Listelendi
        </span>
      </div>

      {/* Material Grid / Table */}
      <div className="bg-[var(--kart)] rounded-xl border border-[var(--kenar)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--kenar)]/20 text-[var(--yazi-soluk)] font-semibold border-b border-[var(--kenar)]">
              <tr>
                <th className="py-3 px-4">Malzeme</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-center">Açılış Seviyesi</th>
                <th className="py-3 px-4 text-right">Maliyet (Düşen)</th>
                <th className="py-3 px-4 text-right">Değer (Fiyat)</th>
                <th className="py-3 px-4 text-right">Net Kâr / Marj</th>
                <th className="py-3 px-4 text-center">Tatlı Tercihi</th>
                <th className="py-3 px-4">Renk Tokenı</th>
                <th className="py-3 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--kenar)]/50">
              {filtrelenmisMalzemeler.map((m) => {
                const kar = m.deger - m.maliyet;
                const zarardaMi = m.maliyet >= m.deger;

                return (
                  <tr
                    key={m.id}
                    className="hover:bg-[var(--kart-hover)] transition-colors group"
                  >
                    {/* Malzeme Adı & İkon */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-1 bg-[var(--kenar)]/20 rounded-lg shrink-0">
                          {m.ikon}
                        </span>
                        <div>
                          <div className="font-semibold text-[var(--yazi)] text-sm">{m.ad}</div>
                          <div className="text-[10px] text-[var(--yazi-soluk)] font-mono">{m.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-[var(--kenar)]/30 text-[var(--yazi)] font-medium text-[11px] capitalize">
                        {m.kategori}
                      </span>
                    </td>

                    {/* Açılış Seviyesi */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-[var(--renk-ana)]">
                      L{m.acilis}
                    </td>

                    {/* Maliyet */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-[var(--yazi-soluk)]">
                      -{m.maliyet} coin
                    </td>

                    {/* Değer */}
                    <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-[var(--yazi)]">
                      +{m.deger} coin
                    </td>

                    {/* Net Kâr */}
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                      {zarardaMi ? (
                        <span className="text-[var(--vurgu)] flex items-center justify-end gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{kar} coin (Zarar!)</span>
                        </span>
                      ) : (
                        <span className="text-[var(--basari)]">+{kar} coin</span>
                      )}
                    </td>

                    {/* Tatlı Mı? */}
                    <td className="py-3 px-4 text-center">
                      {m.tatli ? (
                        <span className="text-[11px] font-semibold text-[var(--renk-ana)] bg-[var(--renk-ana)]/10 px-2 py-0.5 rounded-full">
                          🍬 Tatlı
                        </span>
                      ) : (
                        <span className="text-[11px] text-[var(--yazi-soluk)]">Tuzlu / Sade</span>
                      )}
                    </td>

                    {/* Renk Tokenı */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--yazi-soluk)]">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: `var(${m.renkDegiskeni})` }}
                        />
                        <span className="truncate max-w-[100px]">{m.renkDegiskeni}</span>
                      </div>
                    </td>

                    {/* Eylemler */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDuzenlenecekMalzeme(m)}
                          title="Malzemeyi Düzenle"
                          className="p-1.5 rounded-md hover:bg-[var(--kenar)]/30 text-[var(--yazi)] transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {m.id !== 'krep' && (
                          <button
                            onClick={() => {
                              if (confirm(`'${m.ad}' menüden silinsin mi?`)) {
                                silMalzeme(m.id);
                              }
                            }}
                            title="Malzemeyi Sil"
                            className="p-1.5 rounded-md hover:bg-[var(--vurgu)]/15 text-[var(--vurgu)] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {duzenlenecekMalzeme !== undefined && (
        <MalzemeDuzenleModal
          malzeme={duzenlenecekMalzeme}
          onClose={() => setDuzenlenecekMalzeme(undefined)}
        />
      )}
    </div>
  );
};
