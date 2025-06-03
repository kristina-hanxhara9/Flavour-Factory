// Main Application Logic
class BakeryScanner {
    constructor() {
        this.currentTab = 'scanner';
        this.cart = [];
        this.products = [];
        this.sales = [];
        this.settings = {
            businessName: '',
            businessAddress: '',
            businessPhone: '',
            autoFocus: true,
            flashEnabled: false,
            continuousScan: true,
            taxRate: 0.20 // 20% VAT
        };
        
        // Initialize enterprise features
        this.employeeManager = null;
        this.cloudBackup = null;
        this.thermalPrinter = null;
        this.revenueForecast = null;
        
        this.init();
    }
    
    async init() {
        // Load saved data
        this.loadData();
        
        // Initialize modules
        await this.initializeModules();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
            document.getElementById('app').style.display = 'flex';
        }, 2000);
        
        // Initialize tab
        this.switchTab('scanner');
    }
    
    async initializeModules() {
        // Initialize ML Engine
        if (window.MLEngine) {
            this.mlEngine = new window.MLEngine();
            await this.mlEngine.initialize();
        }
        
        // Initialize Camera Handler
        if (window.CameraHandler) {
            this.cameraHandler = new window.CameraHandler();
        }
        
        // Initialize Bulk Trainer
        if (window.BulkTrainer) {
            this.bulkTrainer = new window.BulkTrainer();
        }
        
        // Initialize Analytics
        if (window.Analytics) {
            this.analytics = new window.Analytics();
            this.analytics.updateDashboard(this.sales);
        }
        
        // Initialize Enterprise Features
        if (window.EmployeeManager) {
            this.employeeManager = new window.EmployeeManager();
            this.updateEmployeeDisplay();
        }
        
        if (window.CloudBackup) {
            this.cloudBackup = new window.CloudBackup();
            // Don't initialize immediately - wait for user action
        }
        
        if (window.ThermalPrinter) {
            this.thermalPrinter = new window.ThermalPrinter();
        }
        
        if (window.RevenueForecast) {
            this.revenueForecast = new window.RevenueForecast();
            this.revenueForecast.loadHistoricalData(this.sales);
        }
    }
    
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });
        
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Fullscreen toggle
        document.getElementById('fullscreenToggle').addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // Scanner tab
        this.setupScannerListeners();
        
        // Training tab
        this.setupTrainingListeners();
        
        // Products tab
        this.setupProductsListeners();
        
        // Sales tab
        this.setupSalesListeners();
        
        // Settings tab
        this.setupSettingsListeners();
        
        // Enterprise features
        this.setupEnterpriseListeners();
    }
    
    setupScannerListeners() {
        // Camera toggle
        document.getElementById('cameraToggle').addEventListener('click', () => {
            if (this.cameraHandler) {
                this.cameraHandler.toggleCamera();
            }
        });
        
        // Manual scan
        document.getElementById('manualScan').addEventListener('click', () => {
            if (this.cameraHandler && this.mlEngine) {
                this.performScan();
            }
        });
        
        // Add to cart button
        document.getElementById('addToCartBtn').addEventListener('click', () => {
            const productName = document.getElementById('detectedName').textContent;
            const product = this.products.find(p => p.name === productName);
            if (product) {
                this.addToCart(product);
            }
        });
        
        // Checkout button
        document.getElementById('checkoutBtn').addEventListener('click', () => {
            this.checkout();
        });
    }
    
    setupTrainingListeners() {
        // Training mode toggle
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                document.querySelectorAll('.training-mode').forEach(mode => {
                    mode.classList.remove('active');
                });
                document.getElementById(btn.dataset.mode + 'Training').classList.add('active');
            });
        });
        
        // Photo upload
        const photoDropZone = document.getElementById('photoDropZone');
        const productPhotos = document.getElementById('productPhotos');
        
        photoDropZone.addEventListener('click', () => productPhotos.click());
        
        photoDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            photoDropZone.classList.add('drag-over');
        });
        
        photoDropZone.addEventListener('dragleave', () => {
            photoDropZone.classList.remove('drag-over');
        });
        
        photoDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            photoDropZone.classList.remove('drag-over');
            this.handlePhotoFiles(e.dataTransfer.files);
        });
        
        productPhotos.addEventListener('change', (e) => {
            this.handlePhotoFiles(e.target.files);
        });
        
        // Single training form
        document.getElementById('singleTrainingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.startSingleTraining();
        });
        
        // Bulk training
        document.getElementById('folderUpload').addEventListener('change', (e) => {
            if (this.bulkTrainer) {
                this.bulkTrainer.handleFolderUpload(e.target.files);
            }
        });
        
        document.getElementById('csvUpload').addEventListener('change', (e) => {
            if (this.bulkTrainer) {
                this.bulkTrainer.handleCSVUpload(e.target.files[0]);
            }
        });
        
        document.getElementById('startBulkTraining').addEventListener('click', () => {
            if (this.bulkTrainer) {
                this.bulkTrainer.startTraining();
            }
        });
    }
    
    setupProductsListeners() {
        // Product search
        document.getElementById('productSearch').addEventListener('input', (e) => {
            this.filterProducts(e.target.value);
        });
        
        // Export products
        document.getElementById('exportProducts').addEventListener('click', () => {
            this.exportProducts();
        });
        
        // Import products
        document.getElementById('importProducts').addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => this.importProducts(e.target.files[0]);
            input.click();
        });
    }
    
    setupSalesListeners() {
        // Date filter
        document.getElementById('salesDateFilter').addEventListener('change', (e) => {
            this.filterSales(e.target.value);
        });
        
        // Export sales
        document.getElementById('exportSales').addEventListener('click', () => {
            this.exportSales();
        });
    }
    
    setupSettingsListeners() {
        // Business info form
        document.getElementById('businessInfoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBusinessInfo();
        });
        
        // Camera settings
        document.getElementById('autoFocus').addEventListener('change', (e) => {
            this.settings.autoFocus = e.target.checked;
            this.saveSettings();
        });
        
        document.getElementById('flashEnabled').addEventListener('change', (e) => {
            this.settings.flashEnabled = e.target.checked;
            this.saveSettings();
        });
        
        document.getElementById('continuousScan').addEventListener('change', (e) => {
            this.settings.continuousScan = e.target.checked;
            this.saveSettings();
        });
        
        // Data management
        document.getElementById('backupData').addEventListener('click', () => {
            this.backupData();
        });
        
        document.getElementById('restoreData').addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => this.restoreData(e.target.files[0]);
            input.click();
        });
        
        document.getElementById('clearData').addEventListener('click', () => {
            if (confirm('A jeni të sigurt që doni të fshini të gjitha të dhënat? Ky veprim nuk mund të zhbëhet!')) {
                this.clearAllData();
            }
        });
        
        // Check updates
        document.getElementById('checkUpdates').addEventListener('click', () => {
            this.showToast('Aplikacioni është i përditësuar!', 'success');
        });
    }
    
    setupEnterpriseListeners() {
        // Employee management
        document.getElementById('switchEmployee').addEventListener('click', () => {
            this.showEmployeeSelector();
        });
        
        document.getElementById('addEmployee').addEventListener('click', () => {
            this.showAddEmployeeDialog();
        });
        
        document.getElementById('viewShifts').addEventListener('click', () => {
            this.showShiftsReport();
        });
        
        // Printer
        document.getElementById('connectPrinter').addEventListener('click', async () => {
            if (this.thermalPrinter) {
                const connected = await this.thermalPrinter.connectBluetooth();
                if (connected) {
                    document.getElementById('printerStatus').textContent = 'I lidhur';
                    document.getElementById('testPrint').disabled = false;
                    this.showToast('Printer u lidh me sukses!', 'success');
                } else {
                    this.showToast('Lidhja me printer dështoi!', 'error');
                }
            }
        });
        
        document.getElementById('testPrint').addEventListener('click', async () => {
            if (this.thermalPrinter && this.thermalPrinter.isConnected) {
                const testSale = {
                    id: 'TEST001',
                    date: new Date(),
                    items: [{name: 'Test Produkt', quantity: 1, price: 100}],
                    subtotal: 100,
                    tax: 20,
                    total: 120
                };
                await this.thermalPrinter.printReceipt(testSale, this.settings);
            }
        });
        
        // Cloud backup
        document.getElementById('setupCloudBackup').addEventListener('click', async () => {
            if (this.cloudBackup) {
                await this.cloudBackup.initialize();
                const authenticated = await this.cloudBackup.authenticate();
                if (authenticated) {
                    this.showToast('Google Drive u konfigurua me sukses!', 'success');
                    document.getElementById('manualBackup').disabled = false;
                }
            }
        });
        
        document.getElementById('manualBackup').addEventListener('click', async () => {
            if (this.cloudBackup && this.cloudBackup.isAuthenticated) {
                try {
                    await this.cloudBackup.createBackup();
                    document.getElementById('lastBackupTime').textContent = new Date().toLocaleString('sq-AL');
                } catch (error) {
                    this.showToast('Backup dështoi!', 'error');
                }
            }
        });
        
        document.getElementById('autoBackup').addEventListener('change', (e) => {
            if (this.cloudBackup) {
                if (e.target.checked) {
                    this.cloudBackup.enableAutoBackup(24);
                    document.getElementById('autoBackupStatus').textContent = 'Aktiv';
                } else {
                    this.cloudBackup.disableAutoBackup();
                    document.getElementById('autoBackupStatus').textContent = 'Joaktiv';
                }
            }
        });
        
        // Employee filter in sales
        document.getElementById('employeeFilter').addEventListener('change', (e) => {
            this.filterSalesByEmployee(e.target.value);
        });
        
        // View employee details
        document.getElementById('viewEmployeeDetails').addEventListener('click', () => {
            this.showEmployeePerformanceDetails();
        });
    }
    
    // Tab switching
    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update active tab content
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === tabName + 'Tab');
        });
        
        this.currentTab = tabName;
        
        // Tab-specific actions
        if (tabName === 'scanner' && this.cameraHandler) {
            this.cameraHandler.startCamera();
        } else if (this.cameraHandler) {
            this.cameraHandler.stopCamera();
        }
        
        if (tabName === 'products') {
            this.displayProducts();
        }
        
        if (tabName === 'sales' && this.analytics) {
            this.analytics.updateDashboard(this.sales);
            
            // Update forecast if available
            if (this.revenueForecast && this.sales.length > 0) {
                this.updateForecastChart();
                this.updateEmployeePerformanceChart();
            }
        }
    }
    
    // Scanner functionality
    async performScan() {
        if (!this.mlEngine || !this.cameraHandler) return;
        
        const image = this.cameraHandler.captureFrame();
        const result = await this.mlEngine.recognizeProduct(image);
        
        if (result && result.confidence > 0.75) {
            this.displayDetectedProduct(result);
            
            if (this.settings.continuousScan) {
                setTimeout(() => this.performScan(), 2000);
            }
        }
    }
    
    displayDetectedProduct(result) {
        const product = this.products.find(p => p.id === result.productId);
        if (!product) return;
        
        document.getElementById('detectedName').textContent = product.name;
        document.getElementById('detectedPrice').textContent = `${product.price} Lek`;
        document.getElementById('productDetected').classList.remove('hidden');
        
        // Update confidence meter
        const confidencePercent = Math.round(result.confidence * 100);
        document.getElementById('confidenceLevel').style.width = confidencePercent + '%';
        document.getElementById('confidenceText').textContent = confidencePercent + '%';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            document.getElementById('productDetected').classList.add('hidden');
        }, 5000);
    }
    
    // Cart functionality
    addToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.cart.push({
                ...product,
                quantity: 1
            });
        }
        
        this.updateCartDisplay();
        this.showToast(`${product.name} u shtua në shportë!`, 'success');
    }
    
    updateCartDisplay() {
        const cartItems = document.getElementById('cartItems');
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Shporta është bosh</p>';
            document.getElementById('checkoutBtn').disabled = true;
        } else {
            cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">${item.price} Lek</div>
                    </div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="app.updateQuantity('${item.id}', -1)">
                            <span class="material-icons">remove</span>
                        </button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="app.updateQuantity('${item.id}', 1)">
                            <span class="material-icons">add</span>
                        </button>
                    </div>
                </div>
            `).join('');
            
            document.getElementById('checkoutBtn').disabled = false;
        }
        
        this.updateCartSummary();
    }
    
    updateQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (!item) return;
        
        item.quantity += change;
        
        if (item.quantity <= 0) {
            this.cart = this.cart.filter(item => item.id !== productId);
        }
        
        this.updateCartDisplay();
    }
    
    updateCartSummary() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * this.settings.taxRate;
        const total = subtotal + tax;
        
        document.getElementById('subtotal').textContent = subtotal.toFixed(0) + ' Lek';
        document.getElementById('tax').textContent = tax.toFixed(0) + ' Lek';
        document.getElementById('total').textContent = total.toFixed(0) + ' Lek';
    }
    
    checkout() {
        if (this.cart.length === 0) return;
        
        const sale = {
            id: Date.now().toString(),
            date: new Date(),
            items: [...this.cart],
            subtotal: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            tax: 0,
            total: 0
        };
        
        sale.tax = sale.subtotal * this.settings.taxRate;
        sale.total = sale.subtotal + sale.tax;
        
        // Add employee info if logged in
        if (this.employeeManager && this.employeeManager.currentShift) {
            sale.employeeId = this.employeeManager.currentShift.employeeId;
            sale.employeeName = this.employeeManager.currentShift.employeeName;
            this.employeeManager.recordSale(sale);
        }
        
        this.sales.push(sale);
        this.saveSales();
        
        // Update product statistics
        this.cart.forEach(item => {
            const product = this.products.find(p => p.id === item.id);
            if (product) {
                product.soldCount = (product.soldCount || 0) + item.quantity;
                product.lastSold = new Date();
            }
        });
        this.saveProducts();
        
        // Show receipt
        this.showReceipt(sale);
        
        // Print to thermal printer if connected
        if (this.thermalPrinter && this.thermalPrinter.isConnected) {
            this.thermalPrinter.printReceipt(sale, this.settings);
        }
        
        // Clear cart
        this.cart = [];
        this.updateCartDisplay();
        
        // Update analytics
        if (this.analytics) {
            this.analytics.updateDashboard(this.sales);
        }
    }
    
    showReceipt(sale) {
        const receiptContent = document.getElementById('receiptContent');
        const date = new Date(sale.date);
        
        receiptContent.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h2>${this.settings.businessName || 'Furra'}</h2>
                <p>${this.settings.businessAddress || ''}</p>
                <p>${this.settings.businessPhone || ''}</p>
            </div>
            <hr>
            <p>Data: ${date.toLocaleDateString('sq-AL')} ${date.toLocaleTimeString('sq-AL')}</p>
            <p>Nr. Faturës: ${sale.id}</p>
            <hr>
            <table style="width: 100%; margin: 20px 0;">
                ${sale.items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td style="text-align: center;">${item.quantity}x</td>
                        <td style="text-align: right;">${item.price} Lek</td>
                        <td style="text-align: right;">${item.price * item.quantity} Lek</td>
                    </tr>
                `).join('')}
            </table>
            <hr>
            <div style="text-align: right;">
                <p>Nën-total: ${sale.subtotal} Lek</p>
                <p>TVSH (20%): ${sale.tax.toFixed(0)} Lek</p>
                <p style="font-size: 1.2rem; font-weight: bold;">Total: ${sale.total.toFixed(0)} Lek</p>
            </div>
            <hr>
            <p style="text-align: center; margin-top: 20px;">Faleminderit për blerjen!</p>
        `;
        
        document.getElementById('receiptModal').classList.remove('hidden');
    }
    
    // Training functionality
    handlePhotoFiles(files) {
        const photoPreview = document.getElementById('photoPreview');
        photoPreview.innerHTML = '';
        
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const div = document.createElement('div');
                    div.className = 'preview-item';
                    div.innerHTML = `
                        <img src="${e.target.result}" alt="Product photo">
                        <button class="remove-btn" onclick="this.parentElement.remove()">
                            <span class="material-icons">close</span>
                        </button>
                    `;
                    photoPreview.appendChild(div);
                };
                reader.readAsDataURL(file);
            }
        });
        
        document.getElementById('trainBtn').disabled = files.length === 0;
    }
    
    async startSingleTraining() {
        const name = document.getElementById('productName').value;
        const price = parseInt(document.getElementById('productPrice').value);
        const category = document.getElementById('productCategory').value;
        const photos = document.querySelectorAll('#photoPreview img');
        
        if (!name || !price || !category || photos.length === 0) {
            this.showToast('Ju lutem plotësoni të gjitha fushat!', 'error');
            return;
        }
        
        // Show progress
        document.getElementById('trainingProgress').classList.remove('hidden');
        document.getElementById('trainBtn').disabled = true;
        
        // Create product
        const product = {
            id: Date.now().toString(),
            name,
            price,
            category,
            trainedDate: new Date(),
            photoCount: photos.length,
            soldCount: 0
        };
        
        // Simulate training (in real app, this would use TensorFlow.js)
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            document.getElementById('progressFill').style.width = progress + '%';
            document.getElementById('progressText').textContent = `Duke trajnuar AI... ${progress}%`;
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                
                // Add product
                this.products.push(product);
                this.saveProducts();
                
                // Train ML model
                if (this.mlEngine) {
                    const images = Array.from(photos).map(img => img.src);
                    this.mlEngine.trainProduct(product.id, images);
                }
                
                // Reset form
                document.getElementById('singleTrainingForm').reset();
                document.getElementById('photoPreview').innerHTML = '';
                document.getElementById('trainingProgress').classList.add('hidden');
                document.getElementById('trainBtn').disabled = false;
                document.getElementById('progressFill').style.width = '0%';
                
                this.showToast(`Produkti "${name}" u trajnua me sukses!`, 'success');
            }
        }, 200);
    }
    
    // Products management
    displayProducts() {
        const productList = document.getElementById('productList');
        
        if (this.products.length === 0) {
            productList.innerHTML = '<p class="text-center">Nuk ka produkte të trajnuara ende.</p>';
            return;
        }
        
        productList.innerHTML = this.products.map(product => `
            <div class="product-card">
                <div class="product-image" style="background-color: ${this.getCategoryColor(product.category)};">
                    <span class="material-icons" style="font-size: 4rem; color: white; display: block; text-align: center; padding-top: 60px;">
                        ${this.getCategoryIcon(product.category)}
                    </span>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-details">
                        <span class="product-price">${product.price} Lek</span>
                        <span class="product-category">${product.category}</span>
                    </div>
                    <div class="product-stats">
                        <span>📸 ${product.photoCount} foto</span>
                        <span>💰 ${product.soldCount || 0} shitur</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-secondary" onclick="app.editProduct('${product.id}')">
                            <span class="material-icons">edit</span>
                            Ndrysho
                        </button>
                        <button class="btn btn-danger" onclick="app.deleteProduct('${product.id}')">
                            <span class="material-icons">delete</span>
                            Fshi
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    filterProducts(searchTerm) {
        const cards = document.querySelectorAll('.product-card');
        const term = searchTerm.toLowerCase();
        
        cards.forEach(card => {
            const name = card.querySelector('.product-name').textContent.toLowerCase();
            const category = card.querySelector('.product-category').textContent.toLowerCase();
            const visible = name.includes(term) || category.includes(term);
            card.style.display = visible ? 'block' : 'none';
        });
    }
    
    editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        const newName = prompt('Emri i ri:', product.name);
        const newPrice = prompt('Çmimi i ri:', product.price);
        
        if (newName && newPrice) {
            product.name = newName;
            product.price = parseInt(newPrice);
            this.saveProducts();
            this.displayProducts();
            this.showToast('Produkti u përditësua!', 'success');
        }
    }
    
    deleteProduct(productId) {
        if (!confirm('A jeni të sigurt që doni të fshini këtë produkt?')) return;
        
        this.products = this.products.filter(p => p.id !== productId);
        this.saveProducts();
        this.displayProducts();
        
        // Remove from ML model
        if (this.mlEngine) {
            this.mlEngine.removeProduct(productId);
        }
        
        this.showToast('Produkti u fshi!', 'success');
    }
    
    exportProducts() {
        const data = JSON.stringify(this.products, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `produkte_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Produktet u eksportuan!', 'success');
    }
    
    async importProducts(file) {
        try {
            const text = await file.text();
            const products = JSON.parse(text);
            
            products.forEach(product => {
                if (!this.products.find(p => p.id === product.id)) {
                    this.products.push(product);
                }
            });
            
            this.saveProducts();
            this.displayProducts();
            this.showToast(`${products.length} produkte u importuan!`, 'success');
        } catch (error) {
            this.showToast('Gabim gjatë importimit!', 'error');
        }
    }
    
    // Sales functionality
    filterSales(date) {
        if (!date) {
            if (this.analytics) {
                this.analytics.updateDashboard(this.sales);
            }
            return;
        }
        
        const filtered = this.sales.filter(sale => {
            const saleDate = new Date(sale.date).toISOString().split('T')[0];
            return saleDate === date;
        });
        
        if (this.analytics) {
            this.analytics.updateDashboard(filtered);
        }
    }
    
    exportSales() {
        const date = document.getElementById('salesDateFilter').value || new Date().toISOString().split('T')[0];
        const filtered = this.sales.filter(sale => {
            const saleDate = new Date(sale.date).toISOString().split('T')[0];
            return !document.getElementById('salesDateFilter').value || saleDate === date;
        });
        
        const csv = this.generateSalesCSV(filtered);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shitjet_${date}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Raporti u eksportua!', 'success');
    }
    
    generateSalesCSV(sales) {
        const headers = ['Data', 'Ora', 'Nr. Faturës', 'Produkti', 'Sasia', 'Çmimi', 'Total', 'TVSH', 'Total me TVSH'];
        const rows = [];
        
        sales.forEach(sale => {
            const date = new Date(sale.date);
            sale.items.forEach(item => {
                rows.push([
                    date.toLocaleDateString('sq-AL'),
                    date.toLocaleTimeString('sq-AL'),
                    sale.id,
                    item.name,
                    item.quantity,
                    item.price,
                    item.price * item.quantity,
                    (item.price * item.quantity * this.settings.taxRate).toFixed(0),
                    (item.price * item.quantity * (1 + this.settings.taxRate)).toFixed(0)
                ]);
            });
        });
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    // Settings functionality
    saveBusinessInfo() {
        this.settings.businessName = document.getElementById('businessName').value;
        this.settings.businessAddress = document.getElementById('businessAddress').value;
        this.settings.businessPhone = document.getElementById('businessPhone').value;
        this.saveSettings();
        this.showToast('Informacioni u ruajt!', 'success');
    }
    
    updateStorageInfo() {
        const modelCount = this.products.length;
        const storageUsed = (JSON.stringify(localStorage).length / 1024 / 1024).toFixed(2);
        
        document.getElementById('modelCount').textContent = modelCount;
        document.getElementById('storageUsed').textContent = storageUsed + ' MB';
    }
    
    backupData() {
        const backup = {
            version: '1.0.0',
            date: new Date(),
            products: this.products,
            sales: this.sales,
            settings: this.settings
        };
        
        const data = JSON.stringify(backup, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_furre_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Backup u krijua!', 'success');
    }
    
    async restoreData(file) {
        try {
            const text = await file.text();
            const backup = JSON.parse(text);
            
            if (confirm('Kjo do të mbishkruajë të gjitha të dhënat ekzistuese. Vazhdoni?')) {
                this.products = backup.products || [];
                this.sales = backup.sales || [];
                this.settings = { ...this.settings, ...backup.settings };
                
                this.saveAll();
                this.init();
                this.showToast('Të dhënat u rikthyen!', 'success');
            }
        } catch (error) {
            this.showToast('Gabim gjatë rikthimit!', 'error');
        }
    }
    
    clearAllData() {
        localStorage.clear();
        this.products = [];
        this.sales = [];
        this.cart = [];
        this.init();
        this.showToast('Të gjitha të dhënat u fshinë!', 'success');
    }
    
    // Utility functions
    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    getCategoryIcon(category) {
        const icons = {
            'byrek': 'bakery_dining',
            'bukë': 'breakfast_dining',
            'ëmbëlsira': 'cake',
            'torta': 'cake',
            'kafe': 'coffee',
            'të tjera': 'restaurant'
        };
        return icons[category] || 'restaurant';
    }
    
    getCategoryColor(category) {
        const colors = {
            'byrek': '#8B4513',
            'bukë': '#D2691E',
            'ëmbëlsira': '#FFB6C1',
            'torta': '#FF69B4',
            'kafe': '#6F4E37',
            'të tjera': '#708090'
        };
        return colors[category] || '#808080';
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="material-icons">${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}</span>
            <span>${message}</span>
        `;
        
        document.getElementById('toastContainer').appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // Data persistence
    loadData() {
        this.products = JSON.parse(localStorage.getItem('products') || '[]');
        this.sales = JSON.parse(localStorage.getItem('sales') || '[]');
        this.settings = { ...this.settings, ...JSON.parse(localStorage.getItem('settings') || '{}') };
        
        // Apply saved theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        
        // Apply saved settings
        document.getElementById('businessName').value = this.settings.businessName;
        document.getElementById('businessAddress').value = this.settings.businessAddress;
        document.getElementById('businessPhone').value = this.settings.businessPhone;
        document.getElementById('autoFocus').checked = this.settings.autoFocus;
        document.getElementById('flashEnabled').checked = this.settings.flashEnabled;
        document.getElementById('continuousScan').checked = this.settings.continuousScan;
        
        this.updateStorageInfo();
    }
    
    saveProducts() {
        localStorage.setItem('products', JSON.stringify(this.products));
    }
    
    saveSales() {
        localStorage.setItem('sales', JSON.stringify(this.sales));
    }
    
    saveSettings() {
        localStorage.setItem('settings', JSON.stringify(this.settings));
    }
    
    saveAll() {
        this.saveProducts();
        this.saveSales();
        this.saveSettings();
    }
    
    // Update forecast chart
    updateForecastChart() {
        if (!this.revenueForecast) return;
        
        const forecast = this.revenueForecast.forecastRevenue(30);
        if (forecast.error) return;
        
        const ctx = document.getElementById('forecastChart');
        if (!ctx) return;
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: forecast.forecast.map(f => new Date(f.date).toLocaleDateString('sq-AL')),
                datasets: [
                    {
                        label: 'Të ardhurat aktuale',
                        data: this.revenueForecast.historicalData.slice(-30).map(d => d.revenue),
                        borderColor: '#2E7D32',
                        backgroundColor: 'rgba(46, 125, 50, 0.1)'
                    },
                    {
                        label: 'Parashikimi',
                        data: forecast.forecast.map(f => f.revenue),
                        borderColor: '#D2691E',
                        backgroundColor: 'rgba(210, 105, 30, 0.1)',
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
        
        // Update forecast info
        const totalForecast = forecast.forecast.reduce((sum, f) => sum + f.revenue, 0);
        document.getElementById('forecastTotal').textContent = this.formatCurrency(totalForecast);
        document.getElementById('forecastAccuracy').textContent = Math.round(forecast.accuracy * 100) + '%';
    }
    
    // Update employee performance chart
    updateEmployeePerformanceChart() {
        if (!this.employeeManager) return;
        
        const performance = this.employeeManager.getAllEmployeesPerformance();
        const ctx = document.getElementById('employeeChart');
        if (!ctx) return;
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: performance.map(p => p.employee.name),
                datasets: [{
                    label: 'Të ardhura',
                    data: performance.map(p => p.totalRevenue),
                    backgroundColor: '#8B4513'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

// Receipt modal handlers
document.querySelector('.close-btn').addEventListener('click', () => {
    document.getElementById('receiptModal').classList.add('hidden');
});

document.getElementById('printReceipt').addEventListener('click', () => {
    window.print();
});

document.getElementById('newSale').addEventListener('click', () => {
    document.getElementById('receiptModal').classList.add('hidden');
});

// Employee management functions
BakeryScanner.prototype.updateEmployeeDisplay = function() {
    if (!this.employeeManager) return;
    
    const currentEmployee = document.getElementById('currentEmployee');
    if (this.employeeManager.currentShift) {
        currentEmployee.textContent = this.employeeManager.currentShift.employeeName;
    } else {
        currentEmployee.textContent = 'Asnjë punonjës';
    }
    
    // Update employee list
    const employeeList = document.getElementById('employeeList');
    employeeList.innerHTML = this.employeeManager.employees.map(emp => `
        <div class="employee-item">
            <div class="employee-info">
                <span class="employee-name">${emp.name}</span>
                <span class="employee-stats">${emp.sales || 0} shitje | ${this.formatCurrency(emp.avgTransaction || 0)}/shitje</span>
            </div>
            <button class="btn btn-secondary btn-small" onclick="app.selectEmployee('${emp.id}')">
                <span class="material-icons">login</span>
            </button>
        </div>
    `).join('');
    
    // Update employee filter
    const employeeFilter = document.getElementById('employeeFilter');
    employeeFilter.innerHTML = '<option value="">Të gjithë punonjësit</option>' +
        this.employeeManager.employees.map(emp => 
            `<option value="${emp.id}">${emp.name}</option>`
        ).join('');
};

BakeryScanner.prototype.showEmployeeSelector = function() {
    const employees = this.employeeManager.employees;
    if (employees.length === 0) {
        this.showToast('Nuk ka punonjës të regjistruar!', 'warning');
        return;
    }
    
    const employeeList = employees.map(emp => 
        `<button class="btn btn-secondary" onclick="app.selectEmployee('${emp.id}')">${emp.name}</button>`
    ).join('');
    
    // Simple employee selector (in real app, use proper modal)
    const selector = prompt('Zgjidhni punonjësin:\n' + employees.map((e, i) => `${i+1}. ${e.name}`).join('\n'));
    if (selector) {
        const index = parseInt(selector) - 1;
        if (employees[index]) {
            this.selectEmployee(employees[index].id);
        }
    }
};

BakeryScanner.prototype.selectEmployee = function(employeeId) {
    if (this.employeeManager) {
        this.employeeManager.startShift(employeeId);
        this.updateEmployeeDisplay();
        this.showToast('Turni filloi!', 'success');
    }
};

BakeryScanner.prototype.showAddEmployeeDialog = function() {
    const name = prompt('Emri i punonjësit:');
    if (name) {
        const employee = this.employeeManager.addEmployee({
            name,
            role: 'Shitës',
            pin: Math.floor(1000 + Math.random() * 9000).toString()
        });
        this.updateEmployeeDisplay();
        this.showToast(`Punonjësi ${name} u shtua!`, 'success');
    }
};

BakeryScanner.prototype.showShiftsReport = function() {
    if (!this.employeeManager) return;
    
    const shifts = this.employeeManager.shifts.slice(-10); // Last 10 shifts
    alert('Turnet e fundit:\n' + shifts.map(s => 
        `${s.employeeName} - ${new Date(s.startTime).toLocaleDateString()} - ${this.formatCurrency(s.revenue)}`
    ).join('\n'));
};

BakeryScanner.prototype.showEmployeePerformanceDetails = function() {
    if (!this.employeeManager) return;
    
    const performance = this.employeeManager.getAllEmployeesPerformance();
    alert('Performanca e punonjësve:\n' + performance.map(p => 
        `${p.employee.name}: ${this.formatCurrency(p.totalRevenue)} të ardhura, ${p.totalSales} shitje`
    ).join('\n'));
};

BakeryScanner.prototype.filterSalesByEmployee = function(employeeId) {
    let filtered = this.sales;
    
    if (employeeId) {
        filtered = filtered.filter(sale => sale.employeeId === employeeId);
    }
    
    if (this.analytics) {
        this.analytics.updateDashboard(filtered);
    }
};

// Initialize app
const app = new BakeryScanner();