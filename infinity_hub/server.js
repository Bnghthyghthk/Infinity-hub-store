const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Data file path
const DATA_FILE = path.join(__dirname, 'data', 'store.json');

// Helper function to read data
function readData() {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
}

// Helper function to write data
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Routes

// Home page - Customer store
app.get('/', (req, res) => {
    const data = readData();
    res.render('index', { products: data.products, shippingRates: data.shippingRates });
});

// Admin dashboard
app.get('/admin', (req, res) => {
    const data = readData();
    res.render('admin', { orders: data.orders, shippingRates: data.shippingRates, products: data.products });
});

// API: Get shipping rates
app.get('/api/shipping-rates', (req, res) => {
    const data = readData();
    res.json(data.shippingRates);
});

// API: Update shipping rate for a governorate
app.post('/api/shipping-rates/update', (req, res) => {
    const { governorate, price } = req.body;
    const data = readData();
    
    const index = data.shippingRates.findIndex(rate => rate.governorate === governorate);
    if (index !== -1) {
        data.shippingRates[index].price = parseInt(price);
        writeData(data);
        res.json({ success: true, message: 'تم تحديث سعر الشحن بنجاح' });
    } else {
        res.status(404).json({ success: false, message: 'المحافظة غير موجودة' });
    }
});

// API: Submit order
app.post('/api/orders', (req, res) => {
    const { customerName, phone, address, governorate, products, totalAmount, shippingCost } = req.body;
    const data = readData();
    
    const newOrder = {
        id: Date.now(),
        customerName,
        phone,
        address,
        governorate,
        products,
        totalAmount: parseFloat(totalAmount),
        shippingCost: parseFloat(shippingCost),
        status: 'pending',
        date: new Date().toISOString()
    };
    
    data.orders.unshift(newOrder);
    writeData(data);
    
    res.json({ success: true, message: 'تم استلام طلبك بنجاح! سيتم التواصل معك قريباً', orderId: newOrder.id });
});

// API: Get all orders
app.get('/api/orders', (req, res) => {
    const data = readData();
    res.json(data.orders);
});

// API: Update order status
app.post('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const data = readData();
    
    const order = data.orders.find(o => o.id == id);
    if (order) {
        order.status = status;
        writeData(data);
        res.json({ success: true, message: 'تم تحديث حالة الطلب بنجاح' });
    } else {
        res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    }
});

// API: Add new product
app.post('/api/products', (req, res) => {
    const { name, price, image, category } = req.body;
    const data = readData();
    
    const newProduct = {
        id: Date.now(),
        name,
        price: parseFloat(price),
        image: image || 'https://via.placeholder.com/300x400?text=New+Product',
        category
    };
    
    data.products.push(newProduct);
    writeData(data);
    
    res.json({ success: true, message: 'تم إضافة المنتج بنجاح', product: newProduct });
});

// Start server
app.listen(PORT, () => {
    console.log(`Infinity Hub Store is running on http://localhost:${PORT}`);
    console.log(`Admin Dashboard: http://localhost:${PORT}/admin`);
});
