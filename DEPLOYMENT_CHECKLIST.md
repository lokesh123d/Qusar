# 🚀 Deployment Checklist for Qusar E-commerce

## Current Issues to Fix:
1. ❌ CORS Error: Backend still showing old CORS config
2. ❌ 500 Internal Server Error: Backend might be crashing

---

## ✅ Step-by-Step Fix

### 1. **Check Render Deployment Status**
- [ ] Go to [Render Dashboard](https://dashboard.render.com/)
- [ ] Click on your `qusar` or `qusar-backend` service
- [ ] Check if it's currently deploying
- [ ] If not, click **"Manual Deploy" → "Deploy latest commit"**

### 2. **Verify Render Settings**

#### Root Directory:
- [ ] Go to **Settings** tab
- [ ] Set **Root Directory** to: `Backend`
- [ ] Click **Save Changes**

#### Build & Start Commands:
- [ ] **Build Command:** `npm install`
- [ ] **Start Command:** `npm start`

### 3. **Set Environment Variables on Render**

Go to **Environment** tab and add these variables:

| Variable | Value | Status |
|----------|-------|--------|
| `PORT` | `5000` | ⬜ |
| `NODE_ENV` | `production` | ⬜ |
| `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/ecommerce` | ⬜ |
| `JWT_SECRET` | Generate using: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` | ⬜ |
| `FRONTEND_URL` | `https://qusar.vercel.app` | ⬜ |

**Important:** Replace the MongoDB URI with your actual MongoDB Atlas connection string!

### 4. **MongoDB Atlas Setup** (If not done)

- [ ] Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [ ] Create a free cluster (if you haven't)
- [ ] Create a database user with password
- [ ] Go to **Network Access** → Add IP: `0.0.0.0/0` (allow all)
- [ ] Get connection string from **Connect** → **Connect your application**
- [ ] Copy the connection string and replace `<password>` with your actual password

### 5. **Check Render Logs**

After deployment starts:
- [ ] Click on **Logs** tab in Render
- [ ] Look for these messages:
  - ✅ `🔒 Allowed CORS Origins: [...]`
  - ✅ `MongoDB Connected Successfully`
  - ✅ `🚀 Server is running on port 5000`
  - ❌ Any error messages (copy them if you see any)

### 6. **Set Vercel Environment Variable**

- [ ] Go to [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Select your `Qusar` project
- [ ] Go to **Settings** → **Environment Variables**
- [ ] Add: `VITE_API_URL` = `https://qusar.onrender.com/api`
- [ ] Redeploy the frontend

### 7. **Test the Deployment**

After both deployments complete:
- [ ] Visit `https://qusar.vercel.app`
- [ ] Open browser console (F12)
- [ ] Check for CORS errors (should be gone)
- [ ] Try loading products
- [ ] Try logging in

---

## 🔍 Troubleshooting

### If you still see CORS errors:
1. Check Render logs to see what origins are being logged
2. Make sure the deployment actually completed
3. Clear browser cache and hard refresh (Ctrl+Shift+R)

### If you see 500 errors:
1. Check Render logs for error messages
2. Most likely: Missing `MONGODB_URI` environment variable
3. Or: MongoDB Atlas not configured to allow connections

### If MongoDB connection fails:
1. Verify connection string is correct
2. Check MongoDB Atlas Network Access allows `0.0.0.0/0`
3. Verify database user credentials are correct

---

## 📝 Quick Commands

### Generate JWT Secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Test Backend Health:
```bash
curl https://qusar.onrender.com/api/health
```

### Check CORS (from terminal):
```bash
curl -H "Origin: https://qusar.vercel.app" -I https://qusar.onrender.com/api/products
```

---

## ✅ Success Indicators

You'll know it's working when:
1. ✅ Render logs show: `MongoDB Connected Successfully`
2. ✅ Render logs show: `🔒 Allowed CORS Origins: [...'https://qusar.vercel.app'...]`
3. ✅ No CORS errors in browser console
4. ✅ Products load on the homepage
5. ✅ Login/Register works

---

## 📞 Need Help?

If you're stuck, share:
1. Screenshot of Render logs
2. Screenshot of Render environment variables
3. Any error messages from browser console
