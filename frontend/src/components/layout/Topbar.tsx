'use client';

import { Bell, Search, Settings, Filter } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Topbar() {
  const pathname = usePathname();
  
  // Create a nice title from the pathname
  const title = pathname === '/' 
    ? 'Dashboard' 
    : pathname.split('/')[1].charAt(0).toUpperCase() + pathname.split('/')[1].slice(1);

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-[#0f1115]/80 backdrop-blur-md border-b border-white/5 z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-white">{title}</h1>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative group hidden md:block">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search JANUS..." 
            className="h-9 w-64 bg-[#181b21] border border-white/5 rounded-full pl-9 pr-4 text-sm text-gray-200 focus:outline-none focus:border-blue-500/50 focus:bg-[#1e2128] transition-all placeholder:text-gray-600"
          />
        </div>
        
        <div className="flex items-center gap-3 border-l border-white/5 pl-6">
          <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-[#0f1115]"></span>
          </button>
          <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
