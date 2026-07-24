# VPN Configuration (CyberGhost via OpenVPN)

This directory contains the OpenVPN configuration and certificate files required to tunnel all backend traffic through CyberGhost VPN.

> ⚠️ **None of these files are committed to the repository.** They must be placed here manually before starting the stack.

---

## Why `ghcr.io/wfg/openvpn-client`?

This stack uses **[ghcr.io/wfg/openvpn-client](https://github.com/wfg/docker-openvpn-client)** instead of the
more commonly seen `dperson/openvpn-client`. Reasons:

- Ships **OpenVPN 2.6+** – required for modern CyberGhost `.ovpn` files that use the `data-ciphers` directive (OpenVPN 2.4 crashes on this).
- Actively maintained and receives regular updates.
- Cleaner split-tunneling via the `SUBNETS` environment variable.
- Does not require loading `iptables`/`ip6tables` kernel modules on the host.

---

## Required Files

Place the following files in this `vpn/` directory:

| File | Description |
|---|---|
| `ca.crt` | Certificate Authority (CA) certificate from CyberGhost |
| `client.crt` | Client certificate issued by CyberGhost |
| `client.key` | Private key for the client certificate |
| `openvpn.ovpn` | OpenVPN configuration file (`.ovpn`) from CyberGhost |
| `credentials.txt` | Plain-text credentials file (see format below) |

### `credentials.txt` Format

The file must contain exactly two lines:

```
your_cyberghost_username
your_cyberghost_password
```

Line 1 = Username  
Line 2 = Password

---

## How to Obtain These Files

1. Log in to your [CyberGhost account](https://my.cyberghostvpn.com/).
2. Navigate to **My Devices** → **Other** → **OpenVPN**.
3. Select your desired server/region and download the configuration package.
4. Extract the archive – it will contain `ca.crt`, `client.crt`, `client.key`, and an `.ovpn` file.
5. Rename the `.ovpn` file to `openvpn.ovpn` and place all files in this directory.
6. Create `credentials.txt` manually with your username on line 1 and your password on line 2.

---

## Directory Structure (Expected)

```
vpn/
├── README.md          ← This file (committed)
├── ca.crt             ← NOT committed
├── client.crt         ← NOT committed
├── client.key         ← NOT committed
├── openvpn.ovpn       ← NOT committed
└── credentials.txt    ← NOT committed
```

---

## Verifying the VPN Tunnel (IP Check)

After starting the stack, you can verify that the backend container actually exits through the VPN and not your real IP:

```bash
docker compose run --rm vpn-check
```

This runs a one-shot Alpine container inside the VPN network namespace, fetches your external IP from `ipify.org`, and shows country and ISP info from `ipapi.co`. The output should show a CyberGhost exit node, **not** your home IP.

Example output:
```
--- VPN IP Check ---
185.212.xxx.xxx
  "ip": "185.212.xxx.xxx",
  "country_name": "Netherlands",
  "org": "AS9009 M247 Europe SRL",
--- Done ---
```

---

## Split-Tunneling / LAN Access

The VPN container is configured to keep your local LAN accessible while routing all other traffic through the VPN tunnel. The default LAN subnet is `192.168.0.0/16`, configurable via `LAN_SUBNET` in your `.env` file.

If your router uses a different subnet (e.g. `10.0.0.0/8` or `172.16.0.0/12`), update `LAN_SUBNET` accordingly.
