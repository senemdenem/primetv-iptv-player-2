/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useCallback } from 'react';

export const useTVNavigation = (itemIds: string[], columnCount: number) => {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
        setFocusedIndex(prev => Math.min(prev + 1, itemIds.length - 1));
        break;
      case 'ArrowLeft':
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'ArrowDown':
        setFocusedIndex(prev => Math.min(prev + columnCount, itemIds.length - 1));
        break;
      case 'ArrowUp':
        setFocusedIndex(prev => Math.max(prev - columnCount, 0));
        break;
      case 'Enter':
        // Handle select in the component
        break;
    }
  }, [itemIds.length, columnCount]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { focusedIndex, focusedId: itemIds[focusedIndex], setFocusedIndex };
};
