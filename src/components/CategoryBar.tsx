/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Category } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CategoryBarProps {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
  favoritesCount: number;
  recentCount: number;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({ 
  categories, 
  selectedId, 
  onSelect,
  favoritesCount,
  recentCount
}) => {
  const { t } = useTranslation();

  const specialCategories = [
    { id: 'all', name: t('all') },
    { id: 'favorites', name: `${t('favorites')} (${favoritesCount})` },
    { id: 'recent', name: `${t('recent')} (${recentCount})` },
  ];

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
      {specialCategories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            "flex-shrink-0 px-5 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap",
            selectedId === cat.id 
              ? "bg-white text-black border-white" 
              : "bg-white/5 text-zinc-400 border-white/10 hover:border-white/20 hover:text-white"
          )}
        >
          {cat.name}
        </button>
      ))}
      <div className="h-6 w-[1px] bg-white/10 flex-shrink-0 mx-2" />
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            "flex-shrink-0 px-5 py-1.5 rounded-full text-xs font-medium transition-all border whitespace-nowrap",
            selectedId === cat.id 
              ? "bg-white text-black border-white" 
              : "bg-white/5 text-zinc-400 border-white/10 hover:border-white/20 hover:text-white"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};
