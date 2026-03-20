#!/bin/bash
# ============================================
# DAB+ Mux Server - Mac Mini Setup Script
# Viva Libido
# ============================================

set -e

echo "=== DAB+ Mux Server - Mac Mini Setup ==="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js niet gevonden. Installeren via Homebrew..."
    if ! command -v brew &> /dev/null; then
        echo "Homebrew niet gevonden. Installeer eerst Homebrew:"
        echo '  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
        exit 1
    fi
    brew install node
fi

echo "Node.js versie: $(node -v)"
echo "npm versie: $(npm -v)"
echo ""

# Install dependencies
echo "=== Dependencies installeren ==="
npm install

# Create data directory
echo ""
echo "=== Data directory aanmaken ==="
mkdir -p data
echo "Data directory: $(pwd)/data"

# Build for production
echo ""
echo "=== Productie build maken ==="
npm run build

echo ""
echo "=== Setup voltooid! ==="
echo ""
echo "Start de server met:"
echo "  npm start           (productie, poort 3000)"
echo "  npm run dev         (development, poort 3000)"
echo ""
echo "Open in je browser:  http://localhost:3000"
echo ""

# Optional: create launchd plist for auto-start
read -p "Wil je de server automatisch starten bij het opstarten van je Mac? (j/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Jj]$ ]]; then
    PLIST_PATH="$HOME/Library/LaunchAgents/com.vivalibido.dabmux.plist"
    APP_DIR="$(pwd)"

    cat > "$PLIST_PATH" << PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.vivalibido.dabmux</string>
    <key>WorkingDirectory</key>
    <string>${APP_DIR}</string>
    <key>ProgramArguments</key>
    <array>
        <string>$(which npm)</string>
        <string>start</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>${APP_DIR}/data/server.log</string>
    <key>StandardErrorPath</key>
    <string>${APP_DIR}/data/server-error.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PORT</key>
        <string>3000</string>
        <key>NODE_ENV</key>
        <string>production</string>
    </dict>
</dict>
</plist>
PLIST

    launchctl load "$PLIST_PATH"
    echo ""
    echo "LaunchAgent geinstalleerd: $PLIST_PATH"
    echo "De server start nu automatisch bij het opstarten."
    echo ""
    echo "Beheer commando's:"
    echo "  launchctl stop com.vivalibido.dabmux     (stoppen)"
    echo "  launchctl start com.vivalibido.dabmux    (starten)"
    echo "  launchctl unload $PLIST_PATH             (verwijderen)"
fi
