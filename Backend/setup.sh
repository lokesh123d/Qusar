#!/bin/bash

echo "🛍️  ShopHub E-Commerce Platform Setup"
echo "======================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo "⚠️  Please update .env with your MongoDB URI and Google OAuth credentials"
else
    echo "✅ .env file already exists"
fi

# Check if client/.env exists
if [ ! -f client/.env ]; then
    echo "📝 Creating client/.env file from template..."
    cp client/.env.example client/.env
    echo "✅ Created client/.env file"
    echo "⚠️  Please update client/.env with your Google Client ID"
else
    echo "✅ client/.env file already exists"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install backend dependencies
echo "Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd client && npm install && cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Update .env file with your MongoDB URI and Google OAuth credentials"
echo "2. Update client/.env file with your Google Client ID"
echo "3. Make sure MongoDB is running"
echo "4. Run 'npm run seed' to populate the database with sample data"
echo "5. Run 'npm run dev' (backend) and 'cd client && npm run dev' (frontend)"
echo ""
echo "📚 Check README.md for detailed instructions"
echo ""
