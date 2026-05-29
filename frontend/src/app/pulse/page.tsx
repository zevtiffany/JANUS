'use client';

import { useState, useEffect } from 'react';
import { Card, MetricCard } from '@/components/ui/Cards';
import { Activity, TrendingUp, AlertTriangle, CheckCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/Elements';
import api from '@/lib/api';

export default function PulsePage() {
  const [pulseData, setPulseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchPulse = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pulse') as any;
      if (res.success) {
        setPulseData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch pulse data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPulse();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 50) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  if (loading && !pulseData) {
      return <div className="text-white p-8 animate-pulse text-center">Loading System Pulse...</div>;
  }

  const data = pulseData || { score: 0, overall: 'UNKNOWN', indicators: [], timestamp: new Date().toISOString() };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                  <Activity className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">System Pulse</h2>
          </div>
          <p className="text-gray-400 mt-2 text-lg">Real-time operational health and metrics overview.</p>
        </div>
        
        <Button variant="secondary" icon={RefreshCcw} onClick={fetchPulse}>Refreshed: {new Date(data.timestamp).toLocaleTimeString()}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 rounded-2xl bg-gradient-to-br from-blue-900/40 via-[#13151a] to-[#13151a] border border-blue-500/20 p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Activity className="w-32 h-32" />
            </div>
            
            <h3 className="text-gray-400 font-medium uppercase tracking-widest text-sm mb-4">Overall Score</h3>
            <div className={`text-7xl font-black mb-2 tracking-tighter ${
                data.score >= 80 ? 'text-emerald-400 text-shadow-glow-emerald' : 
                data.score >= 50 ? 'text-amber-400 text-shadow-glow-amber' : 
                'text-red-400 text-shadow-glow-red'
            }`}>
                {data.score}
            </div>
            <div className={`px-4 py-1.5 rounded-full text-sm font-bold mt-2 ${
                data.score >= 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                data.score >= 50 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
                {data.overall}
            </div>
        </div>

        <div className="md:col-span-2 grid grid-rows-3 gap-4">
            {data.indicators.length === 0 && (
                <div className="text-gray-500 p-8 bg-[#13151a] rounded-xl text-center border border-white/5">
                    No pulse data available. Is PostgreSQL running?
                </div>
            )}
            {data.indicators.map((indicator: any, idx: number) => (
                <div key={idx} className="bg-[#13151a] border border-white/5 rounded-2xl p-5 flex items-center gap-6 hover:border-white/10 transition-colors shadow-lg">
                    <div className={`w-20 w-20 flex-shrink-0 flex items-center justify-center border rounded-full font-bold text-2xl ${getScoreColor(indicator.score)}`}>
                        {indicator.score}
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold text-white tracking-tight">{indicator.module}</h3>
                            <div className="flex items-center gap-1">
                                {indicator.status === 'HEALTHY' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : 
                                 indicator.status === 'WARNING' ? <AlertTriangle className="w-4 h-4 text-amber-500" /> : 
                                 <AlertTriangle className="w-4 h-4 text-red-500" />}
                            </div>
                        </div>
                        
                        <div className="mt-3 flex gap-4 text-sm">
                            {Object.entries(indicator.metrics).map(([key, value]) => (
                                <div key={key} className="flex flex-col">
                                    <span className="text-gray-500 uppercase text-[10px] tracking-wider font-semibold">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    <span className="text-gray-200 font-medium">
                                        {typeof value === 'number' && (key.toLowerCase().includes('revenue') || key.toLowerCase().includes('expenses')) ? `$${value.toLocaleString()}` : String(value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {indicator.alerts && indicator.alerts.length > 0 && (
                        <div className="hidden lg:flex flex-col gap-2 border-l border-white/5 pl-6 min-w-[200px]">
                            {indicator.alerts.map((alert: string, i: number) => (
                                <div key={i} className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1.5 rounded flex items-center gap-1.5 border border-amber-500/20">
                                    <AlertTriangle className="w-3 h-3" />
                                    {alert}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
