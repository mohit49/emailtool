# Production Deployment Checklist for przio.com

## Pre-Deployment

### 1. Environment Variables ✅
- [ ] Create `.env.production` file
- [ ] Set `MONGODB_URI` (MongoDB Atlas connection string)
- [ ] Generate and set `JWT_SECRET` (use: `node scripts/generate-secret.js`)
- [ ] Set `NEXT_PUBLIC_APP_URL=https://przio.com`
- [ ] Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- [ ] Set `NODE_ENV=production`

### 2. MongoDB Setup ✅
- [ ] Create MongoDB Atlas account
- [ ] Create cluster
- [ ] Create database user
- [ ] Whitelist server IP (or 0.0.0.0/0 for all)
- [ ] Get connection string
- [ ] Test connection

### 3. Domain Configuration ✅
- [ ] Point przio.com A record to server IP
- [ ] Configure www.przio.com (optional)
- [ ] SSL certificate ready (Let's Encrypt)

### 4. SMTP Configuration ✅
- [ ] Set up support@przio.com email account
- [ ] Generate app password for SMTP
- [ ] Test SMTP connection

## Deployment Steps

### Step 1: Build Application
```bash
cd frontend
npm install --production
npm run build
```

### Step 2: Test Build Locally
```bash
npm start
# Visit http://localhost:3000
# Verify everything works
```

### Step 3: Deploy to Server

#### Option A: Vercel (Easiest)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy
5. Add custom domain: przio.com

#### Option B: VPS with PM2
```bash
# On server
cd /var/www/emailtestingtool/frontend
npm install --production
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Option C: Docker
```bash
docker-compose up -d
```

### Step 4: Configure Nginx (if using VPS)
- [ ] Install Nginx
- [ ] Create site configuration
- [ ] Enable site
- [ ] Test configuration
- [ ] Restart Nginx

### Step 5: SSL Certificate
- [ ] Install Certbot
- [ ] Obtain certificate for przio.com
- [ ] Configure auto-renewal

## Post-Deployment

### 1. Create Admin User ✅
- [ ] Sign up at https://przio.com/signup
- [ ] Verify email
- [ ] Update user role to admin in MongoDB:
  ```javascript
  db.users.updateOne(
    { email: "admin@przio.com" },
    { $set: { role: "admin" } }
  )
  ```

### 2. Configure Admin SMTP ✅
- [ ] Login as admin
- [ ] Go to Admin Dashboard → Settings
- [ ] Add SMTP configuration:
  - Title: Production SMTP
  - Host: smtp.gmail.com (or your SMTP)
  - Port: 587
  - User: support@przio.com
  - Password: [app password]
  - From: support@przio.com
  - **Set as Default**: ✓
  - **Active**: ✓
- [ ] Test SMTP connection

### 3. Verify System Emails ✅
- [ ] Test email verification (sign up new user)
- [ ] Verify email comes from support@przio.com
- [ ] Test password reset (if implemented)

### 4. Security Checks ✅
- [ ] HTTPS is working
- [ ] Environment variables not exposed
- [ ] MongoDB connection secured
- [ ] JWT_SECRET is strong and unique
- [ ] Firewall configured
- [ ] Regular backups scheduled

### 5. Performance Checks ✅
- [ ] Application loads quickly
- [ ] API responses are fast
- [ ] MongoDB queries optimized
- [ ] Images/assets optimized
- [ ] Monitoring set up (PM2, logs)

### 6. Functionality Tests ✅
- [ ] User signup works
- [ ] Email verification works
- [ ] User login works
- [ ] Template creation works
- [ ] Email sending works
- [ ] Admin dashboard accessible
- [ ] Admin can manage users
- [ ] Admin can manage SMTP
- [ ] Admin can manage templates

## Monitoring & Maintenance

### Daily
- [ ] Check application logs
- [ ] Monitor error rates
- [ ] Check email delivery

### Weekly
- [ ] Review user activity
- [ ] Check MongoDB performance
- [ ] Verify backups

### Monthly
- [ ] Update dependencies
- [ ] Review security
- [ ] Performance optimization

## Troubleshooting

### Application won't start
```bash
pm2 logs email-testing-tool
# Check for errors
```

### 502 Bad Gateway
- Check if app is running: `pm2 status`
- Check Nginx configuration
- Verify port 3000 is accessible

### Emails not sending
- Verify admin SMTP is configured
- Test SMTP in admin panel
- Check SMTP credentials

### MongoDB connection issues
- Verify connection string
- Check IP whitelist
- Verify credentials

## Quick Commands

```bash
# View logs
pm2 logs email-testing-tool

# Restart application
pm2 restart email-testing-tool

# Stop application
pm2 stop email-testing-tool

# Monitor
pm2 monit

# Update application
cd /var/www/emailtestingtool
git pull
cd frontend
npm install --production
npm run build
pm2 restart email-testing-tool
```

## Support

For detailed instructions, see:
- **PRODUCTION_SETUP.md** - Quick setup guide
- **DEPLOYMENT.md** - Detailed deployment guide

