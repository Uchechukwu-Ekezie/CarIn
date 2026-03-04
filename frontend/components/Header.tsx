'use client';

import Link from 'next/link';
import { useStacksAuth } from '@/lib/providers/AppKitProvider';

const Header = () => {
  const { stxAddress: address, isConnected, connectWallet, logout } = useStacksAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] px-4 py-4">
      <nav className="max-w-7xl mx-auto glass-card px-6 py-3 flex justify-between items-center bg-white/5 backdrop-blur-2xl border-white/10">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xl px-4 py-1.5 rounded-xl shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              CarIn
            </div>
            <span className="hidden sm:block text-sm font-semibold tracking-wide text-indigo-400 uppercase">
              Stacks
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-8">
            {['Find Parking', 'List Spot', 'Bookings', 'Rewards'].map((item) => (
              <Link
                key={item}
                href={item === 'List Spot' ? '/owner' : item === 'Find Parking' ? '/' : `/${item.toLowerCase()}`}
                className="text-gray-300 hover:text-white transition-colors font-medium text-sm tracking-wide"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {isConnected && address ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono text-gray-300">
                  {`${address.slice(0, 5)}...${address.slice(-4)}`}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="bg-white text-black font-bold py-2 px-6 rounded-xl hover:bg-gray-200 transition-all shadow-xl active:scale-95 text-sm"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
