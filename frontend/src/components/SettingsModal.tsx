import { X, Clock } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncEnabled: boolean;
  onSyncChange: (enabled: boolean) => void;
}

function SettingsModal({ isOpen, onClose, syncEnabled, onSyncChange }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="hw-modal-overlay">
      <div className="hw-modal w-full max-w-md">
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h2>
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
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: 'var(--brand-red-alpha)' }}
              >
                <Clock className="w-4 h-4" style={{ color: 'var(--brand-red)' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Stream Synchronisation</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Keeps stream playback in sync with other viewers. Increases initial load time.
                </p>
              </div>
            </div>

            {/* Toggle */}
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={syncEnabled}
                onChange={e => onSyncChange(e.target.checked)}
              />
              <div
                className="w-10 h-5 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"
                style={{
                  background: syncEnabled ? 'var(--brand-red)' : 'var(--bg-surface-3)',
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
