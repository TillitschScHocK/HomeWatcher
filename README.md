# HomeWatcher

A self-hosted IPTV stack that routes all traffic through a CyberGhost VPN tunnel,
serves channels via a Threadfin proxy, and exposes a modern dark-themed web UI on
port **1966** — no login required, optimised for TV screens and remote controls.

## Features

- **CyberGhost VPN** via OpenVPN — all IPTV traffic tunnelled, local LAN kept reachable
- **Threadfin** IPTV multiplexer — M3U caching (1-hour interval), XMLTV EPG
- **stream-gate** FastAPI microservice — block/unblock all stream connections in one click via iptables
- **Web UI** — HLS/MPEG-TS playback (hls.js), channel list with logos & category filter, EPG panel, toast notifications
- **Watchtower** — automatic daily container updates at 04:00
- **No re-encoding** — streams are proxied at original quality
- **Gzip compression** for efficient LAN transfer

## Folder Structure

```
HomeWatcher/
├── docker-compose.yml
├── .env                    # created from .env.example (NOT committed)
├── .env.example
├── .gitignore
├── README.md
├── vpn/
│   ├── README.md           # setup instructions (committed)
│   ├── ca.crt              # NOT committed
│   ├── client.crt          # NOT committed
│   ├── client.key          # NOT committed
│   ├── openvpn.ovpn        # NOT committed
│   └── credentials.txt     # NOT committed
├── threadfin/
│   ├── Dockerfile
│   └── entrypoint.sh
├── stream-gate/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── main.py
└── webui/
    ├── Dockerfile
    ├── nginx.conf
    └── html/
        ├── index.html
        ├── style.css
        └── app.js
```

## Quickstart

### 1. Clone the repository

```bash
git clone https://github.com/TillitschScHocK/HomeWatcher.git
cd HomeWatcher
```

### 2. Place VPN files

See [`vpn/README.md`](vpn/README.md) for detailed instructions.
You need these five files in the `vpn/` directory:

```
vpn/ca.crt
vpn/client.crt
vpn/client.key
vpn/openvpn.ovpn
vpn/credentials.txt
```

### 3. Create your `.env` file

```bash
cp .env.example .env
# Edit .env and fill in your M3U_URL and EPG_URL
```

### 4. Start the stack

```bash
docker compose up -d
```

### 5. Open the web UI

Navigate to `http://<your-server-ip>:1966` in any browser or smart TV.

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `M3U_URL` | Full URL to your M3U playlist | *(required)* |
| `EPG_URL` | Full URL to your XMLTV EPG feed | *(required)* |
| `UI_PORT` | Host port for the web UI | `1966` |
| `WATCHTOWER_CLEANUP` | Remove old images after update | `true` |

## Network Architecture

All containers except Watchtower share the VPN container's network stack
(`network_mode: service:vpn`). This means:

- Threadfin, stream-gate, and the web UI all route outgoing traffic through the
  CyberGhost VPN tunnel automatically.
- The web UI Nginx proxy reaches Threadfin on `127.0.0.1:34400` and stream-gate
  on `127.0.0.1:8080` — no extra Docker networks needed.
- The host LAN (`192.168.0.0/16`) remains directly reachable via a split-tunnel
  route configured in the VPN container.

## Security Notes

- VPN certificate files and credentials are listed in `.gitignore` and must never
  be committed.
- `stream-gate` requires `NET_ADMIN` capability to manage iptables rules.
- The web UI has no authentication — expose it on your LAN only.

## Updating

Watchtower checks for new image versions daily at 04:00 and restarts updated
containers automatically. To force an immediate update:

```bash
docker compose pull && docker compose up -d
```
