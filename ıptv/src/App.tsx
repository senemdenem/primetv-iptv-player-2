/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';
import { Channel, Category, Playlist, AppState } from './types';
import { storage } from './services/dataService';
import { Login } from './components/Login';
import { VideoPlayer } from './components/VideoPlayer';
import { CategoryBar } from './components/CategoryBar';
import { ChannelGrid } from './components/ChannelGrid';
import { Search, Settings, Heart, Clock, Menu, X, PinOff, LogOut, Trash2, Globe, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { useTVNavigation } from './hooks/useTVNavigation';

export default function App() {
  const { t, i18n } = useTranslation();
  const [isReady, setIsReady] = useState(false);
  const [state, setState] = useState<AppState>({
    playlist: null,
    channels: [],
    categories: [],
    favorites: [],
    recentlyWatched: [],
    currentChannel: null,
    searchQuery: '',
    selectedCategory: 'all',
    pin: null,
  });

  const [showSettings, setShowSettings] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const playlist = storage.getPlaylist();
    const channels = storage.getChannels();
    const favorites = storage.getFavorites();
    const recent = storage.getRecent();
    const pin = storage.getPin();

    if (playlist && channels.length > 0) {
      const categoriesSet = new Set<string>();
      channels.forEach((c: Channel) => {
        if (c.category) categoriesSet.add(c.category);
      });
      
      const categories: Category[] = Array.from(categoriesSet).map(name => ({ id: name, name }));

      setState(prev => ({
        ...prev,
        playlist,
        channels,
        categories,
        favorites,
        recentlyWatched: recent,
        pin,
      }));
    }
    setIsReady(true);
  }, []);

  const handleLoginSuccess = (playlist: Playlist, channels: Channel[], categories: Category[]) => {
    storage.setPlaylist(playlist);
    storage.setChannels(channels);
    setState(prev => ({
      ...prev,
      playlist,
      channels,
      categories,
    }));
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setState(prev => {
      const exists = prev.favorites.includes(id);
      const newFavorites = exists 
        ? prev.favorites.filter(fid => fid !== id)
        : [...prev.favorites, id];
      storage.setFavorites(newFavorites);
      return { ...prev, favorites: newFavorites };
    });
  };

  const filteredChannels = useMemo(() => {
    let list = state.channels;
    if (state.selectedCategory === 'favorites') {
      list = list.filter(c => state.favorites.includes(c.id));
    } else if (state.selectedCategory === 'recent') {
      list = list.filter(c => state.recentlyWatched.includes(c.id));
    } else if (state.selectedCategory !== 'all') {
      list = list.filter(c => c.category === state.selectedCategory);
    }
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
    }
    return list;
  }, [state.channels, state.selectedCategory, state.favorites, state.recentlyWatched, state.searchQuery]);

  const { focusedId } = useTVNavigation(filteredChannels.map(c => c.id), 6);

  const selectChannel = (channel: Channel) => {
    setState(prev => {
      const newRecent = [channel.id, ...prev.recentlyWatched.filter(id => id !== channel.id)].slice(0, 50);
      storage.setRecent(newRecent);
      return {
        ...prev,
        currentChannel: channel,
        recentlyWatched: newRecent,
      };
    });
    // For smaller screens, maybe scroll to top where player is
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const logout = () => {
    storage.clear();
    setState({
      playlist: null,
      channels: [],
      categories: [],
      favorites: [],
      recentlyWatched: [],
      currentChannel: null,
      searchQuery: '',
      selectedCategory: 'all',
      pin: null,
    });
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.img 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}
          src="/logo.png" 
          alt="PrimeTV" 
          className="w-32 h-auto" 
        />
      </div>
    );
  }

  if (!state.playlist) {
    return <Login onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-600 selection:text-white">
      {/* Header / Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 to-transparent px-4 md:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-white/10 rounded-md md:hidden border border-white/5"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-4 transition-transform hover:scale-105">
              <img src="/logo.png" alt="PrimeTV" className="w-14 h-14 object-contain drop-shadow-[0_0_12px_rgba(0,242,255,0.4)]" />
              <h1 className="text-2xl font-black tracking-tighter uppercase hidden sm:block">
                <span className="bg-gradient-to-r from-[#00f2ff] to-[#0072ff] bg-clip-text text-transparent">Prime</span>
                <span className="text-white ml-0.5">TV</span>
              </h1>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6 text-sm font-bold uppercase tracking-wider text-gray-500">
            <button className="text-white border-b-2 border-cyan-500 pb-1">Live TV</button>
            <button className="hover:text-white transition-colors">Movies</button>
            <button className="hover:text-white transition-colors">Series</button>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6 flex-1 max-w-lg px-4 md:px-8">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={16} />
            <input 
              type="text"
              placeholder={t('search')}
              className="w-full bg-white/5 border border-white/5 rounded-full pl-10 pr-4 py-2 focus:outline-none focus:border-white/20 transition-all text-sm placeholder:text-zinc-600"
              value={state.searchQuery}
              onChange={(e) => setState({ ...state, searchQuery: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
             onClick={() => setShowSettings(true)}
             className="p-2.5 hover:bg-white/10 rounded-md transition-colors border border-white/5"
          >
            <Settings size={20} className="text-zinc-400 hover:text-white" />
          </button>
          <div className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold">
            TV
          </div>
        </div>
      </nav>

      <main className="pt-24 px-4 md:px-8 max-w-[1920px] mx-auto pb-24">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left Column: Player and Selected Details */}
          <div className="xl:col-span-8 space-y-6">
            <VideoPlayer channel={state.currentChannel} />
            
            {state.currentChannel && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/40 p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center overflow-hidden border border-white/10 p-2">
                    <img 
                      src={state.currentChannel.logo || '/logo.png'} 
                      alt="" 
                      className="max-w-full max-h-full object-contain" 
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{state.currentChannel.name}</h2>
                    <div className="flex items-center gap-3 text-zinc-400 text-sm">
                      <span className="px-2 py-0.5 bg-zinc-800 rounded uppercase tracking-wider text-[10px] font-bold text-blue-400 border border-blue-400/20">HLS</span>
                      <span>{state.currentChannel.category}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <button 
                    onClick={(e) => toggleFavorite(state.currentChannel!.id, e)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all ${
                      state.favorites.includes(state.currentChannel.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                   >
                     <Heart size={18} fill={state.favorites.includes(state.currentChannel.id) ? "white" : "none"} />
                     {state.favorites.includes(state.currentChannel.id) ? 'Favorited' : 'Favorite'}
                   </button>
                </div>
              </motion.div>
            )}

            {/* TV Guide (EPG Snapshot) Placeholder */}
            {state.currentChannel && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-5 bg-[#0a0a0a] shadow-xl border border-white/5 rounded-md">
                    <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">{t('nowPlaying')}</h4>
                    <div className="flex justify-between items-end mb-2">
                       <p className="font-bold text-lg leading-tight">Sky Sports Premier League</p>
                       <span className="text-[10px] font-bold text-cyan-500 uppercase">Live</span>
                    </div>
                    <p className="text-xs text-zinc-500 mb-3">Liverpool vs Manchester City</p>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                       <div className="w-2/3 h-full bg-cyan-600 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                    </div>
                 </div>
                 <div className="p-5 bg-black/40 border border-white/5 rounded-md opacity-40">
                    <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">{t('next')}</h4>
                    <div className="flex justify-between items-end mb-2">
                       <p className="font-bold text-lg leading-tight">Match of the Day</p>
                       <span className="text-[10px] font-bold text-zinc-500 uppercase">18:30</span>
                    </div>
                    <p className="text-xs text-zinc-500">Football news and analysis</p>
                 </div>
              </div>
            )}
          </div>

          {/* Right Column: Categories and Grid */}
          <div className="xl:col-span-4 flex flex-col h-[70vh] xl:h-[calc(100vh-140px)]">
             <CategoryBar 
               categories={state.categories}
               selectedId={state.selectedCategory}
               onSelect={(id) => setState({ ...state, selectedCategory: id })}
               favoritesCount={state.favorites.length}
               recentCount={state.recentlyWatched.length}
             />
             <div className="mt-4 flex-1 overflow-hidden">
               <ChannelGrid 
                 channels={filteredChannels}
                 favorites={state.favorites}
                 onSelect={selectChannel}
                 onToggleFavorite={toggleFavorite}
                 focusedId={focusedId}
               />
             </div>
          </div>
        </div>
      </main>

      {/* Remote Navigation Info Footer */}
      <footer className="fixed bottom-0 left-0 right-0 h-12 bg-black flex items-center justify-center gap-8 md:gap-12 text-[10px] text-gray-500 uppercase tracking-widest font-black z-40 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span className="bg-white/10 px-1.5 py-0.5 rounded border border-white/10 text-white font-sans">OK</span> 
          <span>Play</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-white/10 px-1.5 py-0.5 rounded border border-white/10 text-white font-sans">EPG</span> 
          <span>Guide</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-cyan-600/20 px-1.5 py-0.5 rounded border border-cyan-600/50 text-cyan-500 font-sans">REC</span> 
          <span>Record</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="bg-white/10 px-1.5 py-0.5 rounded border border-white/10 text-white font-sans">INFO</span> 
          <span>Settings</span>
        </div>
      </footer>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setShowSettings(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-900 rounded-[32px] border border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                 <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">{t('settings')}</h2>
                    <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                      <X size={24} />
                    </button>
                 </div>

                  <div className="space-y-2">
                    <div className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors group">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                            <Globe size={22} className="text-blue-500" />
                          </div>
                          <div className="text-left">
                            <h4 className="font-semibold">{t('language')}</h4>
                            <p className="text-xs text-zinc-500">{i18n.language === 'en' ? 'English' : 'Türkçe'}</p>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          <button 
                            onClick={() => i18n.changeLanguage('en')}
                            className={`px-3 py-1 rounded-md text-xs font-bold ${i18n.language === 'en' ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-500'}`}
                          >EN</button>
                          <button 
                            onClick={() => i18n.changeLanguage('tr')}
                            className={`px-3 py-1 rounded-md text-xs font-bold ${i18n.language === 'tr' ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-500'}`}
                          >TR</button>
                       </div>
                    </div>

                    <div className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors group">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                            <Heart size={22} className="text-purple-500" />
                          </div>
                          <div className="text-left">
                            <h4 className="font-semibold">{t('parentalControl')}</h4>
                            <p className="text-xs text-zinc-500">PIN locked categories</p>
                          </div>
                       </div>
                       <ChevronRight size={20} className="text-zinc-600" />
                    </div>

                    <button 
                      onClick={logout}
                      className="w-full flex items-center justify-between p-4 bg-red-500/5 hover:bg-red-500/10 rounded-2xl transition-colors group border border-red-500/10 mt-6"
                    >
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-red-500/10 rounded-xl">
                            <LogOut size={22} className="text-red-500" />
                          </div>
                          <div className="text-left">
                            <h4 className="font-semibold text-red-500">Logout</h4>
                            <p className="text-xs text-red-500/60">Clear all playlist data</p>
                          </div>
                       </div>
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm md:hidden"
               onClick={() => setIsSidebarOpen(false)}
            />
            <motion.div 
               initial={{ x: '-100%' }}
               animate={{ x: 0 }}
               exit={{ x: '-100%' }}
               className="fixed inset-y-0 left-0 z-[101] w-80 bg-zinc-900 p-6 md:hidden"
            >
              <div className="flex justify-between items-center mb-8">
                 <img src="/logo.png" alt="" className="h-8 w-auto" />
                 <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                   <X size={24} />
                 </button>
              </div>
              <div className="space-y-4">
                 <button onClick={() => { setState({...state, selectedCategory: 'all'}); setIsSidebarOpen(false); }} className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-2xl font-semibold">
                    <Globe size={20} /> All Channels
                 </button>
                 <button onClick={() => { setState({...state, selectedCategory: 'favorites'}); setIsSidebarOpen(false); }} className="w-full flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl font-semibold text-zinc-400">
                    <Heart size={20} /> Favorites
                 </button>
                 <button onClick={() => { setState({...state, selectedCategory: 'recent'}); setIsSidebarOpen(false); }} className="w-full flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl font-semibold text-zinc-400">
                    <Clock size={20} /> Recently Watched
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
