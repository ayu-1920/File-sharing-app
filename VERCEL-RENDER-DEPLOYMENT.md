# 🚀 Vercel + Render Deployment Guide

## 📋 Overview
- **Frontend**: Vercel (React app)
- **Backend**: Render (Node.js API)
- **Database**: MongoDB Atlas
- **Total Cost**: FREE (both platforms)

## 🎯 Deployment Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Vercel       │    │     Render       │    │  MongoDB Atlas  │
│   (Frontend)   │◄──►│    (Backend)    │◄──►│   (Database)    │
│   https://       │    │   https://       │    │   mongodb://    │
│   .vercel.app    │    │   .onrender.com  │    │   .mongodb.net  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📝 Step-by-Step Deployment

### 🥇 Step 1: Setup MongoDB Atlas
1. **Create Account**: [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. **Create Cluster**: M0 Sandbox (FREE)
3. **Database Access**: Create user `fileshare_user`
4. **Network Access**: Add IP: `0.0.0.0/0` (allows all)
5. **Get Connection String**: 
   ```
   mongodb+srv://fileshare_user:<password>@cluster.mongodb.net/filesharing
   ```

### 🥈 Step 2: Deploy Frontend to Vercel
1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Deploy Frontend**:
   ```bash
   cd client
   npm run build
   vercel --prod
   ```

3. **Note Your Vercel URL**: 
   ```
   https://your-app-name.vercel.app
   ```

### 🥉 Step 3: Deploy Backend to Render
1. **Create Render Account**: [render.com](https://render.com)
2. **Connect GitHub**: Connect your repository
3. **Create Web Service**:
   - Name: `fileshare-backend`
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: `server`

4. **Add Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://fileshare_user:password@cluster.mongodb.net/filesharing
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   JWT_SECRET=your-super-secret-jwt-key
   FRONTEND_URL=https://your-app-name.vercel.app
   ```

### 🔗 Step 4: Connect Frontend to Backend
1. **Update Vercel Environment**:
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add: `REACT_APP_API_URL`
   - Value: `https://your-backend-name.onrender.com/api`

2. **Redeploy Frontend**:
   ```bash
   cd client
   vercel --prod
   ```

## ⚙️ Environment Variables Summary

### Frontend (Vercel):
```env
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

### Backend (Render):
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://fileshare_user:password@cluster.mongodb.net/filesharing
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://your-app.vercel.app
```

## 🎉 Deployment Complete!

### Your Live URLs:
- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-backend.onrender.com/api`
- **Database**: MongoDB Atlas cluster

### 🧪 Test Your Deployment:
1. **Visit Frontend**: Open your Vercel URL
2. **Register Account**: Create a new user
3. **Upload File**: Test file upload
4. **Share via Email**: Test email sharing
5. **Download File**: Test download functionality

## 📊 Features You Get:

### Vercel (Frontend):
- ✅ Global CDN
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Preview deployments
- ✅ Analytics
- ✅ 100GB bandwidth/month

### Render (Backend):
- ✅ Automatic HTTPS
- ✅ Persistent storage (1GB)
- ✅ Custom domains
- ✅ Environment variables
- ✅ Auto-deploys
- ✅ Monitoring

### MongoDB Atlas:
- ✅ 512MB storage (free)
- ✅ Automatic backups
- ✅ Global clusters
- ✅ Monitoring dashboard

## 🔧 Maintenance & Scaling

### When to Upgrade:
- **High Traffic**: >1000 concurrent users
- **Storage**: >1GB files uploaded
- **API Calls**: >100k requests/month

### Scaling Options:
- **Vercel Pro**: $20/month for more bandwidth
- **Render Starter**: $7/month for more power
- **MongoDB Atlas M10**: $25/month for more storage

## 🆘 Troubleshooting

### Common Issues:
1. **CORS Errors**: Check FRONTEND_URL matches Vercel URL
2. **Database Connection**: Verify MongoDB URI and IP access
3. **Email Not Sending**: Check email credentials and app passwords
4. **Upload Fails**: Check Render storage limits

### Debug Commands:
```bash
# Check Render logs
# In Render Dashboard → Logs

# Test API endpoint
curl https://your-backend.onrender.com/api/health

# Check Vercel deployment
# In Vercel Dashboard → Logs
```

---

**🎉 Congratulations! Your file sharing application is now live on Vercel + Render!**
