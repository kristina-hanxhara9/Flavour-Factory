// Bulk Product Training System - Add to enhanced-script.js
// This allows adding multiple products at once with photos

class BulkProductTrainer {
    constructor(app) {
        this.app = app;
        this.bulkProducts = [];
        this.isTraining = false;
        this.currentTrainingIndex = 0;
    }

    // Initialize bulk training interface
    initializeBulkTraining() {
        // Add bulk training tab to the interface
        this.addBulkTrainingUI();
        this.setupBulkEventListeners();
    }

    addBulkTrainingUI() {
        // Find the training tab content
        const trainingTab = document.getElementById('train-tab');
        if (!trainingTab) return;

        // Add bulk training section
        const bulkSection = document.createElement('div');
        bulkSection.className = 'bulk-training-section';
        bulkSection.innerHTML = `
            <div class="bulk-training-header">
                <h2>📦 Trajnim Masiv i Produkteve</h2>
                <p class="bulk-info">
                    🚀 Shto të gjitha produktet tuaja në një herë! Thjesht organizoni fotot në folder 
                    dhe sistemi do t'i trajnojë automatikisht.
                </p>
            </div>

            <div class="bulk-training-tabs">
                <button class="bulk-tab-btn active" data-bulk-tab="folders">
                    📁 Metodë Folder (Rekomanduar)
                </button>
                <button class="bulk-tab-btn" data-bulk-tab="csv">
                    📊 Metodë CSV + Foto
                </button>
                <button class="bulk-tab-btn" data-bulk-tab="smart">
                    🤖 Trajnim i Mençur
                </button>
            </div>

            <!-- Folder Method -->
            <div id="bulk-folders-tab" class="bulk-tab-content active">
                <div class="bulk-method-card">
                    <h3>📁 Metoda Folder (Më e lehtë)</h3>
                    <div class="bulk-instructions">
                        <h4>Si të organizoni fotot:</h4>
                        <div class="folder-structure">
                            <pre>
📁 Produktet-e-mia/
  ├── 📁 Kroasan-me-Vaj/
  │   ├── 📸 foto1.jpg
  │   ├── 📸 foto2.jpg
  │   └── 📸 ...15-20 foto
  ├── 📁 Buke-Integrale/
  │   ├── 📸 foto1.jpg
  │   └── 📸 ...15-20 foto  
  └── 📁 Biskota-Çokollatë/
      └── 📸 ...15-20 foto
                            </pre>
                        </div>
                        <div class="bulk-tips">
                            <h4>💡 Këshilla:</h4>
                            <ul>
                                <li>Emri i folder = Emri i produktit</li>
                                <li>15-20 foto për folder (minimum 5)</li>
                                <li>Foto të qarta me dritë të mirë</li>
                                <li>Këndvështrime të ndryshme</li>
                            </ul>
                        </div>
                    </div>

                    <div class="bulk-upload-area">
                        <div class="folder-upload" id="folder-upload-area">
                            <div class="upload-text">
                                <h3>📁 Zgjidh Folder me Produktet</h3>
                                <p>Kliko këtu ose zvarrit folder-in kryesor</p>
                                <p class="upload-hint">Sistemi do të lexojë automatikisht të gjitha nën-folder-at</p>
                            </div>
                            <input type="file" id="folder-input" webkitdirectory multiple style="display:none;">
                        </div>
                    </div>

                    <div id="bulk-products-preview" class="bulk-products-preview" style="display:none;">
                        <h4>🔍 Produktet e Gjetura:</h4>
                        <div id="bulk-products-list" class="bulk-products-list"></div>
                        
                        <div class="bulk-actions">
                            <button id="start-bulk-training" class="btn btn-primary btn-large">
                                🚀 Fillo Trajnimin Masiv
                            </button>
                            <button id="cancel-bulk-training" class="btn btn-secondary">
                                ❌ Anulo
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CSV Method -->
            <div id="bulk-csv-tab" class="bulk-tab-content">
                <div class="bulk-method-card">
                    <h3>📊 Metoda CSV + Foto</h3>
                    <div class="csv-instructions">
                        <h4>Hapi 1: Krijo skedarin CSV</h4>
                        <div class="csv-example">
                            <pre>
Emri,Çmimi,Kategoria,Përshkrimi,Folder_Fotot
Kroasan me Vaj,2.50,pastry,Brumë e përgatitur me vaj,kroasan-vaj
Bukë Integrale,3.50,bread,Bukë e plotë me farëra,buke-integrale
Biskota Çokollatë,1.75,cookie,Biskota me çokollatë,biskota-çokollatë
                            </pre>
                        </div>
                        
                        <h4>Hapi 2: Organizo fotot</h4>
                        <p>Krijo folder për çdo produkt sipas emrit në CSV</p>
                    </div>

                    <div class="csv-upload">
                        <div class="csv-file">
                            <label>📄 Skedari CSV:</label>
                            <input type="file" id="csv-file-input" accept=".csv" />
                        </div>
                        <div class="csv-photos">
                            <label>📸 Folder me Foto:</label>
                            <input type="file" id="csv-photos-input" webkitdirectory multiple />
                        </div>
                    </div>

                    <button id="process-csv-bulk" class="btn btn-primary">
                        📊 Processo CSV + Fotot
                    </button>
                </div>
            </div>

            <!-- Smart Training -->
            <div id="bulk-smart-tab" class="bulk-tab-content">
                <div class="bulk-method-card">
                    <h3>🤖 Trajnim i Mençur (Eksperimental)</h3>
                    <div class="smart-description">
                        <p>AI do të përpiqet të identifikojë produktet automatikisht nga fotot dhe të krijojë kategoritë.</p>
                        <div class="smart-warning">
                            ⚠️ Kjo metodë është eksperimentale dhe mund të mos jetë 100% e saktë.
                        </div>
                    </div>

                    <div class="smart-upload">
                        <div class="smart-upload-area" id="smart-upload-area">
                            <h3>📸 Ngarko të gjitha fotot</h3>
                            <p>Zgjidh të gjitha fotot e produkteve pa organizim</p>
                            <input type="file" id="smart-photos-input" multiple accept="image/*" />
                        </div>
                    </div>

                    <button id="start-smart-training" class="btn btn-primary">
                        🤖 Fillo Trajnimin e Mençur
                    </button>
                </div>
            </div>

            <!-- Progress Section -->
            <div id="bulk-training-progress" class="bulk-training-progress" style="display:none;">
                <h3>🚀 Trajnimi Masiv në Progres</h3>
                <div class="overall-progress">
                    <div class="progress-info">
                        <span>Produkti aktual: <span id="current-product-name">-</span></span>
                        <span>Progres: <span id="current-product-index">0</span> nga <span id="total-products-count">0</span></span>
                    </div>
                    <div class="progress-bar">
                        <div id="overall-progress-fill" class="progress-fill"></div>
                    </div>
                    <div class="progress-percentage">
                        <span id="overall-progress-percentage">0%</span>
                    </div>
                </div>

                <div class="current-training-progress">
                    <h4>Produkti aktual: <span id="training-product-name">-</span></h4>
                    <div class="training-metrics">
                        <div class="metric">
                            <label>Fotot:</label>
                            <span id="training-photos-count">0</span>
                        </div>
                        <div class="metric">
                            <label>Saktësia:</label>
                            <span id="training-accuracy">-</span>
                        </div>
                        <div class="metric">
                            <label>Koha e mbetur:</label>
                            <span id="training-eta">-</span>
                        </div>
                    </div>
                    <div class="progress-bar">
                        <div id="current-training-fill" class="progress-fill"></div>
                    </div>
                </div>

                <div class="bulk-training-log">
                    <h4>📋 Logi i Trajnimit:</h4>
                    <div id="training-log" class="training-log"></div>
                </div>

                <button id="pause-bulk-training" class="btn btn-warning">
                    ⏸️ Pauzë
                </button>
                <button id="stop-bulk-training" class="btn btn-danger">
                    ⏹️ Ndalo
                </button>
            </div>

            <!-- Results Section -->
            <div id="bulk-training-results" class="bulk-training-results" style="display:none;">
                <h3>🎉 Trajnimi Masiv Përfundoi!</h3>
                <div class="training-summary">
                    <div class="summary-stats">
                        <div class="stat-card">
                            <h4>Produktet e Trajnuara</h4>
                            <span id="trained-products-count" class="stat-number">0</span>
                        </div>
                        <div class="stat-card">
                            <h4>Saktësia Mesatare</h4>
                            <span id="average-accuracy" class="stat-number">0%</span>
                        </div>
                        <div class="stat-card">
                            <h4>Kohëzgjatja Totale</h4>
                            <span id="total-training-time" class="stat-number">0 min</span>
                        </div>
                    </div>
                </div>

                <div id="training-results-list" class="training-results-list"></div>

                <div class="results-actions">
                    <button id="test-trained-products" class="btn btn-success">
                        🧪 Testo Produktet e Trajnuara
                    </button>
                    <button id="export-training-report" class="btn btn-secondary">
                        📄 Eksporto Raportin
                    </button>
                    <button id="start-new-bulk-training" class="btn btn-primary">
                        🔄 Trajnim i Ri
                    </button>
                </div>
            </div>
        `;

        // Insert before existing training section
        trainingTab.insertBefore(bulkSection, trainingTab.firstChild);
    }

    setupBulkEventListeners() {
        // Tab switching
        document.querySelectorAll('.bulk-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchBulkTab(e.target.dataset.bulkTab);
            });
        });

        // Folder method
        document.getElementById('folder-upload-area')?.addEventListener('click', () => {
            document.getElementById('folder-input').click();
        });

        document.getElementById('folder-input')?.addEventListener('change', (e) => {
            this.handleFolderUpload(e.target.files);
        });

        // CSV method
        document.getElementById('process-csv-bulk')?.addEventListener('click', () => {
            this.processCsvBulk();
        });

        // Smart method
        document.getElementById('start-smart-training')?.addEventListener('click', () => {
            this.startSmartTraining();
        });

        // Training controls
        document.getElementById('start-bulk-training')?.addEventListener('click', () => {
            this.startBulkTraining();
        });

        document.getElementById('pause-bulk-training')?.addEventListener('click', () => {
            this.pauseBulkTraining();
        });

        document.getElementById('stop-bulk-training')?.addEventListener('click', () => {
            this.stopBulkTraining();
        });
    }

    switchBulkTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.bulk-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-bulk-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.bulk-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`bulk-${tabName}-tab`).classList.add('active');
    }

    // Handle folder upload (main method)
    handleFolderUpload(files) {
        const products = new Map();
        
        // Group files by folder (product name)
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return;
            
            const pathParts = file.webkitRelativePath.split('/');
            if (pathParts.length < 2) return;
            
            const productFolder = pathParts[pathParts.length - 2]; // Parent folder name
            const productName = this.cleanProductName(productFolder);
            
            if (!products.has(productName)) {
                products.set(productName, {
                    name: productName,
                    photos: [],
                    price: 0, // Will be set by user
                    category: 'other',
                    description: ''
                });
            }
            
            products.get(productName).photos.push(file);
        });

        this.bulkProducts = Array.from(products.values());
        this.displayBulkProductsPreview();
    }

    cleanProductName(folderName) {
        // Convert folder names to clean product names
        return folderName
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .trim();
    }

    displayBulkProductsPreview() {
        const previewDiv = document.getElementById('bulk-products-preview');
        const listDiv = document.getElementById('bulk-products-list');
        
        if (!previewDiv || !listDiv) return;

        let html = '';
        this.bulkProducts.forEach((product, index) => {
            html += `
                <div class="bulk-product-item">
                    <div class="product-photos">
                        <div class="photo-count">${product.photos.length} foto</div>
                        <div class="photo-thumbnails">
                            ${product.photos.slice(0, 3).map(photo => 
                                `<img src="${URL.createObjectURL(photo)}" alt="Photo" />`
                            ).join('')}
                            ${product.photos.length > 3 ? `<div class="more-photos">+${product.photos.length - 3}</div>` : ''}
                        </div>
                    </div>
                    <div class="product-details">
                        <input type="text" 
                               value="${product.name}" 
                               placeholder="Emri i produktit"
                               onchange="window.bulkTrainer.updateProductName(${index}, this.value)" />
                        <input type="number" 
                               step="0.01" 
                               placeholder="Çmimi (€)"
                               onchange="window.bulkTrainer.updateProductPrice(${index}, this.value)" />
                        <select onchange="window.bulkTrainer.updateProductCategory(${index}, this.value)">
                            <option value="other">Tjetër</option>
                            <option value="bread">Bukë</option>
                            <option value="pastry">Brumëra</option>
                            <option value="cake">Torta</option>
                            <option value="cookie">Biskota</option>
                        </select>
                        <input type="text" 
                               placeholder="Përshkrimi (opsional)"
                               onchange="window.bulkTrainer.updateProductDescription(${index}, this.value)" />
                    </div>
                    <div class="product-status">
                        <span class="photo-status ${product.photos.length >= 10 ? 'good' : product.photos.length >= 5 ? 'ok' : 'poor'}">
                            ${product.photos.length >= 10 ? '✅' : product.photos.length >= 5 ? '⚠️' : '❌'} 
                            ${product.photos.length} foto
                        </span>
                    </div>
                </div>
            `;
        });

        listDiv.innerHTML = html;
        previewDiv.style.display = 'block';
    }

    // Update product details
    updateProductName(index, value) {
        if (this.bulkProducts[index]) {
            this.bulkProducts[index].name = value;
        }
    }

    updateProductPrice(index, value) {
        if (this.bulkProducts[index]) {
            this.bulkProducts[index].price = parseFloat(value) || 0;
        }
    }

    updateProductCategory(index, value) {
        if (this.bulkProducts[index]) {
            this.bulkProducts[index].category = value;
        }
    }

    updateProductDescription(index, value) {
        if (this.bulkProducts[index]) {
            this.bulkProducts[index].description = value;
        }
    }

    // Start bulk training process
    async startBulkTraining() {
        if (this.isTraining) return;

        // Validate products
        const validProducts = this.bulkProducts.filter(product => 
            product.name.trim() && 
            product.price > 0 && 
            product.photos.length >= 5
        );

        if (validProducts.length === 0) {
            this.app.showToast('Asnjë produkt i vlefshëm për trajnim!', 'error');
            return;
        }

        this.isTraining = true;
        this.currentTrainingIndex = 0;
        
        // Show progress section
        document.getElementById('bulk-products-preview').style.display = 'none';
        document.getElementById('bulk-training-progress').style.display = 'block';
        
        // Update progress info
        document.getElementById('total-products-count').textContent = validProducts.length;
        
        const startTime = Date.now();
        const trainingResults = [];

        try {
            for (let i = 0; i < validProducts.length; i++) {
                if (!this.isTraining) break; // Check if stopped
                
                this.currentTrainingIndex = i;
                const product = validProducts[i];
                
                // Update progress
                this.updateTrainingProgress(i, validProducts.length, product);
                
                // Train this product
                const result = await this.trainSingleProduct(product);
                trainingResults.push(result);
                
                // Add to app products
                if (result.success) {
                    this.app.products.push({
                        id: Date.now() + i,
                        name: product.name,
                        price: product.price,
                        category: product.category,
                        description: product.description,
                        trainedAt: new Date().toISOString(),
                        photoCount: product.photos.length,
                        trainingAccuracy: result.accuracy || 0.85
                    });
                }
                
                this.logTrainingStep(`✅ ${product.name} trajnua me sukses (${product.photos.length} foto)`);
            }
            
            const endTime = Date.now();
            const totalTime = Math.round((endTime - startTime) / 1000 / 60); // minutes
            
            // Save data
            this.app.saveData();
            
            // Show results
            this.showBulkTrainingResults(trainingResults, totalTime);
            
        } catch (error) {
            this.app.showToast('Gabim në trajnimin masiv: ' + error.message, 'error');
            console.error('Bulk training error:', error);
        } finally {
            this.isTraining = false;
        }
    }

    async trainSingleProduct(product) {
        try {
            // Simulate training process (in real implementation, use actual AI training)
            const trainingTime = Math.random() * 3000 + 2000; // 2-5 seconds
            
            await new Promise(resolve => setTimeout(resolve, trainingTime));
            
            // Mock accuracy based on photo count
            const baseAccuracy = 0.75;
            const photoBonus = Math.min(product.photos.length * 0.01, 0.15);
            const accuracy = baseAccuracy + photoBonus + (Math.random() * 0.1);
            
            return {
                success: true,
                accuracy: Math.min(accuracy, 0.95),
                photoCount: product.photos.length,
                trainingTime: trainingTime
            };
            
        } catch (error) {
            this.logTrainingStep(`❌ Gabim në trajnimin e ${product.name}: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    updateTrainingProgress(currentIndex, total, currentProduct) {
        const overallProgress = (currentIndex / total) * 100;
        
        document.getElementById('current-product-name').textContent = currentProduct.name;
        document.getElementById('current-product-index').textContent = currentIndex + 1;
        document.getElementById('overall-progress-fill').style.width = `${overallProgress}%`;
        document.getElementById('overall-progress-percentage').textContent = `${Math.round(overallProgress)}%`;
        
        document.getElementById('training-product-name').textContent = currentProduct.name;
        document.getElementById('training-photos-count').textContent = currentProduct.photos.length;
        
        // Estimate remaining time
        const remainingProducts = total - currentIndex;
        const avgTimePerProduct = 3; // minutes
        const eta = remainingProducts * avgTimePerProduct;
        document.getElementById('training-eta').textContent = `${eta} min`;
    }

    logTrainingStep(message) {
        const logDiv = document.getElementById('training-log');
        if (!logDiv) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = `<span class="timestamp">${timestamp}</span> ${message}`;
        
        logDiv.appendChild(logEntry);
        logDiv.scrollTop = logDiv.scrollHeight;
    }

    showBulkTrainingResults(results, totalTime) {
        document.getElementById('bulk-training-progress').style.display = 'none';
        document.getElementById('bulk-training-results').style.display = 'block';
        
        const successfulTrainings = results.filter(r => r.success);
        const averageAccuracy = successfulTrainings.length > 0 
            ? successfulTrainings.reduce((sum, r) => sum + (r.accuracy || 0), 0) / successfulTrainings.length 
            : 0;
        
        document.getElementById('trained-products-count').textContent = successfulTrainings.length;
        document.getElementById('average-accuracy').textContent = `${Math.round(averageAccuracy * 100)}%`;
        document.getElementById('total-training-time').textContent = `${totalTime} min`;
        
        // Show detailed results
        const resultsList = document.getElementById('training-results-list');
        let html = '<h4>📊 Detajet e Trajnimit:</h4>';
        
        results.forEach((result, index) => {
            const product = this.bulkProducts[index];
            if (!product) return;
            
            html += `
                <div class="training-result-item ${result.success ? 'success' : 'error'}">
                    <span class="result-icon">${result.success ? '✅' : '❌'}</span>
                    <span class="product-name">${product.name}</span>
                    <span class="result-details">
                        ${result.success 
                            ? `${Math.round((result.accuracy || 0) * 100)}% saktësi, ${product.photos.length} foto`
                            : `Gabim: ${result.error}`
                        }
                    </span>
                </div>
            `;
        });
        
        resultsList.innerHTML = html;
        
        this.app.showToast(`🎉 Trajnimi përfundoi! ${successfulTrainings.length} produkte u trajnuan me sukses.`, 'success');
    }

    pauseBulkTraining() {
        this.isTraining = false;
        this.app.showToast('Trajnimi u pauzua', 'info');
    }

    stopBulkTraining() {
        this.isTraining = false;
        document.getElementById('bulk-training-progress').style.display = 'none';
        document.getElementById('bulk-products-preview').style.display = 'block';
        this.app.showToast('Trajnimi u ndalua', 'warning');
    }

    // CSV method implementation
    async processCsvBulk() {
        const csvFile = document.getElementById('csv-file-input').files[0];
        const photoFiles = document.getElementById('csv-photos-input').files;
        
        if (!csvFile || !photoFiles.length) {
            this.app.showToast('Zgjidhni skedarin CSV dhe folder me foto!', 'error');
            return;
        }
        
        try {
            const csvText = await csvFile.text();
            const csvData = this.parseCSV(csvText);
            
            // Match photos with products
            this.bulkProducts = this.matchPhotosWithCSV(csvData, photoFiles);
            this.displayBulkProductsPreview();
            
        } catch (error) {
            this.app.showToast('Gabim në leximin e CSV: ' + error.message, 'error');
        }
    }

    parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
        return lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const product = {};
            headers.forEach((header, index) => {
                product[header] = values[index] || '';
            });
            return product;
        });
    }

    matchPhotosWithCSV(csvData, photoFiles) {
        const products = [];
        
        csvData.forEach(row => {
            const folderName = row.Folder_Fotot || row.folder || '';
            const photos = Array.from(photoFiles).filter(file => 
                file.webkitRelativePath.toLowerCase().includes(folderName.toLowerCase())
            );
            
            if (photos.length > 0) {
                products.push({
                    name: row.Emri || row.name || '',
                    price: parseFloat(row.Çmimi || row.price) || 0,
                    category: row.Kategoria || row.category || 'other',
                    description: row.Përshkrimi || row.description || '',
                    photos: photos
                });
            }
        });
        
        return products;
    }

    // Smart training (experimental)
    async startSmartTraining() {
        const photoFiles = document.getElementById('smart-photos-input').files;
        
        if (!photoFiles.length) {
            this.app.showToast('Zgjidhni fotot për trajnim të mençur!', 'error');
            return;
        }
        
        this.app.showToast('Trajnimi i mençur është eksperimental. Do të grupojë fotot rastësisht.', 'warning');
        
        // For demo, randomly group photos into products
        this.bulkProducts = this.createSmartGroups(Array.from(photoFiles));
        this.displayBulkProductsPreview();
    }

    createSmartGroups(photos) {
        const groupCount = Math.max(1, Math.floor(photos.length / 15)); // ~15 photos per product
        const groups = [];
        
        for (let i = 0; i < groupCount; i++) {
            const startIndex = i * Math.floor(photos.length / groupCount);
            const endIndex = (i + 1) * Math.floor(photos.length / groupCount);
            const groupPhotos = photos.slice(startIndex, endIndex);
            
            groups.push({
                name: `Produkti ${i + 1}`,
                price: 0,
                category: 'other',
                description: '',
                photos: groupPhotos
            });
        }
        
        return groups;
    }
}

// Initialize bulk trainer when app loads
document.addEventListener('DOMContentLoaded', () => {
    if (window.app) {
        window.bulkTrainer = new BulkProductTrainer(window.app);
        window.bulkTrainer.initializeBulkTraining();
    }
});

console.log('Bulk Product Training system loaded!');