import { X, Copy, Tv2 } from 'lucide-react';
import { useContext } from 'react';
import { ToastContext } from './notifications/ToastContext';

interface TvPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function TvPlaylistModal({ isOpen, onClose }: TvPlaylistModalProps) {
  const { addToast } = useContext(ToastContext);
  const playlistUrl = `${import.meta.env.VITE_BACKEND_URL || window.location.origin}/api/channels/playlist`;

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(playlistUrl);
      addToast({ type: 'success', title: 'Playlist URL copied to clipboard', duration: 2500 });
    } catch {
      addToast({ type: 'error', title: 'Could not copy URL', message: 'Please copy it manually.', duration: 2500 });
    }
  };

  return (
    <div className="hw-modal-overlay">
      <div className="hw-modal w-full max-w-lg">
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <Tv2 className="w-4 h-4" style={{ color: 'var(--brand-red)' }} />
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>TV Playlist</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Close"
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface-2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={playlistUrl}
              readOnly
              className="flex-1 text-sm px-3 py-2.5 rounded-lg"
              style={{
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                outline: 'none',
              }}
            />
            <button
              onClick={handleCopy}
              className="w-10 h-10 flex items-center justify-center rounded-lg flex-shrink-0 transition-colors"
              style={{ background: 'var(--brand-red)', color: '#fff' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--brand-red-dark)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--brand-red)')}
              aria-label="Copy playlist URL"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            Use this playlist URL in any compatible IPTV player. Contact your admin if you experience issues.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TvPlaylistModal;
