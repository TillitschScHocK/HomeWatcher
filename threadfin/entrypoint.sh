#!/bin/sh
set -e

# Inject M3U URL and EPG URL into Threadfin config via env vars at startup.
# Threadfin reads its config from /home/threadfin/conf/settings.json

CONF_DIR="/home/threadfin/conf"
SETTINGS="$CONF_DIR/settings.json"

mkdir -p "$CONF_DIR"

if [ ! -f "$SETTINGS" ]; then
  cat > "$SETTINGS" <<EOF
{
  "version": "1.4.4",
  "m3u": {
    "files": {
      "1": {
        "file": "${M3U_URL}",
        "type": "m3u",
        "updateInterval": 60
      }
    }
  },
  "xmltv": {
    "files": {
      "1": {
        "file": "${EPG_URL}",
        "type": "xmltv",
        "updateInterval": 60
      }
    }
  },
  "tuner": 10
}
EOF
fi

exec ./threadfin -port 34400 -config "$CONF_DIR"
