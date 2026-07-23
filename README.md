# HomeWatcher

A self-hosted IPTV stack powered by [IPTV-Restream](https://github.com/TillitschScHocK/IPTV-Restream),
wrapped in a CyberGhost VPN tunnel via OpenVPN. All outbound stream traffic is
routed through the VPN. The local LAN stays reachable via a split-tunnel route.
The web UI is available on port **1966** — no login required.

## Features

- **CyberGhost VPN** via OpenVPN — all backend and nginx traffic tunnelled
- **IPTV-Restream** frontend (React/Vite/TypeScript/Tailwind) — served as-is, independently customisable
- **IPTV-Restream** backend (Node.js + ffmpeg) — stream proxying and channel management
- **Nginx** reverse proxy — routes `/`, `/api/`, `/socket.io/`, `/proxy/`, `/streams/`
- **Watchtower** — automatic daily container updates at 04:00
- **No re-encoding** — streams are proxied at original quality
- **Split tunnel** — LAN remains accessible without going through the VPN

## Folder Structure

```
HomeWatcher/
├── docker-compose.yml
├── .env                        # created from .env.example (NOT committed)
├── .env.example
├── .gitignore
├── README.md
├── vpn/
│   ├── README.md               # setup instructions (committed)
│   ├── ca.crt                  # NOT committed
│   ├── client.crt              # NOT committed
│   ├── client.key              # NOT committed
│   ├── openvpn.ovpn            # NOT committed
│   └── credentials.txt         # NOT committed
├── frontend/                   # IPTV-Restream React/Vite frontend
│   ├── Dockerfile
│   └── src/ ...                # customise freely
├── backend/                    # IPTV-Restream Node.js backend
│   ├── Dockerfile
│   └── ...                     # customise freely
└── deployment/
    └── nginx/
        └── nginx.conf
```

## Quickstart

### 1. Clone this repository

```bash
git clone https://github.com/TillitschScHocK/HomeWatcher.git
cd HomeWatcher
```

### 2. Copy frontend and backend source from IPTV-Restream

The `frontend/` and `backend/` directories only contain the `Dockerfile` in this
repository. You need to copy the actual source code from your
[IPTV-Restream](https://github.com/TillitschScHocK/IPTV-Restream) repository:

```bash
# Clone IPTV-Restream next to HomeWatcher
git clone https://github.com/TillitschScHocK/IPTV-Restream.git ../IPTV-Restream

# Copy source into HomeWatcher
cp -r ../IPTV-Restream/frontend/src       ./frontend/
cp -r ../IPTV-Restream/frontend/public    ./frontend/   2>/dev/null || true
cp    ../IPTV-Restream/frontend/index.html ./frontend/
cp    ../IPTV-Restream/frontend/package.json ./frontend/
cp    ../IPTV-Restream/frontend/package-lock.json ./frontend/
cp    ../IPTV-Restream/frontend/vite.config.ts ./frontend/
cp    ../IPTV-Restream/frontend/tailwind.config.js ./frontend/
cp    ../IPTV-Restream/frontend/postcss.config.js ./frontend/
cp    ../IPTV-Restream/frontend/tsconfig*.json ./frontend/

cp -r ../IPTV-Restream/backend/controllers ./backend/
cp -r ../IPTV-Restream/backend/models      ./backend/
cp -r ../IPTV-Restream/backend/services    ./backend/
cp -r ../IPTV-Restream/backend/socket      ./backend/
cp    ../IPTV-Restream/backend/server.js   ./backend/
cp    ../IPTV-Restream/backend/package.json ./backend/
cp    ../IPTV-Restream/backend/package-lock.json ./backend/
```

### 3. Place VPN files

See [`vpn/README.md`](vpn/README.md). You need these five files:

```
vpn/ca.crt
vpn/client.crt
vpn/client.key
vpn/openvpn.ovpn
vpn/credentials.txt
```

### 4. Create your `.env` file

```bash
cp .env.example .env
# Edit .env if needed (UI_PORT, LAN_SUBNET, VITE_STREAM_DELAY, …)
```

### 5. Start the stack

```bash
docker compose up -d --build
```

### 6. Open the UI

```
http://<your-server-ip>:1966
```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `LAN_SUBNET` | Local LAN subnet kept outside the VPN tunnel | `192.168.0.0/16` |
| `UI_PORT` | Host port for the web UI | `1966` |
| `VITE_STREAM_DELAY` | HLS stream delay in seconds | `18` |
| `VITE_STREAM_PROXY_DELAY` | Proxy stream delay in seconds | `30` |
| `WATCHTOWER_CLEANUP` | Remove old images after update | `true` |

## Network Architecture

```
Host :1966
    └── homewatcher-nginx  (network_mode: service:vpn)
            ├── / → iptv_restream_frontend:80   (app-network)
            ├── /api/ → iptv_restream_backend:5000  (via VPN)
            ├── /socket.io/ → iptv_restream_backend:5000
            ├── /proxy/ → iptv_restream_backend:5000
            └── /streams/ → tmpfs volume
```

- The **backend** uses `network_mode: service:vpn` — all outbound requests
  (stream fetching, channel updates) go through the CyberGhost tunnel.
- The **frontend** uses the internal `app-network` — it only serves static files
  and does not make outbound requests itself.
- **Nginx** also shares the VPN network stack so the port mapping works correctly.

## Updating the Frontend

Since the frontend source lives in
[IPTV-Restream](https://github.com/TillitschScHocK/IPTV-Restream), you can
customise it freely there and rebuild here:

```bash
docker compose build iptv_restream_frontend
docker compose up -d iptv_restream_frontend
```

## Security Notes

- VPN certificate files and credentials are listed in `.gitignore` and must
  never be committed.
- The web UI has no authentication — expose it on your LAN only.
