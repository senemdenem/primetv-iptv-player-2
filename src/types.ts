/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Channel {
  id: string;
  name: string;
  logo: string;
  url: string;
  category: string;
  groupTitle?: string;
  tvgId?: string;
  tvgName?: string;
  epgId?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface EPGProgram {
  id: string;
  channelId: string;
  title: string;
  description: string;
  start: Date;
  stop: Date;
}

export interface Playlist {
  id: string;
  name: string;
  type: 'm3u' | 'xtream' | 'file';
  url?: string;
  username?: string;
  password?: string;
  lastUpdated: number;
}

export interface AppState {
  playlist: Playlist | null;
  channels: Channel[];
  categories: Category[];
  favorites: string[]; // Channel IDs
  recentlyWatched: string[]; // Channel IDs
  currentChannel: Channel | null;
  searchQuery: string;
  selectedCategory: string; // Category ID or 'all' | 'favorites' | 'recent'
  pin: string | null;
}
