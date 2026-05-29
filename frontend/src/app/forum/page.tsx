'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Cards';
import { Button } from '@/components/ui/Elements';
import { Hash, MessageSquare, Plus, Bell, MoreVertical, Send, User, X } from 'lucide-react';
import api from '@/lib/api';

export default function ForumPage() {
  const [channels, setChannels] = useState<any[]>([]);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Thread Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (activeChannel) {
        fetchThreads(activeChannel);
    }
  }, [activeChannel]);

  const fetchChannels = async () => {
    try {
      const res = await api.get('/forum/channels') as any;
      if (res.success && res.data.length > 0) {
        setChannels(res.data);
        setActiveChannel(res.data[0].id);
      }
    } catch (err) { console.error('Error fetching channels', err); }
      finally { setLoading(false); }
  };

  const fetchThreads = async (channelId: string) => {
    try {
      const res = await api.get(`/forum/channels/${channelId}/threads`) as any;
      if (res.success) {
        setThreads(res.data);
      }
    } catch (err) { console.error('Error fetching threads', err); }
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChannel) return;
    try {
        const payload = { title: newThreadTitle, content: newThreadContent };
        const res = await api.post(`/forum/channels/${activeChannel}/threads`, payload) as any;
        if(res.success) {
            setThreads([res.data, ...threads]); // Prepend new thread
            setIsModalOpen(false);
            setNewThreadTitle('');
            setNewThreadContent('');
        }
    } catch (err) {
        alert('Failed to create thread. Are you logged in?');
        console.error(err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] text-white w-full rounded-xl overflow-hidden border border-white/5 mx-[-20px] lg:mx-0 lg:w-full">
        {/* Sidebar */}
        <div className="w-64 bg-[#13151a] border-r border-white/5 flex flex-col hidden md:flex">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-semibold text-lg">Channels</h3>
                <Plus className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {channels.map(channel => (
                    <div 
                        key={channel.id}
                        onClick={() => setActiveChannel(channel.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${activeChannel === channel.id ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
                    >
                        <Hash className="w-4 h-4" />
                        <span className="font-medium">{channel.name}</span>
                        {channel.unread && <div className="ml-auto w-2 h-2 rounded-full bg-blue-500"></div>}
                    </div>
                ))}
            </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 bg-black/40 flex flex-col relative">
            {/* Header */}
            <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between bg-[#13151a]">
                <div className="flex items-center gap-2">
                    <Hash className="w-6 h-6 text-gray-400" />
                    <h2 className="text-xl font-bold tracking-tight">
                        {channels.find(c => c.id === activeChannel)?.name || 'channel'}
                    </h2>
                </div>
                <div className="flex gap-4 text-gray-400 items-center">
                    <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>New Thread</Button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {threads.length === 0 && !loading && (
                     <div className="text-gray-500 text-center py-10">No threads here yet. Start the conversation!</div>
                )}
                {threads.map(thread => (
                    <div key={thread.id} className="flex gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0">
                            {thread.author?.firstName?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="font-semibold text-gray-200">
                                    {thread.author?.firstName} {thread.author?.lastName}
                                </span>
                                <span className="text-xs text-gray-500">{new Date(thread.createdAt).toLocaleTimeString()}</span>
                            </div>
                            <h4 className="text-md font-medium text-blue-400 mb-1">{thread.title}</h4>
                            <p className="text-gray-300 leading-relaxed text-sm">
                                {thread.content}
                            </p>
                            
                            <div className="mt-3 flex items-center gap-4 text-xs font-medium text-gray-500">
                                <span className="flex items-center gap-1 hover:text-blue-400 cursor-pointer transition-colors">
                                    <MessageSquare className="w-4 h-4" /> {thread._count?.comments || 0} Replies
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* New Thread Modal */}
            {isModalOpen && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                  <div className="bg-[#181b21] rounded-2xl w-full max-w-lg border border-white/10 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Create New Thread</h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5"/></button>
                    </div>
                    <form onSubmit={handleCreateThread} className="space-y-4">
                        <div>
                            <input 
                                required
                                type="text" 
                                placeholder="Thread Title"
                                className="w-full bg-[#13151a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" 
                                value={newThreadTitle} 
                                onChange={(e) => setNewThreadTitle(e.target.value)} 
                            />
                        </div>
                        <div>
                            <textarea 
                                required
                                placeholder="Write your message here..."
                                rows={5}
                                className="w-full bg-[#13151a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 resize-none" 
                                value={newThreadContent} 
                                onChange={(e) => setNewThreadContent(e.target.value)} 
                            />
                        </div>
                        <Button type="submit" className="w-full mt-2">Post Thread</Button>
                    </form>
                  </div>
                </div>
            )}
        </div>
    </div>
  );
}
