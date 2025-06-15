import express from 'express';
import cors from 'cors';
import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../dist')));

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://mahmoud:Mmm12011305@cluster0.szmfzfx.mongodb.net/ordersdb?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const orderSchema = new mongoose.Schema({
  Package_Serial: String,
  Description: String,
  Total_Weight: Number,
  Package_volume: String,
  COD_Value: String,
  Item_Special_Notes: String,
  Customer_Name: String,
  Mobile_No: String,
  Street: String,
  City: String,
  Package_Ref: String,
  Merchant_Name: String,
  Warehouse_Name: String,
  HasPOD: String,
  SellerName: String
});
const Order = mongoose.model('Order', orderSchema);

// نموذج إحصائيات الطلبات
const statsSchema = new mongoose.Schema({
  dailyCount: { type: Number, default: 0 },
  dailyDate: { type: String }, // yyyy-mm-dd
  monthlyCount: { type: Number, default: 0 },
  monthlyMonth: { type: String }, // yyyy-mm
  yearlyCount: { type: Number, default: 0 },
  yearlyYear: { type: String }, // yyyy
  totalCount: { type: Number, default: 0 }
});
const Stats = mongoose.model('Stats', statsSchema);

// In-memory storage for orders
let orders = [];
let downloadCounter = 1;

// Ensure exports directory exists
const exportsDir = path.join(__dirname, '../exports');
if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir);
}

// File to persist orders
const ordersFile = path.join(exportsDir, 'orders.json');

// Load orders from file if exists
function loadOrders() {
  if (fs.existsSync(ordersFile)) {
    try {
      const data = fs.readFileSync(ordersFile, 'utf8');
      orders = JSON.parse(data) || [];
    } catch (e) {
      orders = [];
    }
  } else {
    orders = [];
  }
}

// Save orders to file
function saveOrders() {
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
}

// Save counter to file
const saveCounter = () => {
    fs.writeFileSync(counterFile, downloadCounter.toString());
};

// Clear all files in exports directory except counter.txt
const clearExportsDirectory = () => {
    const files = fs.readdirSync(exportsDir);
    files.forEach(file => {
        if (file !== 'counter.txt') {
            fs.unlinkSync(path.join(exportsDir, file));
        }
    });
};

// Load counter from file if exists
const counterFile = path.join(exportsDir, 'counter.txt');
if (fs.existsSync(counterFile)) {
    downloadCounter = parseInt(fs.readFileSync(counterFile, 'utf8')) || 1;
}

// Reset counter and clear exports on server start
clearExportsDirectory();
downloadCounter = 1;
saveCounter();
loadOrders();

// دالة تحديث الإحصائيات عند إضافة طلب جديد
async function updateStatsOnNewOrder() {
  const now = new Date();
  const today = now.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }); // yyyy-mm-dd
  const month = today.slice(0, 7); // yyyy-mm
  const year = today.slice(0, 4); // yyyy
  let stats = await Stats.findOne();
  if (!stats) {
    stats = new Stats({
      dailyCount: 1,
      dailyDate: today,
      monthlyCount: 1,
      monthlyMonth: month,
      yearlyCount: 1,
      yearlyYear: year,
      totalCount: 1
    });
  } else {
    // Reset daily if needed
    if (stats.dailyDate !== today) {
      stats.dailyCount = 1;
      stats.dailyDate = today;
    } else {
      stats.dailyCount++;
    }
    // Reset monthly if needed
    if (stats.monthlyMonth !== month) {
      stats.monthlyCount = 1;
      stats.monthlyMonth = month;
    } else {
      stats.monthlyCount++;
    }
    // Reset yearly if needed
    if (stats.yearlyYear !== year) {
      stats.yearlyCount = 1;
      stats.yearlyYear = year;
    } else {
      stats.yearlyCount++;
    }
    // Total always increases
    stats.totalCount++;
  }
  await stats.save();
}

// Endpoint لجلب الإحصائيات
app.get('/api/order-stats', async (req, res) => {
  let stats = await Stats.findOne();
  if (!stats) {
    // إذا لم توجد إحصائيات، أرجع القيم صفرية
    return res.json({
      dailyCount: 0,
      monthlyCount: 0,
      yearlyCount: 0,
      totalCount: 0
    });
  }
  res.json({
    dailyCount: stats.dailyCount,
    monthlyCount: stats.monthlyCount,
    yearlyCount: stats.yearlyCount,
    totalCount: stats.totalCount
  });
});

// Add order endpoint
app.post('/api/add-order', async (req, res) => {
  try {
    const { Customer_Name, Mobile_No, Description, Street, City, Alternative_Contact, totalWeight, Item_Special_Notes } = req.body;

    // Validate required fields
    if (!Customer_Name || !Mobile_No || !Description || !Street || !City || !Alternative_Contact || !totalWeight) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Create order object
    const order = new Order({
      Package_Serial: `ORD${Date.now()}`,
      Description,
      Total_Weight: totalWeight,
      Package_volume: '',
      COD_Value: '',
      Item_Special_Notes: Item_Special_Notes || `يسلم في محل الإقامة ودون الإطلاع على الرقم القومي - رقم آخر للتواصل ${Alternative_Contact} - في حالة عدم رد المرسل إليه يرجى التواصل مع الراسل`,
      Customer_Name,
      Mobile_No,
      Street,
      City,
      Package_Ref: '',
      Merchant_Name: '',
      Warehouse_Name: '',
      HasPOD: '',
      SellerName: ''
    });

    // Add order to database
    await order.save();
    await updateStatsOnNewOrder();
    res.json({ message: 'Order added successfully', order });
  } catch (error) {
    console.error('Error adding order:', error);
    res.status(500).json({ error: 'Error adding order' });
  }
});

// Download orders endpoint
app.get('/api/download', async (req, res) => {
  try {
    const orders = await Order.find();
    if (orders.length === 0) {
      return res.status(404).json({ error: 'No orders to download' });
    }
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');
    worksheet.columns = [
      { header: 'Package_Serial', key: 'Package_Serial', width: 20 },
      { header: 'Description', key: 'Description', width: 30 },
      { header: 'Total_Weight', key: 'Total_Weight', width: 15 },
      { header: 'Package_volume', key: 'Package_volume', width: 15 },
      { header: 'COD_Value', key: 'COD_Value', width: 15 },
      { header: 'Item_Special_Notes', key: 'Item_Special_Notes', width: 50 },
      { header: 'Customer_Name', key: 'Customer_Name', width: 20 },
      { header: 'Mobile_No', key: 'Mobile_No', width: 15 },
      { header: 'Street', key: 'Street', width: 30 },
      { header: 'City', key: 'City', width: 15 },
      { header: 'Package_Ref', key: 'Package_Ref', width: 20 },
      { header: 'Merchant_Name', key: 'Merchant_Name', width: 20 },
      { header: 'Warehouse_Name', key: 'Warehouse_Name', width: 20 },
      { header: 'HasPOD', key: 'HasPOD', width: 10 },
      { header: 'SellerName', key: 'SellerName', width: 20 }
    ];
    worksheet.addRows(orders.map(order => order.toObject()));
    const fileName = `Orders_${downloadCounter}.xlsx`;
    const filePath = path.join(exportsDir, fileName);
    await workbook.xlsx.writeFile(filePath);
    downloadCounter++;
    saveCounter();
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).send('Error downloading file');
      }
    });
  } catch (error) {
    console.error('Error generating Excel file:', error);
    res.status(500).send('Error generating Excel file');
  }
});

// Reset orders endpoint
app.post('/api/reset-orders', async (req, res) => {
  try {
    await Order.deleteMany({});
    res.json({ message: 'Orders have been reset.' });
  } catch (error) {
    res.status(500).json({ error: 'Error resetting orders' });
  }
});

// Handle API routes first
app.use('/api', express.Router());

// Send index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});