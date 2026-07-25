import React, { useContext, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { Channel, ChannelMode } from '../types';
import { ToastContext } from './notifications/ToastContext';

interface VideoPlayerProps {
  channel: Channel | null;
  syncEnabled: boolean;
}

function VideoPlayer({ channel, syncEnabled }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef   = useRef<Hls | null>(null);
  const { addToast, removeToast, clearToasts, editToast } = useContext(ToastContext);

  useEffect(() => {
    if (!videoRef.current || !channel?.url) return;
    const video = videoRef.current;

    if (Hls.isSupported()) {
      hlsRef.current?.destroy();

      const hls = new Hls({
        autoStartLoad: !syncEnabled,
        liveDurationInfinity: true,
        manifestLoadPolicy: {
          default: {
            maxTimeToFirstByteMs: Infinity,
            maxLoadTimeMs: 20000,
            timeoutRetry: { maxNumRetry: 3, retryDelayMs: 0, maxRetryDelayMs: 0 },
            errorRetry: {
              maxNumRetry: 12, retryDelayMs: 1000, maxRetryDelayMs: 8000, backoff: 'linear',
              shouldRetry: (cfg, count) => count < cfg!.maxNumRetry,
            },
          },
        },
      });

      const sourceLinks: Record<ChannelMode, string> = {
        direct:   channel.url,
        proxy:    import.meta.env.VITE_BACKEND_URL + '/proxy/channel',
        restream: import.meta.env.VITE_BACKEND_URL + '/streams/' + channel.id + '/' + channel.id + '.m3u8',
      };

      hlsRef.current = hls;
      hls.loadSource(sourceLinks[channel.mode]);
      hls.attachMedia(video);

      if (!syncEnabled) return;

      clearToasts();
      let toastStartId: string | null = null;
      toastStartId = addToast({ type: 'loading', title: 'Stream wird gestartet', message: 'Einen Moment bitte…', duration: 0 });

      const tolerance    = Number(import.meta.env.VITE_SYNCHRONIZATION_TOLERANCE    ?? 0.8);
      const maxDeviation = Number(import.meta.env.VITE_SYNCHRONIZATION_MAX_DEVIATION ?? 4);
      let toastDurationSet = false;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (channel.mode === 'restream') {
          const now = Date.now();
          const fragments = hls.levels[0]?.details?.fragments;
          const lastFrag  = fragments?.[fragments.length - 1];
          if (!lastFrag?.programDateTime) return;
          const timeDiff   = (now - lastFrag.programDateTime) / 1000;
          const videoLen   = fragments!.reduce((a, f) => a + f.duration, 0);
          const targetDelay = Number(import.meta.env.VITE_STREAM_DELAY);
          const delay = videoLen + timeDiff + tolerance + 1;
          if (delay >= targetDelay) {
            hls.startLoad(); video.play();
            if (!toastDurationSet && toastStartId) removeToast(toastStartId);
          } else {
            if (!toastDurationSet && toastStartId) { editToast(toastStartId, { duration: (1 + targetDelay - delay) * 1000 }); toastDurationSet = true; }
            setTimeout(() => hls.loadSource(import.meta.env.VITE_BACKEND_URL + '/streams/' + channel.id + '/' + channel.id + '.m3u8'), 1000);
          }
        } else {
          hls.startLoad(); video.play();
          if (toastStartId) removeToast(toastStartId);
        }
      });

      let timeMissingErrorShown = false;
      hls.on(Hls.Events.FRAG_LOADED, (_e, data) => {
        const frag = data.frag;
        if (!frag.programDateTime) {
          if (!timeMissingErrorShown) {
            addToast({ type: 'error', title: 'Synchronisierungsfehler', message: `Wiedergabe kann für diesen Sender (${channel.mode}) nicht synchronisiert werden.`, duration: 5000 });
            timeMissingErrorShown = true;
          }
          return;
        }
        const timeDiff = (Date.now() - frag.programDateTime) / 1000;
        const videoDiff = frag.end - video.currentTime;
        const delay = timeDiff + videoDiff;
        const targetDelay = channel.mode === 'restream' ? import.meta.env.VITE_STREAM_DELAY : import.meta.env.VITE_STREAM_PROXY_DELAY;
        const deviation = delay - targetDelay;
        if (Math.abs(deviation) > maxDeviation) {
          video.currentTime += deviation;
          video.playbackRate = 1.0;
        } else if (Math.abs(deviation) > tolerance) {
          const adj = Number(import.meta.env.VITE_SYNCHRONIZATION_ADJUSTMENT ?? 0.06);
          const maxAdj = Number(import.meta.env.VITE_SYNCHRONIZATION_MAX_ADJUSTMENT ?? 0.16);
          video.playbackRate = 1 + Math.sign(deviation) * Math.min(Math.abs(adj * deviation), maxAdj);
        } else {
          video.playbackRate = 1.0;
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!data.fatal) return;
        if (toastStartId) removeToast(toastStartId);
        const messages: Record<ChannelMode, string> = {
          direct:   'Stream nicht verfügbar. Versuche Proxy- oder Restream-Modus.',
          proxy:    'Stream nicht verfügbar. Versuche den Restream-Modus.',
          restream: `Stream nicht verfügbar. Quelle prüfen. ${data.response?.text ?? ''}`,
        };
        addToast({ type: 'error', title: 'Stream-Fehler', message: messages[channel.mode], duration: 5000 });
      });
    }
    return () => hlsRef.current?.destroy();
  }, [channel?.url, channel?.mode, syncEnabled]);

  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (videoRef.current?.muted) { e.preventDefault(); videoRef.current.muted = false; videoRef.current.play(); }
  };

  return (
    <div className="hw-video-wrap animate-fade-in-up">
      <video
        ref={videoRef}
        className="w-full aspect-video bg-black"
        muted
        autoPlay
        playsInline
        controls
        onClick={handleVideoClick}
      />
      {channel && (
        <div className="hw-video-bar">
          <img
            src={channel.avatar}
            alt=""
            aria-hidden="true"
            className="w-9 h-9 object-contain rounded-lg flex-shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{channel.name}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{channel.group ?? 'Live TV'}</span>
          </div>
          <div className="ml-auto">
            <span className="live-badge">
              <span className="dot" aria-hidden="true" />
              LIVE
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;
