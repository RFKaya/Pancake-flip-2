import React from 'react';
import { useGameAdmin, SekmeTipi } from '../context/GameAdminContext';
import {
  LayoutDashboard,
  Users,
  Receipt,
  UtensilsCrossed,
  UserCheck,
  TrendingUp,
  Sliders,
  Play,
  Milestone,
  GitBranch,
  ShieldAlert,
  ClipboardList,
} from 'lucide-react';

interface NavItem {
  id: SekmeTipi;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { aktifSekme, setAktifSekme, degisiklikVarMi, supheliKayitlar } = useGameAdmin();

  const bekleyenSupheliSayisi = supheliKayitlar.filter((s) => s.durum === 'bekliyor').length;

  const navGroups: NavGroup[] = [
    {
      title: 'Genel',
      items: [
        {
          id: 'ozet',
          label: 'Panel Özeti',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'Oyuncu Verisi',
      items: [
        {
          id: 'oyuncular',
          label: 'Oyuncular',
          icon: Users,
        },
        {
          id: 'fisler',
          label: 'Fişler (Adisyon)',
          icon: Receipt,
        },
        {
          id: 'supheli',
          label: 'Şüpheli Kayıtlar',
          icon: ShieldAlert,
          badge: bekleyenSupheliSayisi > 0 ? bekleyenSupheliSayisi : undefined,
          badgeColor: 'bg-[var(--vurgu)] text-white',
        },
      ],
    },
    {
      title: 'İçerik & Denge',
      items: [
        {
          id: 'malzemeler',
          label: 'Malzemeler',
          icon: UtensilsCrossed,
        },
        {
          id: 'musteriler',
          label: 'Müşteri Tipleri',
          icon: UserCheck,
        },
        {
          id: 'egri',
          label: 'Seviye Eğrisi',
          icon: TrendingUp,
        },
        {
          id: 'denge',
          label: 'Denge Ayarları',
          icon: Sliders,
          badge: degisiklikVarMi ? 'Taslak' : undefined,
          badgeColor: 'bg-[var(--renk-ana)] text-white',
        },
        {
          id: 'kilometre-taslari',
          label: 'Kilometre Taşları',
          icon: Milestone,
        },
      ],
    },
    {
      title: 'Test & Operasyon',
      items: [
        {
          id: 'simulator',
          label: 'Oyun Simülatörü',
          icon: Play,
        },
        {
          id: 'surumler',
          label: 'Sürümler & Diff',
          icon: GitBranch,
        },
        {
          id: 'denetim',
          label: 'Denetim Günlüğü',
          icon: ClipboardList,
        },
      ],
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-[var(--kart)] border-r border-[var(--kenar)] flex flex-col justify-between py-4 select-none min-h-[calc(100vh-4rem)]">
      <div className="space-y-6 px-3">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <div className="px-3 text-xs font-bold uppercase tracking-wider text-[var(--yazi-soluk)]/70">
              {group.title}
            </div>
            <div className="space-y-0.5 pt-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = aktifSekme === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setAktifSekme(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-[var(--renk-ana)] text-[var(--renk-ana-yazi)] font-semibold shadow-xs'
                        : 'text-[var(--yazi)] hover:bg-[var(--kenar)]/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[var(--renk-ana-yazi)]' : 'text-[var(--yazi-soluk)]'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-[var(--renk-ana-yazi)]'
                            : item.badgeColor || 'bg-[var(--kenar)] text-[var(--yazi)]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="px-4 pt-4 border-t border-[var(--kenar)] text-xs text-[var(--yazi-soluk)]">
        <div className="flex items-center justify-between font-mono">
          <span>Pancake Engine</span>
          <span className="text-[10px]">1.000.000.000 Lvl</span>
        </div>
        <div className="text-[11px] text-[var(--yazi-soluk)]/80 mt-1">
          Damerau-Levenshtein Değerlendirme
        </div>
      </div>
    </aside>
  );
};
