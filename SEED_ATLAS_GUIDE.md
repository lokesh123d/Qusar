# 🌱 How to Seed MongoDB Atlas Database

## Quick Method (Recommended)

### Step 1: Get Your MongoDB Atlas Connection String

1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (looks like this):
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Replace `<password>`** with your actual database user password
6. **Add database name** after `.net/` - change to:
   ```
   mongodb+srv://username:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ecommerce?retryWrites=true&w=majority
   ```

### Step 2: Run the Seed Script

**Option A: Using the Helper Script (Easiest)**
```bash
./seed-atlas.sh 'mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority'
```

**Option B: Manual Method**

1. Open `Backend/.env` file
2. Temporarily change `MONGODB_URI` to your Atlas URI:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority
   ```
3. Run the seed command:
   ```bash
   cd Backend
   npm run seed
   ```
4. **Important:** Change `MONGODB_URI` back to localhost after seeding:
   ```
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   ```

---

## What Gets Seeded?

✅ **60+ Products** across categories:
- 📱 Electronics (Smartphones, Laptops, Headphones)
- 👟 Fashion (Footwear)
- 🏠 Home & Kitchen
- 📚 Books
- ⚽ Sports
- 💄 Beauty

✅ **2 Users:**
- **Admin**: `admin@ecommerce.com` / `admin123`
- **User**: `user@example.com` / `user123`

---

## Verify Seeding Was Successful

### Check MongoDB Atlas:
1. Go to MongoDB Atlas Dashboard
2. Click **"Browse Collections"** on your cluster
3. You should see:
   - `products` collection with 60+ documents
   - `users` collection with 2 documents

### Check Your Live Website:
1. Visit `https://qusar.vercel.app`
2. You should see products on the homepage
3. Try logging in with: `admin@ecommerce.com` / `admin123`

---

## Troubleshooting

### Error: "MongoParseError: Invalid scheme"
- Make sure your connection string starts with `mongodb+srv://`
- Check that you replaced `<password>` with your actual password

### Error: "Authentication failed"
- Verify your database user password is correct
- Check that the user has read/write permissions

### Error: "Network timeout"
- Make sure MongoDB Atlas Network Access allows `0.0.0.0/0`
- Check your internet connection

---

## Need Your MongoDB Atlas URI?

If you haven't set up MongoDB Atlas yet or lost your connection string:

1. Go to MongoDB Atlas → Your Cluster
2. Click **"Connect"**
3. Choose **"Connect your application"**
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Add `/ecommerce` after `.mongodb.net/`

**Example:**
```
mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ecommerce?retryWrites=true&w=majority
```
