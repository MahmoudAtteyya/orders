import express from 'express';
import cors from 'cors';
import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../dist')));

// In-memory storage for orders
let orders = [];
let downloadCounter = 1;

// Ensure exports directory exists
const exportsDir = path.join(__dirname, '../exports');
if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir);
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

// Function to clear orders array
function clearOrders() {
  orders = [];
  console.log('Orders array cleared');
}

// Check orders endpoint
app.get('/orders', (req, res) => {
    res.json({ orders, count: orders.length });
});

// Add order endpoint
app.post('/add-order', (req, res) => {
  try {
    const { Customer_Name, Mobile_No, Description, Street, City, Alternative_Contact, totalWeight, Item_Special_Notes } = req.body;

    // Validate required fields
    if (!Customer_Name || !Mobile_No || !Description || !Street || !City || !Alternative_Contact || !totalWeight) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Create order object
    const order = {
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
    };

    // Add order to array
    orders.push(order);
    console.log('Received order:', req.body);
    console.log('Current orders:', orders);

    res.json({ message: 'Order added successfully', order });
  } catch (error) {
    console.error('Error adding order:', error);
    res.status(500).json({ error: 'Error adding order' });
  }
});

// Download orders endpoint
app.get('/download', async (req, res) => {
  try {
    if (orders.length === 0) {
      return res.status(404).json({ error: 'No orders to download' });
    }

    console.log('Downloading orders:', orders);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    // Define columns with their keys and widths
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

    // Add rows to the worksheet
    worksheet.addRows(orders);

    // Generate unique file name
    const fileName = `Orders_${downloadCounter}.xlsx`;
    const filePath = path.join(exportsDir, fileName);

    // Save the workbook
    await workbook.xlsx.writeFile(filePath);
    console.log('File written successfully');

    // Clear orders array after successful file generation
    clearOrders();
    console.log('Orders array cleared after download');

    // Increment counter and save
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

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});