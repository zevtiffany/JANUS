'use client';

import { Suspense } from 'react';
import { Card, MetricCard } from '@/components/ui/Cards';
import { Button, StatusBadge } from '@/components/ui/Elements';
import { Plus, ArrowUpRight, ArrowDownRight, FileText, CreditCard } from 'lucide-react';

const mockTransactions = [
  { id: '1', date: '2026-03-30', desc: 'Acme Corp Software License', amount: 5000, type: 'income', status: 'COMPLETED' },
  { id: '2', date: '2026-03-29', desc: 'AWS Cloud Hosting', amount: -1250, type: 'expense', status: 'COMPLETED' },
  { id: '3', date: '2026-03-28', desc: 'WeWork Office Rent', amount: -2400, type: 'expense', status: 'PENDING' },
  { id: '4', date: '2026-03-25', desc: 'Consulting Services', amount: 3500, type: 'income', status: 'COMPLETED' },
];

export default function FinancePage() {
  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Finance</h2>
          <p className="text-gray-400 mt-1">Manage accounts, invoices, and expenses.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={FileText}>Create Invoice</Button>
          <Button icon={Plus}>New Transaction</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard 
          title="Total Balance" 
          value="$145,200" 
          icon={CreditCard} 
          trend={{ value: 8.4, label: "vs last month", positive: true }} 
          color="blue"
        />
        <MetricCard 
          title="Total Income" 
          value="$45,800" 
          icon={ArrowUpRight} 
          trend={{ value: 12.1, label: "this month", positive: true }} 
          color="green"
        />
        <MetricCard 
          title="Total Expenses" 
          value="$12,400" 
          icon={ArrowDownRight} 
          trend={{ value: 2.4, label: "this month", positive: false }} 
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Transactions" action={<Button variant="ghost" size="sm">View All</Button>}>
          <div className="space-y-4">
            {mockTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-gray-200 font-medium text-sm">{tx.desc}</h4>
                    <p className="text-xs text-gray-500">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <h4 className={`font-semibold ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}${Math.abs(tx.amount).toLocaleString()}
                  </h4>
                  <StatusBadge status={tx.status} variant={tx.status === 'COMPLETED' ? 'green' : 'amber'} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Pending Invoices" action={<Button variant="ghost" size="sm">Manage</Button>}>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 bg-[#13151a] rounded-full flex items-center justify-center mb-4 border border-white/5">
              <FileText className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-gray-300 font-medium font-lg">No pending invoices</h3>
            <p className="text-gray-500 text-sm mt-1 max-w-xs">All your generated invoices have been paid. Create a new one to get started.</p>
            <Button className="mt-6" variant="secondary" size="sm">Create Invoice</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
