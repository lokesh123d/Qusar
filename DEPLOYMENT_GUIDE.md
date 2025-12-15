# Deployment Guide - Qusar E-commerce

## ⚠️ IMPORTANT: Before Deploying

### 1. Database Setup
After deploying, you MUST run this command to assign sellers to products:

```bash
# Connect to your production MongoDB and run:
node -e "
const mongoose = require('mongoose');
mongoose.connect('YOUR_MONGODB_URI')
  .then(async () => {
    const Product = require('./models/Product');
    const User = require('./models/User');
    
    let seller = await User.findOne({ role: 'seller' });
    if (!seller) seller = await User.findOne({ role: 'admin' });
    if (!seller) seller = await User.findOne();
    
    if (seller) {
      console.log('Assigning seller:', seller.name);
      const result = await Product.updateMany(
        { seller: null },
        { seller: seller._id }
      );
      console.log('✅ Updated', result.modifiedCount, 'products');
    }
    process.exit(0);
  });
"
```

### 2. Environment Variables

**Backend (.env):**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=https://your-frontend-url.vercel.app

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Razorpay (Optional)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

**Frontend (.env):**
```env
VITE_API_URL=https://your-backend-url.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Features That Need Setup

#### Notification System
- ✅ Works automatically after seller assignment
- Notifications are stored in MongoDB
- 30-second polling for updates

#### Order Workflow
1. User places order → Status: "Pending"
2. Seller receives notification
3. Seller confirms → Status: "Processing"
4. OR Seller rejects → Status: "Rejected" (stock restored)

#### Seller Assignment
- All products MUST have a seller assigned
- Run the database script above after deployment
- Without seller, notifications go to admin

### 4. Testing Checklist

After deployment:
- [ ] Place a test order
- [ ] Check if seller receives notification
- [ ] Confirm order from seller account
- [ ] Check if user receives confirmation notification
- [ ] Test order cancellation
- [ ] Verify wishlist functionality
- [ ] Test all responsive layouts

### 5. Known Issues & Solutions

**Issue: Notifications not working**
- Solution: Ensure products have sellers assigned (run script above)
- Check backend logs for errors

**Issue: CORS errors**
- Solution: Update CLIENT_URL in backend .env
- Add your frontend URL to CORS whitelist

**Issue: Images not loading**
- Solution: Check if image URLs are absolute
- Verify uploads folder is accessible

### 6. Production Optimizations

**Backend:**
```bash
# Build for production
npm run build

# Use PM2 for process management
pm2 start server.js --name qusar-backend
```

**Frontend:**
```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

### 7. Database Indexes

Ensure these indexes exist for better performance:
```javascript
// Notifications
db.notifications.createIndex({ user: 1, createdAt: -1 })
db.notifications.createIndex({ user: 1, read: 1 })

// Orders
db.orders.createIndex({ user: 1, createdAt: -1 })
db.orders.createIndex({ seller: 1, orderStatus: 1 })
```

### 8. Contact Information

Update these in Footer.jsx before deploying:
- Phone: +91 8091780737
- Email: qusar5057@gmail.com
- Location: Nainital, Uttarakhand

### 9. Security Checklist

- [ ] All .env files in .gitignore
- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB connection string is secure
- [ ] Google OAuth credentials are correct
- [ ] CORS is properly configured
- [ ] API rate limiting enabled (if needed)

### 10. Monitoring

After deployment, monitor:
- Server logs for errors
- Database connections
- API response times
- Notification delivery
- Order processing

---

## 🚀 Quick Deploy Commands

```bash
# 1. Commit all changes
git add .
git commit -m "Production ready"

# 2. Push to GitHub
git push origin main

# 3. Deploy Backend (Railway/Render)
# Follow platform-specific instructions

# 4. Deploy Frontend (Vercel)
vercel --prod

# 5. Run database setup script
# (Use your platform's shell or MongoDB Compass)
```

---

## ✅ Deployment Complete!

After following all steps above, your application should be fully functional with:
- ✅ Notification system
- ✅ Order management
- ✅ Wishlist feature
- ✅ Seller workflow
- ✅ All UI improvements

**Need help?** Check backend logs and MongoDB for any issues.
