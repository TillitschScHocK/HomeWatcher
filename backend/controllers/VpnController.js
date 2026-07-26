const https = require('https');

// Fetches the public egress IP of the Docker container (server-side)
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

// In-memory cache — avoids hammering the external IP-echo service on every poll
const CACHE_TTL_MS = 60 * 1000;
let cache = null; // { data, expiresAt }

exports.getVpnStatus = async (req, res) => {
  try {
    const now = Date.now();
    if (cache && now < cache.expiresAt) {
      return res.json(cache.data);
    }

    const ipData = await fetchJson('https://api.ipify.org?format=json');
    const ip     = ipData.ip ?? null;

    // Optional VPN detection via environment variable (no keyword guessing)
    const expectedOrg = process.env.EXPECTED_VPN_ORG ? process.env.EXPECTED_VPN_ORG.toLowerCase() : null;
    const expectedIp  = process.env.EXPECTED_VPN_IP  ? process.env.EXPECTED_VPN_IP.trim()         : null;
    const homeIp      = process.env.EXPECTED_HOME_IP ? process.env.EXPECTED_HOME_IP.trim()         : null;

    let vpnActive = null;
    if (expectedIp) {
      vpnActive = ip === expectedIp;
    } else if (homeIp) {
      // VPN is active when the current exit IP differs from the known home/router IP
      vpnActive = ip !== homeIp;
    } else if (expectedOrg) {
      // Fallback: try to resolve org via ipapi.co for org-based check
      try {
        const orgData = await fetchJson(`https://ipapi.co/${ip}/json/`);
        const org = (orgData.org ?? '').toLowerCase();
        vpnActive = org.includes(expectedOrg);
      } catch (_) {
        vpnActive = null;
      }
    }
    // If no env var is set, vpnActive stays null (show IP only, no pass/fail)

    const payload = {
      vpnActive,
      exitIp:    ip,
      checkedAt: new Date().toISOString(),
    };

    cache = { data: payload, expiresAt: now + CACHE_TTL_MS };
    res.json(payload);
  } catch (err) {
    res.status(500).json({ vpnActive: null, exitIp: null, checkedAt: new Date().toISOString(), error: String(err) });
  }
};
