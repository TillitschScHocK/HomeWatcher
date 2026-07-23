# VPN Configuration Files

This directory must contain **five files** that are excluded from Git via `.gitignore`.
Place them here manually before running `docker compose up`.

## Required files

| File | Description |
|---|---|
| `ca.crt` | CyberGhost CA certificate |
| `client.crt` | Your CyberGhost client certificate |
| `client.key` | Your CyberGhost client private key |
| `openvpn.ovpn` | OpenVPN configuration file from CyberGhost dashboard |
| `credentials.txt` | Two-line file: line 1 = username, line 2 = password |

## How to obtain the files

1. Log in to [my.cyberghostvpn.com](https://my.cyberghostvpn.com).
2. Navigate to **VPN → Configure Device → Other Platforms → OpenVPN**.
3. Select your preferred server/region and download the `.ovpn` bundle.
4. Extract `ca.crt`, `client.crt`, `client.key`, and the `.ovpn` file into this directory.
5. Create `credentials.txt`:

```
your_cyberghost_username
your_cyberghost_password
```

## Split tunnel

The `LAN_SUBNET` variable in `.env` (default `192.168.0.0/16`) keeps your local
network reachable without going through the VPN tunnel. Adjust it if your LAN
uses a different range.
