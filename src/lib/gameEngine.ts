import {
  SeviyeYapilandirmasi,
  SeviyeAyari,
  Malzeme,
  MusteriTipi,
  OyunAyarlari,
  Siparis,
  TabakParcasi,
  DegerlendirmeDetay,
  ServisSonucu,
  HataTuru,
} from '../types/game';

/**
 * Format numbers with compact letters (e.g. 1.2K, 3.4M, 1.0B)
 */
export function formatCompact(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return '0';
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (abs >= 1_000_000) {
    return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (abs >= 1_000) {
    return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return value.toLocaleString('tr-TR');
}

export function formatTamSayi(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return value.toLocaleString('tr-TR');
}

/**
 * Calculates required customers for a level based on checkpoints and infinite scaling
 */
export function hesaplaGerekenMusteri(seviye: number, config: SeviyeYapilandirmasi): number {
  if (seviye <= 1) return 1;

  const points = [...config.gerekenMusteriNoktalari].sort((a, b) => a.seviye - b.seviye);

  // Exact match
  const exact = points.find((p) => p.seviye === seviye);
  if (exact) return exact.musteri;

  // Below first point
  if (seviye < points[0].seviye) {
    return points[0].musteri;
  }

  // Inside points range: Linear interpolation
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    if (seviye >= p1.seviye && seviye <= p2.seviye) {
      const ratio = (seviye - p1.seviye) / (p2.seviye - p1.seviye);
      const val = Math.round(p1.musteri + ratio * (p2.musteri - p1.musteri));
      return Math.min(40, val);
    }
  }

  // Above last point (e.g. level > 1000): +2 increase per 500 levels, capped at 40
  const lastPoint = points[points.length - 1];
  const deltaLevels = seviye - lastPoint.seviye;
  const extra = Math.floor(deltaLevels / 500) * 2;
  const total = lastPoint.musteri + extra;
  return Math.min(40, Math.max(1, total));
}

/**
 * Calculates difficulty (0..1) based on level and scale
 */
export function hesaplaZorluk(seviye: number, olcek: number): number {
  if (seviye <= 1) return 0.02;
  // Saturation formula: 1 - exp(-seviye / olcek)
  const z = 1 - Math.exp(-seviye / olcek);
  return Math.min(0.99, Math.max(0.01, Number(z.toFixed(3))));
}

/**
 * Computes runtime SeviyeAyari for any given level (1 to 1 billion)
 */
export function hesaplaSeviyeAyari(
  seviye: number,
  config: SeviyeYapilandirmasi,
  malzemeler: Malzeme[],
  musteriTipleri: MusteriTipi[]
): SeviyeAyari {
  const zorluk = hesaplaZorluk(seviye, config.zorlukOlcek);
  const gerekenMusteri = hesaplaGerekenMusteri(seviye, config);

  // Available ingredients
  const menu = malzemeler.filter((m) => m.acilis <= seviye && m.aktif !== false);

  // Tier lookup: highest tier with tier.seviye <= seviye
  const sortedTiers = [...config.kademeler].sort((a, b) => a.seviye - b.seviye);
  let aktifKademe = sortedTiers[0];
  for (const t of sortedTiers) {
    if (t.seviye <= seviye) {
      aktifKademe = t;
    } else {
      break;
    }
  }

  // Lerp helper
  const lerp = (start: number, end: number, t: number) => {
    return Number((start + (end - start) * t).toFixed(3));
  };

  const cevirPencere = lerp(config.egriler.cevirPencere.baslangic, config.egriler.cevirPencere.doyum, zorluk);
  const hamurTolerans = lerp(config.egriler.hamurTolerans.baslangic, config.egriler.hamurTolerans.doyum, zorluk);
  const pismeHizi = lerp(config.egriler.pismeHizi.baslangic, config.egriler.pismeHizi.doyum, zorluk);
  const sabirCarpani = lerp(config.egriler.sabirCarpani.baslangic, config.egriler.sabirCarpani.doyum, zorluk);
  const gelmeAraligi = lerp(config.egriler.gelmeAraligi.baslangic, config.egriler.gelmeAraligi.doyum, zorluk);
  const tercihOlasiligi = lerp(config.egriler.tercihOlasiligi.baslangic, config.egriler.tercihOlasiligi.doyum, zorluk);

  // Customer weights
  const availableCustomers = musteriTipleri.filter((c) => c.acilis <= seviye);
  const musteriAgirlik: Record<string, number> = {};
  availableCustomers.forEach((c) => {
    let w = c.agirlik;
    if (c.id !== 'normal') {
      const mult = lerp(config.egriler.ozelMusteriCarpani.baslangic, config.egriler.ozelMusteriCarpani.doyum, zorluk);
      w *= mult;
    }
    musteriAgirlik[c.id] = Number(w.toFixed(2));
  });

  return {
    seviye,
    zorluk,
    gerekenMusteri,
    menu,
    krepAraligi: [aktifKademe.krepMin, aktifKademe.krepMax],
    dAraligi: [aktifKademe.dMin, aktifKademe.dMax],
    tavaSayisi: aktifKademe.tavaSayisi,
    esZamanliMusteri: aktifKademe.esZamanliMusteri,
    cevirmeAcik: true,
    tercihAcik: seviye >= 20,
    yogunSaatAcik: seviye >= 150,
    ipucu: seviye <= config.ipucuSeviyesi,
    cevirPencere,
    hamurTolerans,
    pismeHizi,
    sabirCarpani,
    gelmeAraligi,
    tercihOlasiligi,
    musteriAgirlik,
  };
}

/**
 * Validates receipt code format: KRP-BBB-YXXXXXX
 * BBB: 3 digits (or padded) level
 * Y: star 0..3
 * XXXXXX: 6 hex characters
 */
export function dogrulaFisKodu(kod: string): boolean {
  if (!kod || typeof kod !== 'string') return false;
  const regex = /^KRP-\d{3}-[0-3][0-9A-Fa-f]{6}$/;
  return regex.test(kod);
}

/**
 * Generates an authentic receipt code according to Rust backend specs
 */
export function uretFisKodu(seviye: number, yildiz: number): string {
  const bbb = Math.min(999, Math.max(1, seviye)).toString().padStart(3, '0');
  const y = Math.min(3, Math.max(0, yildiz)).toString();
  const hex = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .toUpperCase()
    .padStart(6, '0');
  return `KRP-${bbb}-${y}${hex}`;
}

/**
 * Computes Damerau-Levenshtein distance between expected items and served items
 */
function damerauLevenshtein(a: string[], b: string[]): { distance: number; operations: { missing: number; extra: number; substituted: number; swapped: number } } {
  const la = a.length;
  const lb = b.length;
  const d: number[][] = [];

  for (let i = 0; i <= la; i++) {
    d[i] = [];
    d[i][0] = i;
  }
  for (let j = 0; j <= lb; j++) {
    d[0][j] = j;
  }

  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion (missing)
        d[i][j - 1] + 1, // insertion (extra)
        d[i - 1][j - 1] + cost // substitution (wrong)
      );

      // Transposition (order swap)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }

  // Approximate category breakdown
  let missing = 0;
  let extra = 0;
  let substituted = 0;
  let swapped = 0;

  if (la > lb) missing = la - lb;
  if (lb > la) extra = lb - la;

  const minLen = Math.min(la, lb);
  for (let i = 0; i < minLen; i++) {
    if (a[i] !== b[i]) {
      if (i + 1 < minLen && a[i] === b[i + 1] && a[i + 1] === b[i]) {
        swapped++;
        i++;
      } else {
        substituted++;
      }
    }
  }

  return {
    distance: d[la][lb],
    operations: { missing, extra, substituted, swapped },
  };
}

/**
 * Complete Evaluation & Economy Calculator
 */
export function degerlendirSiparis(
  siparis: Siparis,
  tabak: TabakParcasi[],
  ayarlar: OyunAyarlari,
  musteriTipi: MusteriTipi,
  seviye: number,
  combo: number = 1,
  kalanSabirOrani: number = 0.9,
  malzemeler: Malzeme[] = []
): DegerlendirmeDetay {
  const beklenen = siparis.parcalar;
  const sunulan = tabak.map((p) => p.malzeme);

  const cezaDetay: { tur: HataTuru; miktar: number; aciklama: string }[] = [];

  // 1. Order alignment check via Damerau-Levenshtein
  const dl = damerauLevenshtein(beklenen, sunulan);
  if (dl.operations.missing > 0) {
    const ceza = dl.operations.missing * ayarlar.hataCezalari.eksik;
    cezaDetay.push({
      tur: 'eksik',
      miktar: ceza,
      aciklama: `${dl.operations.missing} malzeme eksik konuldu (-${ceza})`,
    });
  }
  if (dl.operations.extra > 0) {
    const ceza = dl.operations.extra * ayarlar.hataCezalari.fazla;
    cezaDetay.push({
      tur: 'fazla',
      miktar: ceza,
      aciklama: `${dl.operations.extra} fazla malzeme konuldu (-${ceza})`,
    });
  }
  if (dl.operations.substituted > 0) {
    const ceza = dl.operations.substituted * ayarlar.hataCezalari.yanlis;
    cezaDetay.push({
      tur: 'yanlis',
      miktar: ceza,
      aciklama: `${dl.operations.substituted} yanlış malzeme eşleşti (-${ceza})`,
    });
  }
  if (dl.operations.swapped > 0) {
    const ceza = dl.operations.swapped * ayarlar.hataCezalari.sira;
    cezaDetay.push({
      tur: 'sira',
      miktar: ceza,
      aciklama: `${dl.operations.swapped} malzeme sıralaması hatalı (-${ceza})`,
    });
  }

  // 2. Doneness check for pancakes in plate
  const krepParcalari = tabak.filter((p) => p.malzeme === 'krep');
  krepParcalari.forEach((krep, idx) => {
    if (krep.pisme === 'cig') {
      cezaDetay.push({
        tur: 'cig',
        miktar: ayarlar.hataCezalari.pisme,
        aciklama: `${idx + 1}. krep çiğ servis edildi (-${ayarlar.hataCezalari.pisme})`,
      });
    } else if (krep.pisme === 'yanik' || krep.pisme === 'fazla') {
      cezaDetay.push({
        tur: 'fazlaPismis',
        miktar: ayarlar.hataCezalari.pisme,
        aciklama: `${idx + 1}. krep fazla pişmiş/yanık (-${ayarlar.hataCezalari.pisme})`,
      });
    }
  });

  // 3. Thickness preference check (if customer had a preference)
  if (siparis.tercih) {
    const uyumsuzKrep = krepParcalari.find((k) => k.kalinlik && k.kalinlik !== siparis.tercih);
    if (uyumsuzKrep) {
      cezaDetay.push({
        tur: 'kalinlik',
        miktar: ayarlar.hataCezalari.tercih,
        aciklama: `İstenen kalınlık '${siparis.tercih}', sunulan '${uyumsuzKrep.kalinlik}' (-${ayarlar.hataCezalari.tercih})`,
      });
    }
  }

  // Customer penalty multiplier applied
  const toplamHamCeza = cezaDetay.reduce((sum, c) => sum + c.miktar, 0);
  const toplamCeza = Math.round(toplamHamCeza * musteriTipi.ceza);

  const netKalite = Math.max(0, Math.min(100, 100 - toplamCeza));

  // Determine outcome
  let sonuc: ServisSonucu = 'olmadi';
  if (netKalite >= ayarlar.kalitePuanlari.perfect) {
    sonuc = 'perfect';
  } else if (netKalite >= ayarlar.kalitePuanlari.great) {
    sonuc = 'great';
  } else if (netKalite >= ayarlar.kalitePuanlari.good) {
    sonuc = 'good';
  }

  // Financial calculations
  // Price = sum of material values
  let fiyat = 0;
  let maliyet = 0;

  beklenen.forEach((id) => {
    const m = malzemeler.find((item) => item.id === id);
    if (m) {
      fiyat += m.deger;
    } else {
      fiyat += 5; // fallback
    }
  });

  sunulan.forEach((id) => {
    const m = malzemeler.find((item) => item.id === id);
    if (m) {
      maliyet += m.maliyet;
    } else {
      maliyet += 2;
    }
  });

  // Outcome multiplier
  const carpan = ayarlar.odemeCarpani[sonuc] || 0.3;
  const odeme = Math.round(fiyat * carpan * musteriTipi.odeme);

  // Mood & Tip
  let bahsisOrani = 0;
  if (kalanSabirOrani >= ayarlar.ruhHali.mutlu.esik) {
    bahsisOrani = ayarlar.ruhHali.mutlu.bahsis;
  } else if (kalanSabirOrani >= ayarlar.ruhHali.iyi.esik) {
    bahsisOrani = ayarlar.ruhHali.iyi.bahsis;
  } else if (kalanSabirOrani >= ayarlar.ruhHali.notr.esik) {
    bahsisOrani = ayarlar.ruhHali.notr.bahsis;
  }

  const bahsis = Math.round(fiyat * bahsisOrani * musteriTipi.bahsis);

  // Combo earnings: only if level >= 15
  let comboKazanci = 0;
  if (seviye >= ayarlar.combo.baslangicSeviyesi && combo > 1) {
    const comboRatio = Math.min(ayarlar.combo.ustSinir, ayarlar.combo.adim * (combo - 1));
    comboKazanci = Math.round((odeme + bahsis) * comboRatio);
  }

  // Perfect bonus
  const perfectBonus = sonuc === 'perfect' ? ayarlar.perfectBonusu : 0;

  const netKazanc = Math.max(0, odeme + bahsis + comboKazanci + perfectBonus - maliyet);

  return {
    hamPuan: 100,
    cezaToplam: toplamCeza,
    cezaDetay,
    netKalite,
    sonuc,
    fiyat,
    maliyet,
    odeme,
    bahsis,
    comboKazanci,
    perfectBonus,
    netKazanc,
  };
}

/**
 * Random order generator for simulator
 */
export function rastgeleSiparisUret(seviyeAyari: SeviyeAyari, musteriTipleri: MusteriTipi[]): {
  musteriTipi: MusteriTipi;
  siparis: Siparis;
} {
  // Pick customer based on weights
  const availableTypes = musteriTipleri.filter((m) => m.acilis <= seviyeAyari.seviye);
  let totalWeight = 0;
  availableTypes.forEach((m) => {
    totalWeight += seviyeAyari.musteriAgirlik[m.id] || m.agirlik;
  });

  let rand = Math.random() * totalWeight;
  let secilenTip = availableTypes[0];
  for (const t of availableTypes) {
    const w = seviyeAyari.musteriAgirlik[t.id] || t.agirlik;
    if (rand <= w) {
      secilenTip = t;
      break;
    }
    rand -= w;
  }

  // Order length d
  let d = Math.floor(
    Math.random() * (seviyeAyari.dAraligi[1] - seviyeAyari.dAraligi[0] + 1) + seviyeAyari.dAraligi[0]
  );
  if (secilenTip.dKaydirma) d += secilenTip.dKaydirma;
  if (secilenTip.dMax) d = Math.min(d, secilenTip.dMax);
  d = Math.max(1, Math.min(10, d));

  // Pancake count
  const krepSayisi = Math.floor(
    Math.random() * (seviyeAyari.krepAraligi[1] - seviyeAyari.krepAraligi[0] + 1) + seviyeAyari.krepAraligi[0]
  );

  // Filter pool for ingredients
  let havuz = seviyeAyari.menu.filter((m) => m.id !== 'krep');
  if (secilenTip.tatliMi) {
    havuz = havuz.filter((m) => m.tatli === true);
  }
  if (havuz.length === 0) {
    havuz = seviyeAyari.menu;
  }

  const parcalar: string[] = ['krep'];
  let currentKreps = 1;

  for (let i = 1; i < d; i++) {
    // If we need more pancakes and random decides
    if (currentKreps < krepSayisi && Math.random() > 0.5) {
      parcalar.push('krep');
      currentKreps++;
    } else {
      const rastgeleMalzeme = havuz[Math.floor(Math.random() * havuz.length)];
      parcalar.push(rastgeleMalzeme ? rastgeleMalzeme.id : 'krep');
    }
  }

  // Thickness preference (if unlocked and random test passes)
  let tercih: 'ince' | 'normal' | 'kalın' | undefined = undefined;
  if (seviyeAyari.tercihAcik && Math.random() < seviyeAyari.tercihOlasiligi) {
    const tercihler: ('ince' | 'normal' | 'kalın')[] = ['ince', 'normal', 'kalın'];
    tercih = tercihler[Math.floor(Math.random() * tercihler.length)];
  }

  return {
    musteriTipi: secilenTip,
    siparis: {
      parcalar,
      d: parcalar.length,
      tercih,
    },
  };
}
