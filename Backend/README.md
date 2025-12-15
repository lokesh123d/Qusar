# 🛍️ ShopHub - Full-Stack E-Commerce Platform

A modern, feature-rich e-commerce platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js) showcasing full-stack development skills.

![Tech Stack](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

## ✨ Features

### Frontend (React.js)
- 🎨 **Modern UI/UX** - Beautiful, responsive design with smooth animations
- 🔐 **Authentication** - Email/Password & Google OAuth integration
- 🛒 **Shopping Cart** - Real-time cart management
- 🔍 **Product Search** - Advanced search and filtering
- 📱 **Responsive Design** - Mobile-first approach
- ⭐ **Product Reviews** - Rating and review system
- 💳 **Checkout Process** - Multi-step checkout flow
- 📦 **Order Tracking** - Real-time order status updates
- 👤 **User Profile** - Profile and address management
- ❤️ **Wishlist** - Save favorite products

### Backend (Node.js + Express.js)
- 🔒 **JWT Authentication** - Secure token-based auth
- 🔑 **Password Hashing** - bcrypt encryption
- 🌐 **RESTful API** - Clean API architecture
- 🔐 **Google OAuth** - Social login integration
- 📊 **MongoDB Integration** - NoSQL database
- ✅ **Input Validation** - Data validation & sanitization
- 🛡️ **Security** - CORS, helmet, rate limiting ready
- 📝 **Error Handling** - Comprehensive error management

### Database (MongoDB)
- 👥 **User Management** - User profiles and authentication
- 📦 **Product Catalog** - Complete product information
- 🛒 **Cart System** - Shopping cart persistence
- 📋 **Order Management** - Order tracking and history
- ⭐ **Reviews & Ratings** - Product feedback system

## 🚀 Tech Stack

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Context API** - State management
- **Google OAuth** - Social authentication
- **React Icons** - Icon library
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Google Auth Library** - OAuth integration

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**
- **Google Cloud Console Account** (for OAuth)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Ecommerce
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Install Frontend Dependencies

```bash
cd client
npm install
cd ..
```

### 4. Environment Variables Setup

#### Backend (.env)
Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

#### Frontend (client/.env)
Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 5. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized JavaScript origins:
   - `http://localhost:3000`
6. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
7. Copy Client ID and Client Secret to `.env` files

### 6. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On Linux/Mac
sudo systemctl start mongod

# Or using MongoDB Compass
# Just open MongoDB Compass and connect to localhost:27017
```

### 7. Seed the Database

Populate the database with sample data:

```bash
npm run seed
```

This will create:
- **Admin User**: email: `admin@ecommerce.com`, password: `admin123`
- **Sample User**: email: `user@example.com`, password: `user123`
- **8 Sample Products** across different categories

### 8. Run the Application

#### Development Mode (Recommended)

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

#### Production Build

```bash
# Build frontend
npm run build

# Start backend
npm start
```

## 📁 Project Structure

```
Ecommerce/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React Context (Auth, Cart)
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   ├── App.jsx        # Main App component
│   │   └── index.css      # Global styles
│   └── package.json
├── models/                # Mongoose models
│   ├── User.js
│   ├── Product.js
│   ├── Cart.js
│   └── Order.js
├── routes/                # Express routes
│   ├── auth.js
│   ├── products.js
│   ├── cart.js
│   ├── orders.js
│   └── users.js
├── middleware/            # Custom middleware
│   └── auth.js
├── server.js              # Express server
├── seed.js                # Database seeder
├── .env.example           # Environment variables template
└── package.json
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `POST /api/products/:id/reviews` - Add review

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item
- `DELETE /api/cart/:itemId` - Remove from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/cancel` - Cancel order
- `GET /api/orders/admin/all` - Get all orders (Admin)
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Users
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/address` - Add address
- `PUT /api/users/address/:id` - Update address
- `DELETE /api/users/address/:id` - Delete address
- `POST /api/users/wishlist/:productId` - Add to wishlist
- `DELETE /api/users/wishlist/:productId` - Remove from wishlist
- `GET /api/users/wishlist` - Get wishlist

## 🎨 Design Features

- **Modern Color Palette** - Vibrant gradients and professional colors
- **Smooth Animations** - Micro-interactions and transitions
- **Glassmorphism** - Modern UI effects
- **Responsive Grid** - Mobile-first responsive design
- **Custom Components** - Reusable UI components
- **Loading States** - Skeleton screens and spinners
- **Error Handling** - User-friendly error messages

## 🔐 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Protected routes
- Input validation
- CORS configuration
- Environment variables for sensitive data

## 📱 Responsive Breakpoints

- **Mobile**: < 480px
- **Tablet**: 481px - 768px
- **Desktop**: 769px - 1024px
- **Large Desktop**: > 1024px

## 🚧 Future Enhancements

- [ ] Payment gateway integration (Stripe/Razorpay)
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Product recommendations
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Dark mode
- [ ] PWA features
- [ ] Image upload functionality
- [ ] Real-time chat support

## 📝 Available Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Created to showcase full-stack development skills including:
- Frontend development with React.js
- Backend development with Node.js & Express.js
- Database design with MongoDB
- Authentication & Authorization
- RESTful API design
- Modern UI/UX design
- Responsive web development

## 📞 Support

For any queries or issues, please open an issue in the repository.

---

**Happy Shopping! 🛍️**
