# Vercel Deployment Configuration

## 📋 Prerequisites
- Vercel account (free)
- GitHub account (recommended)
- Your project code ready

## 🚀 Step 1: Install Vercel CLI
```bash
# Install globally
npm install -g vercel

# Login to Vercel
vercel login
```

## 📁 Step 2: Prepare Frontend
```bash
# Navigate to client directory
cd client

# Create production build
npm run build

# Deploy to Vercel
vercel --prod
```

## ⚙️ Step 3: Configure Environment Variables
In Vercel Dashboard:
1. Go to your project → Settings → Environment Variables
2. Add: `REACT_APP_API_URL`
3. Value: `https://your-backend-url.onrender.com/api`

## 🌐 Step 4: Custom Domain (Optional)
1. In Vercel Dashboard → Domains
2. Add your custom domain
3. Update DNS records as instructed

## 📊 Vercel Features You Get:
- ✅ Automatic HTTPS/SSL
- ✅ Global CDN
- ✅ Automatic deployments from Git
- ✅ Preview deployments
- ✅ Analytics
- ✅ Custom domain support

## 🔄 Auto-Deploy from GitHub:
1. Connect your GitHub repository
2. Vercel auto-deploys on push
3. Preview deployments for each PR
4. Custom build settings if needed
