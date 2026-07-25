import { useEffect, useState } from 'react';
import { Server, AlertCircle } from 'lucide-react';
import apiService from '../services/ApiService';

interface VpnStatus {
  active: boolean | null;
  ip: string | null;
  org: string | null;
  country: string | null;
  error?: string;
}

export default function VpnBadge() {
  const [status, setStatus]       = useState<VpnStatus | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Single fetch on mount only
  useEffect(() => {
    apiService.request<VpnStatus>('/vpn-status', 'GET')
      .then(data => {
        if (data.error && !data.ip) {
          setFetchError(true);
        } else {
          setStatus(data);
        }
      })
      .catch(() => setFetchError(true));
  }, []);

  // Loading state
  if (!status && !fetchError) {
    return (
      <div className="vpn-badge vpn-checking" title="Server-IP wird ermittelt…">
        <span className="vpn-pulse" />
      </div>
    );
  }

  // Error state
  if (fetchError || !status?.ip) {
    return (
      <div
        className="vpn-badge vpn-off"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        role="status"
        aria-label="IP-Abfrage fehlgeschlagen"
      >
        <AlertCircle className="w-3.5 h-3.5" />
        <span className="vpn-label hidden sm:inline">Fehler</span>
        {showTooltip && (
          <div className="vpn-tooltip">
            <span className="font-semibold">⚠️ IP-Abfrage fehlgeschlagen</span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
              Backend nicht erreichbar
            </span>
          </div>
        )}
      </div>
    );
  }

  // Determine badge color: only if active is explicitly boolean
  const hasVpnCheck = status.active !== null;
  const badgeClass  = hasVpnCheck
    ? (status.active ? 'vpn-on' : 'vpn-off')
    : 'vpn-on'; // neutral green when no env-var check configured

  const label = `Server ${status.ip}`;

  return (
    <div
      className={`vpn-badge ${badgeClass}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      role="status"
      aria-label={label}
    >
      <Server className="w-3.5 h-3.5" />
      <span className="vpn-label hidden sm:inline">{label}</span>

      {showTooltip && (
        <div className="vpn-tooltip">
          <span className="font-semibold">🖥️ Server-IP</span>
          <span className="vpn-tooltip-ip">{status.ip}</span>
          {status.org && (
            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
              {status.org}
            </span>
          )}
          {status.country && (
            <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>{status.country}</span>
          )}
          {hasVpnCheck && (
            <span style={{ fontSize: '0.63rem', opacity: 0.7, marginTop: '2px' }}>
              {status.active ? '🔒 VPN aktiv' : '⚠️ Kein VPN erkannt'}
            </span>
          )}
          <span style={{ fontSize: '0.63rem', opacity: 0.5, marginTop: '2px' }}>
            einmalig beim Laden
          </span>
        </div>
      )}
    </div>
  );
}
