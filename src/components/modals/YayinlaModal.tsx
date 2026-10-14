import React, { useState } from 'react';
import { useGameAdmin } from '../../context/GameAdminContext';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const YayinlaModal: React.FC<Props> = ({ onClose }) => {
  const { taslagiYayinla, surumler } = useGameAdmin();
  const [yayinNotu, setYayinNotu] = useState<string>('');
  const [yonetici, setYonetici] = useState<string>('Admin (Rauf)');
  const [hata, setHata] = useState<string>('');

  const sonrakiSurumNo = `v1.0.${surumler.length}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yayinNotu.trim() || yayinNotu.trim().length < 5) {
      setHata('Lütfen yayın için en az 5 karakterlik açıklayıcı bir sürüm notu girin.');
      return;
    }
    taslagiYayinla(yayinNotu.trim(), yonetici);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[var(--kart)] border border-[var(--kenar)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-[var(--kenar)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[var(--basari)]" />
            <h3 className="text-base font-bold text-[var(--yazi)]">
              Canlı Dengeyi Yayınla ({sonrakiSurumNo})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--yazi-soluk)] hover:text-[var(--yazi)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300">
            <strong>DİKKAT:</strong> Bu işlem taslaktaki tüm fizik, tolerans, ceza ve seviye
            eğrilerini anında tüm sunuculara ve canlı oyunculara yayacaktır.
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--yazi)] mb-1">
              Yayınlayan Yönetici
            </label>
            <input
              type="text"
              value={yonetici}
              onChange={(e) => setYonetici(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)] text-xs text-[var(--yazi)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--yazi)] mb-1">
              Sürüm Açıklaması / Değişiklik Notu <span className="text-[var(--vurgu)]">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="Örn: Pişme toleransı %15 daraltıldı, VIP hata cezası dengelendi..."
              value={yayinNotu}
              onChange={(e) => setYayinNotu(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[var(--kenar)] bg-[var(--zemin)] text-xs text-[var(--yazi)]"
            />
          </div>

          {hata && <p className="text-xs text-[var(--vurgu)]">{hata}</p>}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--kenar)]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs rounded-lg border border-[var(--kenar)] text-[var(--yazi-soluk)] hover:bg-[var(--kenar)]/20 cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[var(--basari)] text-white hover:opacity-90 cursor-pointer shadow-xs"
            >
              Onayla ve Yayınla ({sonrakiSurumNo})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
