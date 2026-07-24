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
      addToast({
        type: 'success',
        title: 'Playlist-URL in Zwischenablage kopiert',
        duration: 2500,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'URL konnte nicht kopiert werden',
        message: 'Bitte kopieren Sie die URL manuell',
        duration: 2500,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Tv2 className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold">TV Stream</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={playlistUrl}
              readOnly
              className="flex-1 bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleCopy}
              className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-sm text-gray-400">
            Verwende diese Playlist in jedem anderen IPTV-Player. Bei Problemen wenden Sie sich bitte an den Admin.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TvPlaylistModal;