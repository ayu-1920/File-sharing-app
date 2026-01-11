# 🚀 File Sharing Application Deployment Guide

## 📋 Table of Contents
1. [Deployment Options](#deployment-options)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Email Configuration](#email-configuration)
6. [Deployment Methods](#deployment-methods)
7. [Monitoring & Maintenance](#monitoring--maintenance)

## 🎯 Deployment Options

### Option 1: Docker Deployment (Recommended)
- **Best for**: Production, easy scaling, consistent environments
- **Pros**: Containerized, portable, easy to manage
- **Cons**: Requires Docker knowledge

### Option 2: VPS/Cloud Server
- **Best for**: Custom setups, full control
- **Platforms**: DigitalOcean, AWS EC2, Vultr, Linode
- **Pros**: Full control, customizable
- **Cons**: More manual setup

### Option 3: PaaS (Platform as a Service)
- **Best for**: Quick deployment, minimal DevOps
- **Platforms**: Heroku, Vercel, Netlify, Render
- **Pros**: Easy deployment, built-in features
- **Cons**: Less control, potential costs

## 🔧 Prerequisites

### Required Software:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (Atlas or self-hosted)
- **Git**
- **Domain name** (optional but recommended)

### Required Accounts:
- **MongoDB Atlas** account (free tier available)
- **Email service** (Gmail, SendGrid, etc.)
- **Hosting platform** account

## 🌍 Environment Setup

### 1. Clone and Prepare Repository
```bash
git clone <your-repository-url>
cd FILE
```

### 2. Install Dependencies
```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

### 3. Environment Configuration

#### Backend Environment (.env)
```bash
# Copy the example file
cp .env.example .env

# Edit the .env file with your values
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/filesharing
FRONTEND_URL=https://your-domain.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
JWT_SECRET=your-super-secret-jwt-key
```

#### Frontend Environment (.env.production)
```bash
REACT_APP_API_URL=https://your-backend-domain.com/api
```

## 🗄️ Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier is sufficient)

### 2. Configure Database
1. **Create Cluster**: Choose M0 Sandbox (free)
2. **Set Up Network Access**:
   - Add your server IP address (0.0.0.0/0 for all IPs)
   - Add your local IP for development

### 3. Create Database User
1. Go to "Database Access"
2. Create new user with:
   - Username: `fileshare_user`
   - Password: Generate strong password
   - Privileges: Read and write to any database

### 4. Get Connection String
1. Go to "Clusters" → "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your user password

### 5. Update Environment Variables
```bash
MONGODB_URI=mongodb+srv://fileshare_user:your_password@cluster.mongodb.net/filesharing?retryWrites=true&w=majority
```

## 📧 Email Configuration

### Option 1: Gmail (Free)
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account → Security → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASS`

### Option 2: SendGrid (Recommended for production)
1. Create SendGrid account
2. Verify your sender domain
3. Get API key
4. Update email service configuration

### Option 3: Other SMTP Services
- Outlook, Yahoo Mail, etc.
- Configure in `server/services/emailService.js`

## 🚀 Deployment Methods

### Method 1: Docker Deployment (Recommended)

#### 1. Build and Deploy with Docker Compose
```bash
# Copy environment file
cp .env.example .env
# Edit .env with your values

# Build and start all services
docker-compose up -d

# Check logs
docker-compose logs -f
```

#### 2. Production Docker Commands
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Update specific service
docker-compose up -d --build backend

# Stop services
docker-compose down
```

### Method 2: VPS/Cloud Server Deployment

#### 1. Server Setup (Ubuntu/Debian)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install Git
sudo apt install git -y
```

#### 2. Deploy Application
```bash
# Clone repository
git clone <your-repo-url>
cd FILE

# Install dependencies
cd client && npm install && cd ..
cd server && npm install && cd ..

# Build frontend
cd client
npm run build
cd ..

# Start backend with PM2
cd server
pm2 start index.js --name "fileshare-backend"
pm2 save
pm2 startup
```

#### 3. Configure Nginx
```nginx
# /etc/nginx/sites-available/fileshare
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/FILE/client/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 4. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Method 3: PaaS Deployment

#### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set EMAIL_USER=your_email
heroku config:set EMAIL_PASS=your_password

# Deploy
git push heroku main
```

#### Vercel (Frontend only)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd client
vercel --prod
```

## 🔍 Monitoring & Maintenance

### 1. Health Checks
```bash
# Check if services are running
pm2 status
docker-compose ps

# Check logs
pm2 logs fileshare-backend
docker-compose logs -f
```

### 2. Database Monitoring
- **MongoDB Atlas**: Built-in monitoring dashboard
- **Metrics**: Connection count, query performance, storage usage

### 3. Performance Monitoring
- **Application monitoring**: New Relic, DataDog
- **Error tracking**: Sentry
- **Uptime monitoring**: UptimeRobot

### 4. Backup Strategy
- **Database**: MongoDB Atlas automatic backups
- **Files**: Regular backup of uploads directory
- **Code**: Git repository backup

### 5. Security Maintenance
- **Regular updates**: Keep dependencies updated
- **Security patches**: Monitor for vulnerabilities
- **Access control**: Review user permissions regularly

## 📊 Scaling Considerations

### When to Scale:
- High traffic (>1000 concurrent users)
- Large file uploads (>100MB)
- Database performance issues

### Scaling Options:
1. **Vertical Scaling**: Increase server resources
2. **Horizontal Scaling**: Load balancer + multiple instances
3. **CDN**: For static assets and file downloads
4. **Database Sharding**: For very large datasets

## 🆘 Troubleshooting

### Common Issues:
1. **Database Connection**: Check MongoDB URI and network access
2. **Email Not Sending**: Verify email credentials and app passwords
3. **File Upload Issues**: Check disk space and permissions
4. **CORS Errors**: Verify FRONTEND_URL configuration

### Debug Commands:
```bash
# Check application logs
pm2 logs fileshare-backend --lines 100

# Test database connection
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/filesharing"

# Check network connectivity
curl -I https://your-domain.com/api/health
```

## 📞 Support

For deployment issues:
1. Check logs for error messages
2. Verify environment variables
3. Test database connectivity
4. Review this documentation

---

**🎉 Congratulations! Your file sharing application is now ready for production deployment!**
