'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Wallet, 
  Package, 
  Briefcase, 
  Users, 
  FileText, 
  MessageSquare, 
  Activity 
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Finance', href: '/finance', icon: Wallet },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Projects', href: '/projects', icon: Briefcase },
  { name: 'HR', href: '/hr', icon: Users },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Forum', href: '/forum', icon: MessageSquare },
  { name: 'Pulse', href: '/pulse', icon: Activity },
];

export default function Sidebar({ className = '' }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div className={`flex flex-col h-full bg-[#13151a] border-r border-white/5 ${className}`}>
      <div className="flex h-16 items-center px-6 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            J
          </div>
          <span className="text-xl font-bold tracking-tight text-white">JANUS<span className="text-blue-500">.</span></span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                  ${isActive 
                    ? 'bg-blue-600/10 text-blue-500' 
                    : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
                  }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-500 group-hover:text-gray-300'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
      
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 font-medium">
            SA
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-200">System Admin</span>
            <span className="text-xs text-gray-500">admin@janus.dev</span>
          </div>
        </div>
      </div>
    </div>
  );
}
