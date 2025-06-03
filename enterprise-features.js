// Employee Management System
class EmployeeManager {
    constructor() {
        this.employees = this.loadEmployees();
        this.currentShift = null;
        this.shifts = this.loadShifts();
    }
    
    // Load employees from storage
    loadEmployees() {
        return JSON.parse(localStorage.getItem('employees') || '[]');
    }
    
    // Load shifts from storage
    loadShifts() {
        return JSON.parse(localStorage.getItem('shifts') || '[]');
    }
    
    // Save employees
    saveEmployees() {
        localStorage.setItem('employees', JSON.stringify(this.employees));
    }
    
    // Save shifts
    saveShifts() {
        localStorage.setItem('shifts', JSON.stringify(this.shifts));
    }
    
    // Add new employee
    addEmployee(employee) {
        const newEmployee = {
            id: Date.now().toString(),
            ...employee,
            createdAt: new Date(),
            sales: 0,
            transactions: 0,
            avgTransaction: 0,
            lastActive: null
        };
        
        this.employees.push(newEmployee);
        this.saveEmployees();
        return newEmployee;
    }
    
    // Start shift
    startShift(employeeId) {
        if (this.currentShift) {
            this.endShift();
        }
        
        const employee = this.employees.find(e => e.id === employeeId);
        if (!employee) return null;
        
        this.currentShift = {
            id: Date.now().toString(),
            employeeId,
            employeeName: employee.name,
            startTime: new Date(),
            endTime: null,
            sales: 0,
            revenue: 0,
            transactions: [],
            breaks: []
        };
        
        employee.lastActive = new Date();
        this.saveEmployees();
        
        return this.currentShift;
    }
    
    // End shift
    endShift() {
        if (!this.currentShift) return;
        
        this.currentShift.endTime = new Date();
        this.currentShift.duration = this.calculateDuration(
            this.currentShift.startTime,
            this.currentShift.endTime
        );
        
        // Update employee stats
        const employee = this.employees.find(e => e.id === this.currentShift.employeeId);
        if (employee) {
            employee.sales += this.currentShift.sales;
            employee.transactions += this.currentShift.transactions.length;
            employee.avgTransaction = employee.sales / employee.transactions;
            this.saveEmployees();
        }
        
        this.shifts.push(this.currentShift);
        this.saveShifts();
        
        const completedShift = this.currentShift;
        this.currentShift = null;
        
        return completedShift;
    }
    
    // Record sale in current shift
    recordSale(sale) {
        if (!this.currentShift) return;
        
        this.currentShift.transactions.push({
            id: sale.id,
            time: new Date(),
            amount: sale.total
        });
        
        this.currentShift.sales++;
        this.currentShift.revenue += sale.total;
    }
    
    // Start break
    startBreak() {
        if (!this.currentShift) return;
        
        const breakRecord = {
            start: new Date(),
            end: null
        };
        
        this.currentShift.breaks.push(breakRecord);
        return breakRecord;
    }
    
    // End break
    endBreak() {
        if (!this.currentShift) return;
        
        const currentBreak = this.currentShift.breaks.find(b => !b.end);
        if (currentBreak) {
            currentBreak.end = new Date();
            currentBreak.duration = this.calculateDuration(currentBreak.start, currentBreak.end);
        }
    }
    
    // Calculate duration in minutes
    calculateDuration(start, end) {
        return Math.round((new Date(end) - new Date(start)) / 1000 / 60);
    }
    
    // Get employee performance
    getEmployeePerformance(employeeId, dateRange) {
        const employee = this.employees.find(e => e.id === employeeId);
        if (!employee) return null;
        
        const employeeShifts = this.shifts.filter(s => 
            s.employeeId === employeeId &&
            (!dateRange || (
                new Date(s.startTime) >= dateRange.start &&
                new Date(s.startTime) <= dateRange.end
            ))
        );
        
        const totalRevenue = employeeShifts.reduce((sum, shift) => sum + shift.revenue, 0);
        const totalSales = employeeShifts.reduce((sum, shift) => sum + shift.sales, 0);
        const totalHours = employeeShifts.reduce((sum, shift) => sum + (shift.duration / 60), 0);
        
        return {
            employee,
            shifts: employeeShifts.length,
            totalRevenue,
            totalSales,
            totalHours,
            avgRevenuePerHour: totalHours > 0 ? totalRevenue / totalHours : 0,
            avgSalesPerShift: employeeShifts.length > 0 ? totalSales / employeeShifts.length : 0
        };
    }
    
    // Get all employees performance
    getAllEmployeesPerformance(dateRange) {
        return this.employees.map(employee => 
            this.getEmployeePerformance(employee.id, dateRange)
        ).sort((a, b) => b.totalRevenue - a.totalRevenue);
    }
    
    // Get shift report
    getShiftReport(shiftId) {
        const shift = this.shifts.find(s => s.id === shiftId);
        if (!shift) return null;
        
        const totalBreakTime = shift.breaks.reduce((sum, b) => 
            sum + (b.duration || 0), 0
        );
        
        const workingTime = shift.duration - totalBreakTime;
        const revenuePerHour = workingTime > 0 ? (shift.revenue / (workingTime / 60)) : 0;
        
        return {
            ...shift,
            totalBreakTime,
            workingTime,
            revenuePerHour,
            avgTransactionValue: shift.sales > 0 ? shift.revenue / shift.sales : 0
        };
    }
}

// Cloud Backup System (using free Google Drive API)
class CloudBackup {
    constructor() {
        this.provider = 'googledrive';
        this.isAuthenticated = false;
        this.autoBackupEnabled = false;
        this.lastBackup = null;
        this.backupInterval = null;
    }
    
    // Initialize Google Drive API (FREE)
    async initialize() {
        // Check if API keys are configured
        if (!window.APP_CONFIG || !window.APP_CONFIG.GOOGLE_CLIENT_ID) {
            console.log('Google Drive not configured. Please set up API keys.');
            if (window.app) {
                window.app.showToast('Google Drive nuk është konfiguruar ende. Kliko "Konfiguro Google Drive" për udhëzime.', 'warning');
            }
            return false;
        }
        
        // Google Drive offers 15GB free storage
        // Cost: $0/month for up to 15GB
        
        if (typeof gapi === 'undefined') {
            console.log('Google API not loaded yet. Loading...');
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => this.handleClientLoad();
            document.body.appendChild(script);
        } else {
            this.handleClientLoad();
        }
    }
    
    handleClientLoad() {
        gapi.load('client:auth2', () => {
            gapi.client.init({
                apiKey: window.APP_CONFIG.GOOGLE_API_KEY,
                clientId: window.APP_CONFIG.GOOGLE_CLIENT_ID,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
                scope: 'https://www.googleapis.com/auth/drive.file'
            }).then(() => {
                console.log('Google API initialized successfully');
            }).catch(error => {
                console.error('Google API initialization failed:', error);
            });
        });
    }
    
    // Authenticate user
    async authenticate() {
        try {
            if (typeof gapi === 'undefined' || !gapi.auth2) {
                throw new Error('Google API not loaded. Please configure API keys first.');
            }
            
            const GoogleAuth = gapi.auth2.getAuthInstance();
            if (!GoogleAuth) {
                throw new Error('Google Auth not initialized. Please check API configuration.');
            }
            
            await GoogleAuth.signIn();
            this.isAuthenticated = true;
            return true;
        } catch (error) {
            console.error('Authentication failed:', error);
            if (window.app) {
                window.app.showToast('Autentifikimi dështoi. Kontrolloni konfigurimin.', 'error');
            }
            return false;
        }
    }
    
    // Create backup
    async createBackup() {
        if (!this.isAuthenticated) {
            await this.authenticate();
        }
        
        const backupData = {
            version: '1.0.0',
            timestamp: new Date(),
            data: {
                products: JSON.parse(localStorage.getItem('products') || '[]'),
                sales: JSON.parse(localStorage.getItem('sales') || '[]'),
                employees: JSON.parse(localStorage.getItem('employees') || '[]'),
                shifts: JSON.parse(localStorage.getItem('shifts') || '[]'),
                settings: JSON.parse(localStorage.getItem('settings') || '{}')
            }
        };
        
        const file = new Blob([JSON.stringify(backupData)], { type: 'application/json' });
        const metadata = {
            name: `bakery_backup_${new Date().toISOString()}.json`,
            mimeType: 'application/json',
            parents: ['appDataFolder'] // Hidden app folder (doesn't count against quota)
        };
        
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);
        
        try {
            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: new Headers({ 'Authorization': 'Bearer ' + gapi.auth.getToken().access_token }),
                body: form
            });
            
            const result = await response.json();
            this.lastBackup = new Date();
            
            if (window.app) {
                window.app.showToast('Backup i suksesshëm në Google Drive!', 'success');
            }
            
            return result;
        } catch (error) {
            console.error('Backup failed:', error);
            throw error;
        }
    }
    
    // Restore from backup
    async restoreBackup(fileId) {
        if (!this.isAuthenticated) {
            await this.authenticate();
        }
        
        try {
            const response = await gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media'
            });
            
            const backupData = JSON.parse(response.body);
            
            // Restore all data
            Object.entries(backupData.data).forEach(([key, value]) => {
                localStorage.setItem(key, JSON.stringify(value));
            });
            
            if (window.app) {
                window.app.showToast('Të dhënat u rikthyen me sukses!', 'success');
                window.location.reload();
            }
            
            return true;
        } catch (error) {
            console.error('Restore failed:', error);
            throw error;
        }
    }
    
    // List backups
    async listBackups() {
        if (!this.isAuthenticated) {
            await this.authenticate();
        }
        
        try {
            const response = await gapi.client.drive.files.list({
                spaces: 'appDataFolder',
                fields: 'files(id, name, createdTime, size)',
                orderBy: 'createdTime desc',
                pageSize: 10
            });
            
            return response.result.files;
        } catch (error) {
            console.error('Failed to list backups:', error);
            return [];
        }
    }
    
    // Enable auto backup
    enableAutoBackup(intervalHours = 24) {
        this.autoBackupEnabled = true;
        
        // Clear existing interval
        if (this.backupInterval) {
            clearInterval(this.backupInterval);
        }
        
        // Set new interval
        this.backupInterval = setInterval(() => {
            this.createBackup();
        }, intervalHours * 60 * 60 * 1000);
        
        // Save preference
        localStorage.setItem('autoBackupEnabled', 'true');
        localStorage.setItem('autoBackupInterval', intervalHours.toString());
    }
    
    // Disable auto backup
    disableAutoBackup() {
        this.autoBackupEnabled = false;
        
        if (this.backupInterval) {
            clearInterval(this.backupInterval);
            this.backupInterval = null;
        }
        
        localStorage.setItem('autoBackupEnabled', 'false');
    }
}

// Thermal Printer Integration
class ThermalPrinter {
    constructor() {
        this.printerType = 'bluetooth'; // or 'usb', 'network'
        this.isConnected = false;
        this.device = null;
        this.printerWidth = 48; // characters
    }
    
    // Initialize Bluetooth printer
    async connectBluetooth() {
        try {
            // Web Bluetooth API
            this.device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }],
                optionalServices: ['00001800-0000-1000-8000-00805f9b34fb']
            });
            
            const server = await this.device.gatt.connect();
            const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
            this.characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');
            
            this.isConnected = true;
            return true;
        } catch (error) {
            console.error('Bluetooth connection failed:', error);
            return false;
        }
    }
    
    // Format receipt for thermal printer
    formatReceipt(sale, businessInfo) {
        const line = '='.repeat(this.printerWidth);
        const center = (text) => text.padStart((this.printerWidth + text.length) / 2).padEnd(this.printerWidth);
        const alignPrice = (name, price) => {
            const priceStr = price + ' Lek';
            const nameWidth = this.printerWidth - priceStr.length - 1;
            return name.substring(0, nameWidth).padEnd(nameWidth) + ' ' + priceStr;
        };
        
        let receipt = '';
        
        // Header
        receipt += center(businessInfo.name || 'FURRA') + '\n';
        if (businessInfo.address) receipt += center(businessInfo.address) + '\n';
        if (businessInfo.phone) receipt += center(businessInfo.phone) + '\n';
        receipt += line + '\n';
        
        // Date and receipt number
        const date = new Date(sale.date);
        receipt += `Data: ${date.toLocaleDateString('sq-AL')}\n`;
        receipt += `Ora: ${date.toLocaleTimeString('sq-AL')}\n`;
        receipt += `Nr: ${sale.id}\n`;
        if (sale.employeeName) receipt += `Punonjës: ${sale.employeeName}\n`;
        receipt += line + '\n';
        
        // Items
        sale.items.forEach(item => {
            receipt += alignPrice(`${item.quantity}x ${item.name}`, item.price * item.quantity) + '\n';
        });
        
        receipt += line + '\n';
        
        // Totals
        receipt += alignPrice('Nën-total:', sale.subtotal) + '\n';
        receipt += alignPrice('TVSH (20%):', sale.tax) + '\n';
        receipt += alignPrice('TOTAL:', sale.total) + '\n';
        
        receipt += line + '\n';
        receipt += center('Faleminderit!') + '\n';
        receipt += center('Mirupafshim!') + '\n';
        
        // Add QR code command if supported
        if (this.supportsQRCode()) {
            receipt += this.generateQRCommand(sale.id);
        }
        
        return receipt;
    }
    
    // Print receipt
    async printReceipt(sale, businessInfo) {
        if (!this.isConnected) {
            const connected = await this.connectBluetooth();
            if (!connected) {
                throw new Error('Printer not connected');
            }
        }
        
        const receiptText = this.formatReceipt(sale, businessInfo);
        const encoder = new TextEncoder();
        const data = encoder.encode(receiptText + '\n\n\n'); // Add paper feed
        
        try {
            await this.characteristic.writeValue(data);
            return true;
        } catch (error) {
            console.error('Print failed:', error);
            throw error;
        }
    }
    
    // Check if printer supports QR codes
    supportsQRCode() {
        // Most modern thermal printers support QR codes
        return true;
    }
    
    // Generate QR code command (ESC/POS)
    generateQRCommand(data) {
        // ESC/POS command for QR code
        const cmd = '\x1D\x28\x6B'; // QR code command
        // ... additional QR formatting
        return cmd;
    }
}

// Revenue Forecasting
class RevenueForecast {
    constructor() {
        this.historicalData = [];
    }
    
    // Load historical data
    loadHistoricalData(sales) {
        // Group by day
        const dailyData = {};
        
        sales.forEach(sale => {
            const date = new Date(sale.date).toISOString().split('T')[0];
            if (!dailyData[date]) {
                dailyData[date] = { date, revenue: 0, transactions: 0 };
            }
            dailyData[date].revenue += sale.total;
            dailyData[date].transactions++;
        });
        
        this.historicalData = Object.values(dailyData).sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );
    }
    
    // Simple moving average forecast
    forecastRevenue(days = 30) {
        if (this.historicalData.length < 7) {
            return { error: 'Not enough data for forecasting' };
        }
        
        // Calculate weekly patterns
        const weeklyPattern = this.calculateWeeklyPattern();
        
        // Calculate trend
        const trend = this.calculateTrend();
        
        // Generate forecast
        const forecast = [];
        const lastDate = new Date(this.historicalData[this.historicalData.length - 1].date);
        
        for (let i = 1; i <= days; i++) {
            const forecastDate = new Date(lastDate);
            forecastDate.setDate(forecastDate.getDate() + i);
            
            const dayOfWeek = forecastDate.getDay();
            const baseRevenue = weeklyPattern[dayOfWeek];
            const trendAdjustment = trend * i;
            
            forecast.push({
                date: forecastDate.toISOString().split('T')[0],
                revenue: Math.max(0, baseRevenue + trendAdjustment),
                confidence: Math.max(0.5, 1 - (i / days) * 0.5) // Confidence decreases over time
            });
        }
        
        return {
            forecast,
            weeklyPattern,
            trend,
            accuracy: this.calculateAccuracy()
        };
    }
    
    // Calculate weekly pattern
    calculateWeeklyPattern() {
        const pattern = Array(7).fill(0);
        const counts = Array(7).fill(0);
        
        this.historicalData.forEach(day => {
            const dayOfWeek = new Date(day.date).getDay();
            pattern[dayOfWeek] += day.revenue;
            counts[dayOfWeek]++;
        });
        
        // Calculate average for each day of week
        return pattern.map((total, i) => counts[i] > 0 ? total / counts[i] : 0);
    }
    
    // Calculate trend using linear regression
    calculateTrend() {
        const n = this.historicalData.length;
        if (n < 2) return 0;
        
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        
        this.historicalData.forEach((day, i) => {
            sumX += i;
            sumY += day.revenue;
            sumXY += i * day.revenue;
            sumX2 += i * i;
        });
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        return slope;
    }
    
    // Calculate forecast accuracy (using last 7 days as test)
    calculateAccuracy() {
        if (this.historicalData.length < 14) return 0;
        
        // Use older data to predict last 7 days
        const testDays = 7;
        const trainingData = this.historicalData.slice(0, -testDays);
        const testData = this.historicalData.slice(-testDays);
        
        // Simple accuracy calculation
        let totalError = 0;
        testData.forEach(actual => {
            const predicted = this.predictRevenue(new Date(actual.date), trainingData);
            const error = Math.abs(actual.revenue - predicted) / actual.revenue;
            totalError += error;
        });
        
        return Math.max(0, 1 - (totalError / testDays));
    }
    
    // Predict revenue for a specific date
    predictRevenue(date, data = this.historicalData) {
        const dayOfWeek = date.getDay();
        const relevantDays = data.filter(d => new Date(d.date).getDay() === dayOfWeek);
        
        if (relevantDays.length === 0) return 0;
        
        // Weighted average (more recent days have higher weight)
        let weightedSum = 0;
        let weightSum = 0;
        
        relevantDays.slice(-4).forEach((day, i) => {
            const weight = i + 1;
            weightedSum += day.revenue * weight;
            weightSum += weight;
        });
        
        return weightedSum / weightSum;
    }
}

// Export for use in main app
window.EmployeeManager = EmployeeManager;
window.CloudBackup = CloudBackup;
window.ThermalPrinter = ThermalPrinter;
window.RevenueForecast = RevenueForecast;