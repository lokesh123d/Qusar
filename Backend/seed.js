require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const products = [
    // ELECTRONICS - Smartphones (10 products)
    {
        name: 'iPhone 15 Pro Max',
        description: 'Latest iPhone with A17 Pro chip, titanium design, and advanced camera system',
        price: 159900,
        originalPrice: 179900,
        discount: 11,
        category: 'Electronics',
        brand: 'Apple',
        stock: 50,
        images: ['https://images.unsplash.com/photo-1592286927505-4fd30a732422?w=500'],
        ratings: { average: 4.8, count: 2340 },
        specifications: { 'Display': '6.7" Super Retina XDR', 'Processor': 'A17 Pro', 'RAM': '8GB', 'Storage': '256GB' }
    },
    {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Premium Samsung flagship with S Pen, 200MP camera, and AI features',
        price: 129999,
        originalPrice: 149999,
        discount: 13,
        category: 'Electronics',
        brand: 'Samsung',
        stock: 45,
        images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500'],
        ratings: { average: 4.7, count: 1890 },
        specifications: { 'Display': '6.8" Dynamic AMOLED', 'Processor': 'Snapdragon 8 Gen 3', 'RAM': '12GB', 'Storage': '256GB' }
    },
    {
        name: 'OnePlus 12',
        description: 'Flagship killer with Hasselblad camera and 100W fast charging',
        price: 64999,
        originalPrice: 69999,
        discount: 7,
        category: 'Electronics',
        brand: 'OnePlus',
        stock: 60,
        images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'],
        ratings: { average: 4.6, count: 1234 },
        specifications: { 'Display': '6.82" AMOLED', 'Processor': 'Snapdragon 8 Gen 3', 'RAM': '12GB', 'Storage': '256GB' }
    },
    {
        name: 'Google Pixel 8 Pro',
        description: 'Pure Android experience with best-in-class camera and AI features',
        price: 106999,
        originalPrice: 119999,
        discount: 11,
        category: 'Electronics',
        brand: 'Google',
        stock: 35,
        images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500'],
        ratings: { average: 4.7, count: 890 },
        specifications: { 'Display': '6.7" LTPO OLED', 'Processor': 'Google Tensor G3', 'RAM': '12GB', 'Storage': '128GB' }
    },
    {
        name: 'Xiaomi 14',
        description: 'Leica camera system with Snapdragon 8 Gen 3 processor',
        price: 69999,
        originalPrice: 79999,
        discount: 13,
        category: 'Electronics',
        brand: 'Xiaomi',
        stock: 55,
        images: ['https://images.unsplash.com/photo-1567581935884-3349723552ca?w=500'],
        ratings: { average: 4.5, count: 1567 },
        specifications: { 'Display': '6.36" AMOLED', 'Processor': 'Snapdragon 8 Gen 3', 'RAM': '12GB', 'Storage': '256GB' }
    },
    {
        name: 'iPhone 14 Pro',
        description: 'Dynamic Island, Always-On display, 48MP camera',
        price: 119900,
        originalPrice: 139900,
        discount: 14,
        category: 'Electronics',
        brand: 'Apple',
        stock: 40,
        images: ['https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=500'],
        ratings: { average: 4.7, count: 3456 },
        specifications: { 'Display': '6.1" Super Retina XDR', 'Processor': 'A16 Bionic', 'RAM': '6GB', 'Storage': '128GB' }
    },
    {
        name: 'Vivo X100 Pro',
        description: 'Zeiss optics with advanced night photography',
        price: 89999,
        originalPrice: 99999,
        discount: 10,
        category: 'Electronics',
        brand: 'Vivo',
        stock: 50,
        images: ['https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=500'],
        ratings: { average: 4.5, count: 890 },
        specifications: { 'Display': '6.78" AMOLED', 'Processor': 'MediaTek Dimensity 9300', 'RAM': '12GB', 'Storage': '256GB' }
    },
    {
        name: 'Realme GT 5 Pro',
        description: 'Flagship performance at mid-range price',
        price: 45999,
        originalPrice: 54999,
        discount: 16,
        category: 'Electronics',
        brand: 'Realme',
        stock: 70,
        images: ['https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=500'],
        ratings: { average: 4.4, count: 2345 },
        specifications: { 'Display': '6.7" AMOLED', 'Processor': 'Snapdragon 8 Gen 2', 'RAM': '12GB', 'Storage': '256GB' }
    },
    {
        name: 'Nothing Phone 2',
        description: 'Unique Glyph interface with flagship specs',
        price: 44999,
        originalPrice: 49999,
        discount: 10,
        category: 'Electronics',
        brand: 'Nothing',
        stock: 60,
        images: ['https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500'],
        ratings: { average: 4.5, count: 1678 },
        specifications: { 'Display': '6.7" LTPO AMOLED', 'Processor': 'Snapdragon 8+ Gen 1', 'RAM': '12GB', 'Storage': '256GB' }
    },
    {
        name: 'Motorola Edge 50 Pro',
        description: 'Clean Android with premium design',
        price: 35999,
        originalPrice: 39999,
        discount: 10,
        category: 'Electronics',
        brand: 'Motorola',
        stock: 55,
        images: ['https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500'],
        ratings: { average: 4.3, count: 1234 },
        specifications: { 'Display': '6.7" pOLED', 'Processor': 'Snapdragon 7 Gen 3', 'RAM': '8GB', 'Storage': '256GB' }
    },

    // ELECTRONICS - Laptops (10 products)
    {
        name: 'MacBook Pro M3',
        description: 'Apple MacBook Pro with M3 chip, stunning Liquid Retina XDR display',
        price: 169900,
        originalPrice: 189900,
        discount: 11,
        category: 'Electronics',
        brand: 'Apple',
        stock: 25,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'],
        ratings: { average: 4.9, count: 567 },
        specifications: { 'Display': '14" Liquid Retina XDR', 'Processor': 'Apple M3', 'RAM': '16GB', 'Storage': '512GB SSD' }
    },
    {
        name: 'Dell XPS 15',
        description: 'Premium Windows laptop with InfinityEdge display',
        price: 149999,
        originalPrice: 169999,
        discount: 12,
        category: 'Electronics',
        brand: 'Dell',
        stock: 30,
        images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500'],
        ratings: { average: 4.6, count: 890 },
        specifications: { 'Display': '15.6" FHD+', 'Processor': 'Intel i7 13th Gen', 'RAM': '16GB', 'Storage': '512GB SSD' }
    },
    {
        name: 'HP Pavilion Gaming',
        description: 'Gaming laptop with NVIDIA RTX graphics',
        price: 74999,
        originalPrice: 89999,
        discount: 17,
        category: 'Electronics',
        brand: 'HP',
        stock: 40,
        images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500'],
        ratings: { average: 4.4, count: 1234 },
        specifications: { 'Display': '15.6" FHD 144Hz', 'Processor': 'AMD Ryzen 7', 'RAM': '16GB', 'Storage': '512GB SSD', 'GPU': 'RTX 3050' }
    },
    {
        name: 'Lenovo ThinkPad X1 Carbon',
        description: 'Business ultrabook with legendary keyboard',
        price: 134999,
        originalPrice: 149999,
        discount: 10,
        category: 'Electronics',
        brand: 'Lenovo',
        stock: 20,
        images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500'],
        ratings: { average: 4.7, count: 456 },
        specifications: { 'Display': '14" WUXGA', 'Processor': 'Intel i7 13th Gen', 'RAM': '16GB', 'Storage': '512GB SSD' }
    },
    {
        name: 'ASUS ROG Strix G15',
        description: 'High-performance gaming laptop',
        price: 119999,
        originalPrice: 139999,
        discount: 14,
        category: 'Electronics',
        brand: 'ASUS',
        stock: 35,
        images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500'],
        ratings: { average: 4.6, count: 789 },
        specifications: { 'Display': '15.6" FHD 165Hz', 'Processor': 'AMD Ryzen 9', 'RAM': '16GB', 'Storage': '1TB SSD', 'GPU': 'RTX 4060' }
    },
    {
        name: 'MacBook Air M2',
        description: 'Thin, light, and powerful with M2 chip',
        price: 114900,
        originalPrice: 129900,
        discount: 12,
        category: 'Electronics',
        brand: 'Apple',
        stock: 45,
        images: ['https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500'],
        ratings: { average: 4.8, count: 2345 },
        specifications: { 'Display': '13.6" Liquid Retina', 'Processor': 'Apple M2', 'RAM': '8GB', 'Storage': '256GB SSD' }
    },
    {
        name: 'Acer Predator Helios 300',
        description: 'Gaming powerhouse with advanced cooling',
        price: 99999,
        originalPrice: 119999,
        discount: 17,
        category: 'Electronics',
        brand: 'Acer',
        stock: 30,
        images: ['https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500'],
        ratings: { average: 4.5, count: 1567 },
        specifications: { 'Display': '15.6" FHD 144Hz', 'Processor': 'Intel i7 12th Gen', 'RAM': '16GB', 'Storage': '512GB SSD', 'GPU': 'RTX 3060' }
    },
    {
        name: 'Microsoft Surface Laptop 5',
        description: 'Premium Windows laptop with touchscreen',
        price: 124999,
        originalPrice: 139999,
        discount: 11,
        category: 'Electronics',
        brand: 'Microsoft',
        stock: 25,
        images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500'],
        ratings: { average: 4.6, count: 890 },
        specifications: { 'Display': '13.5" PixelSense', 'Processor': 'Intel i7 12th Gen', 'RAM': '16GB', 'Storage': '512GB SSD' }
    },
    {
        name: 'Lenovo IdeaPad Gaming 3',
        description: 'Budget gaming laptop with solid performance',
        price: 64999,
        originalPrice: 79999,
        discount: 19,
        category: 'Electronics',
        brand: 'Lenovo',
        stock: 50,
        images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'],
        ratings: { average: 4.3, count: 2345 },
        specifications: { 'Display': '15.6" FHD 120Hz', 'Processor': 'AMD Ryzen 5', 'RAM': '8GB', 'Storage': '512GB SSD', 'GPU': 'GTX 1650' }
    },
    {
        name: 'Asus VivoBook 15',
        description: 'Everyday laptop with modern design',
        price: 45999,
        originalPrice: 54999,
        discount: 16,
        category: 'Electronics',
        brand: 'ASUS',
        stock: 60,
        images: ['https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=500'],
        ratings: { average: 4.2, count: 3456 },
        specifications: { 'Display': '15.6" FHD', 'Processor': 'Intel i5 11th Gen', 'RAM': '8GB', 'Storage': '512GB SSD' }
    },

    // ELECTRONICS - Headphones (8 products)
    {
        name: 'Sony WH-1000XM5',
        description: 'Industry-leading noise cancellation',
        price: 29990,
        originalPrice: 34990,
        discount: 14,
        category: 'Electronics',
        brand: 'Sony',
        stock: 75,
        images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500'],
        ratings: { average: 4.8, count: 3456 },
        specifications: { 'Type': 'Over-Ear', 'Connectivity': 'Bluetooth 5.2', 'Battery': '30 hours', 'ANC': 'Yes' }
    },
    {
        name: 'Apple AirPods Pro 2',
        description: 'Active noise cancellation with spatial audio',
        price: 24900,
        originalPrice: 26900,
        discount: 7,
        category: 'Electronics',
        brand: 'Apple',
        stock: 100,
        images: ['https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500'],
        ratings: { average: 4.7, count: 5678 },
        specifications: { 'Type': 'In-Ear', 'Connectivity': 'Bluetooth', 'Battery': '6 hours', 'ANC': 'Yes' }
    },
    {
        name: 'Bose QuietComfort 45',
        description: 'Premium comfort with world-class noise cancellation',
        price: 28900,
        originalPrice: 32900,
        discount: 12,
        category: 'Electronics',
        brand: 'Bose',
        stock: 50,
        images: ['https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500'],
        ratings: { average: 4.6, count: 2345 },
        specifications: { 'Type': 'Over-Ear', 'Connectivity': 'Bluetooth', 'Battery': '24 hours', 'ANC': 'Yes' }
    },
    {
        name: 'JBL Tune 770NC',
        description: 'Wireless over-ear headphones with ANC',
        price: 7999,
        originalPrice: 9999,
        discount: 20,
        category: 'Electronics',
        brand: 'JBL',
        stock: 120,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
        ratings: { average: 4.3, count: 1890 },
        specifications: { 'Type': 'Over-Ear', 'Connectivity': 'Bluetooth', 'Battery': '70 hours', 'ANC': 'Yes' }
    },
    {
        name: 'boAt Rockerz 450',
        description: 'Wireless Bluetooth headphones with extra bass',
        price: 1499,
        originalPrice: 2990,
        discount: 50,
        category: 'Electronics',
        brand: 'boAt',
        stock: 200,
        images: ['https://images.unsplash.com/photo-1577174881658-0f30157f72c4?w=500'],
        ratings: { average: 4.2, count: 12345 },
        specifications: { 'Type': 'Over-Ear', 'Connectivity': 'Bluetooth', 'Battery': '15 hours', 'ANC': 'No' }
    },
    {
        name: 'Sennheiser Momentum 4',
        description: 'Audiophile-grade wireless headphones',
        price: 34990,
        originalPrice: 39990,
        discount: 13,
        category: 'Electronics',
        brand: 'Sennheiser',
        stock: 40,
        images: ['https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=500'],
        ratings: { average: 4.7, count: 890 },
        specifications: { 'Type': 'Over-Ear', 'Connectivity': 'Bluetooth 5.2', 'Battery': '60 hours', 'ANC': 'Yes' }
    },
    {
        name: 'Samsung Galaxy Buds 2 Pro',
        description: 'Premium TWS earbuds with 360 audio',
        price: 14990,
        originalPrice: 17990,
        discount: 17,
        category: 'Electronics',
        brand: 'Samsung',
        stock: 80,
        images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500'],
        ratings: { average: 4.5, count: 2345 },
        specifications: { 'Type': 'In-Ear', 'Connectivity': 'Bluetooth 5.3', 'Battery': '5 hours', 'ANC': 'Yes' }
    },
    {
        name: 'Beats Studio Pro',
        description: 'Premium wireless headphones by Apple',
        price: 34900,
        originalPrice: 39900,
        discount: 13,
        category: 'Electronics',
        brand: 'Beats',
        stock: 45,
        images: ['https://images.unsplash.com/photo-1545127398-14699f92334b?w=500'],
        ratings: { average: 4.6, count: 1567 },
        specifications: { 'Type': 'Over-Ear', 'Connectivity': 'Bluetooth', 'Battery': '40 hours', 'ANC': 'Yes' }
    },

    // FASHION - Footwear (8 products)
    {
        name: 'Nike Air Max 270',
        description: 'Iconic Air Max cushioning with breathable mesh',
        price: 12995,
        originalPrice: 14995,
        discount: 13,
        category: 'Fashion',
        brand: 'Nike',
        stock: 80,
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
        ratings: { average: 4.6, count: 4567 },
        specifications: { 'Type': 'Running Shoes', 'Material': 'Mesh', 'Sole': 'Rubber' }
    },
    {
        name: 'Adidas Ultraboost 22',
        description: 'Premium running shoes with Boost cushioning',
        price: 16999,
        originalPrice: 18999,
        discount: 11,
        category: 'Fashion',
        brand: 'Adidas',
        stock: 60,
        images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500'],
        ratings: { average: 4.7, count: 2890 },
        specifications: { 'Type': 'Running Shoes', 'Material': 'Primeknit', 'Sole': 'Continental Rubber' }
    },
    {
        name: 'Puma RS-X',
        description: 'Retro-inspired chunky sneakers',
        price: 7999,
        originalPrice: 9999,
        discount: 20,
        category: 'Fashion',
        brand: 'Puma',
        stock: 100,
        images: ['https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500'],
        ratings: { average: 4.4, count: 1234 },
        specifications: { 'Type': 'Casual Shoes', 'Material': 'Synthetic', 'Sole': 'Rubber' }
    },
    {
        name: 'Reebok Classic Leather',
        description: 'Timeless design with premium leather',
        price: 5999,
        originalPrice: 7999,
        discount: 25,
        category: 'Fashion',
        brand: 'Reebok',
        stock: 90,
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500'],
        ratings: { average: 4.5, count: 2345 },
        specifications: { 'Type': 'Casual Shoes', 'Material': 'Leather', 'Sole': 'Rubber' }
    },
    {
        name: 'New Balance 574',
        description: 'Classic sneakers with ENCAP cushioning',
        price: 8999,
        originalPrice: 10999,
        discount: 18,
        category: 'Fashion',
        brand: 'New Balance',
        stock: 70,
        images: ['https://images.unsplash.com/photo-1539185441755-769473a23570?w=500'],
        ratings: { average: 4.5, count: 1890 },
        specifications: { 'Type': 'Casual Shoes', 'Material': 'Suede', 'Sole': 'Rubber' }
    },
    {
        name: 'Converse Chuck Taylor',
        description: 'Iconic canvas sneakers',
        price: 3999,
        originalPrice: 4999,
        discount: 20,
        category: 'Fashion',
        brand: 'Converse',
        stock: 150,
        images: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500'],
        ratings: { average: 4.4, count: 5678 },
        specifications: { 'Type': 'Casual Shoes', 'Material': 'Canvas', 'Sole': 'Rubber' }
    },
    {
        name: 'Vans Old Skool',
        description: 'Classic skate shoes with waffle sole',
        price: 4499,
        originalPrice: 5499,
        discount: 18,
        category: 'Fashion',
        brand: 'Vans',
        stock: 120,
        images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500'],
        ratings: { average: 4.6, count: 3456 },
        specifications: { 'Type': 'Skate Shoes', 'Material': 'Canvas/Suede', 'Sole': 'Waffle Rubber' }
    },
    {
        name: 'Asics Gel-Kayano 30',
        description: 'Premium running shoes with GEL technology',
        price: 14999,
        originalPrice: 17999,
        discount: 17,
        category: 'Fashion',
        brand: 'Asics',
        stock: 50,
        images: ['https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=500'],
        ratings: { average: 4.7, count: 1234 },
        specifications: { 'Type': 'Running Shoes', 'Material': 'Mesh', 'Sole': 'Rubber' }
    },

    // HOME & KITCHEN (6 products)
    {
        name: 'Instant Pot Duo 7-in-1',
        description: 'Multi-use pressure cooker',
        price: 8999,
        originalPrice: 12999,
        discount: 31,
        category: 'Home & Kitchen',
        brand: 'Instant Pot',
        stock: 70,
        images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=500'],
        ratings: { average: 4.7, count: 12345 },
        specifications: { 'Capacity': '6 Liters', 'Functions': '7-in-1', 'Material': 'Stainless Steel' }
    },
    {
        name: 'Philips Air Fryer',
        description: 'Healthy cooking with Rapid Air technology',
        price: 9999,
        originalPrice: 14999,
        discount: 33,
        category: 'Home & Kitchen',
        brand: 'Philips',
        stock: 85,
        images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=500'],
        ratings: { average: 4.5, count: 8901 },
        specifications: { 'Capacity': '4.1 Liters', 'Power': '1400W', 'Material': 'Plastic' }
    },
    {
        name: 'Prestige Induction Cooktop',
        description: 'Energy-efficient induction cooktop',
        price: 2499,
        originalPrice: 3999,
        discount: 38,
        category: 'Home & Kitchen',
        brand: 'Prestige',
        stock: 120,
        images: ['https://images.unsplash.com/photo-1556911220-bff31c812dba?w=500'],
        ratings: { average: 4.3, count: 5678 },
        specifications: { 'Power': '2000W', 'Control': 'Touch', 'Timer': 'Yes' }
    },
    {
        name: 'Bajaj Mixer Grinder',
        description: '750W mixer grinder with 3 jars',
        price: 3499,
        originalPrice: 5999,
        discount: 42,
        category: 'Home & Kitchen',
        brand: 'Bajaj',
        stock: 100,
        images: ['https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500'],
        ratings: { average: 4.4, count: 6789 },
        specifications: { 'Power': '750W', 'Jars': '3', 'Material': 'Stainless Steel' }
    },
    {
        name: 'Kent RO Water Purifier',
        description: 'Advanced RO+UV+UF purification',
        price: 14999,
        originalPrice: 21999,
        discount: 32,
        category: 'Home & Kitchen',
        brand: 'Kent',
        stock: 50,
        images: ['https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500'],
        ratings: { average: 4.6, count: 3456 },
        specifications: { 'Capacity': '8 Liters', 'Technology': 'RO+UV+UF', 'Storage': '8L' }
    },
    {
        name: 'Havells OTG Oven',
        description: 'Multi-function oven toaster griller',
        price: 5999,
        originalPrice: 8999,
        discount: 33,
        category: 'Home & Kitchen',
        brand: 'Havells',
        stock: 60,
        images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=500'],
        ratings: { average: 4.4, count: 2345 },
        specifications: { 'Capacity': '28 Liters', 'Power': '1500W', 'Functions': 'Toast, Bake, Grill' }
    },

    // BOOKS (6 products)
    {
        name: 'Atomic Habits',
        description: 'An Easy & Proven Way to Build Good Habits',
        price: 399,
        originalPrice: 599,
        discount: 33,
        category: 'Books',
        brand: 'Penguin Random House',
        stock: 200,
        images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'],
        ratings: { average: 4.8, count: 15678 },
        specifications: { 'Author': 'James Clear', 'Pages': '320', 'Language': 'English' }
    },
    {
        name: 'Rich Dad Poor Dad',
        description: 'What the Rich Teach Their Kids About Money',
        price: 299,
        originalPrice: 450,
        discount: 34,
        category: 'Books',
        brand: 'Plata Publishing',
        stock: 250,
        images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500'],
        ratings: { average: 4.7, count: 23456 },
        specifications: { 'Author': 'Robert Kiyosaki', 'Pages': '336', 'Language': 'English' }
    },
    {
        name: 'The Psychology of Money',
        description: 'Timeless lessons on wealth, greed, and happiness',
        price: 349,
        originalPrice: 499,
        discount: 30,
        category: 'Books',
        brand: 'Jaico Publishing',
        stock: 180,
        images: ['https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500'],
        ratings: { average: 4.7, count: 12345 },
        specifications: { 'Author': 'Morgan Housel', 'Pages': '256', 'Language': 'English' }
    },
    {
        name: 'Think and Grow Rich',
        description: 'The classic guide to success',
        price: 199,
        originalPrice: 299,
        discount: 33,
        category: 'Books',
        brand: 'Fingerprint Publishing',
        stock: 300,
        images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500'],
        ratings: { average: 4.6, count: 18901 },
        specifications: { 'Author': 'Napoleon Hill', 'Pages': '320', 'Language': 'English' }
    },
    {
        name: 'The Alchemist',
        description: 'A magical fable about following your dreams',
        price: 299,
        originalPrice: 399,
        discount: 25,
        category: 'Books',
        brand: 'HarperCollins',
        stock: 220,
        images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500'],
        ratings: { average: 4.8, count: 25678 },
        specifications: { 'Author': 'Paulo Coelho', 'Pages': '208', 'Language': 'English' }
    },
    {
        name: 'Sapiens',
        description: 'A Brief History of Humankind',
        price: 449,
        originalPrice: 599,
        discount: 25,
        category: 'Books',
        brand: 'Vintage',
        stock: 150,
        images: ['https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500'],
        ratings: { average: 4.7, count: 14567 },
        specifications: { 'Author': 'Yuval Noah Harari', 'Pages': '512', 'Language': 'English' }
    },

    // SPORTS (4 products)
    {
        name: 'Boldfit Gym Shaker',
        description: 'Leak-proof protein shaker',
        price: 299,
        originalPrice: 599,
        discount: 50,
        category: 'Sports',
        brand: 'Boldfit',
        stock: 300,
        images: ['https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=500'],
        ratings: { average: 4.3, count: 8901 },
        specifications: { 'Capacity': '700ml', 'Material': 'BPA Free Plastic', 'Features': 'Leak-proof' }
    },
    {
        name: 'Strauss Yoga Mat',
        description: 'Anti-skid exercise mat',
        price: 599,
        originalPrice: 1299,
        discount: 54,
        category: 'Sports',
        brand: 'Strauss',
        stock: 150,
        images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500'],
        ratings: { average: 4.4, count: 5678 },
        specifications: { 'Size': '6mm thick', 'Material': 'NBR', 'Dimensions': '183 x 61 cm' }
    },
    {
        name: 'Nivia Football',
        description: 'Professional quality football',
        price: 599,
        originalPrice: 999,
        discount: 40,
        category: 'Sports',
        brand: 'Nivia',
        stock: 200,
        images: ['https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=500'],
        ratings: { average: 4.2, count: 3456 },
        specifications: { 'Size': '5', 'Material': 'PVC', 'Type': 'Training' }
    },
    {
        name: 'Cosco Cricket Bat',
        description: 'Kashmir willow cricket bat',
        price: 1299,
        originalPrice: 1999,
        discount: 35,
        category: 'Sports',
        brand: 'Cosco',
        stock: 100,
        images: ['https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500'],
        ratings: { average: 4.3, count: 2345 },
        specifications: { 'Material': 'Kashmir Willow', 'Size': 'Full', 'Weight': '1100-1200g' }
    },

    // BEAUTY (4 products)
    {
        name: 'Lakme Lipstick',
        description: 'Matte finish lipstick',
        price: 499,
        originalPrice: 650,
        discount: 23,
        category: 'Beauty',
        brand: 'Lakme',
        stock: 250,
        images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500'],
        ratings: { average: 4.3, count: 6789 },
        specifications: { 'Type': 'Matte Lipstick', 'Shade': 'Red Rush', 'Volume': '3.6g' }
    },
    {
        name: 'Mamaearth Face Wash',
        description: 'Natural face wash with vitamin C',
        price: 299,
        originalPrice: 399,
        discount: 25,
        category: 'Beauty',
        brand: 'Mamaearth',
        stock: 300,
        images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500'],
        ratings: { average: 4.4, count: 12345 },
        specifications: { 'Type': 'Face Wash', 'Ingredients': 'Vitamin C, Turmeric', 'Volume': '100ml' }
    },
    {
        name: 'Gillette Fusion Razor',
        description: 'Precision trimmer with 5 blades',
        price: 399,
        originalPrice: 599,
        discount: 33,
        category: 'Beauty',
        brand: 'Gillette',
        stock: 200,
        images: ['https://images.unsplash.com/photo-1564182379166-8fcfdda80151?w=500'],
        ratings: { average: 4.5, count: 8901 },
        specifications: { 'Type': 'Manual Razor', 'Blades': '5', 'Features': 'Precision Trimmer' }
    },
    {
        name: 'Nivea Body Lotion',
        description: 'Deep moisture body lotion',
        price: 249,
        originalPrice: 349,
        discount: 29,
        category: 'Beauty',
        brand: 'Nivea',
        stock: 350,
        images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500'],
        ratings: { average: 4.4, count: 9876 },
        specifications: { 'Type': 'Body Lotion', 'Skin Type': 'All', 'Volume': '400ml' }
    }
];

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create users (passwords will be hashed by User model's pre-save hook)
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@ecommerce.com',
            password: 'admin123',
            role: 'admin'
        });

        const user = await User.create({
            name: 'John Doe',
            email: 'user@example.com',
            password: 'user123',
            avatar: 'https://via.placeholder.com/150'
        });

        console.log('👤 Admin user created');
        console.log('👤 Sample user created');

        // Insert products
        await Product.insertMany(products);
        console.log(`📦 ${products.length} products inserted`);

        console.log('\n✨ Database seeded successfully!');
        console.log('\n📝 Login Credentials:');
        console.log(`Admin - Email: admin@ecommerce.com, Password: admin123`);
        console.log(`User  - Email: user@example.com, Password: user123`);
        console.log(`\n📊 Total Products: ${products.length}`);
        console.log(`📂 Categories: Electronics, Fashion, Home & Kitchen, Books, Sports, Beauty`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
