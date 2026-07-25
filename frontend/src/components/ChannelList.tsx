import React from 'react';
import { Channel } from '../types';
import socketService from '../services/SocketService';

interface ChannelListProps {
  channels: Channel[];
  selectedChannel: Channel | null;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  onEditChannel: (channel: Channel) => void;
}

function ChannelList({ channels, selectedChannel, setSearchQuery, onEditChannel }: ChannelListProps) {
  const onSelectChannel = (channel: Channel) => {
    setSearchQuery('');
    if (channel.id === selectedChannel?.id) return;
    socketService.setCurrentChannel(channel.id);
  };

  const onRightClickChannel = (event: React.MouseEvent, channel: Channel) => {
    event.preventDefault();
    onEditChannel(channel);
  };

  if (channels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3" style={{ color: 'var(--text-faint)' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M8 19l-2 2M16 19l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <p className="text-sm font-medium" style={{ color: 'var(--text-faint)' }}>No channels found</p>
      </div>
    );
  }

  return (
    <div
      className="flex gap-2.5 hover:overflow-x-auto overflow-hidden pb-2 px-0.5 pt-0.5 scroll-container"
      role="list"
      aria-label="Channel list"
    >
      {channels.map((channel, index) => {
        const isActive = selectedChannel?.id === channel.id;
        return (
          <button
            key={channel.id}
            role="listitem"
            title={channel.name.length > 28 ? channel.name : undefined}
            onClick={() => onSelectChannel(channel)}
            onContextMenu={e => onRightClickChannel(e, channel)}
            className={`channel-card flex-shrink-0 w-24 ${isActive ? 'is-active' : ''}`}
            style={{ animationDelay: `${index * 35}ms` }}
            aria-pressed={isActive}
            aria-label={channel.name}
          >
            <div className="w-14 h-14 mb-1.5 flex items-center justify-center rounded-lg overflow-hidden"
              style={{ background: 'var(--bg-surface-3)' }}
            >
              <img
                src={channel.avatar}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
            <p
              className="text-xs font-medium text-center leading-tight px-1"
              style={{ color: isActive ? 'var(--brand-red)' : 'var(--text-muted)' }}
            >
              {channel.name.length > 22 ? `${channel.name.substring(0, 22)}…` : channel.name}
            </p>
          </button>
        );
      })}
    </div>
  );
}

export default ChannelList;
