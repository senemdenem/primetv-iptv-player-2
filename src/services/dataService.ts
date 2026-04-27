/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Channel, Category } from '../types';

export const parseM3U = (data: string): { channels: Channel[], categories: Category[] } => {
  const lines = data.split('\n');
  const channels: Channel[] = [];
  const categoryMap = new Map<string, string>();

  let currentChannel: Partial<Channel> = {};

  for (let line of lines) {
    line = line.trim();
    if (line.startsWith('#EXTINF:')) {
      const nameMatch = line.match(/,(.*)$/);
      const groupMatch = line.match(/group-title="(.*?)"/);
      const logoMatch = line.match(/tvg-logo="(.*?)"/);
      const tvgIdMatch = line.match(/tvg-id="(.*?)"/);

      currentChannel = {
        name: nameMatch ? nameMatch[1].trim() : 'Unknown',
        groupTitle: groupMatch ? groupMatch[1] : 'Mixed',
        logo: logoMatch ? logoMatch[1] : '',
        tvgId: tvgIdMatch ? tvgIdMatch[1] : '',
      };
      
      if (currentChannel.groupTitle) {
        categoryMap.set(currentChannel.groupTitle, currentChannel.groupTitle);
      }
    } else if (line.startsWith('http') || line.startsWith('rtmp') || line.startsWith('rtsp')) {
      if (currentChannel.name) {
        channels.push({
          id: Math.random().toString(36).substr(2, 9),
          name: currentChannel.name,
          logo: currentChannel.logo || '',
          url: line,
          category: currentChannel.groupTitle || 'Mixed',
          ...currentChannel
        } as Channel);
      }
      currentChannel = {};
    }
  }

  const categories: Category[] = Array.from(categoryMap.keys()).map(name => ({
    id: name,
    name
  }));

  return { channels, categories };
};

export const storage = {
  getPlaylist: () => {
    const data = localStorage.getItem('primetv_playlist');
    return data ? JSON.parse(data) : null;
  },
  setPlaylist: (playlist: any) => localStorage.setItem('primetv_playlist', JSON.stringify(playlist)),
  getChannels: () => {
    const data = localStorage.getItem('primetv_channels');
    return data ? JSON.parse(data) : [];
  },
  setChannels: (channels: Channel[]) => localStorage.setItem('primetv_channels', JSON.stringify(channels)),
  getFavorites: () => {
    const data = localStorage.getItem('primetv_favorites');
    return data ? JSON.parse(data) : [];
  },
  setFavorites: (favorites: string[]) => localStorage.setItem('primetv_favorites', JSON.stringify(favorites)),
  getRecent: () => {
    const data = localStorage.getItem('primetv_recent');
    return data ? JSON.parse(data) : [];
  },
  setRecent: (recent: string[]) => localStorage.setItem('primetv_recent', JSON.stringify(recent)),
  getPin: () => localStorage.getItem('primetv_pin'),
  setPin: (pin: string) => localStorage.setItem('primetv_pin', pin),
  clear: () => localStorage.clear(),
};
