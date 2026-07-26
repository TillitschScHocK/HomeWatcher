import { useEffect, useState } from 'react';
import { Server, AlertCircle } from 'lucide-react';
import apiService from '../services/ApiService';
import './VpnStatusBadge.css';

interface VpnStatus {
  vpnActive:  boolean | null;
  exitIp:     string | null;
  checkedAt:  string | null;
  error?:     string;
}

const POLL_INTERVAL_MS = 60 * 1000;

export default function VpnBadge() {
  const [status, setStatus]         = useState<VpnStatus | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  function poll() {
    apiService.request<VpnStatus>('/vpn-status', 'GET')
      .then(data => {
        if (data.error && !data.exitIp) {
          setFetchError(true);
        } else {
          setFetchError(false);
          setStatus(data);
        }
      })
      .catch(() => setFetchError(true));
  }

  useEffect(() => {
    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(id);
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
  if (fetchError || !status?.exitIp) {
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

  // Determine badge colour: only when vpnActive is explicitly boolean
  const hasVpnCheck = status.vpnActive !== null;
  const badgeClass  = hasVpnCheck
    ? (status.vpnActive ? 'vpn-on' : 'vpn-off')
    : 'vpn-on'; // neutral green when no env-var check is configured

  const label = hasVpnCheck
    ? (status.vpnActive ? 'VPN active' : 'VPN inactive')
    : `Server ${status.exitIp}`;

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
          <span className="font-semibold">
            {hasVpnCheck
              ? (status.vpnActive ? '🔒 VPN aktiv' : '⚠️ Kein VPN erkannt')
              : '🖥️ Server-IP'}
          </span>
          <span className="vpn-tooltip-ip">{status.exitIp}</span>
          {status.checkedAt && (
            <span style={{ fontSize: '0.63rem', opacity: 0.5, marginTop: '2px' }}>
              {new Date(status.checkedAt).toLocaleTimeString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
