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

exports.getVpnStatus = async (req, res) => {
  try {
    const data = await fetchJson('https://ipapi.co/json/');

    // Optional VPN detection via environment variable (no keyword guessing)
    const expectedOrg = process.env.EXPECTED_VPN_ORG ? process.env.EXPECTED_VPN_ORG.toLowerCase() : null;
    const expectedIp  = process.env.EXPECTED_VPN_IP  ? process.env.EXPECTED_VPN_IP.trim()         : null;
    const org         = (data.org ?? '').toLowerCase();
    const ip          = data.ip ?? null;

    let active = null;
    if (expectedIp) {
      active = ip === expectedIp;
    } else if (expectedOrg) {
      active = org.includes(expectedOrg);
    }
    // If neither env var is set, active stays null (= no VPN check, just show IP)

    res.json({
      active,
      ip,
      org:     data.org          ?? null,
      country: data.country_name ?? null,
    });
  } catch (err) {
    res.status(500).json({ active: null, ip: null, org: null, country: null, error: String(err) });
  }
};
