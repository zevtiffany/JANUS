'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Elements';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { setAuth } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    try {
      const response = await api.post('/auth/login', { email, password }) as any;
      if (response.success) {
          setAuth(response.data.user, response.data.accessToken);
          router.push('/');
      }
    } catch (err: any) {
      setErrorMsg(err.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-[#0f1115] to-[#1a1f2e]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-white text-3xl shadow-lg shadow-blue-500/30">
            J
          </div>
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-white mb-2">
          JANUS ERP
        </h2>
        <p className="text-center text-sm text-gray-400">
          Joint Administration & Networked Unified System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#181b21] py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-white/5 mx-4 sm:mx-0">
          {errorMsg && (
             <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {errorMsg}
             </div>
          )}
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-white/10 bg-[#13151a] px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
                  placeholder="admin@janus.dev"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-white/10 bg-[#13151a] px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-[#13151a]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-500 hover:text-blue-400">
                  Forgot your password?
                </a>
              </div>
            </div>

            <Button className="w-full" size="lg" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[#181b21] px-2 text-gray-500">Demo Credentials</span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-center text-xs text-gray-400">
              <div className="bg-[#13151a] p-2 rounded border border-white/5">
                <p className="font-medium text-gray-300">Admin</p>
                <p>admin@janus.dev</p>
                <p>admin123</p>
              </div>
              <div className="bg-[#13151a] p-2 rounded border border-white/5">
                <p className="font-medium text-gray-300">Manager</p>
                <p>manager@janus.dev</p>
                <p>admin123</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
