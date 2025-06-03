# 🥐 Skaneri i Furrës - AI-Powered Bakery Scanner System

A professional Progressive Web App (PWA) for bakeries to scan and sell products using AI-powered image recognition with TensorFlow.js.

## 🌟 Features

### 1. **Real-Time Product Recognition**
- ✅ Live camera feed with auto-scanning
- ✅ TensorFlow.js machine learning (not fake/demo)
- ✅ Confidence scoring (75-95%)
- ✅ Multi-angle recognition
- ✅ Offline capable after training

### 2. **Bulk Training System**
- ✅ Folder-based training (drag & drop)
- ✅ CSV import for product lists
- ✅ Smart image grouping
- ✅ Batch processing (20-50 products)
- ✅ Progress tracking with ETA
- ✅ Automatic data augmentation

### 3. **Complete Sales Management**
- ✅ Shopping cart with quantity adjustment
- ✅ Automatic price calculation with tax
- ✅ Receipt generation and printing
- ✅ Daily sales tracking
- ✅ Searchable transaction history

### 4. **Business Analytics Dashboard**
- ✅ Real-time sales metrics
- ✅ Interactive charts (hourly sales, top products)
- ✅ Peak hour analysis
- ✅ Profit tracking
- ✅ CSV/PDF export capabilities

## 🚀 Quick Start

### 1. **Installation**

Simply open the `index.html` file in a modern web browser (Chrome, Edge, Firefox, Safari).

```bash
# Navigate to the project folder
cd /Users/kristinahanxhara/Desktop/bakery-scanner

# Start a local server (optional but recommended)
python3 -m http.server 8000
# OR
npx serve .

# Open in browser
# http://localhost:8000
```

### 2. **First Time Setup**

1. **Allow Camera Access**: When prompted, allow the app to access your camera
2. **Business Info**: Go to Settings tab and enter your bakery information
3. **Train Products**: Start with 2-3 products to test the system

## 📱 Installation as Mobile App

### iOS (iPhone/iPad)
1. Open Safari and navigate to the app
2. Tap the Share button
3. Select "Add to Home Screen"
4. Name it and tap "Add"

### Android
1. Open Chrome and navigate to the app
2. Tap the menu (3 dots)
3. Select "Add to Home Screen"
4. Confirm installation

## 🎓 Training Products

### Single Product Training
1. Go to **Training** tab
2. Select **Single Training** mode
3. Enter product details:
   - Name (e.g., "Byrek me spinaq")
   - Price (e.g., "150" Lek)
   - Category
4. Upload 10-20 photos from different angles
5. Click "Start Training"

### Bulk Training
1. Organize photos in folders:
   ```
   Products/
   ├── Byrek_Spinaq/
   │   ├── photo1.jpg
   │   ├── photo2.jpg
   │   └── ...
   ├── Byrek_Mish/
   │   ├── photo1.jpg
   │   └── ...
   ```
2. Go to **Training** > **Bulk Training**
3. Click "Upload Folder" and select the parent folder
4. Set prices for each product
5. Click "Start Bulk Training"

### CSV Import
Create a CSV file with columns:
```csv
Emri,Çmimi,Kategoria
Byrek me spinaq,150,byrek
Byrek me mish,200,byrek
Tortë çokollatë,2500,torta
```

## 🛒 Using the Scanner

1. **Automatic Scanning**
   - Point camera at product
   - Wait for green recognition frame
   - Product appears with confidence score
   - Click "Add to Cart"

2. **Manual Scanning**
   - Click "Manual Scan" button
   - Position product in frame
   - Take photo when ready

3. **Checkout Process**
   - Review cart items
   - Adjust quantities if needed
   - Click "Checkout"
   - Print or save receipt

## 📊 Analytics & Reports

### Daily Dashboard
- View today's sales summary
- Monitor hourly trends
- Track best-selling products
- Identify peak hours

### Export Options
- **Sales Report**: CSV format with all transactions
- **Product Report**: Performance metrics for each item
- **Financial Summary**: Revenue, tax, and profit data

## ⚙️ Settings & Configuration

### Camera Settings
- **Auto-focus**: Enable for better scanning
- **Flash**: Toggle for low-light conditions
- **Continuous Scan**: Auto-scan without clicking

### Data Management
- **Backup**: Export all data as JSON
- **Restore**: Import previous backup
- **Clear Data**: Remove all products and sales

## 🔧 Troubleshooting

### Camera Not Working
1. Check browser permissions (Settings > Privacy > Camera)
2. Ensure no other app is using the camera
3. Try refreshing the page
4. Test with a different browser

### Products Not Recognized
1. Ensure good lighting conditions
2. Hold product steady for 2-3 seconds
3. Try different angles
4. Retrain with more photos if needed

### Slow Performance
1. Close unnecessary browser tabs
2. Clear browser cache
3. Reduce number of trained products
4. Use a more powerful device

## 💻 Technical Requirements

### Minimum Requirements
- **Browser**: Chrome 80+, Safari 13+, Firefox 75+
- **Camera**: 720p resolution or higher
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 500MB free space

### Optimal Setup
- **Device**: Modern smartphone or tablet
- **Camera**: 1080p with autofocus
- **Internet**: Required only for initial setup
- **Lighting**: Bright, even lighting

## 🔐 Data Privacy & Security

- ✅ All data stored locally on device
- ✅ No cloud dependency after setup
- ✅ Encrypted browser storage
- ✅ No user tracking or analytics
- ✅ Complete data ownership

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Ensure you're using a supported browser
3. Try the demo products first
4. Export logs from Settings > Debug

## 🎯 Best Practices

### For Training
1. Use consistent lighting for photos
2. Include various angles (front, side, top)
3. Avoid blurry or dark images
4. Train similar products separately
5. Update training monthly

### For Scanning
1. Clean camera lens regularly
2. Position products 20-30cm from camera
3. Avoid reflective packaging angles
4. Scan in well-lit areas
5. Hold products steady

### For Business
1. Backup data daily
2. Review analytics weekly
3. Update prices seasonally
4. Train new staff properly
5. Keep receipt printer ready

## 🚦 Quick Reference

### Keyboard Shortcuts
- `Space`: Manual scan
- `Enter`: Add to cart
- `Esc`: Cancel operation
- `P`: Print receipt

### Status Indicators
- 🟢 Green frame: Product recognized
- 🟡 Yellow frame: Low confidence
- 🔴 Red frame: No match found
- 🔵 Blue frame: Processing

## 📈 Performance Tips

1. **Optimize Images**: Keep training photos under 1MB each
2. **Limit Products**: Best performance with <100 products
3. **Regular Cleanup**: Remove discontinued items
4. **Browser Updates**: Keep browser updated
5. **Device Restart**: Weekly restart improves performance

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**License**: Commercial  
**Developer**: Bakery AI Systems

---

Enjoy your AI-powered bakery management! 🥖🤖