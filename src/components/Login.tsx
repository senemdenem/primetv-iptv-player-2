/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout, Globe, FileUp, Database, Loader2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { parseM3U } from '../services/dataService';
import { Channel, Category, Playlist } from '../types';

interface LoginProps {
  onSuccess: (playlist: Playlist, channels: Channel[], categories: Category[]) => void;
}

type LoginType = 'm3u' | 'xtream' | 'file';

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const [type, setType] = useState<LoginType>('m3u');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    username: '',
    password: '',
  });

  const handleM3U = async () => {
    setLoading(true);
    try {
      const response = await fetch(formData.url);
      const text = await response.text();
      const { channels, categories } = parseM3U(text);
      const playlist: Playlist = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name || 'M3U Playlist',
        type: 'm3u',
        url: formData.url,
        lastUpdated: Date.now(),
      };
      onSuccess(playlist, channels, categories);
    } catch (error) {
      alert('Error loading M3U URL');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { channels, categories } = parseM3U(text);
      const playlist: Playlist = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: 'file',
        lastUpdated: Date.now(),
      };
      onSuccess(playlist, channels, categories);
      setLoading(false);
    };
    reader.readAsText(file);
  };

  const menuItems = [
    { id: 'm3u', icon: Globe, label: t('m3uUrl') },
    { id: 'xtream', icon: Database, label: t('xtreamCodes') },
    { id: 'file', icon: FileUp, label: t('localFile') },
  ];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side: Branding */}
        <div className="hidden md:flex flex-col gap-6">
          <img src="/logo.png" alt="PrimeTV" className="w-48 h-auto" />
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{t('appName')}</h1>
            <p className="text-zinc-500 text-lg">Experience IPTV like never before with a beautiful Netflix-style interface.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-zinc-900 rounded-xl border border-white/5">
                <Layout className="text-blue-500 mb-2" />
                <h4 className="text-white font-medium">Modern UI</h4>
             </div>
             <div className="p-4 bg-zinc-900 rounded-xl border border-white/5">
                <Globe className="text-green-500 mb-2" />
                <h4 className="text-white font-medium">Fast Streaming</h4>
             </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-600" />
          <div className="flex gap-2 mb-8 bg-black/40 p-1 rounded-md">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setType(item.id as LoginType)}
                className={`flex-1 flex flex-col items-center gap-2 py-3 px-2 rounded transition-all ${
                  type === item.id ? 'bg-zinc-800 text-white shadow-lg border border-white/10' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <item.icon size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={type}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {type === 'm3u' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">{t('playlistName')}</label>
                    <input
                      type="text"
                      className="w-full bg-black/40 border border-white/5 rounded-md px-4 py-3 text-white focus:outline-none focus:border-cyan-600/50 transition-colors text-sm"
                      placeholder="My Premium List"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">{t('m3uUrl')}</label>
                    <input
                      type="url"
                      className="w-full bg-black/40 border border-white/5 rounded-md px-4 py-3 text-white focus:outline-none focus:border-cyan-600/50 transition-colors text-sm"
                      placeholder="https://provider.com/playlist.m3u"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    />
                  </div>
                  <button
                    disabled={loading || !formData.url}
                    onClick={handleM3U}
                    className="w-full bg-cyan-600 text-white font-black uppercase tracking-[0.2em] py-4 rounded hover:bg-cyan-700 transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(6,182,212,0.3)] mt-6"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : t('connect')}
                    {!loading && <ChevronRight size={18} />}
                  </button>
                </>
              )}

              {type === 'xtream' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">{t('hostUrl')}</label>
                    <input
                      type="url"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                      placeholder="http://provider.com:8080"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-400">{t('username')}</label>
                      <input
                        type="text"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-400">{t('password')}</label>
                      <input
                        type="password"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                      />
                    </div>
                  </div>
                  <p className="text-zinc-500 text-xs text-center italic">Xtream Codes support coming in full version.</p>
                  <button className="w-full bg-white/10 text-zinc-500 font-bold py-4 rounded-xl cursor-not-allowed">
                    {t('connect')}
                  </button>
                </div>
              )}

              {type === 'file' && (
                <div className="space-y-6 py-8">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl p-12 text-center hover:border-white/30 transition-all cursor-pointer relative">
                    <input
                      type="file"
                      accept=".m3u,.m3u8"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileUpload}
                    />
                    <FileUp size={48} className="text-zinc-600 mb-4" />
                    <h3 className="text-white font-semibold mb-2">Click or drag M3U file</h3>
                    <p className="text-zinc-500 text-sm">Support for .m3u and .m3u8 files</p>
                  </div>
                  {loading && (
                    <div className="flex items-center justify-center gap-2 text-white">
                      <Loader2 className="animate-spin" />
                      <span>Parsing channels...</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
