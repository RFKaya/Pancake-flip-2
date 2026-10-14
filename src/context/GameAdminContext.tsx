import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Malzeme,
  MusteriTipi,
  SeviyeYapilandirmasi,
  OyunAyarlari,
  Oyuncu,
  Fis,
  SupheliKayit,
  DenetimKaydi,
  IcerikSurum,
} from '../types/game';
import {
  VARSAYILAN_MALZEMELER,
  VARSAYILAN_MUSTERILER,
  VARSAYILAN_SEVIYE_YAPILANDIRMASI,
  VARSAYILAN_AYARLAR,
  MOCK_OYUNCULAR,
  MOCK_FISLER,
  MOCK_SUPHELI_KAYITLAR,
  MOCK_DENETIM_GUNLUGU,
  MOCK_SURUMLER,
} from '../data/defaultData';

export type SekmeTipi =
  | 'ozet'
  | 'oyuncular'
  | 'fisler'
  | 'malzemeler'
  | 'musteriler'
  | 'egri'
  | 'denge'
  | 'simulator'
  | 'kilometre-taslari'
  | 'surumler'
  | 'supheli'
  | 'denetim';

interface GameAdminContextType {
  tema: 'gunduz' | 'gece';
  setTema: (tema: 'gunduz' | 'gece') => void;
  toggleTema: () => void;
  aktifSekme: SekmeTipi;
  setAktifSekme: (sekme: SekmeTipi) => void;

  // Data
  malzemeler: Malzeme[];
  musteriTipleri: MusteriTipi[];
  seviyeYapilandirmasi: SeviyeYapilandirmasi;
  ayarlar: OyunAyarlari;

  // Draft & Version state
  taslakAyarlar: OyunAyarlari;
  taslakSeviye: SeviyeYapilandirmasi;
  degisiklikVarMi: boolean;
  taslagiGuncelle: (yeniAyarlar?: Partial<OyunAyarlari>, yeniSeviye?: Partial<SeviyeYapilandirmasi>) => void;
  taslagiYayinla: (not: string, yonetici?: string) => void;
  taslagiSifirla: () => void;

  // Operations
  guncelleMalzeme: (m: Malzeme) => void;
  ekleMalzeme: (m: Malzeme) => void;
  silMalzeme: (id: string) => void;

  guncelleMusteriTipi: (c: MusteriTipi) => void;
  ekleMusteriTipi: (c: MusteriTipi) => void;

  guncelleSeviyeNoktasi: (index: number, seviye: number, musteri: number) => void;
  ekleSeviyeNoktasi: (seviye: number, musteri: number) => void;
  silSeviyeNoktasi: (index: number) => void;

  // Players
  oyuncular: Oyuncu[];
  oyuncuSeviyeAyarla: (oyuncuId: string, yeniSeviye: number, gerekce: string, yonetici?: string) => boolean;
  oyuncuIlerlemeSifirla: (oyuncuId: string, gerekce: string, yonetici?: string) => boolean;
  oyuncuDurumDegistir: (oyuncuId: string, durum: 'aktif' | 'engelli' | 'supheli', gerekce: string, yonetici?: string) => void;

  // Receipts
  fisler: Fis[];
  fisSupheliIsaretle: (fisId: string, neden: string) => void;
  fisDogrula: (fisId: string) => void;

  // Anti-Cheat & Suspicious
  supheliKayitlar: SupheliKayit[];
  supheliKayitCoz: (kayitId: string, aksiyon: 'temizle' | 'engelle' | 'seviye_dusur', gerekce: string) => void;

  // Audit Logs
  denetimGunlugu: DenetimKaydi[];
  ekleDenetimKaydi: (islem: string, hedefTur: DenetimKaydi['hedefTur'], hedefId: string, gerekce: string, onceki?: string, yeni?: string) => void;

  // Versions
  surumler: IcerikSurum[];
  surumeDon: (surumId: string, yonetici?: string) => void;
}

const GameAdminContext = createContext<GameAdminContextType | undefined>(undefined);

export const GameAdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tema, setTemaState] = useState<'gunduz' | 'gece'>('gunduz');
  const [aktifSekme, setAktifSekme] = useState<SekmeTipi>('ozet');

  const [malzemeler, setMalzemeler] = useState<Malzeme[]>(VARSAYILAN_MALZEMELER);
  const [musteriTipleri, setMusteriTipleri] = useState<MusteriTipi[]>(VARSAYILAN_MUSTERILER);
  const [seviyeYapilandirmasi, setSeviyeYapilandirmasi] = useState<SeviyeYapilandirmasi>(VARSAYILAN_SEVIYE_YAPILANDIRMASI);
  const [ayarlar, setAyarlar] = useState<OyunAyarlari>(VARSAYILAN_AYARLAR);

  // Drafts
  const [taslakAyarlar, setTaslakAyarlar] = useState<OyunAyarlari>(VARSAYILAN_AYARLAR);
  const [taslakSeviye, setTaslakSeviye] = useState<SeviyeYapilandirmasi>(VARSAYILAN_SEVIYE_YAPILANDIRMASI);
  const [degisiklikVarMi, setDegisiklikVarMi] = useState<boolean>(false);

  // Mock collections
  const [oyuncular, setOyuncular] = useState<Oyuncu[]>(MOCK_OYUNCULAR);
  const [fisler, setFisler] = useState<Fis[]>(MOCK_FISLER);
  const [supheliKayitlar, setSupheliKayitlar] = useState<SupheliKayit[]>(MOCK_SUPHELI_KAYITLAR);
  const [denetimGunlugu, setDenetimGunlugu] = useState<DenetimKaydi[]>(MOCK_DENETIM_GUNLUGU);
  const [surumler, setSurumler] = useState<IcerikSurum[]>(MOCK_SURUMLER);

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-tema', tema);
    if (tema === 'gece') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [tema]);

  const toggleTema = () => {
    setTemaState((prev) => (prev === 'gunduz' ? 'gece' : 'gunduz'));
  };

  const ekleDenetimKaydi = (
    islem: string,
    hedefTur: DenetimKaydi['hedefTur'],
    hedefId: string,
    gerekce: string,
    onceki?: string,
    yeni?: string
  ) => {
    const yeniKayit: DenetimKaydi = {
      id: `aud_${Date.now()}`,
      yonetici: 'Admin (Rauf)',
      islem,
      hedefTur,
      hedefId,
      gerekce,
      tarih: new Date().toISOString(),
      oncekiDeger: onceki,
      yeniDeger: yeni,
    };
    setDenetimGunlugu((prev) => [yeniKayit, ...prev]);
  };

  // Draft handling
  const taslagiGuncelle = (yeniAyarlar?: Partial<OyunAyarlari>, yeniSeviye?: Partial<SeviyeYapilandirmasi>) => {
    if (yeniAyarlar) {
      setTaslakAyarlar((prev) => ({ ...prev, ...yeniAyarlar }));
    }
    if (yeniSeviye) {
      setTaslakSeviye((prev) => ({ ...prev, ...yeniSeviye }));
    }
    setDegisiklikVarMi(true);
  };

  const taslagiSifirla = () => {
    setTaslakAyarlar(ayarlar);
    setTaslakSeviye(seviyeYapilandirmasi);
    setDegisiklikVarMi(false);
  };

  const taslagiYayinla = (not: string, yonetici: string = 'Admin (Rauf)') => {
    setAyarlar(taslakAyarlar);
    setSeviyeYapilandirmasi(taslakSeviye);
    setDegisiklikVarMi(false);

    const yeniSurumNo = `v1.0.${surumler.length}`;
    const yeniSurum: IcerikSurum = {
      id: `ver_${Date.now()}`,
      surum: yeniSurumNo,
      yayinTarihi: new Date().toISOString(),
      yayinlayan: yonetici,
      not: not || 'Denge ve fizik ayarları güncellendi.',
      durum: 'yayinlandi',
      veri: {
        malzemeler,
        musteriTipleri,
        seviye: taslakSeviye,
        ayarlar: taslakAyarlar,
      },
    };

    setSurumler((prev) => [
      yeniSurum,
      ...prev.map((s) => (s.durum === 'yayinlandi' ? { ...s, durum: 'arsiv' as const } : s)),
    ]);

    ekleDenetimKaydi(
      'Sürüm Yayını',
      'surum',
      yeniSurumNo,
      `Canlıya alındı: ${not}`,
      'Önceki sürüm',
      yeniSurumNo
    );
  };

  const surumeDon = (surumId: string, yonetici: string = 'Admin (Rauf)') => {
    const hedef = surumler.find((s) => s.id === surumId);
    if (!hedef) return;

    setMalzemeler(hedef.veri.malzemeler);
    setMusteriTipleri(hedef.veri.musteriTipleri);
    setSeviyeYapilandirmasi(hedef.veri.seviye);
    setAyarlar(hedef.veri.ayarlar);
    setTaslakAyarlar(hedef.veri.ayarlar);
    setTaslakSeviye(hedef.veri.seviye);
    setDegisiklikVarMi(false);

    setSurumler((prev) =>
      prev.map((s) => ({
        ...s,
        durum: s.id === surumId ? ('yayinlandi' as const) : ('arsiv' as const),
      }))
    );

    ekleDenetimKaydi(
      'Sürüme Geri Dönüş (Rollback)',
      'surum',
      hedef.surum,
      `${hedef.surum} sürümüne geri dönüldü.`
    );
  };

  // Malzeme operations
  const guncelleMalzeme = (m: Malzeme) => {
    setMalzemeler((prev) => prev.map((item) => (item.id === m.id ? m : item)));
    ekleDenetimKaydi('Malzeme Güncelleme', 'malzeme', m.id, `${m.ad} parametreleri güncellendi.`);
  };

  const ekleMalzeme = (m: Malzeme) => {
    setMalzemeler((prev) => [...prev, m]);
    ekleDenetimKaydi('Yeni Malzeme Eklendi', 'malzeme', m.id, `${m.ad} menüye eklendi.`);
  };

  const silMalzeme = (id: string) => {
    const m = malzemeler.find((item) => item.id === id);
    setMalzemeler((prev) => prev.filter((item) => item.id !== id));
    ekleDenetimKaydi('Malzeme Silindi', 'malzeme', id, `${m?.ad || id} menüden kaldırıldı.`);
  };

  // Customer type operations
  const guncelleMusteriTipi = (c: MusteriTipi) => {
    setMusteriTipleri((prev) => prev.map((item) => (item.id === c.id ? c : item)));
    ekleDenetimKaydi('Müşteri Tipi Güncellendi', 'denge', c.id, `${c.ad} çarpanları değiştirildi.`);
  };

  const ekleMusteriTipi = (c: MusteriTipi) => {
    setMusteriTipleri((prev) => [...prev, c]);
    ekleDenetimKaydi('Yeni Müşteri Tipi Eklendi', 'denge', c.id, `${c.ad} eklendi.`);
  };

  // Level curve checkpoints
  const guncelleSeviyeNoktasi = (index: number, seviye: number, musteri: number) => {
    const noktalar = [...seviyeYapilandirmasi.gerekenMusteriNoktalari];
    noktalar[index] = { seviye, musteri };
    const yeni = { ...seviyeYapilandirmasi, gerekenMusteriNoktalari: noktalar };
    setSeviyeYapilandirmasi(yeni);
    setTaslakSeviye(yeni);
    ekleDenetimKaydi('Seviye Noktası Güncellendi', 'denge', `L${seviye}`, `Gereken müşteri: ${musteri}`);
  };

  const ekleSeviyeNoktasi = (seviye: number, musteri: number) => {
    const noktalar = [...seviyeYapilandirmasi.gerekenMusteriNoktalari, { seviye, musteri }].sort(
      (a, b) => a.seviye - b.seviye
    );
    const yeni = { ...seviyeYapilandirmasi, gerekenMusteriNoktalari: noktalar };
    setSeviyeYapilandirmasi(yeni);
    setTaslakSeviye(yeni);
    ekleDenetimKaydi('Yeni Seviye Noktası', 'denge', `L${seviye}`, `Gereken müşteri: ${musteri}`);
  };

  const silSeviyeNoktasi = (index: number) => {
    const silinen = seviyeYapilandirmasi.gerekenMusteriNoktalari[index];
    const noktalar = seviyeYapilandirmasi.gerekenMusteriNoktalari.filter((_, idx) => idx !== index);
    const yeni = { ...seviyeYapilandirmasi, gerekenMusteriNoktalari: noktalar };
    setSeviyeYapilandirmasi(yeni);
    setTaslakSeviye(yeni);
    ekleDenetimKaydi('Seviye Noktası Silindi', 'denge', `L${silinen?.seviye}`, 'Kontrol noktası silindi.');
  };

  // Player management (Mandatory reason required by UX guide!)
  const oyuncuSeviyeAyarla = (
    oyuncuId: string,
    yeniSeviye: number,
    gerekce: string,
    yonetici: string = 'Admin (Rauf)'
  ): boolean => {
    if (!gerekce || gerekce.trim().length < 5) return false;

    setOyuncular((prev) =>
      prev.map((p) => {
        if (p.id === oyuncuId) {
          const oncekiSeviye = p.ilerleme.seviye;
          ekleDenetimKaydi(
            'Oyuncu Seviyesi Değiştirildi',
            'oyuncu',
            oyuncuId,
            `Seviye ${oncekiSeviye} -> ${yeniSeviye}. Gerekçe: ${gerekce}`,
            String(oncekiSeviye),
            String(yeniSeviye)
          );
          return {
            ...p,
            ilerleme: {
              ...p.ilerleme,
              seviye: yeniSeviye,
              enYuksekSeviye: Math.max(p.ilerleme.enYuksekSeviye, yeniSeviye),
              ilerleme: 0,
            },
          };
        }
        return p;
      })
    );
    return true;
  };

  const oyuncuIlerlemeSifirla = (
    oyuncuId: string,
    gerekce: string,
    yonetici: string = 'Admin (Rauf)'
  ): boolean => {
    if (!gerekce || gerekce.trim().length < 5) return false;

    setOyuncular((prev) =>
      prev.map((p) => {
        if (p.id === oyuncuId) {
          ekleDenetimKaydi(
            'İlerleme Sıfırlandı',
            'oyuncu',
            oyuncuId,
            `Oyuncu sıfırlandı. Gerekçe: ${gerekce}`
          );
          return {
            ...p,
            ilerleme: {
              ...p.ilerleme,
              seviye: 1,
              ilerleme: 0,
              toplamMusteri: 0,
              toplamCoin: 0,
              enYuksekSeviye: 1,
              enIyiSeri: 0,
              toplamMukemmel: 0,
            },
          };
        }
        return p;
      })
    );
    return true;
  };

  const oyuncuDurumDegistir = (
    oyuncuId: string,
    durum: 'aktif' | 'engelli' | 'supheli',
    gerekce: string,
    yonetici: string = 'Admin (Rauf)'
  ) => {
    setOyuncular((prev) =>
      prev.map((p) => {
        if (p.id === oyuncuId) {
          ekleDenetimKaydi(
            `Oyuncu Durumu: ${durum.toUpperCase()}`,
            'oyuncu',
            oyuncuId,
            `Durum: ${p.durum} -> ${durum}. Gerekçe: ${gerekce}`
          );
          return { ...p, durum };
        }
        return p;
      })
    );
  };

  // Receipts
  const fisSupheliIsaretle = (fisId: string, neden: string) => {
    setFisler((prev) =>
      prev.map((f) => (f.id === fisId ? { ...f, supheli: true } : f))
    );
    ekleDenetimKaydi('Fiş Şüpheli İşaretlendi', 'fis', fisId, `Neden: ${neden}`);
  };

  const fisDogrula = (fisId: string) => {
    setFisler((prev) =>
      prev.map((f) => (f.id === fisId ? { ...f, supheli: false } : f))
    );
    ekleDenetimKaydi('Fiş Doğrulandı', 'fis', fisId, 'İnceleme sonucu fiş doğrulandı.');
  };

  // Suspicious cases
  const supheliKayitCoz = (
    kayitId: string,
    aksiyon: 'temizle' | 'engelle' | 'seviye_dusur',
    gerekce: string
  ) => {
    const k = supheliKayitlar.find((item) => item.id === kayitId);
    if (!k) return;

    if (aksiyon === 'temizle') {
      setSupheliKayitlar((prev) =>
        prev.map((item) => (item.id === kayitId ? { ...item, durum: 'temizlendi' as const } : item))
      );
      oyuncuDurumDegistir(k.playerId, 'aktif', `Şüphe temizlendi: ${gerekce}`);
    } else if (aksiyon === 'engelle') {
      setSupheliKayitlar((prev) =>
        prev.map((item) => (item.id === kayitId ? { ...item, durum: 'islem_yapildi' as const } : item))
      );
      oyuncuDurumDegistir(k.playerId, 'engelli', `Şüpheli eylem doğrulandı: ${gerekce}`);
    } else if (aksiyon === 'seviye_dusur') {
      setSupheliKayitlar((prev) =>
        prev.map((item) => (item.id === kayitId ? { ...item, durum: 'islem_yapildi' as const } : item))
      );
      oyuncuSeviyeAyarla(k.playerId, 10, `Hileli seviye geri çekildi: ${gerekce}`);
    }
  };

  return (
    <GameAdminContext.Provider
      value={{
        tema,
        setTema: setTemaState,
        toggleTema,
        aktifSekme,
        setAktifSekme,
        malzemeler,
        musteriTipleri,
        seviyeYapilandirmasi,
        ayarlar,
        taslakAyarlar,
        taslakSeviye,
        degisiklikVarMi,
        taslagiGuncelle,
        taslagiYayinla,
        taslagiSifirla,
        guncelleMalzeme,
        ekleMalzeme,
        silMalzeme,
        guncelleMusteriTipi,
        ekleMusteriTipi,
        guncelleSeviyeNoktasi,
        ekleSeviyeNoktasi,
        silSeviyeNoktasi,
        oyuncular,
        oyuncuSeviyeAyarla,
        oyuncuIlerlemeSifirla,
        oyuncuDurumDegistir,
        fisler,
        fisSupheliIsaretle,
        fisDogrula,
        supheliKayitlar,
        supheliKayitCoz,
        denetimGunlugu,
        ekleDenetimKaydi,
        surumler,
        surumeDon,
      }}
    >
      {children}
    </GameAdminContext.Provider>
  );
};

export const useGameAdmin = () => {
  const context = useContext(GameAdminContext);
  if (!context) {
    throw new Error('useGameAdmin must be used within GameAdminProvider');
  }
  return context;
};
