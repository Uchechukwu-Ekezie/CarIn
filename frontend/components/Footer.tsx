import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 pb-12 border-t border-white/5 bg-black/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-2xl px-4 py-1.5 rounded-xl shadow-lg shadow-indigo-500/20 inline-block mb-6">
              CarIn
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Revolutionizing urban mobility through decentralized parking infrastructure on Stacks.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Platform</h4>
            <ul className="space-y-4">
              {['Find Parking', 'List Spot', 'My Bookings', 'Rewards'].map((link) => (
                <li key={link}>
                  <Link href={link === 'List Spot' ? '/owner' : '/'} className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Connect</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">Twitter</a></li>
              <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">Discord</a></li>
              <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">Mail Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Protocol</h4>
            <div className="p-1 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/5">
              <div className="bg-black/40 p-4 rounded-lg">
                <p className="text-xs text-gray-400 mb-2 font-medium">Built on Stacks</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50" />
                  <span className="text-xs font-bold text-white tracking-widest uppercase">Layer 2 Bitcoin</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            © {currentYear} CarIn. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-500 hover:text-gray-300 text-xs transition-colors">Privacy</a>
            <a href="#" className="text-gray-500 hover:text-gray-300 text-xs transition-colors">Terms</a>
            <a href="#" className="text-gray-500 hover:text-gray-300 text-xs transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
