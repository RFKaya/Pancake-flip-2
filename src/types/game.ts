export type MalzemeKategori = 'krep' | 'dolgu' | 'sos' | 'topping';

export type PismeBolgesi = 'cig' | 'az' | 'orta' | 'iyi' | 'fazla' | 'yanik';

export type GorunenPisme = 'cig' | 'pismis' | 'yanik';

export type ServisSonucu = 'perfect' | 'great' | 'good' | 'olmadi';

export type Kalinlik = 'ince' | 'normal' | 'kalın';

export type CevirmeKalitesi = 'kacti' | 'erken' | 'iyi' | 'mukemmel' | 'gec';

export type MusteriTipiId = 'normal' | 'cocuk' | 'elestirmen' | 'vip' | string;

export type HataTuru = 'eksik' | 'fazla' | 'yanlis' | 'sira' | 'cig' | 'fazlaPismis' | 'kalinlik';

export type TokenRengi =
  | '--renk-ana'
  | '--renk-ana-koyu'
  | '--vurgu'
  | '--basari'
  | '--krep-cig'
  | '--krep-az'
  | '--krep-orta'
  | '--krep-iyi'
  | '--krep-fazla'
  | '--krep-yanik'
  | '--sahne-tabak'
  | '--sahne-tava';

export interface Malzeme {
  id: string;
  ad: string;
  kategori: MalzemeKategori;
  acilis: number; // Açıldığı seviye
  maliyet: number; // Konurken düşülen maliyet
  deger: number; // Siparişe katkısı (fiyat)
  ikon: string; // Emoji
  renkDegiskeni: TokenRengi;
  tatli?: boolean; // Çocuk müşteri tatlı ister
  aktif?: boolean;
}

export interface MusteriTipi {
  id: MusteriTipiId;
  ad: string;
  ikon: string;
  acilis: number;
  agirlik: number;
  sabir: number;
  odeme: number;
  bahsis: number;
  ceza: number;
  dKaydirma: number;
  dMax?: number;
  tatliMi?: boolean;
}

export interface KontrolNoktasi {
  seviye: number;
  musteri: number;
}

export interface Kademe {
  seviye: number;
  krepMin: number;
  krepMax: number;
  dMin: number;
  dMax: number;
  tavaSayisi: number;
  esZamanliMusteri: number;
}

export interface MekanikAcilis {
  seviye: number;
  baslik: string;
  aciklama: string;
}

export interface KilometreTasi {
  seviye: number;
  baslik: {
    tr: string;
    en: string;
    ar: string;
    fa: string;
  };
  altMetin: {
    tr: string;
    en: string;
    ar: string;
    fa: string;
  };
  odulCoin?: number;
}

export interface SeviyeYapilandirmasi {
  seviyeSiniri: number;
  devHizliSeviyeler: number[];
  devEnYuksek: number;
  gerekenMusteriNoktalari: KontrolNoktasi[];
  zorlukOlcek: number;
  ilerlemeKatsayisi: {
    perfect: number;
    great: number;
    good: number;
    olmadi: number;
    seriEsik: number;
    seriBonus: number;
  };
  egriler: {
    cevirPencere: { baslangic: number; doyum: number };
    hamurTolerans: { baslangic: number; doyum: number };
    pismeHizi: { baslangic: number; doyum: number };
    sabirCarpani: { baslangic: number; doyum: number };
    gelmeAraligi: { baslangic: number; doyum: number };
    ozelMusteriCarpani: { baslangic: number; doyum: number };
    tercihOlasiligi: { baslangic: number; doyum: number };
  };
  sabirMin: number;
  musteriArasi: number;
  ilkMusteriGecikmesi: number;
  ipucuSeviyesi: number;
  yogunSaat: {
    aralik: number;
    sure: number;
    gelmeCarpani: number;
    kazancCarpani: number;
  };
  kademeler: Kademe[];
  mekanikler: MekanikAcilis[];
  kilometreTaslari: KilometreTasi[];
}

export interface OyunAyarlari {
  pismeSuresi: number; // sn (örn. 6.0)
  yuzSuresi: number;
  ikinciYuzHizi: number;
  pismeBolgeleri: {
    cig: number; // 0.30
    az: number; // 0.55
    orta: number; // 0.80
    iyi: number; // 1.00
    fazla: number; // 1.15
  };
  dokumSuresi: number;
  hamurMin: number;
  hamurMax: number;
  tabakMax: number;
  sosSuresi: number;
  dolguSuresi: number;
  toppingSuresi: number;
  yanikBekleme: number;
  cikisSuresi: number;
  mesajSuresi: number;
  kalitePuanlari: {
    perfect: number; // 100
    great: number; // 80
    good: number; // 50
  };
  odemeCarpani: {
    perfect: number; // 1.0
    great: number; // 0.9
    good: number; // 0.7
    olmadi: number; // 0.3
  };
  hataCezalari: {
    eksik: number; // 25
    fazla: number; // 20
    yanlis: number; // 25
    sira: number; // 10
    pisme: number; // 25
    tercih: number; // 10
  };
  combo: {
    adim: number; // 0.10
    ustSinir: number; // 0.50
    baslangicSeviyesi: number; // 15
  };
  perfectBonusu: number; // 5 coin
  ruhHali: {
    mutlu: { esik: number; bahsis: number; ikon: string }; // >= 0.8, 0.30
    iyi: { esik: number; bahsis: number; ikon: string }; // >= 0.6, 0.20
    notr: { esik: number; bahsis: number; ikon: string }; // >= 0.4, 0.10
    kizgin: { esik: number; bahsis: number; ikon: string }; // >= 0.2, 0.00
    ofkeli: { esik: number; bahsis: number; ikon: string }; // < 0.2, 0.00
  };
}

export interface SeviyeAyari {
  seviye: number;
  zorluk: number; // 0..1
  gerekenMusteri: number;
  menu: Malzeme[];
  krepAraligi: [number, number];
  dAraligi: [number, number];
  tavaSayisi: number;
  esZamanliMusteri: number;
  cevirmeAcik: boolean;
  tercihAcik: boolean;
  yogunSaatAcik: boolean;
  ipucu: boolean;
  cevirPencere: number;
  hamurTolerans: number;
  pismeHizi: number;
  sabirCarpani: number;
  gelmeAraligi: number;
  tercihOlasiligi: number;
  musteriAgirlik: Record<string, number>;
}

export interface TabakParcasi {
  malzeme: string; // malzeme id
  pisme?: PismeBolgesi;
  kalinlik?: Kalinlik;
  usta?: boolean;
}

export interface Siparis {
  parcalar: string[]; // aşağıdan yukarı malzeme id
  d: number;
  tercih?: Kalinlik;
}

export interface Musteri {
  id: string;
  tip: MusteriTipiId;
  siparis: Siparis;
  sabirToplam: number;
  sabir: number;
}

export interface DegerlendirmeDetay {
  hamPuan: number;
  cezaToplam: number;
  cezaDetay: { tur: HataTuru; miktar: number; aciklama: string }[];
  netKalite: number;
  sonuc: ServisSonucu;
  fiyat: number;
  maliyet: number;
  odeme: number;
  bahsis: number;
  comboKazanci: number;
  perfectBonus: number;
  netKazanc: number;
}

export interface Fis {
  id: string;
  playerId: string;
  kod: string; // KRP-BBB-YXXXXXX
  bolum: number;
  yildiz: number; // 0..3
  net: number;
  kasa: number;
  tarih: string;
  musteriTipi?: string;
  sonuc?: ServisSonucu;
  supheli?: boolean;
}

export interface IlerlemeVerisi {
  surum: number;
  seviye: number;
  ilerleme: number;
  toplamMusteri: number;
  toplamCoin: number;
  enYuksekSeviye: number;
  enIyiSeri: number;
  toplamMukemmel: number;
}

export interface Oyuncu {
  id: string;
  ad: string;
  eposta?: string;
  kayitTarihi: string;
  sonOyun: string;
  durum: 'aktif' | 'engelli' | 'supheli';
  ilerleme: IlerlemeVerisi;
  supheNotu?: string;
}

export interface IcerikSurum {
  id: string;
  surum: string;
  yayinTarihi: string;
  yayinlayan: string;
  not: string;
  durum: 'yayinlandi' | 'taslak' | 'arsiv';
  veri: {
    malzemeler: Malzeme[];
    musteriTipleri: MusteriTipi[];
    seviye: SeviyeYapilandirmasi;
    ayarlar: OyunAyarlari;
  };
}

export interface SupheliKayit {
  id: string;
  playerId: string;
  oyuncuAdi: string;
  tarih: string;
  neden: string;
  kanit: string;
  durum: 'bekliyor' | 'temizlendi' | 'islem_yapildi';
  seviye: number;
}

export interface DenetimKaydi {
  id: string;
  yonetici: string;
  islem: string;
  hedefTur: 'oyuncu' | 'denge' | 'malzeme' | 'surum' | 'fis';
  hedefId: string;
  gerekce: string;
  tarih: string;
  oncekiDeger?: string;
  yeniDeger?: string;
}
