# Render Deployment Configuration

## 📋 Prerequisites
- Render account (free tier available)
- GitHub repository
- MongoDB Atlas cluster

## 🚀 Step 1: Prepare Backend
```bash
# Ensure dependencies are installed
cd server
npm install

# Test locally first
npm start
```

## 📁 Step 2: Create render.yaml
```yaml
services:
  # Backend Web Service
  - type: web
    name: fileshare-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        value: your-mongodb-atlas-connection-string
      - key: EMAIL_USER
        value: your-email@gmail.com
      - key: EMAIL_PASS
        value: your-app-password
      - key: JWT_SECRET
        value: your-super-secret-jwt-key
      - key: FRONTEND_URL
        value: https://your-vercel-app.vercel.app
    disk:
      name: fileshare-uploads
      mountPath: /app/uploads
      sizeGB: 1
```

## 🌐 Step 3: Deploy to Render
1. **Create Render Account**: [render.com](https://render.com)
2. **Connect GitHub**: Connect your repository
3. **Create Web Service**:
   - Choose "Web Service"
   - Connect your GitHub repo
   - Select "server" directory
   - Node runtime (latest)
   - Build Command: `npm install`
   - Start Command: `npm start`

## ⚙️ Step 4: Configure Environment Variables
In Render Dashboard:
1. Go to your service → Environment
2. Add these variables:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/filesharing
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   JWT_SECRET=your-super-secret-jwt-key
   FRONTEND_URL=https://your-app.vercel.app
   ```

## 📊 Render Features You Get:
- ✅ Automatic HTTPS/SSL
- ✅ Free SSL certificates
- ✅ Auto-deploys from Git
- ✅ Persistent storage (1GB free)
- ✅ Custom domains
- ✅ Environment variables
- ✅ Logs and monitoring

## 🔧 Render Specific Settings:
- **Instance Type**: Free (shared CPU, 512MB RAM)
- **Region**: Choose closest to your users
- **Build Cache**: Enabled for faster deploys
- **Health Check**: /api/health endpoint
