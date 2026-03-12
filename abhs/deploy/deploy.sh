#!/bin/bash
# ─── ABHS Deploy Script ─────────────────────────────────
# Run from VPS: sudo bash /var/www/abhsweb/abhs/deploy/deploy.sh
set -e

REPO_DIR="/var/www/abhsweb"
APP_DIR="$REPO_DIR/abhs"
BRANCH="main"

echo "=== ABHS Deploy ==="

cd "$REPO_DIR"

# Pull latest
echo "→ Pulling latest from $BRANCH..."
git fetch origin
git reset --hard "origin/$BRANCH"

# Install dependencies
echo "→ Installing dependencies..."
cd "$APP_DIR"
npm ci --production=false

# Build
echo "→ Building production..."
npx next build

# Create data directories if they don't exist
mkdir -p "$APP_DIR/data/uploads"
chown -R www-data:www-data "$APP_DIR/data"

# Restart service
echo "→ Restarting abhs service..."
systemctl restart abhs

echo "→ Checking status..."
sleep 2
systemctl is-active abhs && echo "=== ABHS is running ===" || echo "!!! ABHS failed to start — check: journalctl -u abhs -n 50"
