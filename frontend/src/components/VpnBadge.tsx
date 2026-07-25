import { useEffect, useState } from 'react';
import { ShieldCheck, ShieldOff } from 'lucide-react';

interface VpnState {
  active: boolean;
  ip: string | null;
  checking: boolean;
}

// Known VPN / datacenter ASN prefixes returned by ipapi.co
const VPN_KEYWORDS = [
  'vpn', 'hosting', 'datacenter', 'data center', 'cloud', 'server',
  'ovh', 'hetzner', 'mullvad', 'proton', 'nordvpn', 'expressvpn',
  'digital ocean', 'linode', 'amazon', 'google', 'microsoft',
];

async function detectVpn(): Promise<VpnState> {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    const org: string = (data.org ?? '').toLowerCase();
    const active = VPN_KEYWORDS.some(kw => org.includes(kw));
    return { active, ip: data.ip ?? null, checking: false };
  } catch {
    return { active: false, ip: null, checking: false };
  }
}

export default function VpnBadge() {
  const [state, setState] = useState<VpnState>({ active: false, ip: null, checking: true });
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    detectVpn().then(setState);
    const interval = setInterval(() => detectVpn().then(setState), 60_000);
    return () => clearInterval(interval);
  }, []);

  if (state.checking) {
    return (
      <div
        className="vpn-badge vpn-checking"
        title="Checking VPN…"
      >
        <span className="vpn-pulse" />
        <span className="vpn-label hidden sm:inline">Checking…</span>
      </div>
    );
  }

  return (
    <div
      className={`vpn-badge ${state.active ? 'vpn-on' : 'vpn-off'}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      role="status"
      aria-label={state.active ? 'VPN active' : 'VPN not detected'}
    >
      {state.active
        ? <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
        : <ShieldOff   className="w-3.5 h-3.5 flex-shrink-0" />}

      <span className="vpn-label hidden sm:inline">
        {state.active ? 'VPN' : 'No VPN'}
      </span>

      {showTooltip && (
        <div className="vpn-tooltip">
          <span className="font-semibold">{state.active ? '🔒 VPN aktiv' : '⚠️ Kein VPN'}</span>
          {state.ip && <span className="vpn-tooltip-ip">{state.ip}</span>}
          <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>Wird jede Minute geprüft</span>
        </div>
      )}
    </div>
  );
}
