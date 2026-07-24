#!/bin/bash
# modern_rebuild_frontend.sh
# Cooles Update-Skript für das Frontend 🚀

SERVICE_NAME="iptv_restream_frontend"

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}💻 Prüfe Docker-Dienst...${NC}"
docker info > /dev/null 2>&1 || { echo -e "${RED}Docker läuft nicht!${NC}"; exit 1; }

echo -e "${YELLOW}📦 Frontend neu bauen...${NC}"
docker-compose build $SERVICE_NAME || { echo -e "${RED}Build fehlgeschlagen!${NC}"; exit 1; }

echo -e "${YELLOW}🧹 Alten Container prüfen und ggf. entfernen...${NC}"
OLD_CONTAINER=$(docker ps -a -q --filter "name=${SERVICE_NAME}")
if [ ! -z "$OLD_CONTAINER" ]; then
    echo -e "${YELLOW}⚠ Gefundener alter Container: $OLD_CONTAINER${NC}"
    docker rm -f $OLD_CONTAINER || { echo -e "${RED}Container konnte nicht entfernt werden${NC}"; exit 1; }
else
    echo -e "${GREEN}✔ Kein alter Container gefunden.${NC}"
fi

echo -e "${YELLOW}🚀 Frontend neu starten...${NC}"
docker-compose up -d $SERVICE_NAME || { echo -e "${RED}Container konnte nicht gestartet werden${NC}"; exit 1; }

echo -e "${GREEN}🎉 Fertig! Aktueller Status:${NC}"
docker ps --filter "name=${SERVICE_NAME}"

# Optional: Logs live anzeigen
read -p "📄 Logs live anzeigen? (y/n) " SHOW_LOGS
if [[ "$SHOW_LOGS" =~ ^[Yy]$ ]]; then
    docker logs -f $(docker ps -q --filter "name=${SERVICE_NAME}")
fi
