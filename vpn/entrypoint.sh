#!/bin/sh
# Wrapper around the wfg/openvpn-client entrypoint.
#
# Docker's port mapping (ports: 1966:8080) only works for the container
# that declares `ports:`. nginx runs in network_mode: service:vpn and
# listens on port 80 inside the shared namespace, but the VPN container
# itself has nothing on :8080, so Docker refuses incoming connections.
#
# Fix: run socat in the background INSIDE the VPN container to forward
# TCP :8080 -> 127.0.0.1:80 (nginx in the shared namespace).

# Install socat if not present (Alpine-based image)
if ! command -v socat > /dev/null 2>&1; then
    apk add --no-cache socat > /dev/null 2>&1
fi

# Start socat forwarder in background
(
  while true; do
    socat TCP-LISTEN:8080,fork,reuseaddr TCP:127.0.0.1:80 2>/dev/null
    sleep 2
  done
) &

# Hand off to the original wfg entrypoint
exec /data/scripts/entry.sh "$@"
