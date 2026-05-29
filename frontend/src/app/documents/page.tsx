'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Cards';
import { Button } from '@/components/ui/Elements';
import { Folder, File, UploadCloud, Search, Download, MoreHorizontal, X } from 'lucide-react';
import api from '@/lib/api';

export default function DocumentsPage() {
  const [folders, setFolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
      try {
          const folderRes = await api.get('/documents/folders') as any;
          const fileRes  = await api.get('/documents/files') as any;
          
          if(folderRes.success) setFolders(folderRes.data);
          if(fileRes.success) setFiles(fileRes.data);
      } catch (err) { console.error('Error fetching docs', err); }
      finally { setLoading(false); }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const res = await api.post('/documents/folders', { name: newFolderName }) as any;
          if (res.success) {
              setFolders([...folders, { ...res.data, _count: { items: 0 } }]);
              setIsModalOpen(false);
              setNewFolderName('');
          }
      } catch (err) { alert('Failed to create folder'); }
  };

  return (
    <div className="space-y-6 pb-20 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Documents</h2>
          <p className="text-gray-400 mt-1">Secure company file storage and sharing.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={Folder} onClick={() => setIsModalOpen(true)}>New Folder</Button>
          <Button icon={UploadCloud}>Upload File</Button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
        <input 
            type="text" 
            placeholder="Search files and folders..." 
            className="w-full bg-[#13151a] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Folders</h3>
        {folders.length === 0 && !loading && <span className="text-gray-500">No folders inside this path.</span>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {folders.map((folder) => (
                <div key={folder.id} className="bg-[#13151a] border border-white/5 rounded-xl p-4 hover:border-blue-500/50 cursor-pointer transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Folder className="w-6 h-6 text-blue-500 group-hover:text-blue-400 transition-colors" />
                        </div>
                        <button className="text-gray-600 hover:text-white"><MoreHorizontal className="w-5 h-5" /></button>
                    </div>
                    <h4 className="font-medium text-gray-200">{folder.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{folder._count?.documents || 0} items</p>
                </div>
            ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-white mb-4">Recent Files</h3>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 border-b border-white/5 uppercase">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Modified</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-200 flex items-center gap-3">
                        <File className="w-4 h-4 text-gray-400" />
                        {file.name}
                    </td>
                    <td className="py-3 px-4 text-gray-400">{file.mimeType}</td>
                    <td className="py-3 px-4 text-gray-400">{(file.size / 1024).toFixed(1)} KB</td>
                    <td className="py-3 px-4 text-gray-400">{new Date(file.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right flex justify-end gap-2">
                      <button className="text-gray-500 hover:text-blue-400 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {files.length === 0 && !loading && <tr><td colSpan={5} className="py-8 text-center text-gray-500">No files found.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      
      {/* New Folder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#181b21] rounded-2xl w-full max-w-sm border border-white/10 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Create Folder</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleCreateFolder} className="space-y-4">
                <div>
                    <input type="text" placeholder="Folder Name" required className="w-full bg-[#13151a] border border-white/10 rounded-lg p-2.5 text-white" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
                </div>
                <Button type="submit" className="w-full mt-2">Save</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
