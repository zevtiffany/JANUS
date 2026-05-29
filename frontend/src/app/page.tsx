'use client';

import { Suspense } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MetricCard } from '@/components/ui/Cards';
import { DollarSign, Package, Briefcase, Activity } from 'lucide-react';

const mockData = [
  { name: 'Jan', revenue: 4000, expenses: 2400 },
  { name: 'Feb', revenue: 3000, expenses: 1398 },
  { name: 'Mar', revenue: 2000, expenses: 9800 },
  { name: 'Apr', revenue: 2780, expenses: 3908 },
  { name: 'May', revenue: 1890, expenses: 4800 },
  { name: 'Jun', revenue: 2390, expenses: 3800 },
  { name: 'Jul', revenue: 3490, expenses: 4300 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Overview</h2>
        <p className="text-gray-400 mt-1">Operational Pulse & Key Metrics for JANUS ERP.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Revenue" 
          value="$128,430" 
          icon={DollarSign} 
          trend={{ value: 12.5, label: "vs last month", positive: true }} 
          color="green"
        />
        <MetricCard 
          title="Active Projects" 
          value="24" 
          icon={Briefcase} 
          trend={{ value: 4.2, label: "vs last month", positive: true }} 
          color="blue"
        />
        <MetricCard 
          title="Low Stock Items" 
          value="12" 
          icon={Package} 
          trend={{ value: 2.1, label: "needs attention", positive: false }} 
          color="amber"
        />
        <MetricCard 
          title="System Pulse" 
          value="98" 
          icon={Activity} 
          trend={{ value: 0.5, label: "healthy status", positive: true }} 
          color="purple"
        />
      </div>

      {/* Charts & Pulse Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-[#181b21] border border-white/5 rounded-xl p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-white">Financial Overview</h3>
            <select className="bg-[#13151a] border border-white/10 text-sm rounded-lg px-3 py-1.5 text-gray-300 focus:ring-blue-500 focus:border-blue-500">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e2128', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pulse Status Widget */}
        <div className="bg-[#181b21] border border-white/5 rounded-xl p-5 shadow-sm flex flex-col">
          <h3 className="font-semibold text-white mb-4">Operational Pulse</h3>
          <div className="flex-1 flex flex-col gap-4">
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 flex items-center justify-center bg-emerald-500/10 shrink-0">
                <span className="text-emerald-500 font-bold">94</span>
              </div>
              <div>
                <h4 className="text-gray-200 font-medium">Finance Health</h4>
                <p className="text-sm text-gray-500">Revenue exceeded expenses</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 flex items-center justify-center bg-amber-500/10 shrink-0">
                <span className="text-amber-500 font-bold">78</span>
              </div>
              <div>
                <h4 className="text-gray-200 font-medium">Inventory Risk</h4>
                <p className="text-sm text-gray-500">12 items below reorder level</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 flex items-center justify-center bg-emerald-500/10 shrink-0">
                <span className="text-emerald-500 font-bold">92</span>
              </div>
              <div>
                <h4 className="text-gray-200 font-medium">Project Delivery</h4>
                <p className="text-sm text-gray-500">On track, 2 minor delays</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-400">Overall System Status:</span>
                <span className="text-sm font-medium text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Healthy
                </span>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
