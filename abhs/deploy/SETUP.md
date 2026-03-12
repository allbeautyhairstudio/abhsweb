# ABHS VPS Deployment Guide

Ubuntu 24.04 LTS — Nginx reverse proxy alongside existing sites.

---

## 1. Install Node.js 22 LTS (if not already installed)

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # should be v22.x
```

## 2. Install build tools (needed for better-sqlite3)

```bash
sudo apt-get install -y build-essential python3
```

## 3. Clone the repo

```bash
sudo mkdir -p /var/www/abhsweb
sudo chown $USER:$USER /var/www/abhsweb
git clone git@github.com-allbeautyhairstudio:allbeautyhairstudio/abhsweb.git /var/www/abhsweb
```

> **Note:** Make sure the SSH key for `github.com-allbeautyhairstudio` is on the VPS,
> or use HTTPS: `https://github.com/allbeautyhairstudio/abhsweb.git`

## 4. Create .env.local

```bash
cd /var/www/abhsweb/abhs
cp .env.example .env.local
nano .env.local
```

**Change these values:**

| Variable | What to set |
|---|---|
| `ADMIN_PASSWORD` | Strong password (use: `openssl rand -base64 24`) |
| `ADMIN_SECRET` | Random secret (use: `openssl rand -base64 32`) |
| `SQUARE_ACCESS_TOKEN` | Your production Square token |
| `SQUARE_LOCATION_ID` | Your Square location ID |
| `SQUARE_ENVIRONMENT` | `production` |
| `INSTAGRAM_ACCESS_TOKEN` | Your Instagram long-lived token |
| `NOTIFY_PHONE` | Karli's phone number |
| `SMTP_USER` | Gmail address |
| `SMTP_PASS` | Gmail app password |

## 5. Install dependencies and build

```bash
cd /var/www/abhsweb/abhs
npm ci
npx next build
```

## 6. Create data directories

```bash
mkdir -p /var/www/abhsweb/abhs/data/uploads
sudo chown -R www-data:www-data /var/www/abhsweb/abhs/data
```

## 7. Install the systemd service

```bash
sudo cp /var/www/abhsweb/abhs/deploy/abhs.service /etc/systemd/system/abhs.service
sudo systemctl daemon-reload
sudo systemctl enable abhs
sudo systemctl start abhs

# Verify it's running:
sudo systemctl status abhs
# Check logs if needed:
journalctl -u abhs -n 50
```

## 8. Add the Nginx site

```bash
sudo cp /var/www/abhsweb/abhs/deploy/abhs.nginx.conf /etc/nginx/sites-available/abhs
sudo ln -s /etc/nginx/sites-available/abhs /etc/nginx/sites-enabled/abhs

# Test config
sudo nginx -t

# Reload (not restart — keeps other sites up)
sudo nginx -s reload
```

## 9. SSL with Let's Encrypt

```bash
sudo certbot --nginx -d allbeautyhairstudio.com -d www.allbeautyhairstudio.com
```

Certbot will automatically modify the Nginx config to add SSL. Auto-renewal is set up by default.

## 10. DNS

Point these records to your VPS IP:

| Type | Name | Value |
|------|------|-------|
| A | `allbeautyhairstudio.com` | `YOUR_VPS_IP` |
| A | `www.allbeautyhairstudio.com` | `YOUR_VPS_IP` |

---

## Redeploying after changes

```bash
cd /var/www/abhsweb
git pull origin main
cd abhs
npm ci
npx next build
sudo systemctl restart abhs
```

Or use the deploy script:

```bash
sudo bash /var/www/abhsweb/abhs/deploy/deploy.sh
```

## Useful commands

```bash
sudo systemctl status abhs        # Check if running
sudo systemctl restart abhs       # Restart app
sudo systemctl stop abhs          # Stop app
journalctl -u abhs -f             # Live logs
journalctl -u abhs -n 100         # Last 100 log lines
sudo nginx -t                     # Test Nginx config
sudo nginx -s reload              # Reload Nginx
```

## Monitoring

- App runs on `http://127.0.0.1:3000` (internal only)
- Nginx proxies port 80/443 → 3000
- SQLite DB at `data/abhs.db` (auto-created on first run)
- Client photo uploads at `data/uploads/`
- Systemd auto-restarts on crash (5s delay)
