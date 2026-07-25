import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Plus, Tv2, ChevronDown, Tag } from 'lucide-react';
import VideoPlayer from './components/VideoPlayer';
import ChannelList from './components/ChannelList';
import ChannelModal from './components/add_channel/ChannelModal';
import { Channel } from './types';
import socketService from './services/SocketService';
import apiService from './services/ApiService';
import SettingsModal from './components/SettingsModal';
import TvPlaylistModal from './components/TvPlaylistModal';
import { ToastProvider } from './components/notifications/ToastContext';
import ToastContainer from './components/notifications/ToastContainer';
import spatenLogo from './assets/spaten.svg';

function App() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTvPlaylistOpen, setIsTvPlaylistOpen] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(() => {
    const saved = localStorage.getItem('syncEnabled');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [editChannel, setEditChannel] = useState<Channel | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>('All Channels');
  const [selectedGroup, setSelectedGroup] = useState<string>('Category');
  const [isPlaylistDropdownOpen, setIsPlaylistDropdownOpen] = useState(false);
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);

  const playlistRef = useRef<HTMLDivElement>(null);
  const groupRef    = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (playlistRef.current && !playlistRef.current.contains(e.target as Node)) setIsPlaylistDropdownOpen(false);
      if (groupRef.current    && !groupRef.current.contains(e.target as Node))    setIsGroupDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const playlists = useMemo(() => {
    const unique = new Set(channels.map(c => c.playlistName).filter(Boolean));
    return ['All Channels', ...Array.from(unique)];
  }, [channels]);

  const filteredChannels = useMemo(() => {
    let list = selectedPlaylist === 'All Channels' ? channels : channels.filter(c => c.playlistName === selectedPlaylist);
    list = selectedGroup === 'Category' ? list : list.filter(c => c.group === selectedGroup);
    return list.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [channels, selectedPlaylist, selectedGroup, searchQuery]);

  const groups = useMemo(() => {
    const base = selectedPlaylist === 'All Channels' ? channels : channels.filter(c => c.playlistName === selectedPlaylist);
    const unique = new Set(base.map(c => c.group).filter(Boolean));
    return ['Category', ...Array.from(unique)];
  }, [selectedPlaylist, channels]);

  useEffect(() => {
    apiService.request<Channel[]>('/channels/', 'GET').then(setChannels).catch(console.error);
    apiService.request<Channel>('/channels/current', 'GET').then(setSelectedChannel).catch(console.error);

    const onAdded    = (ch: Channel) => setChannels(prev => [...prev, ch]);
    const onSelected = (ch: Channel) => setSelectedChannel(ch);
    const onUpdated  = (ch: Channel) => {
      setChannels(prev => prev.map(c => c.id === ch.id ? ch : c));
      setSelectedChannel(prev => {
        if (prev?.id !== ch.id) return prev;
        if ((prev.url !== ch.url || JSON.stringify(prev.headers) !== JSON.stringify(ch.headers)) && prev.mode === 'restream') {
          setTimeout(() => window.location.reload(), 3000);
        }
        return ch;
      });
    };
    const onDeleted = (id: number) => setChannels(prev => prev.filter(c => c.id !== id));

    socketService.subscribeToEvent('channel-added',    onAdded);
    socketService.subscribeToEvent('channel-selected', onSelected);
    socketService.subscribeToEvent('channel-updated',  onUpdated);
    socketService.subscribeToEvent('channel-deleted',  onDeleted);
    socketService.connect();

    return () => {
      socketService.unsubscribeFromEvent('channel-added',    onAdded);
      socketService.unsubscribeFromEvent('channel-selected', onSelected);
      socketService.unsubscribeFromEvent('channel-updated',  onUpdated);
      socketService.unsubscribeFromEvent('channel-deleted',  onDeleted);
      socketService.disconnect();
    };
  }, []);

  const handleEditChannel = (ch: Channel) => { setEditChannel(ch); setIsModalOpen(true); };

  return (
    <ToastProvider>
      <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>

        {/* ── Header ────────────────────────────────────────────────── */}
        <header className="hw-header">
          <div className="container mx-auto px-4 py-3 flex items-center gap-4">

            {/* Brand / Logo */}
            <a href="/" className="flex items-center gap-2 flex-shrink-0 hover-lift" aria-label="HomeWatcher">
              <img
                src={spatenLogo}
                alt="HomeWatcher logo"
                className="w-6 h-6 object-contain opacity-90"
              />
              <span
                className="text-base font-bold tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                Home<span style={{ color: 'var(--brand-red)' }}>Watcher</span>
              </span>
            </a>

            {/* Search */}
            <div className="flex-1 mx-2 max-w-xl relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: 'var(--text-faint)' }}
              />
              <input
                type="text"
                placeholder="Search channels…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="hw-search w-full pl-10 pr-4 py-2.5 text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
              <button
                onClick={() => { setIsModalOpen(true); setIsGroupDropdownOpen(false); setIsPlaylistDropdownOpen(false); }}
                className="btn-red"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>
          </div>
        </header>

        {/* ── Main ──────────────────────────────────────────────────── */}
        <main className="container mx-auto px-4 py-6 space-y-4">

          {/* Channel Panel */}
          <section className="hw-card p-5">

            {/* Panel Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="section-label">Channels</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Playlist Dropdown */}
                <div className="relative" ref={playlistRef}>
                  <button
                    onClick={() => { setIsPlaylistDropdownOpen(o => !o); setIsGroupDropdownOpen(false); }}
                    className="btn-ghost text-sm"
                    style={isPlaylistDropdownOpen ? { color: 'var(--brand-red)', borderColor: 'var(--brand-red)' } : {}}
                  >
                    <Tv2 className="w-4 h-4" />
                    <span>{selectedPlaylist}</span>
                    <ChevronDown
                      className="w-3.5 h-3.5 transition-transform duration-200"
                      style={{ transform: isPlaylistDropdownOpen ? 'rotate(180deg)' : 'none' }}
                    />
                  </button>
                  {isPlaylistDropdownOpen && (
                    <div className="hw-dropdown absolute top-full left-0 mt-1.5 w-52 z-50">
                      <div className="max-h-64 overflow-y-auto scroll-container py-1">
                        {playlists.map(pl => (
                          <button
                            key={pl}
                            onClick={() => { setSelectedPlaylist(pl); setSelectedGroup('Category'); setIsPlaylistDropdownOpen(false); }}
                            className={`hw-dropdown-item ${selectedPlaylist === pl ? 'is-active' : ''}`}
                          >{pl}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Group Dropdown */}
                <div className="relative" ref={groupRef}>
                  <button
                    onClick={() => { setIsGroupDropdownOpen(o => !o); setIsPlaylistDropdownOpen(false); }}
                    className="btn-ghost text-sm"
                    style={isGroupDropdownOpen ? { color: 'var(--brand-red)', borderColor: 'var(--brand-red)' } : {}}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>{selectedGroup}</span>
                    <ChevronDown
                      className="w-3.5 h-3.5 transition-transform duration-200"
                      style={{ transform: isGroupDropdownOpen ? 'rotate(180deg)' : 'none' }}
                    />
                  </button>
                  {isGroupDropdownOpen && (
                    <div className="hw-dropdown absolute top-full left-0 mt-1.5 w-52 z-50">
                      <div className="max-h-64 overflow-y-auto scroll-container py-1">
                        {groups.map(g => (
                          <button
                            key={g}
                            onClick={() => { setSelectedGroup(g); setIsGroupDropdownOpen(false); }}
                            className={`hw-dropdown-item ${selectedGroup === g ? 'is-active' : ''}`}
                          >{g === 'Category' ? 'All Categories' : g}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Channel count badge */}
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-md"
                  style={{ background: 'var(--bg-surface-2)', color: 'var(--text-faint)', letterSpacing: '0.04em' }}
                >
                  {filteredChannels.length}
                </span>
              </div>
            </div>

            <ChannelList
              channels={filteredChannels}
              selectedChannel={selectedChannel}
              setSearchQuery={setSearchQuery}
              onEditChannel={handleEditChannel}
            />
          </section>

          {/* Video Player */}
          <VideoPlayer channel={selectedChannel} syncEnabled={syncEnabled} />
        </main>

        {/* ── Modals ────────────────────────────────────────────────── */}
        {isModalOpen && (
          <ChannelModal
            onClose={() => { setIsModalOpen(false); setEditChannel(null); }}
            channel={editChannel}
          />
        )}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          syncEnabled={syncEnabled}
          onSyncChange={enabled => { setSyncEnabled(enabled); localStorage.setItem('syncEnabled', JSON.stringify(enabled)); }}
        />
        <TvPlaylistModal isOpen={isTvPlaylistOpen} onClose={() => setIsTvPlaylistOpen(false)} />
        <ToastContainer />
      </div>
    </ToastProvider>
  );
}

export default App;
