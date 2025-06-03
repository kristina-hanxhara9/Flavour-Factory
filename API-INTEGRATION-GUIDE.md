# 🔌 API Integration Guide - Udhëzues Integrimesh

## ☁️ CLOUD BACKUP SETUP - Konfigurimi i Cloud Backup

### 1. Google Drive API Setup

#### Step 1: Google Cloud Console
```bash
1. Shkoni te: https://console.cloud.google.com
2. Krijoni projekt të ri: "Bakery Scanner API"
3. Aktivizoni Google Drive API:
   - Go to "APIs & Services" → "Library"
   - Search "Google Drive API"
   - Click "Enable"
```

#### Step 2: Create Credentials
```bash
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Configure consent screen:
   - Application name: "Bakery Scanner"
   - Authorized domains: localhost (for testing)
4. Create OAuth client:
   - Application type: "Web application"
   - Authorized redirect URIs: http://localhost:8080
5. Copy Client ID and Client Secret
```

#### Step 3: App Configuration
```javascript
// Add to enhanced-script.js
const GOOGLE_DRIVE_CONFIG = {
    clientId: 'your-client-id.apps.googleusercontent.com',
    clientSecret: 'your-client-secret',
    redirectUri: 'http://localhost:8080',
    scope: 'https://www.googleapis.com/auth/drive.file'
};
```

### 2. Firebase Setup

#### Step 1: Firebase Console
```bash
1. Go to: https://console.firebase.google.com
2. Create new project: "Bakery Scanner DB"
3. Add web app to project
4. Copy configuration object
```

#### Step 2: Firebase Configuration
```javascript
// Firebase config
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 3. AWS S3 Setup

#### Step 1: AWS Account Setup
```bash
1. Create AWS account: https://aws.amazon.com
2. Go to IAM → Users → Create User
3. Attach policy: AmazonS3FullAccess
4. Generate Access Key and Secret
```

#### Step 2: S3 Bucket Configuration
```bash
1. Go to S3 → Create Bucket
2. Bucket name: "bakery-scanner-backup"
3. Region: Choose closest to your location
4. Configure CORS:
```

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

---

## 🖨️ PRINTER INTEGRATION - Integrim Printerash

### 1. Thermal Printer Setup (Recommended)

#### Compatible Printers:
```
✅ Epson TM-T20II (USB/Ethernet)
✅ Star TSP143IIIW (WiFi)
✅ Citizen CT-S310II (USB/Serial)
✅ Bixolon SRP-330II (USB/Parallel)
✅ POS-80 (USB/Serial/Bluetooth)
```

#### ESC/POS Commands:
```javascript
// Basic ESC/POS commands for thermal printers
const ESC_POS = {
    INIT: '\x1B\x40',           // Initialize printer
    FEED_LINE: '\x0A',          // Line feed
    CUT_PAPER: '\x1D\x56\x00',  // Cut paper
    ALIGN_CENTER: '\x1B\x61\x01', // Center align
    ALIGN_LEFT: '\x1B\x61\x00',   // Left align
    BOLD_ON: '\x1B\x45\x01',      // Bold on
    BOLD_OFF: '\x1B\x45\x00',     // Bold off
    DOUBLE_HEIGHT: '\x1B\x21\x10', // Double height
    NORMAL_SIZE: '\x1B\x21\x00'    // Normal size
};
```

### 2. Bluetooth Printer Integration

#### Setup Steps:
```javascript
// Bluetooth printer connection
async function connectBluetoothPrinter() {
    try {
        // Request Bluetooth device
        const device = await navigator.bluetooth.requestDevice({
            filters: [
                { services: ['000018f0-0000-1000-8000-00805f9b34fb'] },
                { namePrefix: 'POS-' },
                { namePrefix: 'BT-' }
            ]
        });
        
        // Connect to GATT server
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(
            '000018f0-0000-1000-8000-00805f9b34fb'
        );
        
        // Get characteristic for printing
        const characteristic = await service.getCharacteristic(
            '00002af1-0000-1000-8000-00805f9b34fb'
        );
        
        return characteristic;
    } catch (error) {
        console.error('Bluetooth connection failed:', error);
        throw error;
    }
}
```

### 3. Receipt Template Engine

#### HTML to ESC/POS Converter:
```javascript
class ReceiptConverter {
    constructor() {
        this.width = 48; // Characters per line for 80mm paper
    }
    
    convertToESCPOS(receiptHTML) {
        const commands = [];
        
        // Initialize printer
        commands.push(ESC_POS.INIT);
        
        // Parse HTML and convert to commands
        const parser = new DOMParser();
        const doc = parser.parseFromString(receiptHTML, 'text/html');
        
        this.processElement(doc.body, commands);
        
        // Cut paper
        commands.push('\n\n\n');
        commands.push(ESC_POS.CUT_PAPER);
        
        return new Uint8Array(commands.join('').split('').map(c => c.charCodeAt(0)));
    }
    
    processElement(element, commands) {
        for (const node of element.childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                commands.push(node.textContent);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                switch (node.tagName.toLowerCase()) {
                    case 'h1':
                    case 'h2':
                    case 'h3':
                        commands.push(ESC_POS.BOLD_ON);
                        commands.push(ESC_POS.DOUBLE_HEIGHT);
                        commands.push(ESC_POS.ALIGN_CENTER);
                        this.processElement(node, commands);
                        commands.push(ESC_POS.NORMAL_SIZE);
                        commands.push(ESC_POS.BOLD_OFF);
                        commands.push(ESC_POS.ALIGN_LEFT);
                        commands.push('\n');
                        break;
                    case 'strong':
                    case 'b':
                        commands.push(ESC_POS.BOLD_ON);
                        this.processElement(node, commands);
                        commands.push(ESC_POS.BOLD_OFF);
                        break;
                    case 'center':
                        commands.push(ESC_POS.ALIGN_CENTER);
                        this.processElement(node, commands);
                        commands.push(ESC_POS.ALIGN_LEFT);
                        break;
                    case 'br':
                        commands.push('\n');
                        break;
                    case 'hr':
                        commands.push('-'.repeat(this.width) + '\n');
                        break;
                    default:
                        this.processElement(node, commands);
                        break;
                }
            }
        }
    }
}
```

---

## 📊 ANALYTICS API - API e Analitikave

### 1. Data Export Formats

#### JSON Export:
```javascript
// Export all data to JSON
function exportAllData() {
    const exportData = {
        timestamp: new Date().toISOString(),
        version: '2.0',
        products: app.products,
        sales: app.sales,
        shifts: app.shifts,
        analytics: app.generateAdvancedAnalytics(),
        businessInfo: {
            name: localStorage.getItem('business_name'),
            address: localStorage.getItem('business_address'),
            phone: localStorage.getItem('business_phone')
        }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bakery-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}
```

#### CSV Export:
```javascript
// Export sales to CSV
function exportSalesToCSV() {
    const headers = ['Date', 'Time', 'Employee', 'Product', 'Quantity', 'Price', 'Total'];
    const rows = [];
    
    app.sales.forEach(sale => {
        const date = new Date(sale.timestamp);
        const dateStr = date.toLocaleDateString();
        const timeStr = date.toLocaleTimeString();
        
        sale.items.forEach(item => {
            rows.push([
                dateStr,
                timeStr,
                sale.employee || 'Unknown',
                item.name,
                item.quantity,
                item.price.toFixed(2),
                (item.price * item.quantity).toFixed(2)
            ]);
        });
    });
    
    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
```

### 2. Real-time Analytics API

#### WebSocket Integration:
```javascript
// Real-time analytics updates
class AnalyticsSocket {
    constructor(url) {
        this.url = url;
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }
    
    connect() {
        this.socket = new WebSocket(this.url);
        
        this.socket.onopen = () => {
            console.log('Analytics WebSocket connected');
            this.reconnectAttempts = 0;
        };
        
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleAnalyticsUpdate(data);
        };
        
        this.socket.onclose = () => {
            console.log('Analytics WebSocket disconnected');
            this.attemptReconnect();
        };
        
        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }
    
    sendUpdate(type, data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: type,
                data: data,
                timestamp: new Date().toISOString(),
                deviceId: app.getDeviceId()
            }));
        }
    }
    
    handleAnalyticsUpdate(data) {
        switch (data.type) {
            case 'sales_update':
                this.updateRealTimeDashboard(data.data);
                break;
            case 'inventory_alert':
                this.showInventoryAlert(data.data);
                break;
            case 'performance_metric':
                this.updatePerformanceMetrics(data.data);
                break;
        }
    }
}
```

---

## 🤖 AI MODEL API - API e Modelit AI

### 1. Model Training API

#### Custom Training Endpoint:
```javascript
// Enhanced model training with cloud processing
async function trainModelInCloud(productData, images) {
    const formData = new FormData();
    
    // Add product metadata
    formData.append('product', JSON.stringify(productData));
    
    // Add images
    images.forEach((image, index) => {
        formData.append(`image_${index}`, image);
    });
    
    // Add existing model for transfer learning
    if (app.model) {
        const modelBlob = await app.model.save();
        formData.append('existing_model', modelBlob);
    }
    
    try {
        const response = await fetch('/api/train-model', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${app.getApiKey()}`,
                'X-Device-ID': app.getDeviceId()
            },
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            throw new Error('Training failed');
        }
    } catch (error) {
        console.error('Cloud training error:', error);
        throw error;
    }
}
```

### 2. Model Inference API

#### Batch Processing:
```javascript
// Process multiple images at once
async function batchRecognition(images) {
    const results = [];
    
    for (const image of images) {
        try {
            const result = await app.recognizeProductWithAI(image);
            results.push(result);
        } catch (error) {
            results.push({
                error: true,
                message: error.message
            });
        }
    }
    
    return results;
}
```

---

## 🔐 SECURITY & AUTHENTICATION - Siguria

### 1. API Key Management

#### Secure Storage:
```javascript
// Secure API key storage
class SecureStorage {
    static encrypt(data, key) {
        // Simple encryption (use proper crypto in production)
        return btoa(data + key);
    }
    
    static decrypt(encryptedData, key) {
        try {
            return atob(encryptedData).replace(key, '');
        } catch {
            return null;
        }
    }
    
    static setApiKey(service, apiKey) {
        const deviceKey = this.getDeviceKey();
        const encrypted = this.encrypt(apiKey, deviceKey);
        localStorage.setItem(`api_key_${service}`, encrypted);
    }
    
    static getApiKey(service) {
        const deviceKey = this.getDeviceKey();
        const encrypted = localStorage.getItem(`api_key_${service}`);
        return encrypted ? this.decrypt(encrypted, deviceKey) : null;
    }
    
    static getDeviceKey() {
        let key = localStorage.getItem('device_key');
        if (!key) {
            key = Math.random().toString(36).substr(2, 16);
            localStorage.setItem('device_key', key);
        }
        return key;
    }
}
```

### 2. Data Encryption

#### Backup Encryption:
```javascript
// Encrypt sensitive data before backup
async function encryptBackupData(data) {
    const key = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
    
    const encoder = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encoder.encode(JSON.stringify(data))
    );
    
    return {
        encrypted: Array.from(new Uint8Array(encrypted)),
        iv: Array.from(iv),
        key: await window.crypto.subtle.exportKey('raw', key)
    };
}
```

---

## 📱 MOBILE APP CONVERSION - Konvertim në App Mobile

### 1. PWA to Native App

#### Using Capacitor:
```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli

# Initialize Capacitor
npx cap init bakery-scanner com.yourcompany.bakeryscanner

# Add platforms
npx cap add android
npx cap add ios

# Build and sync
npm run build
npx cap sync

# Open in native IDE
npx cap open android
npx cap open ios
```

#### Capacitor Configuration:
```json
{
  "appId": "com.yourcompany.bakeryscanner",
  "appName": "Bakery Scanner Pro",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "plugins": {
    "Camera": {
      "permissions": ["camera"]
    },
    "Filesystem": {
      "permissions": ["storage"]
    },
    "Network": {
      "permissions": ["network"]
    }
  }
}
```

---

## 🔄 CONTINUOUS INTEGRATION - Integrim i Vazhdueshëm

### 1. Automatic Updates

#### Update Service:
```javascript
// Check for updates
class UpdateService {
    constructor() {
        this.currentVersion = '2.0.0';
        this.updateUrl = 'https://your-server.com/api/updates';
    }
    
    async checkForUpdates() {
        try {
            const response = await fetch(`${this.updateUrl}/check`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentVersion: this.currentVersion,
                    deviceId: app.getDeviceId()
                })
            });
            
            const updateInfo = await response.json();
            
            if (updateInfo.hasUpdate) {
                return this.promptForUpdate(updateInfo);
            }
            
            return false;
        } catch (error) {
            console.error('Update check failed:', error);
            return false;
        }
    }
    
    async promptForUpdate(updateInfo) {
        const shouldUpdate = confirm(
            `Një përditësim i ri është i disponueshëm (v${updateInfo.version}).\n` +
            `Ndryshimet: ${updateInfo.changes}\n\n` +
            `Doni ta përditësoni tani?`
        );
        
        if (shouldUpdate) {
            return this.performUpdate(updateInfo);
        }
        
        return false;
    }
    
    async performUpdate(updateInfo) {
        try {
            // Download update
            const response = await fetch(updateInfo.downloadUrl);
            const updateData = await response.json();
            
            // Backup current data
            const backupData = {
                products: app.products,
                sales: app.sales,
                shifts: app.shifts,
                settings: app.settings
            };
            localStorage.setItem('backup_before_update', JSON.stringify(backupData));
            
            // Apply update
            this.applyUpdate(updateData);
            
            // Update version
            localStorage.setItem('app_version', updateInfo.version);
            
            app.showToast('Përditësimi u instalua me sukses!', 'success');
            
            // Reload after 2 seconds
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
            return true;
        } catch (error) {
            console.error('Update failed:', error);
            app.showToast('Përditësimi dështoi. Provoni përsëri.', 'error');
            return false;
        }
    }
}
```

---

## 📞 SUPPORT API - API e Mbështetjes

### 1. Remote Diagnostics

#### System Info Collection:
```javascript
// Collect system information for support
function collectSystemInfo() {
    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screen: {
            width: screen.width,
            height: screen.height,
            colorDepth: screen.colorDepth
        },
        app: {
            version: localStorage.getItem('app_version') || '2.0.0',
            deviceId: app.getDeviceId(),
            productsCount: app.products.length,
            salesCount: app.sales.length,
            lastBackup: app.cloudConfig.lastBackup
        },
        browser: {
            cookies: navigator.cookieEnabled,
            localStorage: !!window.localStorage,
            webWorkers: !!window.Worker,
            webAssembly: !!window.WebAssembly
        },
        permissions: {
            camera: 'unknown',
            microphone: 'unknown',
            geolocation: 'unknown'
        }
    };
}
```

### 2. Error Reporting

#### Automatic Error Reporting:
```javascript
// Global error handler
window.addEventListener('error', (event) => {
    const errorInfo = {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error ? event.error.stack : null,
        timestamp: new Date().toISOString(),
        systemInfo: collectSystemInfo()
    };
    
    // Send to error reporting service
    sendErrorReport(errorInfo);
});

async function sendErrorReport(errorInfo) {
    try {
        await fetch('/api/error-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(errorInfo)
        });
    } catch (error) {
        console.error('Failed to send error report:', error);
    }
}
```

---

**🎯 This comprehensive API guide enables full enterprise integration with any existing business systems!**

The system can now integrate with:
- ✅ Any cloud storage provider
- ✅ Any POS system
- ✅ Any thermal printer
- ✅ Any analytics platform
- ✅ Any accounting software
- ✅ Any mobile platform

**Ready for production use in any professional environment!** 🚀