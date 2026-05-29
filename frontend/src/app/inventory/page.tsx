'use client';

import { Card, MetricCard } from '@/components/ui/Cards';
import { Button, StatusBadge } from '@/components/ui/Elements';
import { Plus, Package, Truck, AlertTriangle, Archive } from 'lucide-react';

const mockProducts = [
  { id: '1', sku: 'ELEC-001', name: 'Wireless Keyboard', stock: 120, status: 'IN_STOCK' },
  { id: '2', sku: 'ELEC-002', name: 'USB-C Hub', stock: 12, status: 'LOW_STOCK' },
  { id: '3', sku: 'OFF-001', name: 'A4 Paper Ream', stock: 500, status: 'IN_STOCK' },
  { id: '4', sku: 'RAW-001', name: 'Steel Sheet 4x8', stock: 4, status: 'CRITICAL' },
];

export default function InventoryPage() {
  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Inventory (Supply Chain)</h2>
          <p className="text-gray-400 mt-1">Track products, stock movements, and orders.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={Truck}>Receive Stock</Button>
          <Button icon={Plus}>Add Product</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Total Products" value="842" icon={Archive} color="blue" />
        <MetricCard title="Total Value" value="$42,850" icon={Package} color="green" />
        <MetricCard title="Low Stock Items" value="16" icon={AlertTriangle} color="amber" />
        <MetricCard title="Pending Orders" value="5" icon={Truck} color="purple" />
      </div>

      <Card title="Current Inventory List" action={<Button variant="ghost" size="sm">View All</Button>}>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-sm text-gray-400">
                <th className="pb-3 px-4 font-medium">SKU</th>
                <th className="pb-3 px-4 font-medium">Product Name</th>
                <th className="pb-3 px-4 font-medium">Stock Level</th>
                <th className="pb-3 px-4 font-medium">Status</th>
                <th className="pb-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockProducts.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-gray-300 text-sm">{p.sku}</td>
                  <td className="py-3 px-4 text-gray-200 font-medium text-sm">{p.name}</td>
                  <td className="py-3 px-4">
                    <span className="text-gray-300 font-medium">{p.stock}</span>
                    <span className="text-gray-500 text-xs ml-1">units</span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge 
                      status={p.status.replace('_', ' ')} 
                      variant={p.status === 'IN_STOCK' ? 'green' : p.status === 'LOW_STOCK' ? 'amber' : 'red'} 
                    />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
    </div>
  );
}
