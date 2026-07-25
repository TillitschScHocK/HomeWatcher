import { useEffect, useState } from 'react';
import { ShieldCheck, ShieldOff } from 'lucide-react';
import apiService from '../services/ApiService';

interface VpnStatus {
  active: boolean;
  ip: string | null;
  org: string | null;
  country: string | null;
}

export default function VpnBadge() {
  const [status, setStatus] = useState<VpnStatus | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Single fetch on mount – checks the server/container's outbound IP
  useEffect(() => {
    apiService.request<VpnStatus>('/vpn-status', 'GET')
      .then(setStatus)
      .catch(() => setStatus({ active: false, ip: null, org: null, country: null }));
  }, []);

  // Still loading
  if (!status) {
    return (
      <div className="vpn-badge vpn-checking" title="Checking server IP…">
        <span className="vpn-pulse" />
      </div>
    );
  }

  return (
    <div
      className={`vpn-badge ${status.active ? 'vpn-on' : 'vpn-off'}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      role="status"
      aria-label={status.active ? 'Server VPN active' : 'Server VPN not detected'}
    >
      {status.active
        ? <ShieldCheck className="w-3.5 h-3.5" />
        : <ShieldOff   className="w-3.5 h-3.5" />}

      <span className="vpn-label hidden sm:inline">
        {status.active ? 'VPN' : 'No VPN'}
      </span>

      {showTooltip && (
        <div className="vpn-tooltip">
          <span className="font-semibold">
            {status.active ? '🔒 Server VPN aktiv' : '⚠️ Kein VPN erkannt'}
          </span>
          {status.ip && (
            <span className="vpn-tooltip-ip">{status.ip}</span>
          )}
          {status.org && (
            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
              {status.org}
            </span>
          )}
          {status.country && (
            <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>{status.country}</span>
          )}
          <span style={{ fontSize: '0.63rem', opacity: 0.5, marginTop: '2px' }}>
            Server-IP · einmalig beim Laden
          </span>
        </div>
      )}
    </div>
  );
}
