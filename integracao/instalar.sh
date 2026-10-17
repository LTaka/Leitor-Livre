#!/usr/bin/env bash
set -euo pipefail
ID="${1:-}"
if [[ ! "$ID" =~ ^[a-p]{32}$ ]]; then echo 'Uso: bash instalar.sh ID_DA_EXTENSAO';exit 2;fi
for x in python3 espeak; do command -v "$x" >/dev/null || { echo "Falta $x";exit 1;}; done
if ! command -v ffmpeg >/dev/null; then
 echo 'FFmpeg não encontrado: WAV funcionará; MP3 exigirá instalá-lo depois.'
fi
HERE="$(cd "$(dirname "$0")" && pwd)"
DEST="$HOME/.local/share/leitor-livre"
mkdir -p "$DEST"
install -m 755 "$HERE/native_host.py" "$DEST/native_host.py"
for browser in google-chrome google-chrome-beta google-chrome-unstable microsoft-edge microsoft-edge-beta microsoft-edge-dev chromium; do
 OUT="$HOME/.config/$browser/NativeMessagingHosts/br.leitorlivre.exporter.json"
 mkdir -p "$(dirname "$OUT")"
 python3 - "$OUT" "$DEST/native_host.py" "$ID" <<'INNER'
import sys,json
out,host,id=sys.argv[1:]
with open(out,'w') as f:json.dump(dict(name='br.leitorlivre.exporter',description='Leitor Livre MP3',path=host,type='stdio',allowed_origins=[f'chrome-extension://{id}/']),f,indent=2)
INNER
 chmod 644 "$OUT"
 echo "Registrado: $OUT"
done
echo 'Pronto. Feche COMPLETAMENTE o Chrome/Edge e reabra.'
