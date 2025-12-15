#!/bin/bash

# Google Login Setup Checker Script
# यह script check करता है कि सब कुछ properly configured है या नहीं

echo "🔍 Google Login Setup Checker"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Backend .env file
echo "📋 Step 1: Backend .env file check कर रहे हैं..."
if [ -f "/home/sama/Desktop/Ecommerce/.env" ]; then
    echo -e "${GREEN}✅ Backend .env file मिल गई${NC}"
    
    # Check GOOGLE_CLIENT_ID
    if grep -q "GOOGLE_CLIENT_ID=" /home/sama/Desktop/Ecommerce/.env; then
        CLIENT_ID=$(grep "GOOGLE_CLIENT_ID=" /home/sama/Desktop/Ecommerce/.env | cut -d '=' -f2)
        if [ -z "$CLIENT_ID" ] || [ "$CLIENT_ID" = "your_google_client_id" ]; then
            echo -e "${RED}❌ GOOGLE_CLIENT_ID set नहीं है${NC}"
            echo -e "${YELLOW}   Action: .env file में अपना Google Client ID add करें${NC}"
        else
            echo -e "${GREEN}✅ GOOGLE_CLIENT_ID set है${NC}"
        fi
    else
        echo -e "${RED}❌ GOOGLE_CLIENT_ID नहीं मिला${NC}"
    fi
    
    # Check GOOGLE_CLIENT_SECRET
    if grep -q "GOOGLE_CLIENT_SECRET=" /home/sama/Desktop/Ecommerce/.env; then
        CLIENT_SECRET=$(grep "GOOGLE_CLIENT_SECRET=" /home/sama/Desktop/Ecommerce/.env | cut -d '=' -f2)
        if [ -z "$CLIENT_SECRET" ] || [ "$CLIENT_SECRET" = "your_google_client_secret" ]; then
            echo -e "${RED}❌ GOOGLE_CLIENT_SECRET set नहीं है${NC}"
            echo -e "${YELLOW}   Action: .env file में अपना Google Client Secret add करें${NC}"
        else
            echo -e "${GREEN}✅ GOOGLE_CLIENT_SECRET set है${NC}"
        fi
    else
        echo -e "${RED}❌ GOOGLE_CLIENT_SECRET नहीं मिला${NC}"
    fi
else
    echo -e "${RED}❌ Backend .env file नहीं मिली${NC}"
fi

echo ""

# Check 2: Frontend .env file
echo "📋 Step 2: Frontend .env file check कर रहे हैं..."
if [ -f "/home/sama/Desktop/Ecommerce/client/.env" ]; then
    echo -e "${GREEN}✅ Frontend .env file मिल गई${NC}"
    
    # Check VITE_GOOGLE_CLIENT_ID
    if grep -q "VITE_GOOGLE_CLIENT_ID=" /home/sama/Desktop/Ecommerce/client/.env; then
        VITE_CLIENT_ID=$(grep "VITE_GOOGLE_CLIENT_ID=" /home/sama/Desktop/Ecommerce/client/.env | cut -d '=' -f2)
        if [ -z "$VITE_CLIENT_ID" ]; then
            echo -e "${RED}❌ VITE_GOOGLE_CLIENT_ID set नहीं है${NC}"
            echo -e "${YELLOW}   Action: client/.env file में अपना Google Client ID add करें${NC}"
        else
            echo -e "${GREEN}✅ VITE_GOOGLE_CLIENT_ID set है${NC}"
        fi
    else
        echo -e "${RED}❌ VITE_GOOGLE_CLIENT_ID नहीं मिला${NC}"
        echo -e "${YELLOW}   Action: client/.env file में VITE_GOOGLE_CLIENT_ID add करें${NC}"
    fi
else
    echo -e "${RED}❌ Frontend .env file नहीं मिली${NC}"
    echo -e "${YELLOW}   Action: client/.env file बनाएं${NC}"
fi

echo ""

# Check 3: Backend dependencies
echo "📋 Step 3: Backend dependencies check कर रहे हैं..."
cd /home/sama/Desktop/Ecommerce
if npm list google-auth-library &> /dev/null; then
    echo -e "${GREEN}✅ google-auth-library installed है${NC}"
else
    echo -e "${RED}❌ google-auth-library installed नहीं है${NC}"
    echo -e "${YELLOW}   Action: npm install google-auth-library${NC}"
fi

echo ""

# Check 4: Frontend dependencies
echo "📋 Step 4: Frontend dependencies check कर रहे हैं..."
cd /home/sama/Desktop/Ecommerce/client
if npm list @react-oauth/google &> /dev/null; then
    echo -e "${GREEN}✅ @react-oauth/google installed है${NC}"
else
    echo -e "${RED}❌ @react-oauth/google installed नहीं है${NC}"
    echo -e "${YELLOW}   Action: cd client && npm install @react-oauth/google${NC}"
fi

echo ""

# Check 5: Backend server
echo "📋 Step 5: Backend server check कर रहे हैं..."
if curl -s http://localhost:5000/api/health &> /dev/null; then
    echo -e "${GREEN}✅ Backend server running है${NC}"
else
    echo -e "${RED}❌ Backend server running नहीं है${NC}"
    echo -e "${YELLOW}   Action: npm run dev (backend folder में)${NC}"
fi

echo ""

# Check 6: Frontend server
echo "📋 Step 6: Frontend server check कर रहे हैं..."
if curl -s http://localhost:5173 &> /dev/null; then
    echo -e "${GREEN}✅ Frontend server running है${NC}"
else
    echo -e "${RED}❌ Frontend server running नहीं है${NC}"
    echo -e "${YELLOW}   Action: npm run dev (client folder में)${NC}"
fi

echo ""
echo "================================"
echo "✅ Check complete!"
echo ""
echo "📖 अगर कोई ❌ है, तो GOOGLE_LOGIN_SETUP_HINDI.md file देखें"
echo "📖 File location: /home/sama/Desktop/Ecommerce/GOOGLE_LOGIN_SETUP_HINDI.md"
echo ""
