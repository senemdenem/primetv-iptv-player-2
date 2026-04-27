/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Channel } from '../types';
import { ChannelCard } from './ChannelCard';

interface ChannelGridProps {
  channels: Channel[];
  favorites: string[];
  onSelect: (channel: Channel) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  focusedId?: string;
}

export const ChannelGrid: React.FC<ChannelGridProps> = ({
  channels,
  favorites,
  onSelect,
  onToggleFavorite,
  focusedId
}) => {
  if (channels.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 py-20">
        <p className="text-xl font-medium">No channels found</p>
        <p className="text-sm">Try searching for something else or change category</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-4 p-2">
        {channels.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            isFavorite={favorites.includes(channel.id)}
            onSelect={onSelect}
            onToggleFavorite={onToggleFavorite}
            isFocused={focusedId === channel.id}
          />
        ))}
      </div>
    </div>
  );
};
