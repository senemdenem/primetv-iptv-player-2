/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Loader2, Maximize, Play, Pause, Volume2, RotateCcw } from 'lucide-react';
import { Channel } from '../types';
import { useTranslation } from 'react-i18next';

interface VideoPlayerProps {
  channel: Channel | null;
  onFullScreen?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ channel, onFullScreen }) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (!channel || !videoRef.current) return;

    const video = videoRef.current;
    setLoading(true);
    setError(null);

    // Stop current hls
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        highBufferWatchdogPeriod: 2,
        fragLoadingMaxRetry: 5,
      });
      hlsRef.current = hls;
      hls.loadSource(channel.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {
          // Auto-play might be blocked
          setIsPlaying(false);
        });
        setLoading(false);
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setError(t('errorLoading'));
              setLoading(false);
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS for Safari
      video.src = channel.url;
      video.addEventListener('loadedmetadata', () => {
        video.play();
        setLoading(false);
      });
      video.addEventListener('error', () => {
        setError(t('errorLoading'));
        setLoading(false);
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [channel, t]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const retry = () => {
    if (!channel) return;
    const url = channel.url;
    // Simple way to trigger effect again
    // For a real app, I'd have a more robust retry logic
  };

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden group shadow-2xl">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        playsInline
      />

      {/* Overlay UI */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-6">
        <div className="flex justify-between items-start">
          <div className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded border border-white/10">
            <span className="text-white text-sm font-bold uppercase tracking-tight">{channel?.name}</span>
          </div>
          <button 
            onClick={onFullScreen}
            className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors border border-white/10"
          >
            <Maximize size={20} />
          </button>
        </div>

        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-cyan-600 text-[10px] font-bold rounded">LIVE</span>
                <span className="text-white text-xs font-bold tracking-widest uppercase opacity-80">{t('buffering')}</span>
             </div>
             <div className="w-64 md:w-96 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-cyan-600" />
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={togglePlay}
              className="p-4 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors border border-white/10"
            >
              {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
            </button>
            <div className="hidden md:flex items-center gap-2 text-white">
              <Volume2 size={20} />
              <div className="w-16 h-1 bg-white/20 rounded-full relative">
                <div className="absolute inset-0 bg-white rounded-full w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-white text-xs font-black uppercase tracking-[0.2em]">{t('buffering')}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90">
          <div className="flex flex-col items-center gap-4 text-center p-6 max-w-sm">
            <div className="w-16 h-16 bg-cyan-600/10 rounded-full flex items-center justify-center border border-cyan-600">
               <RotateCcw className="text-cyan-500 w-8 h-8" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight mb-1">{error}</p>
              <p className="text-zinc-500 text-xs font-medium">{t('autoReconnect')}</p>
            </div>
            <button 
              onClick={retry}
              className="mt-2 w-full py-3 bg-cyan-600 text-white font-black uppercase tracking-widest text-xs rounded hover:bg-cyan-700 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
