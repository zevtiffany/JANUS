'use client';

import { Card, MetricCard } from '@/components/ui/Cards';
import { Button, StatusBadge } from '@/components/ui/Elements';
import { Plus, Briefcase, PlayCircle, CheckCircle, Clock } from 'lucide-react';

const mockProjects = [
  { id: '1', name: 'ERP Implementation', status: 'ACTIVE', progress: 65, tasks: 12, dueDate: '2026-06-30' },
  { id: '2', name: 'Website Redesign', status: 'ACTIVE', progress: 42, tasks: 8, dueDate: '2026-05-15' },
  { id: '3', name: 'Q2 Marketing Campaign', status: 'PLANNING', progress: 0, tasks: 5, dueDate: '2026-06-30' },
  { id: '4', name: 'Q1 Tax Filing', status: 'COMPLETED', progress: 100, tasks: 3, dueDate: '2026-04-10' },
];

export default function ProjectsPage() {
  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Projects</h2>
          <p className="text-gray-400 mt-1">Manage project tracking, tasks, and timesheets.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={Clock}>Log Time</Button>
          <Button icon={Plus}>New Project</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Total Projects" value="4" icon={Briefcase} color="blue" />
        <MetricCard title="Active Projects" value="2" icon={PlayCircle} color="green" />
        <MetricCard title="Completed" value="1" icon={CheckCircle} />
        <MetricCard title="Total Hours Logged" value="168.5" icon={Clock} color="purple" trend={{ value: 12, label: "this week", positive: true }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProjects.map(proj => (
          <Card key={proj.id} title={proj.name}>
            <div className="flex justify-between items-center mb-4">
              <StatusBadge 
                status={proj.status === 'ACTIVE' ? 'IN PROGRESS' : proj.status} 
                variant={proj.status === 'COMPLETED' ? 'green' : proj.status === 'ACTIVE' ? 'blue' : 'gray'} 
              />
              <span className="text-sm font-medium text-gray-400">{proj.progress}%</span>
            </div>
            
            <div className="w-full bg-[#13151a] rounded-full h-2 mb-6 border border-white/5">
              <div 
                className={`h-2 rounded-full ${proj.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                style={{ width: `${proj.progress}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center mt-2 border-t border-white/5 pt-4">
              <div className="text-sm">
                <p className="text-gray-500">Tasks</p>
                <p className="font-medium text-gray-200">{proj.tasks} total</p>
              </div>
              <div className="text-sm text-right">
                <p className="text-gray-500">Due Date</p>
                <p className="font-medium text-gray-200">{proj.dueDate}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
              <Button variant="secondary" size="sm" className="w-full">View Tasks</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
