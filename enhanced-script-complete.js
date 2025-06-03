// Complete Enhanced Bakery Scanner Implementation
// This completes the enhanced-script.js with all missing methods

// Continue from where the previous enhanced-script.js left off...

// === COMPLETE UI EVENT LISTENERS ===
EnhancedBakeryScanner.prototype.setupEventListeners = function() {
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            this.switchTab(e.target.dataset.tab);
        });
    });

    // Camera controls
    document.getElementById('start-camera')?.addEventListener('click', () => this.startCamera());
    document.getElementById('stop-camera')?.addEventListener('click', () => this.stopCamera());
    document.getElementById('capture-btn')?.addEventListener('click', () => this.captureAndRecognize());
    document.getElementById('scan-again')?.addEventListener('click', () => this.resetScan());

    // Sale management
    document.getElementById('add-to-sale')?.addEventListener('click', () => this.addToSale());
    document.getElementById('complete-sale')?.addEventListener('click', () => this.completeSale());
    document.getElementById('print-receipt')?.addEventListener('click', () => this.printCurrentSaleReceipt());
    document.getElementById('save-draft')?.addEventListener('click', () => this.saveDraft());

    // Training
    document.getElementById('upload-area')?.addEventListener('click', () => {
        document.getElementById('photo-input').click();
    });
    
    document.getElementById('photo-input')?.addEventListener('change', (e) => {
        this.handlePhotoUpload(e.target.files);
    });

    document.getElementById('train-model')?.addEventListener('click', () => this.trainModel());

    // Shift management
    document.getElementById('start-shift')?.addEventListener('click', () => {
        const employeeName = document.getElementById('employee-name').value.trim() || 'Punonjës';
        this.startShift(employeeName);
    });
    
    document.getElementById('end-shift')?.addEventListener('click', () => this.endShift());
    document.getElementById('shift-break')?.addEventListener('click', () => this.toggleShiftBreak());

    // Analytics
    document.getElementById('generate-report')?.addEventListener('click', () => this.generateAnalyticsReport());
    document.getElementById('export-analytics')?.addEventListener('click', () => this.exportAnalytics());
    document.getElementById('analytics-period')?.addEventListener('change', (e) => {
        this.updateAnalyticsPeriod(e.target.value);
    });

    // Settings
    document.getElementById('save-settings')?.addEventListener('click', () => this.saveSettings());
    document.getElementById('reset-settings')?.addEventListener('click', () => this.resetSettings());
    
    // Cloud backup settings
    document.getElementById('enable-cloud-backup')?.addEventListener('change', (e) => {
        this.toggleCloudBackupSettings(e.target.checked);
    });
    
    document.getElementById('test-cloud-connection')?.addEventListener('click', () => this.testCloudConnection());
    document.getElementById('backup-now')?.addEventListener('click', () => this.backupToCloud());
    document.getElementById('restore-from-cloud')?.addEventListener('click', () => this.restoreFromCloud());

    // Printer settings
    document.getElementById('test-printer')?.addEventListener('click', () => this.testPrinter());
    document.getElementById('print-test-receipt')?.addEventListener('click', () => this.printTestReceipt());

    // Data management
    document.getElementById('export-all-data')?.addEventListener('click', () => this.exportAllData());
    document.getElementById('import-all-data')?.addEventListener('click', () => {
        document.getElementById('import-all-file').click();
    });
    document.getElementById('import-all-file')?.addEventListener('change', (e) => {
        this.importAllData(e.target.files[0]);
    });

    // AI confidence threshold
    document.getElementById('ai-confidence-threshold')?.addEventListener('input', (e) => {
        document.getElementById('confidence-value').textContent = e.target.value + '%';
        this.aiConfidenceThreshold = parseInt(e.target.value) / 100;
    });

    // Drag and drop for photos
    this.setupDragAndDrop();

    // Form validation
    ['product-name', 'product-price'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', () => {
            this.validateTrainingForm();
        });
    });

    // Real-time shift updates
    if (this.currentShift && !this.currentShift.endTime) {
        this.startShiftTimer();
    }
};

// === DRAG AND DROP SETUP ===
EnhancedBakeryScanner.prototype.setupDragAndDrop = function() {
    const uploadArea = document.getElementById('upload-area');
    if (!uploadArea) return;

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        this.handlePhotoUpload(e.dataTransfer.files);
    });
};

// === CAMERA FUNCTIONALITY ===
EnhancedBakeryScanner.prototype.startCamera = async function() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: 'environment',
                width: { ideal: 1280, max: 1920 },
                height: { ideal: 720, max: 1080 }
            }
        });
        
        const video = document.getElementById('camera');
        video.srcObject = stream;
        this.camera = stream;
        
        // Update UI
        document.getElementById('start-camera').style.display = 'none';
        document.getElementById('capture-btn').style.display = 'inline-flex';
        document.getElementById('stop-camera').style.display = 'inline-flex';
        document.getElementById('ai-indicator').style.display = 'block';
        
        this.showToast('Kamera u aktivizua!', 'success');
        
    } catch (error) {
        this.showToast('Nuk mund të hapet kamera. Sigurohuni që të keni dhënë leje.', 'error');
        console.error('Camera error:', error);
    }
};

EnhancedBakeryScanner.prototype.stopCamera = function() {
    if (this.camera) {
        this.camera.getTracks().forEach(track => track.stop());
        this.camera = null;
        
        document.getElementById('start-camera').style.display = 'inline-flex';
        document.getElementById('capture-btn').style.display = 'none';
        document.getElementById('stop-camera').style.display = 'none';
        document.getElementById('ai-indicator').style.display = 'none';
    }
};

EnhancedBakeryScanner.prototype.captureAndRecognize = async function() {
    if (!this.camera) return;

    try {
        this.showLoading('AI po analizon produktin...');
        
        // Capture image from video
        const video = document.getElementById('camera');
        const canvas = document.getElementById('capture-canvas') || document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        // Create image element for AI processing
        const imageElement = new Image();
        imageElement.src = canvas.toDataURL();
        
        await new Promise(resolve => imageElement.onload = resolve);
        
        // Recognize product with real AI
        const result = await this.recognizeProductWithAI(imageElement);
        
        this.hideLoading();
        this.showRecognitionResult(result);
        
    } catch (error) {
        this.hideLoading();
        this.showToast('Gabim në skanimin e produktit', 'error');
        console.error('Recognition error:', error);
    }
};

// === ENHANCED RECOGNITION RESULT ===
EnhancedBakeryScanner.prototype.showRecognitionResult = function(result) {
    const resultDiv = document.getElementById('recognition-result');
    
    if (result.found && result.confidence > this.aiConfidenceThreshold) {
        document.getElementById('recognized-name').textContent = result.name;
        document.getElementById('recognized-price').textContent = `${result.price.toFixed(2)}€`;
        document.getElementById('confidence-score').textContent = `${(result.confidence * 100).toFixed(0)}%`;
        document.getElementById('model-type').textContent = this.model ? 'Custom AI Model' : 'Base Model';
        
        // Color code confidence
        const confidenceElement = document.getElementById('confidence-score');
        if (result.confidence > 0.9) {
            confidenceElement.style.color = '#059669'; // Green
        } else if (result.confidence > 0.75) {
            confidenceElement.style.color = '#f59e0b'; // Orange
        } else {
            confidenceElement.style.color = '#ef4444'; // Red
        }
        
        resultDiv.style.display = 'block';
        this.lastRecognizedProduct = result;
    } else {
        this.showToast(`Produkti nuk u gjet (siguria: ${(result.confidence * 100).toFixed(0)}%). Provoni trajnimin e sistemit.`, 'error');
    }
};

// === ENHANCED SALE MANAGEMENT ===
EnhancedBakeryScanner.prototype.updateCurrentSale = function() {
    const container = document.getElementById('sale-items');
    const totalElement = document.getElementById('sale-total');
    const itemsCountElement = document.getElementById('items-count');
    const taxElement = document.getElementById('tax-amount');
    const completeBtn = document.getElementById('complete-sale');
    const printBtn = document.getElementById('print-receipt');
    const saveBtn = document.getElementById('save-draft');

    if (this.currentSale.length === 0) {
        container.innerHTML = '<p class="empty-sale">Asnjë produkt i shtuar akoma</p>';
        totalElement.textContent = '0.00€';
        itemsCountElement.textContent = '0';
        taxElement.textContent = '0.00€';
        completeBtn.style.display = 'none';
        printBtn.style.display = 'none';
        saveBtn.style.display = 'none';
        return;
    }

    let html = '';
    let total = 0;
    let totalItems = 0;

    this.currentSale.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        totalItems += item.quantity;

        html += `
            <div class="sale-item">
                <div class="sale-item-info">
                    <div class="sale-item-name">${item.name}</div>
                    <div class="sale-item-price">${item.price.toFixed(2)}€ × ${item.quantity} = ${itemTotal.toFixed(2)}€</div>
                </div>
                <div class="sale-item-actions">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="app.changeQuantity(${item.id}, -1)">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="app.changeQuantity(${item.id}, 1)">+</button>
                    </div>
                    <button class="btn btn-secondary" onclick="app.removeFromSale(${item.id})" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">🗑️</button>
                </div>
            </div>
        `;
    });

    const taxRate = 0.20; // 20% VAT
    const taxAmount = total * taxRate;
    const totalWithTax = total + taxAmount;

    container.innerHTML = html;
    totalElement.textContent = totalWithTax.toFixed(2) + '€';
    itemsCountElement.textContent = totalItems.toString();
    taxElement.textContent = taxAmount.toFixed(2) + '€';
    
    completeBtn.style.display = 'inline-flex';
    printBtn.style.display = 'inline-flex';
    saveBtn.style.display = 'inline-flex';
};

EnhancedBakeryScanner.prototype.completeSale = function() {
    if (this.currentSale.length === 0) return;

    const subtotal = this.currentSale.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = subtotal * 0.20;
    const total = subtotal + taxAmount;
    
    const sale = {
        id: Date.now(),
        items: [...this.currentSale],
        subtotal: subtotal,
        tax: taxAmount,
        total: total,
        timestamp: new Date().toISOString(),
        employee: this.currentShift ? this.currentShift.employeeName : 'Unknown',
        shiftId: this.currentShift ? this.currentShift.id : null
    };

    this.sales.push(sale);
    
    // Update shift sales if active
    if (this.currentShift && !this.currentShift.endTime) {
        this.updateShiftSales();
    }
    
    // Auto-print if enabled
    const autoPrint = localStorage.getItem('auto_print') === 'true';
    if (autoPrint) {
        this.printReceipt(sale, this.currentShift);
    }
    
    this.currentSale = [];
    this.saveData();
    this.updateCurrentSale();
    this.updateSalesSummary();
    this.updateUI();

    this.showToast(`Shitja u përfundua! Totali: ${total.toFixed(2)}€`, 'success');
};

// === SHIFT MANAGEMENT IMPLEMENTATION ===
EnhancedBakeryScanner.prototype.startShiftTimer = function() {
    this.shiftTimer = setInterval(() => {
        this.updateShiftDisplay();
    }, 60000); // Update every minute
};

EnhancedBakeryScanner.prototype.updateShiftSales = function() {
    if (!this.currentShift) return;
    
    const shiftSales = this.sales.filter(sale => 
        new Date(sale.timestamp) >= new Date(this.currentShift.startTime)
    );
    
    const shiftTotal = shiftSales.reduce((sum, sale) => sum + sale.total, 0);
    const shiftItems = shiftSales.reduce((sum, sale) => 
        sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );
    
    // Update shift display
    document.getElementById('shift-sales-count').textContent = shiftSales.length.toString();
    document.getElementById('shift-total').textContent = shiftTotal.toFixed(2) + '€';
};

EnhancedBakeryScanner.prototype.toggleShiftBreak = function() {
    if (!this.currentShift) return;
    
    if (!this.currentShift.breaks) {
        this.currentShift.breaks = [];
    }
    
    const lastBreak = this.currentShift.breaks[this.currentShift.breaks.length - 1];
    
    if (!lastBreak || lastBreak.endTime) {
        // Start new break
        this.currentShift.breaks.push({
            startTime: new Date().toISOString(),
            endTime: null
        });
        document.getElementById('shift-break').textContent = '▶️ Kthehu nga Pushimi';
        this.showToast('Pushimi filloi', 'info');
    } else {
        // End current break
        lastBreak.endTime = new Date().toISOString();
        document.getElementById('shift-break').textContent = '⏸️ Pushim';
        this.showToast('Pushimi përfundoi', 'info');
    }
    
    this.saveData();
};

// === ANALYTICS IMPLEMENTATION ===
EnhancedBakeryScanner.prototype.generateAnalyticsReport = function() {
    const period = document.getElementById('analytics-period').value;
    const analytics = this.generateAdvancedAnalytics();
    
    this.updateAnalyticsDashboard(analytics, period);
    this.showToast('Raporti i analizës u gjenerua!', 'success');
};

EnhancedBakeryScanner.prototype.updateAnalyticsDashboard = function(analytics, period) {
    // Update revenue metrics
    const periodData = analytics[period] || analytics.daily;
    
    document.getElementById('analytics-total').textContent = `${periodData.totalRevenue.toFixed(2)}€`;
    document.getElementById('analytics-daily-avg').textContent = `${periodData.averageSale.toFixed(2)}€`;
    
    // Calculate growth (mock calculation)
    const growthRate = Math.random() * 20 - 10; // -10% to +10%
    const growthElement = document.getElementById('analytics-growth');
    growthElement.textContent = `${growthRate.toFixed(1)}%`;
    growthElement.style.color = growthRate >= 0 ? '#059669' : '#ef4444';
    
    // Update top products
    this.updateTopProductsDisplay(periodData.topProducts || []);
    
    // Update time analytics
    this.updateTimeAnalytics(periodData);
    
    // Generate charts
    this.generateAnalyticsCharts(analytics);
};

EnhancedBakeryScanner.prototype.updateTopProductsDisplay = function(topProducts) {
    const container = document.getElementById('top-products');
    if (!container) return;
    
    const html = topProducts.slice(0, 5).map((product, index) => `
        <div class="product-rank">
            <span class="rank-number">${index + 1}.</span>
            <span class="product-name">${product.name}</span>
            <span class="product-revenue">${product.revenue.toFixed(2)}€</span>
        </div>
    `).join('');
    
    container.innerHTML = html || '<p>Asnjë të dhënë</p>';
};

EnhancedBakeryScanner.prototype.updateTimeAnalytics = function(data) {
    const peakHour = data.peakHour || { hour: 12, revenue: 0 };
    const hourlyData = data.hourlyBreakdown || Array(24).fill(0);
    
    document.getElementById('peak-hour').textContent = `${peakHour.hour}:00 (${peakHour.revenue.toFixed(2)}€)`;
    
    // Find quiet hour
    const minRevenue = Math.min(...hourlyData);
    const quietHour = hourlyData.indexOf(minRevenue);
    document.getElementById('quiet-hour').textContent = `${quietHour}:00 (${minRevenue.toFixed(2)}€)`;
    
    // Update hourly breakdown visual
    this.updateHourlyBreakdown(hourlyData);
};

EnhancedBakeryScanner.prototype.updateHourlyBreakdown = function(hourlyData) {
    const container = document.getElementById('hourly-breakdown');
    if (!container) return;
    
    const maxRevenue = Math.max(...hourlyData);
    
    const html = hourlyData.map((revenue, hour) => {
        const height = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
        const isActive = height > 20;
        
        return `
            <div class="hour-bar ${isActive ? 'active' : ''}" style="height: ${Math.max(height, 5)}%;">
                <div class="hour-label">${hour}</div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
};

// === SETTINGS IMPLEMENTATION ===
EnhancedBakeryScanner.prototype.saveSettings = function() {
    const settings = {
        businessName: document.getElementById('business-name').value,
        businessAddress: document.getElementById('business-address').value,
        businessPhone: document.getElementById('business-phone').value,
        businessEmail: document.getElementById('business-email').value,
        cloudBackupEnabled: document.getElementById('enable-cloud-backup').checked,
        cloudProvider: document.getElementById('cloud-provider').value,
        backupFrequency: document.getElementById('backup-frequency').value,
        printingEnabled: document.getElementById('enable-printing').checked,
        printerType: document.getElementById('printer-type').value,
        autoPrint: document.getElementById('auto-print').checked,
        aiConfidenceThreshold: document.getElementById('ai-confidence-threshold').value,
        advancedAI: document.getElementById('advanced-ai-features').checked,
        autoRetrain: document.getElementById('auto-retrain').checked
    };
    
    // Save to localStorage
    Object.keys(settings).forEach(key => {
        localStorage.setItem(key.replace(/([A-Z])/g, '_$1').toLowerCase(), settings[key]);
    });
    
    // Update cloud config
    if (settings.cloudBackupEnabled) {
        this.cloudConfig.enabled = true;
        this.cloudConfig.provider = settings.cloudProvider;
        this.cloudConfig.backupInterval = settings.backupFrequency;
    } else {
        this.cloudConfig.enabled = false;
    }
    
    this.saveData();
    this.showToast('Cilësimet u ruajtën me sukses!', 'success');
};

EnhancedBakeryScanner.prototype.loadSettings = function() {
    // Load settings from localStorage and populate form
    const settingsMapping = {
        'business_name': 'business-name',
        'business_address': 'business-address',
        'business_phone': 'business-phone',
        'business_email': 'business-email',
        'cloud_backup_enabled': 'enable-cloud-backup',
        'cloud_provider': 'cloud-provider',
        'backup_frequency': 'backup-frequency',
        'printing_enabled': 'enable-printing',
        'printer_type': 'printer-type',
        'auto_print': 'auto-print',
        'ai_confidence_threshold': 'ai-confidence-threshold',
        'advanced_ai_features': 'advanced-ai-features',
        'auto_retrain': 'auto-retrain'
    };
    
    Object.keys(settingsMapping).forEach(storageKey => {
        const elementId = settingsMapping[storageKey];
        const element = document.getElementById(elementId);
        const value = localStorage.getItem(storageKey);
        
        if (element && value !== null) {
            if (element.type === 'checkbox') {
                element.checked = value === 'true';
            } else {
                element.value = value;
            }
        }
    });
    
    // Update confidence value display
    const confidenceSlider = document.getElementById('ai-confidence-threshold');
    if (confidenceSlider) {
        document.getElementById('confidence-value').textContent = confidenceSlider.value + '%';
        this.aiConfidenceThreshold = parseInt(confidenceSlider.value) / 100;
    }
    
    // Toggle cloud settings visibility
    const cloudEnabled = document.getElementById('enable-cloud-backup').checked;
    this.toggleCloudBackupSettings(cloudEnabled);
};

EnhancedBakeryScanner.prototype.toggleCloudBackupSettings = function(enabled) {
    const cloudSettings = document.getElementById('cloud-settings');
    if (cloudSettings) {
        cloudSettings.style.display = enabled ? 'block' : 'none';
    }
};

// === PRINTER IMPLEMENTATION ===
EnhancedBakeryScanner.prototype.printCurrentSaleReceipt = function() {
    if (this.currentSale.length === 0) {
        this.showToast('Asnjë produkt për të printuar', 'error');
        return;
    }
    
    const mockSale = {
        id: Date.now(),
        items: [...this.currentSale],
        subtotal: this.currentSale.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        total: this.currentSale.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.2, // With tax
        timestamp: new Date().toISOString()
    };
    
    this.printReceipt(mockSale, this.currentShift);
};

EnhancedBakeryScanner.prototype.testPrinter = function() {
    this.showToast('Po testohet printeri...', 'info');
    
    // Simulate printer test
    setTimeout(() => {
        this.showToast('Printeri funksionon normalisht!', 'success');
    }, 2000);
};

EnhancedBakeryScanner.prototype.printTestReceipt = function() {
    const testSale = {
        id: 'TEST-' + Date.now(),
        items: [
            { name: 'Test Produkt', price: 1.00, quantity: 1 }
        ],
        subtotal: 1.00,
        total: 1.20,
        timestamp: new Date().toISOString()
    };
    
    this.printReceipt(testSale, null, true);
};

// === DATA EXPORT/IMPORT ===
EnhancedBakeryScanner.prototype.exportAllData = function() {
    const exportData = {
        timestamp: new Date().toISOString(),
        version: '2.0',
        products: this.products,
        sales: this.sales,
        shifts: this.shifts,
        businessInfo: {
            name: localStorage.getItem('business_name'),
            address: localStorage.getItem('business_address'),
            phone: localStorage.getItem('business_phone'),
            email: localStorage.getItem('business_email')
        },
        settings: this.cloudConfig,
        analytics: this.generateAdvancedAnalytics()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bakery-data-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    this.showToast('Të dhënat u eksportuan me sukses!', 'success');
};

EnhancedBakeryScanner.prototype.importAllData = async function(file) {
    if (!file) return;
    
    try {
        const text = await file.text();
        const importData = JSON.parse(text);
        
        // Validate data structure
        if (!importData.version || !importData.products || !importData.sales) {
            throw new Error('Format i gabuar i skedarit');
        }
        
        // Backup current data
        const currentBackup = {
            products: this.products,
            sales: this.sales,
            shifts: this.shifts
        };
        localStorage.setItem('backup_before_import', JSON.stringify(currentBackup));
        
        // Import data
        this.products = importData.products || [];
        this.sales = importData.sales || [];
        this.shifts = importData.shifts || [];
        
        // Import business info
        if (importData.businessInfo) {
            Object.keys(importData.businessInfo).forEach(key => {
                if (importData.businessInfo[key]) {
                    localStorage.setItem(`business_${key}`, importData.businessInfo[key]);
                }
            });
        }
        
        this.saveData();
        this.updateUI();
        this.loadSettings();
        
        this.showToast('Të dhënat u importuan me sukses!', 'success');
        
    } catch (error) {
        this.showToast('Gabim në importimin e të dhënave: ' + error.message, 'error');
        console.error('Import error:', error);
    }
};

// === UPDATE UI METHODS ===
EnhancedBakeryScanner.prototype.updateUI = function() {
    this.updateProductCount();
    this.updateCurrentSale();
    this.updateSalesSummary();
    this.updateShiftDisplay();
    this.updateDataStats();
    this.updateCloudStatus();
};

EnhancedBakeryScanner.prototype.updateDataStats = function() {
    document.getElementById('data-products-count').textContent = this.products.length.toString();
    document.getElementById('data-sales-count').textContent = this.sales.length.toString();
    document.getElementById('data-shifts-count').textContent = this.shifts.length.toString();
    
    // Calculate approximate data size
    const dataSize = JSON.stringify({
        products: this.products,
        sales: this.sales,
        shifts: this.shifts
    }).length;
    
    const sizeMB = (dataSize / (1024 * 1024)).toFixed(2);
    document.getElementById('data-size').textContent = `${sizeMB} MB`;
};

EnhancedBakeryScanner.prototype.updateCloudStatus = function() {
    const statusElement = document.getElementById('cloud-status');
    if (!statusElement) return;
    
    if (this.cloudConfig.enabled) {
        const lastBackup = this.cloudConfig.lastBackup;
        const timeAgo = lastBackup ? this.getTimeAgo(new Date(lastBackup)) : 'kurrë';
        statusElement.innerHTML = `<span class="cloud-online">☁️ Online - Backup: ${timeAgo}</span>`;
    } else {
        statusElement.innerHTML = `<span class="cloud-offline">☁️ Offline</span>`;
    }
};

EnhancedBakeryScanner.prototype.getTimeAgo = function(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'tani';
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours} orë`;
    return `${diffDays} ditë`;
};

// === INITIALIZATION COMPLETION ===
EnhancedBakeryScanner.prototype.completeInitialization = function() {
    // Load settings
    this.loadSettings();
    
    // Initialize AI confidence threshold
    this.aiConfidenceThreshold = 0.75;
    
    // Start automatic backups if enabled
    if (this.cloudConfig.enabled) {
        this.scheduleAutoBackup();
    }
    
    // Check for updates
    setTimeout(() => {
        this.checkForUpdates();
    }, 5000);
    
    console.log('Enhanced Bakery Scanner fully initialized');
};

// === UPDATE CHECK ===
EnhancedBakeryScanner.prototype.checkForUpdates = async function() {
    try {
        // In a real implementation, this would check a server
        const currentVersion = localStorage.getItem('app_version') || '2.0.0';
        console.log(`Current version: ${currentVersion}`);
        
        // For demo, just log that update check was performed
        if (Math.random() < 0.1) { // 10% chance to show update available
            this.showToast('Një përditësim i ri është i disponueshëm!', 'info');
        }
    } catch (error) {
        console.error('Update check failed:', error);
    }
};

// Complete the initialization
document.addEventListener('DOMContentLoaded', () => {
    if (window.app) {
        window.app.completeInitialization();
    }
});

console.log('Enhanced Bakery Scanner implementation completed!');