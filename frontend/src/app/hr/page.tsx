'use client';

import { useState, useEffect } from 'react';
import { Card, MetricCard } from '@/components/ui/Cards';
import { Button, StatusBadge } from '@/components/ui/Elements';
import { Users, UserPlus, Building, Calendar, MoreVertical, Coffee, X } from 'lucide-react';
import api from '@/lib/api';

export default function HRPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(({
      totalEmployees: 0,
      activeEmployees: 0,
      departments: 0,
      attendanceToday: 0
  }));
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmp, setNewEmp] = useState({ firstName: '', lastName: '', email: '', position: '', departmentId: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const sumRes = await api.get('/hr/summary') as any;
      const empRes = await api.get('/hr/employees') as any;
      if (sumRes.success) setSummary(sumRes.data);
      if (empRes.success) setEmployees(empRes.data);
    } catch (err) {
      console.error('Failed to fetch HR data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    // Assuming backend has a POST /hr/employees or we just close modal for now
    alert('Employee API integration pending for POST.');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Human Resources</h2>
          <p className="text-gray-400 mt-1">Manage personnel, attendance, and departments.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={Calendar}>Time Off Options</Button>
          <Button icon={UserPlus} onClick={() => setIsModalOpen(true)}>Add Employee</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Total Employees" value={loading ? '...' : summary.totalEmployees.toString()} icon={Users} color="blue" trend={{ value: 2, label: "this month", positive: true }} />
        <MetricCard title="Active Departments" value={loading ? '...' : summary.departments.toString()} icon={Building} color="purple" />
        <MetricCard title="Attendance Today" value={loading ? '...' : summary.attendanceToday.toString()} icon={Calendar} color="amber" />
        <MetricCard title="Open Requisitions" value="5" icon={UserPlus} color="green" />
      </div>

      <div className="grid gap-6">
        <Card title="Employee Directory">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 border-b border-white/5 uppercase">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Join Date</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-900/40 font-bold text-blue-500 flex items-center justify-center">
                                {emp.user?.firstName?.charAt(0) || 'U'}
                            </div>
                            {emp.user?.firstName} {emp.user?.lastName}
                            <span className="text-xs text-gray-500 ml-1">({emp.employeeCode})</span>
                        </div>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{emp.position}</td>
                    <td className="py-3 px-4 text-gray-400">{emp.department?.name || '-'}</td>
                    <td className="py-3 px-4">
                      <StatusBadge 
                        status={emp.status} 
                        variant={emp.status === 'ACTIVE' ? 'green' : 'amber'} 
                      />
                    </td>
                    <td className="py-3 px-4 text-gray-400">{new Date(emp.hireDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-gray-500 hover:text-white transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && employees.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-500">No employees found. Check DB connection.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#181b21] rounded-2xl w-full max-w-md border border-white/10 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Add New Employee</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleAddEmployee} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">First Name</label>
                        <input type="text" className="w-full bg-[#13151a] border border-white/10 rounded-lg p-2.5 text-white" value={newEmp.firstName} onChange={(e) => setNewEmp({...newEmp, firstName: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Last Name</label>
                        <input type="text" className="w-full bg-[#13151a] border border-white/10 rounded-lg p-2.5 text-white" value={newEmp.lastName} onChange={(e) => setNewEmp({...newEmp, lastName: e.target.value})} />
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Email</label>
                    <input type="email" className="w-full bg-[#13151a] border border-white/10 rounded-lg p-2.5 text-white" value={newEmp.email} onChange={(e) => setNewEmp({...newEmp, email: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Position</label>
                    <input type="text" className="w-full bg-[#13151a] border border-white/10 rounded-lg p-2.5 text-white" value={newEmp.position} onChange={(e) => setNewEmp({...newEmp, position: e.target.value})} />
                </div>
                <Button type="submit" className="w-full mt-2">Save Employee</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
