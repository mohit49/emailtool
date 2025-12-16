# Production Deployment Guide for przio.com

This guide will help you deploy the Email Testing Tool to production on przio.com.

## Prerequisites

1. **Server/Hosting**: VPS (DigitalOcean, AWS EC2, Linode, etc.) or Platform (Vercel, Railway, Render)
2. **Domain**: przio.com configured with DNS
3. **MongoDB**: MongoDB Atlas (recommended) or self-hosted MongoDB
4. **SSL Certificate**: For HTTPS (Let's Encrypt is free)
5. **Node.js**: Version 18+ installed on server

## Step 1: Prepare Production Environment

### 1.1 Set Up MongoDB Atlas (Recommended)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your server IP (or 0.0.0.0/0 for all IPs - less secure)
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/emailtestingtool`

### 1.2 Configure Domain DNS

Point przio.com to your server:
- **A Record**: `@` → Your server IP
- **CNAME Record**: `www` → `przio.com` (optional)

## Step 2: Server Setup (VPS Deployment)

### 2.1 Install Node.js and PM2

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

### 2.2 Clone and Setup Application

```bash
# Clone repository
cd /var/www
sudo git clone <your-repo-url> emailtestingtool
cd emailtestingtool/frontend

# Install dependencies
npm install --production

# Build the application
npm run build
```

### 2.3 Configure Environment Variables

Create `.env.production` file:

```bash
cd /var/www/emailtestingtool/frontend
sudo nano .env.production
```

Add production environment variables (see `.env.production.example`):

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/emailtestingtool
JWT_SECRET=your-very-strong-random-secret-key-here
NEXT_PUBLIC_APP_URL=https://przio.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=support@przio.com
SMTP_PASS=your-app-password
SMTP_FROM=support@przio.com
NODE_ENV=production
```

**Important**: 
- Generate a strong JWT_SECRET: `openssl rand -base64 32`
- Use MongoDB Atlas connection string
- Set SMTP credentials for support@przio.com

### 2.4 Start Application with PM2

```bash
cd /var/www/emailtestingtool/frontend

# Start the application
pm2 start npm --name "email-testing-tool" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## Step 3: Configure Nginx (Reverse Proxy)

### 3.1 Install Nginx

```bash
sudo apt update
sudo apt install nginx
```

### 3.2 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/przio.com
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name przio.com www.przio.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name przio.com www.przio.com;

    # SSL Certificate (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/przio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/przio.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Increase timeouts for large requests
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

### 3.3 Enable Site and Test

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/przio.com /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Step 4: Install SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d przio.com -d www.przio.com

# Auto-renewal (already configured by certbot)
sudo certbot renew --dry-run
```

## Step 5: Configure Admin SMTP in Production

1. Access your application: https://przio.com
2. Login as admin
3. Go to Admin Dashboard → Settings
4. Add SMTP configuration:
   - **Title**: Production SMTP
   - **Host**: smtp.gmail.com (or your SMTP server)
   - **Port**: 587
   - **User**: support@przio.com
   - **Password**: Your app password
   - **From**: support@przio.com
   - **Set as Default**: ✓ (Check this)
   - **Active**: ✓

## Step 6: Create First Admin User

### Option 1: Via Signup (then promote to admin)

1. Sign up at https://przio.com/signup
2. Verify email
3. Connect to MongoDB and update user role:

```javascript
// In MongoDB shell or MongoDB Compass
db.users.updateOne(
  { email: "your-admin-email@example.com" },
  { $set: { role: "admin" } }
)
```

### Option 2: Via API (if you have access)

```bash
curl -X POST https://przio.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@przio.com",
    "password": "secure-password",
    "name": "Admin User"
  }'
```

Then update role in MongoDB as above.

## Step 7: Production Optimizations

### 7.1 Update Next.js Config

Ensure `next.config.js` has production optimizations:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // For Docker or serverless
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig
```

### 7.2 Set Up Logging

PM2 logs are automatically saved. View them:

```bash
pm2 logs email-testing-tool
```

### 7.3 Set Up Monitoring

```bash
# PM2 Monitoring
pm2 monit

# Or use PM2 Plus (cloud monitoring)
pm2 link <secret-key> <public-key>
```

## Step 8: Deployment Platform Options

### Option A: Vercel (Easiest)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

**Vercel Environment Variables:**
- `MONGODB_URI`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL` = `https://przio.com`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `NODE_ENV` = `production`

### Option B: Railway

1. Connect GitHub repo
2. Add environment variables
3. Deploy

### Option C: DigitalOcean App Platform

1. Create new app
2. Connect GitHub repo
3. Configure environment variables
4. Deploy

## Step 9: Post-Deployment Checklist

- [ ] Application accessible at https://przio.com
- [ ] SSL certificate installed and working
- [ ] Admin user created and can login
- [ ] Admin SMTP configured (support@przio.com)
- [ ] Test email verification works
- [ ] Test sending emails works
- [ ] MongoDB connection stable
- [ ] PM2 process running
- [ ] Nginx serving correctly
- [ ] Logs are being captured

## Step 10: Maintenance

### Update Application

```bash
cd /var/www/emailtestingtool
git pull
cd frontend
npm install --production
npm run build
pm2 restart email-testing-tool
```

### View Logs

```bash
pm2 logs email-testing-tool
```

### Monitor Performance

```bash
pm2 monit
```

## Security Checklist

- [ ] Strong JWT_SECRET (32+ characters, random)
- [ ] MongoDB connection string secured
- [ ] SMTP credentials secured
- [ ] HTTPS enabled
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] Regular backups of MongoDB
- [ ] Environment variables not in git
- [ ] Admin SMTP password is app password (not regular password)

## Troubleshooting

### Application not starting
```bash
pm2 logs email-testing-tool
# Check for errors
```

### Nginx 502 Bad Gateway
- Check if Next.js is running: `pm2 status`
- Check Next.js logs: `pm2 logs email-testing-tool`
- Verify port 3000 is accessible

### MongoDB connection issues
- Check MongoDB Atlas IP whitelist
- Verify connection string
- Check MongoDB user credentials

### Email not sending
- Verify admin SMTP is configured
- Check SMTP credentials
- Test SMTP connection in admin panel

## Support

For issues or questions, check the logs first:
```bash
pm2 logs email-testing-tool --lines 100
```

