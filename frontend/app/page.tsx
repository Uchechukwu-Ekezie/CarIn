'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import ViewToggle, { ViewMode } from '@/components/map/ViewToggle';
import SpotList from '@/components/map/SpotList';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useParkingSpots } from '@/lib/hooks/useParkingSpots';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { ParkingSpot } from '@/lib/hooks/useParkingSpots';

// Dynamically import MapView to avoid SSR issues
const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading map...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const { spots, loading } = useParkingSpots();
  const { location: userLocation } = useGeolocation();

  const handleSpotClick = (spot: ParkingSpot) => {
    window.location.href = `/booking/${spot.id}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow pt-28">
        {/* Stunning Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-6">
          {/* Background Elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black z-10" />
            <Image
              src="/hero-bg.png"
              alt="Futuristic City"
              fill
              className="object-cover opacity-40 scale-110 blur-[2px] animate-pulse-slow"
              priority
            />
          </div>

          <div className="relative z-20 max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-gray-300">Next-Gen Bitcoin Infrastructure</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-[1.1] tracking-tight animate-fade-in-up delay-100">
              Find Your <span className="text-gradient">Space</span> <br />
              In the Future.
            </h1>

            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
              Decentralized parking infrastructure powered by Stacks. <br className="hidden md:block" />
              Secure, transparent, and built for the Bitcoin economy.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up delay-300">
              <Link
                href="#find-parking"
                className="btn-primary w-full sm:w-auto"
              >
                Find Parking Now
              </Link>
              <Link
                href="/owner"
                className="px-8 py-3 rounded-xl font-bold text-white glass-card hover:bg-white/10 transition-all border border-white/10 w-full sm:w-auto"
              >
                List Your Spot
              </Link>
            </div>
          </div>

          {/* Bottom Gradient Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#020202] to-transparent z-10" />
        </section>

        {/* Features Section */}
        <section className="py-24 relative z-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  title: 'Secure & Transparent',
                  desc: 'Bitcoin L2 smart contracts ensure immutable logs and safe payments.',
                  color: 'indigo',
                  icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                },
                {
                  title: 'Instant Booking',
                  desc: 'Zero-latency confirmations with micro-transaction support.',
                  color: 'purple',
                  icon: 'M13 10V3L4 14h7v7l9-11h-7z'
                },
                {
                  title: 'Earn Rewards',
                  desc: 'Stake your parking spots and earn STX yield for every booking.',
                  color: 'emerald',
                  icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                }
              ].map((f, i) => (
                <div key={i} className="glass-card group p-8 hover:bg-white/10 transition-all duration-500 border-white/5 hover:border-white/20">
                  <div className={`bg-${f.color}-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 ring-1 ring-white/10`}>
                    <svg className={`w-8 h-8 text-${f.color}-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={f.icon} />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{f.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section id="find-parking" className="py-24 relative z-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col sm:flex-row items-end justify-between gap-6 mb-12 border-b border-white/5 pb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white tracking-tight">Active Infrastructure</h2>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-indigo-400/80 font-medium text-sm">
                    {loading ? 'Scanning Stacks nodes...' : `${spots.length} spaces live on-chain`}
                  </p>
                </div>
              </div>
              <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
            </div>

            <div className="relative">
              {viewMode === 'map' ? (
                <div className="h-[700px] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 group">
                  <div className="absolute inset-0 z-10 pointer-events-none border-[12px] border-black/50 rounded-3xl" />
                  <MapView onSpotClick={handleSpotClick} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {loading ? (
                    <div className="col-span-full py-24 glass-card flex flex-col items-center">
                      <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-gray-400 font-medium lowercase tracking-widest text-xs">Node Syncing...</p>
                    </div>
                  ) : (
                    <SpotList
                      spots={spots}
                      userLocation={userLocation}
                      onSpotClick={handleSpotClick}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}





