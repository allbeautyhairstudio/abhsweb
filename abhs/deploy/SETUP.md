# ABHS VPS Deployment Guide

Ubuntu 24.04 LTS — PM2 + Nginx reverse proxy alongside existing sites.

---

## 1. Install build tools (needed for better-sqlite3)

```bash
sudo apt-get install -y build-essential python3
```

> Skip if already installed. Node.js + PM2 + Nginx are already on the VPS.

## 2. Clone the repo

```bash
cd /var/www
git clone git@github.com-allbeautyhairstudio:allbeautyhairstudio/abhsweb.git
```

> If the SSH key isn't on the VPS yet, use HTTPS:
> `git clone https://github.com/allbeautyhairstudio/abhsweb.git`

## 3. Create .env.local

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

## 4. Install dependencies and build

```bash
cd /var/www/abhsweb/abhs
npm ci
npx next build
```

## 5. Create data directories

```bash
mkdir -p /var/www/abhsweb/abhs/data/uploads
```

## 6. Start with PM2

```bash
cd /var/www/abhsweb/abhs
pm2 start deploy/ecosystem.config.js
pm2 save

# Verify it's running:
pm2 status
pm2 logs abhs --lines 20
```

## 7. Check the port

Pick a port that doesn't conflict with your other PM2 apps. Default is 3005.
If 3005 is taken, edit `deploy/ecosystem.config.js` and update the port.

```bash
# Check what ports are in use:
ss -tlnp | grep -E '300[0-9]'
```

## 8. Add the Nginx site

```bash
sudo cp /var/www/abhsweb/abhs/deploy/abhs.nginx.conf /etc/nginx/sites-available/abhs
sudo ln -s /etc/nginx/sites-available/abhs /etc/nginx/sites-enabled/abhs

# Test config (won't affect other sites)
sudo nginx -t

# Reload
sudo nginx -s reload
```

## 9. SSL with Let's Encrypt

```bash
sudo certbot --nginx -d allbeautyhairstudio.com -d www.allbeautyhairstudio.com
```

Certbot will auto-modify the Nginx config for SSL. Auto-renewal is set up by default.

## 10. DNS

Point these records to your VPS IP:

| Type | Name                            | Value         |
|------|---------------------------------|---------------|
| A    | `allbeautyhairstudio.com`       | `YOUR_VPS_IP` |
| A    | `www.allbeautyhairstudio.com`   | `YOUR_VPS_IP` |

---

## Redeploying after changes

```bash
cd /var/www/abhsweb
git pull origin main
cd abhs
npm ci
npx next build
pm2 restart abhs
```

Or use the deploy script:

```bash
bash /var/www/abhsweb/abhs/deploy/deploy.sh
```

## Useful commands

```bash
pm2 status                     # All apps
pm2 logs abhs                  # Live logs
pm2 logs abhs --lines 100     # Last 100 lines
pm2 restart abhs               # Restart
pm2 stop abhs                  # Stop
pm2 delete abhs                # Remove from PM2
sudo nginx -t                  # Test Nginx config
sudo nginx -s reload           # Reload Nginx
```

## Monitoring

- App runs on `http://127.0.0.1:3005` (internal only)
- Nginx proxies port 80/443 → 3005
- SQLite DB at `data/abhs.db` (auto-created on first run)
- Client photo uploads at `data/uploads/`
- PM2 auto-restarts on crash (5s delay, max 10 retries)
- `pm2 monit` for real-time CPU/memory dashboard
