/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameAdminProvider, useGameAdmin } from './context/GameAdminContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

// Views
import { PanelOzetiView } from './components/views/PanelOzetiView';
import { OyuncularView } from './components/views/OyuncularView';
import { FislerView } from './components/views/FislerView';
import { MalzemelerView } from './components/views/MalzemelerView';
import { MusteriTipleriView } from './components/views/MusteriTipleriView';
import { SeviyeEgrisiView } from './components/views/SeviyeEgrisiView';
import { DengeAyarlariView } from './components/views/DengeAyarlariView';
import { SimulatorView } from './components/views/SimulatorView';
import { KilometreTaslariView } from './components/views/KilometreTaslariView';
import { SurumlerView } from './components/views/SurumlerView';
import { SupheliKayitlarView } from './components/views/SupheliKayitlarView';
import { DenetimGunluguView } from './components/views/DenetimGunluguView';

const MainLayout: React.FC = () => {
  const { aktifSekme } = useGameAdmin();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--zemin)] text-[var(--yazi)] transition-colors">
      <Header />

      <div className="flex-1 flex flex-row w-full max-w-full overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {aktifSekme === 'ozet' && <PanelOzetiView />}
          {aktifSekme === 'oyuncular' && <OyuncularView />}
          {aktifSekme === 'fisler' && <FislerView />}
          {aktifSekme === 'malzemeler' && <MalzemelerView />}
          {aktifSekme === 'musteriler' && <MusteriTipleriView />}
          {aktifSekme === 'egri' && <SeviyeEgrisiView />}
          {aktifSekme === 'denge' && <DengeAyarlariView />}
          {aktifSekme === 'simulator' && <SimulatorView />}
          {aktifSekme === 'kilometre-taslari' && <KilometreTaslariView />}
          {aktifSekme === 'surumler' && <SurumlerView />}
          {aktifSekme === 'supheli' && <SupheliKayitlarView />}
          {aktifSekme === 'denetim' && <DenetimGunluguView />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <GameAdminProvider>
      <MainLayout />
    </GameAdminProvider>
  );
}
