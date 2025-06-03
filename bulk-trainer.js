// Bulk Trainer for handling mass product training
class BulkTrainer {
    constructor() {
        this.productsToTrain = [];
        this.currentTrainingIndex = 0;
        this.isTraining = false;
        this.trainingStats = {
            total: 0,
            completed: 0,
            failed: 0,
            startTime: null,
            endTime: null
        };
    }
    
    // Handle folder upload for bulk training
    async handleFolderUpload(files) {
        console.log('Processing folder upload...');
        
        // Group files by folder
        const folderMap = new Map();
        
        Array.from(files).forEach(file => {
            // Skip non-image files
            if (!file.type.startsWith('image/')) return;
            
            // Get folder path
            const pathParts = file.webkitRelativePath.split('/');
            if (pathParts.length < 2) return;
            
            const folderName = pathParts[pathParts.length - 2];
            
            if (!folderMap.has(folderName)) {
                folderMap.set(folderName, []);
            }
            
            folderMap.get(folderName).push(file);
        });
        
        // Convert to products array
        this.productsToTrain = [];
        
        for (const [folderName, imageFiles] of folderMap) {
            if (imageFiles.length > 0) {
                this.productsToTrain.push({
                    name: this.formatProductName(folderName),
                    category: this.guessCategory(folderName),
                    price: 0, // User needs to set this
                    images: imageFiles,
                    status: 'pending'
                });
            }
        }
        
        this.displayBulkPreview();
    }
    
    // Handle CSV upload for bulk training
    async handleCSVUpload(file) {
        try {
            const text = await file.text();
            const lines = text.split('\n').filter(line => line.trim());
            
            if (lines.length < 2) {
                window.app.showToast('CSV file është bosh ose i pavlefshëm', 'error');
                return;
            }
            
            // Parse CSV header
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('emri'));
            const priceIndex = headers.findIndex(h => h.includes('price') || h.includes('çmimi'));
            const categoryIndex = headers.findIndex(h => h.includes('category') || h.includes('kategori'));
            const photosIndex = headers.findIndex(h => h.includes('photo') || h.includes('foto'));
            
            if (nameIndex === -1) {
                window.app.showToast('CSV duhet të ketë kolonën "name" ose "emri"', 'error');
                return;
            }
            
            // Parse products
            this.productsToTrain = [];
            
            for (let i = 1; i < lines.length; i++) {
                const values = this.parseCSVLine(lines[i]);
                if (values.length <= nameIndex) continue;
                
                const product = {
                    name: values[nameIndex],
                    price: priceIndex !== -1 && values[priceIndex] ? parseInt(values[priceIndex]) : 0,
                    category: categoryIndex !== -1 && values[categoryIndex] ? values[categoryIndex] : 'të tjera',
                    images: [],
                    status: 'pending'
                };
                
                // Handle photo paths if provided
                if (photosIndex !== -1 && values[photosIndex]) {
                    const photoPaths = values[photosIndex].split(';');
                    // Note: In real implementation, would need to handle photo file references
                    product.photoCount = photoPaths.length;
                }
                
                this.productsToTrain.push(product);
            }
            
            this.displayBulkPreview();
            window.app.showToast(`${this.productsToTrain.length} produkte u gjetën në CSV`, 'success');
            
        } catch (error) {
            console.error('CSV parse error:', error);
            window.app.showToast('Gabim në leximin e CSV file', 'error');
        }
    }
    
    // Parse CSV line handling quotes and commas
    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current.trim());
        return values;
    }
    
    // Display bulk training preview
    displayBulkPreview() {
        const preview = document.getElementById('bulkPreview');
        const productList = document.getElementById('bulkProductList');
        
        if (this.productsToTrain.length === 0) {
            preview.classList.add('hidden');
            return;
        }
        
        preview.classList.remove('hidden');
        
        productList.innerHTML = this.productsToTrain.map((product, index) => `
            <div class="bulk-product-item" data-index="${index}">
                <div>
                    <strong>${product.name}</strong>
                    <small>${product.images ? product.images.length : 0} foto</small>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="number" 
                           placeholder="Çmimi" 
                           value="${product.price || ''}"
                           onchange="window.app.bulkTrainer.updateProductPrice(${index}, this.value)"
                           style="width: 80px;">
                    <select onchange="window.app.bulkTrainer.updateProductCategory(${index}, this.value)">
                        <option value="byrek" ${product.category === 'byrek' ? 'selected' : ''}>Byrek</option>
                        <option value="bukë" ${product.category === 'bukë' ? 'selected' : ''}>Bukë</option>
                        <option value="ëmbëlsira" ${product.category === 'ëmbëlsira' ? 'selected' : ''}>Ëmbëlsira</option>
                        <option value="torta" ${product.category === 'torta' ? 'selected' : ''}>Torta</option>
                        <option value="kafe" ${product.category === 'kafe' ? 'selected' : ''}>Kafe</option>
                        <option value="të tjera" ${product.category === 'të tjera' ? 'selected' : ''}>Të tjera</option>
                    </select>
                    <button class="btn btn-danger" onclick="window.app.bulkTrainer.removeProduct(${index})" style="padding: 4px 8px;">
                        <span class="material-icons" style="font-size: 16px;">delete</span>
                    </button>
                </div>
            </div>
        `).join('');
        
        document.getElementById('bulkProgressText').textContent = `0/${this.productsToTrain.length}`;
    }
    
    // Update product price
    updateProductPrice(index, price) {
        if (this.productsToTrain[index]) {
            this.productsToTrain[index].price = parseInt(price) || 0;
        }
    }
    
    // Update product category
    updateProductCategory(index, category) {
        if (this.productsToTrain[index]) {
            this.productsToTrain[index].category = category;
        }
    }
    
    // Remove product from bulk list
    removeProduct(index) {
        this.productsToTrain.splice(index, 1);
        this.displayBulkPreview();
    }
    
    // Start bulk training process
    async startTraining() {
        if (this.isTraining || this.productsToTrain.length === 0) return;
        
        // Validate all products have prices
        const invalidProducts = this.productsToTrain.filter(p => !p.price || p.price <= 0);
        if (invalidProducts.length > 0) {
            window.app.showToast(`Ju lutem vendosni çmimet për të gjitha produktet`, 'error');
            return;
        }
        
        this.isTraining = true;
        this.currentTrainingIndex = 0;
        this.trainingStats = {
            total: this.productsToTrain.length,
            completed: 0,
            failed: 0,
            startTime: new Date(),
            endTime: null
        };
        
        // Disable start button
        document.getElementById('startBulkTraining').disabled = true;
        
        // Start training loop
        await this.trainNextProduct();
    }
    
    // Train next product in queue
    async trainNextProduct() {
        if (this.currentTrainingIndex >= this.productsToTrain.length) {
            this.completeTraining();
            return;
        }
        
        const product = this.productsToTrain[this.currentTrainingIndex];
        
        // Update UI
        this.updateProgress();
        document.getElementById('currentProduct').innerHTML = `
            <p>Duke trajnuar: <strong>${product.name}</strong></p>
            <div class="progress-bar" style="margin-top: 10px;">
                <div id="currentProductProgress" class="progress-fill" style="width: 0%;"></div>
            </div>
        `;
        
        try {
            // Create product in app
            const newProduct = {
                id: Date.now().toString(),
                name: product.name,
                price: product.price,
                category: product.category,
                trainedDate: new Date(),
                photoCount: product.images.length,
                soldCount: 0
            };
            
            // Add to app products
            window.app.products.push(newProduct);
            
            // Process images and train ML model
            if (window.app.mlEngine && product.images.length > 0) {
                const imageUrls = await this.loadImagesAsDataUrls(product.images);
                
                // Simulate training progress
                let progress = 0;
                const progressInterval = setInterval(() => {
                    progress += 20;
                    document.getElementById('currentProductProgress').style.width = progress + '%';
                    
                    if (progress >= 100) {
                        clearInterval(progressInterval);
                    }
                }, 200);
                
                // Train model
                await window.app.mlEngine.trainProduct(newProduct.id, imageUrls);
                
                clearInterval(progressInterval);
                document.getElementById('currentProductProgress').style.width = '100%';
            }
            
            product.status = 'completed';
            this.trainingStats.completed++;
            
        } catch (error) {
            console.error(`Failed to train ${product.name}:`, error);
            product.status = 'failed';
            this.trainingStats.failed++;
        }
        
        // Move to next product
        this.currentTrainingIndex++;
        
        // Continue with next product after short delay
        setTimeout(() => this.trainNextProduct(), 500);
    }
    
    // Load images as data URLs
    async loadImagesAsDataUrls(imageFiles) {
        const urls = [];
        
        for (const file of imageFiles) {
            try {
                const url = await this.fileToDataUrl(file);
                urls.push(url);
            } catch (error) {
                console.error('Failed to load image:', error);
            }
        }
        
        return urls;
    }
    
    // Convert file to data URL
    fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    // Update training progress
    updateProgress() {
        const progress = (this.currentTrainingIndex / this.productsToTrain.length) * 100;
        document.getElementById('bulkProgressFill').style.width = progress + '%';
        document.getElementById('bulkProgressText').textContent = 
            `${this.currentTrainingIndex}/${this.productsToTrain.length}`;
    }
    
    // Complete training process
    completeTraining() {
        this.isTraining = false;
        this.trainingStats.endTime = new Date();
        
        // Save products
        window.app.saveProducts();
        
        // Calculate duration
        const duration = Math.round((this.trainingStats.endTime - this.trainingStats.startTime) / 1000);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        
        // Show completion message
        const message = `Trajnimi përfundoi!
            ${this.trainingStats.completed} produkte u trajnuan me sukses
            ${this.trainingStats.failed > 0 ? `${this.trainingStats.failed} dështuan` : ''}
            Koha: ${minutes}m ${seconds}s`;
        
        window.app.showToast(message, 'success');
        
        // Reset UI
        document.getElementById('startBulkTraining').disabled = false;
        document.getElementById('currentProduct').innerHTML = '';
        document.getElementById('bulkPreview').classList.add('hidden');
        
        // Clear products list
        this.productsToTrain = [];
        
        // Update product list if on products tab
        if (window.app.currentTab === 'products') {
            window.app.displayProducts();
        }
    }
    
    // Smart grouping of similar images
    async autoGroupImages(imageFiles) {
        // This would use ML to group similar images
        // For now, using simple name-based grouping
        const groups = new Map();
        
        imageFiles.forEach(file => {
            const baseName = file.name.replace(/\d+\.(jpg|jpeg|png)$/i, '');
            
            if (!groups.has(baseName)) {
                groups.set(baseName, []);
            }
            
            groups.get(baseName).push(file);
        });
        
        return groups;
    }
    
    // Format product name from folder/file name
    formatProductName(name) {
        return name
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase())
            .trim();
    }
    
    // Guess category from product name
    guessCategory(name) {
        const lowerName = name.toLowerCase();
        
        if (lowerName.includes('byrek') || lowerName.includes('pite')) {
            return 'byrek';
        } else if (lowerName.includes('bukë') || lowerName.includes('bread')) {
            return 'bukë';
        } else if (lowerName.includes('tortë') || lowerName.includes('cake')) {
            return 'torta';
        } else if (lowerName.includes('ëmbëlsirë') || lowerName.includes('sweet')) {
            return 'ëmbëlsira';
        } else if (lowerName.includes('kafe') || lowerName.includes('coffee')) {
            return 'kafe';
        }
        
        return 'të tjera';
    }
    
    // Generate training report
    generateTrainingReport() {
        const report = {
            date: new Date(),
            stats: this.trainingStats,
            products: this.productsToTrain.map(p => ({
                name: p.name,
                category: p.category,
                price: p.price,
                imageCount: p.images ? p.images.length : 0,
                status: p.status
            }))
        };
        
        return report;
    }
    
    // Export training data
    exportTrainingData() {
        const report = this.generateTrainingReport();
        const data = JSON.stringify(report, null, 2);
        
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trajnim_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Export for use in main app
window.BulkTrainer = BulkTrainer;