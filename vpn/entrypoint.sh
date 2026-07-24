#!/bin/sh
# Wrapper around the wfg/openvpn-client entrypoint.
#
# Docker's port mapping (ports: 1966:80) only works for the container
# that declares `ports:`. Since nginx runs in network_mode: service:vpn,
# IT listens on port 80 inside the shared namespace, but the VPN container
# itself has nothing on port 80 — so incoming connections are refused.
#
# Fix: run socat in the background INSIDE the VPN container to forward
# TCP :80 -> 127.0.0.1:80. Because the VPN and nginx share the same
# network namespace, socat can reach nginx on 127.0.0.1:80 and Docker
# sees the VPN container listening on :80 for the port mapping.
#
# We wait briefly for socat to be available (it's installed below),
# then hand off to the original entry.sh.

# Install socat if not present (image is Alpine-based)
if ! command -v socat > /dev/null 2>&1; then
    apk add --no-cache socat > /dev/null 2>&1
fi

# Start socat in background: listen on all interfaces :80, forward to
# localhost :80 where nginx (in the shared namespace) is listening.
# Use a small retry loop so nginx has time to come up after VPN connects.
(
  while true; do
    socat TCP-LISTEN:8080,fork,reuseaddr TCP:127.0.0.1:80 2>/dev/null
    sleep 2
  done
) &

# Hand off to the original wfg entrypoint
exec /app/scripts/entry.sh "$@"
