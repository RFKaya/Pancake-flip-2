import React, { useState } from 'react';
import { Oyuncu, Fis } from '../../types/game';
import { useGameAdmin } from '../../context/GameAdminContext';
import { formatCompact, formatTamSayi, hesaplaGerekenMusteri } from '../../lib/gameEngine';
import {
  X,
  User,
  ShieldAlert,
  RotateCcw,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Receipt,
  Clock,
  Sparkles,
} from 'lucide-react';

interface Props {
  oyuncu: Oyuncu;
  onClose: () => void;
}

export const OyuncuDuzenleModal: React.FC<Props> = ({ oyuncu, onClose }) => {
  const {
    oyuncuSeviyeAyarla,
    oyuncuIlerlemeSifirla,
    oyuncuDurumDegistir,
    fisler,
    seviyeYapilandirmasi,
  } = useGameAdmin();

  const [yeniSeviye, setYeniSeviye] = useState<number>(oyuncu.ilerleme.seviye);
  const [seviyeGerekcesi, setSeviyeGerekcesi] = useState<string>('');
  const [seviyeHata, setSeviyeHata] = useState<string>('');

  const [sifirlaGerekcesi, setSifirlaGerekcesi] = useState<string>('');
  const [sifirlaOnayModal, setSifirlaOnayModal] = useState<boolean>(false);

  const [engelleGerekcesi, setEngelleGerekcesi] = useState<string>('');
  const [islemBasarili, setIslemBasarili] = useState<string>('');

  const oyuncuFisleri = fisler.filter((f) => f.playerId === oyuncu.id);
  const gerekenMusteri = hesaplaGerekenMusteri(oyuncu.ilerleme.seviye, seviyeYapilandirmasi);

  const handleSeviyeKaydet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seviyeGerekcesi || seviyeGerekcesi.trim().length < 5) {
      setSeviyeHata('Seviye değişikliği için en az 5 karakterlik geçerli bir denetim gerekçesi zorunludur.');
      return;
    }
    const basarili = oyuncuSeviyeAyarla(oyuncu.id, yeniSeviye, seviyeGerekcesi);
    if (basarili) {
      setIslemBasarili(`Seviye başarıyla ${yeniSeviye} olarak güncellendi ve denetim günlüğüne kaydedildi.`);
      setSeviyeHata('');
      setSeviyeGerekcesi('');
    }
  };

  const handleIlerlemeSifirla = () => {
    if (!sifirlaGerekcesi || sifirlaGerekcesi.trim().length < 5) {
      alert('Sıfırlama işlemi için zorunlu gerekçe girilmelidir.');
      return;
    }
    const basarili = oyuncuIlerlemeSifirla(oyuncu.id, sifirlaGerekcesi);
    if (basarili) {
      setIslemBasarili('Oyuncunun tüm ilerlemesi sıfırlandı.');
      setSifirlaOnayModal(false);
      setSifirlaGerekcesi('');
    }
  };

  const handleDurumDegistir = (yeniDurum: 'aktif' | 'engelli' | 'supheli') => {
    const gerekce = engelleGerekcesi || `Yönetici panelinden durum '${yeniDurum}' olarak güncellendi.`;
    oyuncuDurumDegistir(oyuncu.id, yeniDurum, gerekce);
    setIslemBasarili(`Oyuncu durumu '${yeniDurum.toUpperCase()}' yapıldı.`);
    setEngelleGerekcesi('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[var(--kart)] border border-[var(--kenar)] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--kenar)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--renk-ana)]/10 text-[var(--renk-ana)] flex items-center justify-center font-bold text-lg">
              {oyuncu.ad.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[var(--yazi)]">{oyuncu.ad}</h3>
                <span className="font-mono text-xs text-[var(--yazi-soluk)]">{oyuncu.id}</span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    oyuncu.durum === 'aktif'
                      ? 'bg-[var(--basari)]/15 text-[var(--basari)]'
                      : oyuncu.durum === 'engelli'
                      ? 'bg-[var(--vurgu)]/15 text-[var(--vurgu)]'
                      : 'bg-amber-500/15 text-amber-600'
                  }`}
                >
                  {oyuncu.durum.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-[var(--yazi-soluk)]">
                {oyuncu.eposta || 'E-posta tanımlı değil'} · Kayıt:{' '}
                {new Date(oyuncu.kayitTarihi).toLocaleDateString('tr-TR')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--yazi-soluk)] hover:text-[var(--yazi)] hover:bg-[var(--kenar)]/30 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {islemBasarili && (
            <div className="p-3 rounded-lg bg-[var(--basari)]/10 border border-[var(--basari)]/30 text-xs text-[var(--basari)] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{islemBasarili}</span>
            </div>
          )}

          {oyuncu.supheNotu && (
            <div className="p-3 rounded-lg bg-[var(--vurgu)]/10 border border-[var(--vurgu)]/30 text-xs text-[var(--vurgu)] flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Şüphe / Güvenlik Bayrağı:</span> {oyuncu.supheNotu}
              </div>
            </div>
          )}

          {/* Player Progress Stats Card */}
          <div className="p-4 rounded-xl bg-[var(--kenar)]/15 border border-[var(--kenar)]/50 space-y-3">
            <div className="flex items-center justify-between text-xs text-[var(--yazi-soluk)]">
              <span className="font-semibold text-[var(--yazi)]">
                İlerleme Profili (Şema Sürüm {oyuncu.ilerleme.surum})
              </span>
              <span className="font-mono">
                Son Oyun: {new Date(oyuncu.sonOyun).toLocaleTimeString('tr-TR')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-[var(--kart)] p-2.5 rounded-lg border border-[var(--kenar)]/60">
                <div className="text-xs text-[var(--yazi-soluk)]">Mevcut Seviye</div>
                <div className="text-xl font-bold font-mono text-[var(--renk-ana)]">
                  L{oyuncu.ilerleme.seviye}
                </div>
                <div className="text-[10px] text-[var(--yazi-soluk)]">
                  Gereken: {oyuncu.ilerleme.ilerleme}/{gerekenMusteri}
                </div>
              </div>

              <div className="bg-[var(--kart)] p-2.5 rounded-lg border border-[var(--kenar)]/60">
                <div className="text-xs text-[var(--yazi-soluk)]">En Yüksek</div>
                <div className="text-xl font-bold font-mono text-[var(--yazi)]">
                  L{oyuncu.ilerleme.enYuksekSeviye}
                </div>
                <div className="text-[10px] text-[var(--yazi-soluk)]">Kişisel Rekor</div>
              </div>

              <div className="bg-[var(--kart)] p-2.5 rounded-lg border border-[var(--kenar)]/60">
                <div className="text-xs text-[var(--yazi-soluk)]">Toplam Coin</div>
                <div
                  className="text-xl font-bold font-mono text-[var(--yazi)]"
                  title={`${formatTamSayi(oyuncu.ilerleme.toplamCoin)} coin`}
                >
                  {formatCompact(oyuncu.ilerleme.toplamCoin)}
                </div>
                <div className="text-[10px] text-[var(--yazi-soluk)]">Kasa Bakiyesi</div>
              </div>

              <div className="bg-[var(--kart)] p-2.5 rounded-lg border border-[var(--kenar)]/60">
                <div className="text-xs text-[var(--yazi-soluk)]">En İyi Seri / Perfect</div>
                <div className="text-xl font-bold font-mono text-[var(--basari)]">
                  {oyuncu.ilerleme.enIyiSeri} / {formatCompact(oyuncu.ilerleme.toplamMukemmel)}
                </div>
                <div className="text-[10px] text-[var(--yazi-soluk)]">Kusursuz Servis</div>
              </div>
            </div>
          </div>

          {/* Level Edit Form (With Required Reason Rule) */}
          <div className="p-4 rounded-xl border border-[var(--kenar)] bg-[var(--kart)] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--yazi)]">
              <Sliders className="w-4 h-4 text-[var(--renk-ana)]" />
              <span>Yönetici Seviye Ayarı (Zorunlu Denetim Kaydı)</span>
            </div>
            <p className="text-xs text-[var(--yazi-soluk)]">
              Bir oyuncunun seviyesini elle değiştirmek tüm ilerleme eğrisini etkiler ve zorunlu denetim
              gerekçesiyle sisteme kaydedilir.
            </p>

            <form onSubmit={handleSeviyeKaydet} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--yazi)] mb-1">
                    Yeni Seviye
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000000000"
                    value={yeniSeviye}
                    onChange={(e) => setYeniSeviye(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)] text-xs font-mono text-[var(--yazi)]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[var(--yazi)] mb-1">
                    Zorunlu Gerekçe / Sebebi <span className="text-[var(--vurgu)]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Hileli seviye sıfırlaması veya destek talebi incelemesi"
                    value={seviyeGerekcesi}
                    onChange={(e) => setSeviyeGerekcesi(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)] text-xs text-[var(--yazi)] placeholder:text-[var(--yazi-soluk)]/50"
                  />
                </div>
              </div>

              {seviyeHata && <p className="text-xs text-[var(--vurgu)]">{seviyeHata}</p>}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[var(--renk-ana)] text-[var(--renk-ana-yazi)] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Seviyeyi Kaydet & Denetime Yaz
                </button>
              </div>
            </form>
          </div>

          {/* Action Danger / Control Zone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Account Status Control */}
            <div className="p-4 rounded-xl border border-[var(--kenar)] bg-[var(--kart)] space-y-2">
              <div className="text-xs font-bold text-[var(--yazi)]">Hesap Durumu</div>
              <input
                type="text"
                placeholder="Durum değişikliği nedeni (isteğe bağlı)"
                value={engelleGerekcesi}
                onChange={(e) => setEngelleGerekcesi(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)] text-xs text-[var(--yazi)]"
              />
              <div className="flex items-center gap-2 pt-1">
                {oyuncu.durum !== 'aktif' && (
                  <button
                    onClick={() => handleDurumDegistir('aktif')}
                    className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-[var(--basari)]/15 text-[var(--basari)] hover:bg-[var(--basari)]/25 cursor-pointer"
                  >
                    Aktif Yap
                  </button>
                )}
                {oyuncu.durum !== 'engelli' && (
                  <button
                    onClick={() => handleDurumDegistir('engelli')}
                    className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-[var(--vurgu)]/15 text-[var(--vurgu)] hover:bg-[var(--vurgu)]/25 cursor-pointer"
                  >
                    Oyuncuyu Engelle
                  </button>
                )}
                {oyuncu.durum !== 'supheli' && (
                  <button
                    onClick={() => handleDurumDegistir('supheli')}
                    className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 cursor-pointer"
                  >
                    Şüpheli İşaretle
                  </button>
                )}
              </div>
            </div>

            {/* Reset Progression */}
            <div className="p-4 rounded-xl border border-[var(--kenar)] bg-[var(--kart)] space-y-2 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-[var(--vurgu)] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>İlerlemeyi Sıfırla (Yıkıcı Eylem)</span>
                </div>
                <p className="text-xs text-[var(--yazi-soluk)] mt-1">
                  Oyuncunun seviyesi 1'e, coinleri ve servisleri 0'a çekilir.
                </p>
              </div>

              <button
                onClick={() => setSifirlaOnayModal(true)}
                className="w-full py-1.5 text-xs font-semibold rounded-lg bg-[var(--vurgu)] text-white hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>İlerlemeyi Sıfırla...</span>
              </button>
            </div>
          </div>

          {/* Player Receipts Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[var(--yazi)] flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-[var(--yazi-soluk)]" />
                <span>Oyuncunun Kayıtlı Fişleri ({oyuncuFisleri.length})</span>
              </span>
            </div>

            {oyuncuFisleri.length === 0 ? (
              <p className="text-xs text-[var(--yazi-soluk)] italic">Henüz kesilmiş fiş kaydı yok.</p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {oyuncuFisleri.map((f) => (
                  <div
                    key={f.id}
                    className="p-2.5 rounded-lg bg-[var(--kenar)]/20 border border-[var(--kenar)]/40 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-[var(--yazi)]">{f.kod}</span>
                      <span className="text-[var(--yazi-soluk)]">L{f.bolum}</span>
                      <span className="text-[var(--renk-logo)] font-bold">
                        {'★'.repeat(f.yildiz)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[var(--basari)] font-medium">+{f.net} coin</span>
                      <span className="text-[var(--yazi-soluk)] text-[10px]">
                        {new Date(f.tarih).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[var(--kenar)] bg-[var(--kenar)]/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--kart)] border border-[var(--kenar)] text-[var(--yazi)] hover:bg-[var(--kenar)]/20 cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>

      {/* Confirmation Sub-Modal for Progression Reset */}
      {sifirlaOnayModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[var(--kart)] border border-[var(--kenar)] rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-[var(--vurgu)] font-bold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>DİKKAT: İlerlemeyi Sıfırla</span>
            </div>
            <p className="text-xs text-[var(--yazi)] leading-relaxed">
              Bu işlem <strong>{oyuncu.ad}</strong> isimli oyuncunun tüm seviye, coin ve servis
              verisini kalıcı olarak sıfırlayacaktır. Bu işlem geri alınamaz.
            </p>

            <div>
              <label className="block text-xs font-medium text-[var(--yazi)] mb-1">
                Zorunlu Sıfırlama Gerekçesi <span className="text-[var(--vurgu)]">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="Örn: Kullanıcı isteği ile hesap sıfırlama veya test amaçlı reset"
                value={sifirlaGerekcesi}
                onChange={(e) => setSifirlaGerekcesi(e.target.value)}
                className="w-full p-2 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)] text-xs text-[var(--yazi)]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSifirlaOnayModal(false)}
                className="px-3 py-1.5 text-xs rounded-lg border border-[var(--kenar)] text-[var(--yazi-soluk)] hover:bg-[var(--kenar)]/20 cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                onClick={handleIlerlemeSifirla}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[var(--vurgu)] text-white hover:opacity-90 cursor-pointer"
              >
                Onayla ve Sıfırla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
