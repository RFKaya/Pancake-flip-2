import React, { useState } from 'react';
import { useGameAdmin } from '../../context/GameAdminContext';
import { ClipboardList, Filter, Search, User, Shield } from 'lucide-react';

export const DenetimGunluguView: React.FC = () => {
  const { denetimGunlugu } = useGameAdmin();
  const [arama, setArama] = useState<string>('');
  const [hedefTurFiltresi, setHedefTurFiltresi] = useState<string>('all');

  const filtrelenmisKayitlar = denetimGunlugu.filter((k) => {
    const searchMatch =
      k.islem.toLowerCase().includes(arama.toLowerCase()) ||
      k.hedefId.toLowerCase().includes(arama.toLowerCase()) ||
      k.gerekce.toLowerCase().includes(arama.toLowerCase()) ||
      k.yonetici.toLowerCase().includes(arama.toLowerCase());
    if (!searchMatch) return false;

    if (hedefTurFiltresi !== 'all' && k.hedefTur !== hedefTurFiltresi) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--kenar)]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--yazi)]">
            Yönetici Denetim Günlüğü (Audit Log)
          </h1>
          <p className="text-xs text-[var(--yazi-soluk)] mt-0.5">
            Tüm manuel seviye değişiklikleri, yayınlanan sürümler, silinen/eklenen malzemeler ve gerekçeleri
          </p>
        </div>

        <span className="text-xs text-[var(--yazi-soluk)] font-mono">
          Toplam <strong>{denetimGunlugu.length}</strong> Denetim Kaydı
        </span>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-[var(--kart)] border border-[var(--kenar)] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[var(--yazi-soluk)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="İşlem, gerekçe veya hedef ara..."
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)] text-xs text-[var(--yazi)] placeholder:text-[var(--yazi-soluk)]/60 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--yazi-soluk)] w-full sm:w-auto">
          <span>Hedef Türü:</span>
          <select
            value={hedefTurFiltresi}
            onChange={(e) => setHedefTurFiltresi(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)] text-xs text-[var(--yazi)] font-medium cursor-pointer"
          >
            <option value="all">Tüm İşlemler</option>
            <option value="oyuncu">Oyuncu Yönetimi</option>
            <option value="denge">Denge & Seviye</option>
            <option value="malzeme">Malzeme Değişikliği</option>
            <option value="surum">Sürüm Yayını / Rollback</option>
            <option value="fis">Fiş Doğrulama</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--kart)] rounded-xl border border-[var(--kenar)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--kenar)]/20 text-[var(--yazi-soluk)] font-semibold border-b border-[var(--kenar)]">
              <tr>
                <th className="py-3 px-4">Tarih</th>
                <th className="py-3 px-4">Yönetici</th>
                <th className="py-3 px-4">İşlem</th>
                <th className="py-3 px-4">Hedef Türü / ID</th>
                <th className="py-3 px-4">Zorunlu Gerekçe / Sebebi</th>
                <th className="py-3 px-4 text-right">Değer Değişimi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--kenar)]/50">
              {filtrelenmisKayitlar.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--yazi-soluk)] italic">
                    Denetim kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                filtrelenmisKayitlar.map((k) => (
                  <tr key={k.id} className="hover:bg-[var(--kart-hover)]">
                    <td className="py-3 px-4 text-[var(--yazi-soluk)] font-mono text-[11px] whitespace-nowrap">
                      {new Date(k.tarih).toLocaleString('tr-TR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[var(--yazi)] whitespace-nowrap">
                      {k.yonetici}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[var(--renk-ana)]">{k.islem}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded bg-[var(--kenar)]/30 mr-1 text-[var(--yazi-soluk)]">
                        {k.hedefTur}
                      </span>
                      <span className="text-[var(--yazi)] font-bold">{k.hedefId}</span>
                    </td>
                    <td className="py-3 px-4 text-[var(--yazi)] font-medium max-w-xs truncate">
                      {k.gerekce}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[11px]">
                      {k.oncekiDeger || k.yeniDeger ? (
                        <span className="text-[var(--yazi-soluk)]">
                          {k.oncekiDeger} →{' '}
                          <strong className="text-[var(--basari)]">{k.yeniDeger}</strong>
                        </span>
                      ) : (
                        <span className="text-[var(--yazi-soluk)]">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
