#!/bin/bash

# Script to seed MongoDB Atlas database
# This will populate your production database with sample products

echo "🌱 MongoDB Atlas Seeding Script"
echo "================================"
echo ""

# Check if MONGODB_ATLAS_URI is provided
if [ -z "$1" ]; then
    echo "❌ Error: MongoDB Atlas URI not provided"
    echo ""
    echo "Usage: ./seed-atlas.sh 'mongodb+srv://username:password@cluster.mongodb.net/ecommerce'"
    echo ""
    echo "To get your MongoDB Atlas URI:"
    echo "1. Go to MongoDB Atlas Dashboard"
    echo "2. Click 'Connect' on your cluster"
    echo "3. Choose 'Connect your application'"
    echo "4. Copy the connection string"
    echo "5. Replace <password> with your actual password"
    echo "6. Add '/ecommerce' after .net/ to specify database name"
    exit 1
fi

MONGODB_ATLAS_URI="$1"

echo "📋 Backing up current .env file..."
cp Backend/.env Backend/.env.local.backup

echo "🔄 Temporarily updating .env with Atlas URI..."
# Update MONGODB_URI in .env file
sed -i.bak "s|MONGODB_URI=.*|MONGODB_URI=$MONGODB_ATLAS_URI|" Backend/.env

echo "🌱 Running seed script..."
cd Backend
npm run seed

SEED_EXIT_CODE=$?

echo ""
echo "🔄 Restoring original .env file..."
cd ..
mv Backend/.env.local.backup Backend/.env
rm -f Backend/.env.bak

if [ $SEED_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Database seeded successfully!"
    echo "🎉 Your MongoDB Atlas database now has all the products!"
    echo ""
    echo "📝 Login Credentials:"
    echo "   Admin - Email: admin@ecommerce.com, Password: admin123"
    echo "   User  - Email: user@example.com, Password: user123"
else
    echo ""
    echo "❌ Seeding failed. Please check the error messages above."
    exit 1
fi
