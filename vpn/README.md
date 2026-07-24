# VPN Configuration (CyberGhost via OpenVPN)

This directory contains the OpenVPN configuration and certificate files required to tunnel all backend traffic through CyberGhost VPN.

> ⚠️ **None of these files are committed to the repository.** They must be placed here manually before starting the stack.

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
4. Extract the downloaded archive — it will contain `ca.crt`, `client.crt`, `client.key`, and an `.ovpn` file.
5. Rename the `.ovpn` file to `openvpn.ovpn` and place all files in this directory.
6. Create `credentials.txt` manually with your username on line 1 and your password on line 2.

---

## Directory Structure (Expected)

```
vpn/
├── README.md          ← This file (committed)
├── ca.crt             ← NOT committed (add to .gitignore)
├── client.crt         ← NOT committed
├── client.key         ← NOT committed
├── openvpn.ovpn       ← NOT committed
└── credentials.txt    ← NOT committed
```

---

## Split-Tunneling / LAN Access

The VPN container is configured to keep your local LAN accessible while routing all other traffic through the VPN tunnel. The default LAN subnet is `192.168.0.0/16`, which can be overridden via the `LAN_SUBNET` variable in your `.env` file.
