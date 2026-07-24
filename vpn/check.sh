#!/bin/sh
# VPN IP Check
# Run via: docker compose run --rm vpn-check
# Compares the host's real IP (via eth0) against the VPN exit IP (via tun0).

apk add --no-cache curl 2>/dev/null 1>/dev/null

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
RESET='\033[0m'
BOLD='\033[1m'

printf "\n"
printf "${BOLD}=== VPN IP Check ===${RESET}\n"

REAL_IP=$(curl -s --interface eth0 --max-time 5 https://api.ipify.org 2>/dev/null)
if [ -z "$REAL_IP" ]; then
  REAL_IP="(could not determine)"
fi

VPN_IP=$(curl -s --interface tun0 --max-time 5 https://api.ipify.org 2>/dev/null)
if [ -z "$VPN_IP" ]; then
  VPN_IP="(could not determine)"
fi

printf "  Host IP  : ${BOLD}%s${RESET}\n" "$REAL_IP"
printf "  VPN IP   : ${BOLD}%s${RESET}\n" "$VPN_IP"
printf "\n"

if [ "$VPN_IP" = "(could not determine)" ]; then
  printf "  ${YELLOW}UNKNOWN - tun0 did not return an IP. Is the VPN tunnel up?${RESET}\n"
elif [ "$REAL_IP" = "$VPN_IP" ]; then
  printf "  ${RED}FAIL - VPN does not appear to be routing traffic!${RESET}\n"
else
  printf "  ${GREEN}OK - VPN is active. Traffic exits via a different IP.${RESET}\n"
fi

printf "\n"
