/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Heart, Play } from 'lucide-react';
import { Channel } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChannelCardProps {
  channel: Channel;
  isFavorite: boolean;
  onSelect: (channel: Channel) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  isFocused?: boolean;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({ 
  channel, 
  isFavorite, 
  onSelect, 
  onToggleFavorite,
  isFocused 
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative group aspect-[16/9] bg-[#0a0a0a] rounded-md overflow-hidden cursor-pointer border-2 border-white/5 transition-all duration-300",
        isFocused ? "border-cyan-500 scale-105 z-10 shadow-[0_0_20px_rgba(6,182,212,0.3)]" : "hover:border-white/20"
      )}
      onClick={() => onSelect(channel)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#00f2ff]/10 to-black opacity-40" />
      <img
        src={channel.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name)}&background=27272a&color=fff&size=512`}
        alt={channel.name}
        className="w-full h-full object-contain opacity-60 group-hover:opacity-100 transition-opacity p-4"
        referrerPolicy="no-referrer"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-between p-3">
        <div className="flex justify-between items-start">
           <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
             {channel.groupTitle?.substring(0, 3) || 'TV'}
           </span>
           <button
              onClick={(e) => onToggleFavorite(channel.id, e)}
              className={cn(
                "p-1.5 rounded-full backdrop-blur-md transition-colors",
                isFavorite ? "text-cyan-400 bg-cyan-400/10" : "text-white/60 bg-white/5 hover:text-white"
              )}
            >
              <Heart size={12} fill={isFavorite ? "currentColor" : "none"} />
            </button>
        </div>

        <div>
          <h3 className="text-white text-xs font-bold truncate mb-1">
            {channel.name}
          </h3>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
             <div className="w-1/3 h-full bg-cyan-500" />
          </div>
        </div>
      </div>

      {/* Hover/Focus Play Icon */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center opacity-0 transition-opacity",
        (isFocused || "group-hover") && "opacity-100"
      )}>
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center translate-y-2 group-hover:translate-y-0 transition-transform">
          <Play size={20} fill="black" className="ml-1" />
        </div>
      </div>
    </motion.div>
  );
};
