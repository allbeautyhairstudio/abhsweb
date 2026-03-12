#!/bin/bash
# ─── ABHS Deploy Script ─────────────────────────────────
# Run from VPS: bash /var/www/abhsweb/abhs/deploy/deploy.sh
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

# Restart PM2 process
echo "→ Restarting abhs..."
pm2 restart abhs --update-env 2>/dev/null || pm2 start "$APP_DIR/deploy/ecosystem.config.js"
pm2 save

echo "→ Checking status..."
sleep 2
pm2 status abhs
echo "=== Deploy complete ==="
