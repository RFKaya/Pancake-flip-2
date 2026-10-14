import React, { useState } from 'react';
import { Fis } from '../../types/game';
import { useGameAdmin } from '../../context/GameAdminContext';
import { dogrulaFisKodu, formatTamSayi } from '../../lib/gameEngine';
import {
  X,
  Receipt,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Layers,
  Coins,
} from 'lucide-react';

interface Props {
  fis: Fis;
  onClose: () => void;
}

export const FisDetayModal: React.FC<Props> = ({ fis, onClose }) => {
  const { fisDogrula, fisSupheliIsaretle, oyuncular } = useGameAdmin();
  const [kopyalandi, setKopyalandi] = useState<boolean>(false);
  const [supheliNedeni, setSupheliNedeni] = useState<string>('');
  const [supheliFormAcik, setSupheliFormAcik] = useState<boolean>(false);

  const formatGecerliMi = dogrulaFisKodu(fis.kod);
  const oyuncu = oyuncular.find((p) => p.id === fis.playerId);

  const handleKopyala = () => {
    navigator.clipboard.writeText(fis.kod);
    setKopyalandi(true);
    setTimeout(() => setKopyalandi(false), 2000);
  };

  const handleSupheliIsaretle = () => {
    if (!supheliNedeni) return;
    fisSupheliIsaretle(fis.id, supheliNedeni);
    setSupheliFormAcik(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[var(--kart)] border border-[var(--kenar)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3 border-b border-[var(--kenar)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[var(--renk-ana)]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--yazi)]">
              Adisyon Fiş Kaydı
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--yazi-soluk)] hover:text-[var(--yazi)] hover:bg-[var(--kenar)]/30 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Realistic Thermal Receipt Slip */}
        <div className="p-6 bg-[#FAF7F2] dark:bg-[#1C140F] text-[#2C1810] dark:text-[#EAE0D5] font-mono text-xs space-y-4 border-b border-dashed border-[var(--kenar)] select-text">
          {/* Slip Header */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-[var(--kenar)]">
            <div className="text-lg font-bold tracking-wider">PANCAKE FLIP! RESTORAN</div>
            <div className="text-[10px] text-[var(--yazi-soluk)]">OTANTİK KREP & TATLI İŞLETMESİ</div>
            <div className="text-[10px] text-[var(--yazi-soluk)]">
              Tarih: {new Date(fis.tarih).toLocaleString('tr-TR')}
            </div>
          </div>

          {/* Slip Code & Verification */}
          <div className="p-2.5 rounded-lg bg-[var(--kenar)]/20 flex items-center justify-between">
            <div>
              <div className="text-[9px] uppercase tracking-wider text-[var(--yazi-soluk)]">
                Resmi Fiş Kodu (Rust / SHA256)
              </div>
              <div className="font-bold text-sm tracking-widest text-[var(--yazi)]">{fis.kod}</div>
            </div>
            <button
              onClick={handleKopyala}
              title="Fiş Kodunu Kopyala"
              className="p-1.5 rounded-md hover:bg-[var(--kenar)]/40 transition-colors cursor-pointer"
            >
              {kopyalandi ? <Check className="w-4 h-4 text-[var(--basari)]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Validation Tag */}
          <div className="flex items-center justify-between text-[11px]">
            <span>Format Doğrulaması:</span>
            {formatGecerliMi ? (
              <span className="text-[var(--basari)] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>GEÇERLİ KRP STANDARDI</span>
              </span>
            ) : (
              <span className="text-[var(--vurgu)] font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>GEÇERSİZ KOD FORMATI</span>
              </span>
            )}
          </div>

          {/* Slip Items & Breakdown */}
          <div className="space-y-1.5 pt-2 border-t border-dashed border-[var(--kenar)]">
            <div className="flex items-center justify-between">
              <span>Seviye (Bölüm):</span>
              <span className="font-bold">L{fis.bolum}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Oyuncu:</span>
              <span className="font-bold">{oyuncu ? oyuncu.ad : fis.playerId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Müşteri Tipi:</span>
              <span className="capitalize">{fis.musteriTipi || 'Standart'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Servis Başarısı:</span>
              <span className="font-bold text-[var(--renk-logo)]">
                {'★'.repeat(fis.yildiz)}
                {'☆'.repeat(Math.max(0, 3 - fis.yildiz))} ({fis.yildiz} Yıldız)
              </span>
            </div>
          </div>

          {/* Economics */}
          <div className="pt-2 border-t border-dashed border-[var(--kenar)] space-y-1 text-sm">
            <div className="flex items-center justify-between font-bold text-[var(--basari)]">
              <span>NET SERVİS KAZANCI:</span>
              <span>+{fis.net} COIN</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--yazi-soluk)]">
              <span>Kasa Toplamı (Anlık):</span>
              <span>{formatTamSayi(fis.kasa)} COIN</span>
            </div>
          </div>

          {/* Barcode Mock */}
          <div className="pt-2 text-center text-[10px] text-[var(--yazi-soluk)]">
            <div className="tracking-[6px] font-bold text-xs py-1">|||| | ||||| || |||||| | |||</div>
            <div>* {fis.kod} *</div>
          </div>
        </div>

        {/* Modal Controls */}
        <div className="p-4 bg-[var(--kart)] space-y-3">
          {fis.supheli ? (
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--vurgu)]/10 text-xs text-[var(--vurgu)] font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Bu fiş şüpheli olarak işaretlenmiş.</span>
              </span>
              <button
                onClick={() => fisDogrula(fis.id)}
                className="px-2.5 py-1 rounded-md bg-[var(--kart)] border border-[var(--kenar)] hover:bg-[var(--kenar)]/20 text-[var(--yazi)] font-semibold cursor-pointer"
              >
                Doğrula (Temizle)
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setSupheliFormAcik(!supheliFormAcik)}
                className="text-xs text-[var(--vurgu)] hover:underline cursor-pointer font-medium"
              >
                Şüpheli Fiş Olarak İşaretle
              </button>

              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[var(--kart)] border border-[var(--kenar)] text-[var(--yazi)] hover:bg-[var(--kenar)]/20 cursor-pointer"
              >
                Kapat
              </button>
            </div>
          )}

          {supheliFormAcik && !fis.supheli && (
            <div className="p-3 rounded-lg border border-[var(--vurgu)]/30 bg-[var(--vurgu)]/5 space-y-2">
              <label className="block text-xs font-medium text-[var(--yazi)]">
                Şüphe Gerekçesi
              </label>
              <input
                type="text"
                placeholder="Örn: Geçersiz hash veya anormal kasa sıçraması"
                value={supheliNedeni}
                onChange={(e) => setSupheliNedeni(e.target.value)}
                className="w-full p-1.5 text-xs rounded-md border border-[var(--kenar)] bg-[var(--zemin)] text-[var(--yazi)]"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSupheliFormAcik(false)}
                  className="px-2.5 py-1 text-xs text-[var(--yazi-soluk)] hover:bg-[var(--kenar)]/20 rounded cursor-pointer"
                >
                  İptal
                </button>
                <button
                  onClick={handleSupheliIsaretle}
                  className="px-3 py-1 text-xs font-semibold rounded bg-[var(--vurgu)] text-white hover:opacity-90 cursor-pointer"
                >
                  İşaretle
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
