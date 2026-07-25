const https = require('https');

// Fetches the public IP of the Docker container (server-side)
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Accept': 'application/json' } }, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

const VPN_KEYWORDS = [
  'vpn', 'hosting', 'datacenter', 'data center', 'cloud', 'server',
  'ovh', 'hetzner', 'mullvad', 'proton', 'nordvpn', 'expressvpn',
  'digital ocean', 'linode', 'amazon', 'google', 'microsoft', 'akamai',
];

exports.getVpnStatus = async (req, res) => {
  try {
    const data = await fetchJson('https://ipapi.co/json/');
    const org = (data.org ?? '').toLowerCase();
    const active = VPN_KEYWORDS.some(kw => org.includes(kw));
    res.json({
      active,
      ip: data.ip ?? null,
      org: data.org ?? null,
      country: data.country_name ?? null,
    });
  } catch (err) {
    res.status(500).json({ active: false, ip: null, org: null, country: null, error: String(err) });
  }
};
