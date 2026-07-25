import React from 'react';
import modernSpade from '../assets/spaten_modern.svg';

interface LogoProps {
  size?: number | string;
  className?: string;
  /** Show full text variant or icon-only */
  variant?: 'full' | 'icon';
}

/**
 * HomeWatcher Logo – Union Berlin style (red & white)
 * Designed to be crisp on TV browsers (high contrast, no fine details)
 */
const Logo: React.FC<LogoProps> = ({ size = 80, className = '', variant = 'full' }) => {
  if (variant === 'icon') {
    return (
      <img
        src={modernSpade}
        alt="HomeWatcher Logo"
        width={size}
        height={size}
        className={className}
        style={{
          display: 'inline-block',
          borderRadius: '50%',
          boxShadow: '0 4px 16px rgba(140, 0, 0, 0.5)',
        }}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.65em',
        userSelect: 'none',
      }}
    >
      <img
        src={modernSpade}
        alt="HomeWatcher Spaten Logo"
        width={size}
        height={size}
        style={{
          borderRadius: '50%',
          boxShadow: '0 4px 20px rgba(140, 0, 0, 0.55)',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          fontWeight: 800,
          fontSize: typeof size === 'number' ? `${size * 0.3}px` : '1.5rem',
          letterSpacing: '0.06em',
          lineHeight: 1,
          /* Union Berlin inspired gradient text */
          background: 'linear-gradient(135deg, #CC0000 0%, #ff3333 50%, #CC0000 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))',
        }}
      >
        Home<span style={{ WebkitTextFillColor: '#1a1a1a', color: '#1a1a1a', background: 'none', WebkitBackgroundClip: 'unset', backgroundClip: 'unset', filter: 'none' }}>Watcher</span>
      </span>
    </div>
  );
};

export default Logo;
