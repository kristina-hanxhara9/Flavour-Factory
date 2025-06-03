// Machine Learning Engine using TensorFlow.js
class MLEngine {
    constructor() {
        this.model = null;
        this.mobileNet = null;
        this.trainedModels = new Map();
        this.isInitialized = false;
        this.modelVersion = '1.0.0';
        this.inputSize = 224;
    }
    
    async initialize() {
        try {
            console.log('Initializing ML Engine...');
            
            // Load MobileNet as feature extractor
            this.mobileNet = await mobilenet.load({
                version: 2,
                alpha: 1.0
            });
            
            // Try to load existing models from IndexedDB
            await this.loadModelsFromStorage();
            
            this.isInitialized = true;
            console.log('ML Engine initialized successfully');
            
            return true;
        } catch (error) {
            console.error('Failed to initialize ML Engine:', error);
            return false;
        }
    }
    
    // Create a custom model on top of MobileNet
    createModel(numClasses) {
        // Create a sequential model
        const model = tf.sequential({
            layers: [
                // Input layer - flattened MobileNet features
                tf.layers.dense({
                    inputShape: [1024], // MobileNet v2 output size
                    units: 128,
                    activation: 'relu'
                }),
                // Dropout for regularization
                tf.layers.dropout({
                    rate: 0.2
                }),
                // Hidden layer
                tf.layers.dense({
                    units: 64,
                    activation: 'relu'
                }),
                // Output layer
                tf.layers.dense({
                    units: numClasses,
                    activation: 'softmax'
                })
            ]
        });
        
        // Compile the model
        model.compile({
            optimizer: tf.train.adam(0.0001),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });
        
        return model;
    }
    
    // Preprocess image for model input
    async preprocessImage(imageElement) {
        return tf.tidy(() => {
            // Convert image to tensor
            const img = tf.browser.fromPixels(imageElement);
            
            // Resize to MobileNet input size
            const resized = tf.image.resizeBilinear(img, [this.inputSize, this.inputSize]);
            
            // Normalize pixel values to [-1, 1] range
            const normalized = resized.sub(127.5).div(127.5);
            
            // Add batch dimension
            return normalized.expandDims(0);
        });
    }
    
    // Extract features using MobileNet
    async extractFeatures(imageElement) {
        const processedImage = await this.preprocessImage(imageElement);
        
        // Get embeddings from MobileNet
        const embeddings = await this.mobileNet.infer(processedImage, 'global_average_pooling2d_1');
        
        // Clean up tensor
        processedImage.dispose();
        
        return embeddings;
    }
    
    // Train a new product
    async trainProduct(productId, imageUrls) {
        try {
            console.log(`Training product ${productId} with ${imageUrls.length} images...`);
            
            // Load and extract features from all images
            const features = [];
            const labels = [];
            
            for (let i = 0; i < imageUrls.length; i++) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = imageUrls[i];
                });
                
                const feature = await this.extractFeatures(img);
                features.push(feature);
                labels.push(productId);
                
                // Data augmentation - create variations
                const augmented = await this.augmentImage(img);
                for (const augImg of augmented) {
                    const augFeature = await this.extractFeatures(augImg);
                    features.push(augFeature);
                    labels.push(productId);
                }
            }
            
            // Store features for this product
            const productData = {
                id: productId,
                features: features,
                centroid: this.calculateCentroid(features),
                threshold: 0.75
            };
            
            this.trainedModels.set(productId, productData);
            
            // Save to IndexedDB
            await this.saveModelToStorage(productId, productData);
            
            // Clean up tensors
            features.forEach(f => f.dispose());
            
            console.log(`Product ${productId} trained successfully`);
            return true;
            
        } catch (error) {
            console.error(`Failed to train product ${productId}:`, error);
            return false;
        }
    }
    
    // Image augmentation for better training
    async augmentImage(imageElement) {
        const augmented = [];
        
        // Create canvas for transformations
        const canvas = document.createElement('canvas');
        canvas.width = this.inputSize;
        canvas.height = this.inputSize;
        const ctx = canvas.getContext('2d');
        
        // Original image
        ctx.drawImage(imageElement, 0, 0, this.inputSize, this.inputSize);
        
        // Slight rotations
        for (const angle of [-15, 15]) {
            ctx.save();
            ctx.translate(this.inputSize / 2, this.inputSize / 2);
            ctx.rotate(angle * Math.PI / 180);
            ctx.drawImage(imageElement, -this.inputSize / 2, -this.inputSize / 2, this.inputSize, this.inputSize);
            ctx.restore();
            
            const img = new Image();
            img.src = canvas.toDataURL();
            await new Promise(resolve => img.onload = resolve);
            augmented.push(img);
        }
        
        // Brightness variations
        for (const brightness of [0.8, 1.2]) {
            ctx.filter = `brightness(${brightness})`;
            ctx.drawImage(imageElement, 0, 0, this.inputSize, this.inputSize);
            
            const img = new Image();
            img.src = canvas.toDataURL();
            await new Promise(resolve => img.onload = resolve);
            augmented.push(img);
        }
        
        // Horizontal flip
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(imageElement, -this.inputSize, 0, this.inputSize, this.inputSize);
        ctx.restore();
        
        const flippedImg = new Image();
        flippedImg.src = canvas.toDataURL();
        await new Promise(resolve => flippedImg.onload = resolve);
        augmented.push(flippedImg);
        
        return augmented;
    }
    
    // Calculate centroid of feature vectors
    calculateCentroid(features) {
        return tf.tidy(() => {
            const stacked = tf.stack(features.map(f => f.squeeze()));
            const mean = tf.mean(stacked, 0);
            stacked.dispose();
            return mean;
        });
    }
    
    // Recognize a product from camera frame
    async recognizeProduct(imageElement) {
        if (!this.isInitialized || this.trainedModels.size === 0) {
            return null;
        }
        
        try {
            // Extract features from the image
            const features = await this.extractFeatures(imageElement);
            
            let bestMatch = null;
            let bestSimilarity = 0;
            
            // Compare with all trained products
            for (const [productId, productData] of this.trainedModels) {
                const similarity = await this.calculateSimilarity(features, productData.centroid);
                
                if (similarity > bestSimilarity && similarity >= productData.threshold) {
                    bestSimilarity = similarity;
                    bestMatch = productId;
                }
            }
            
            // Clean up
            features.dispose();
            
            if (bestMatch) {
                return {
                    productId: bestMatch,
                    confidence: bestSimilarity
                };
            }
            
            return null;
            
        } catch (error) {
            console.error('Recognition error:', error);
            return null;
        }
    }
    
    // Calculate cosine similarity between feature vectors
    async calculateSimilarity(features1, features2) {
        return tf.tidy(() => {
            const f1 = features1.squeeze();
            const f2 = features2.squeeze();
            
            // Cosine similarity
            const dotProduct = tf.sum(tf.mul(f1, f2));
            const norm1 = tf.sqrt(tf.sum(tf.square(f1)));
            const norm2 = tf.sqrt(tf.sum(tf.square(f2)));
            const similarity = dotProduct.div(norm1.mul(norm2));
            
            return similarity.dataSync()[0];
        });
    }
    
    // Remove a product from the model
    async removeProduct(productId) {
        if (this.trainedModels.has(productId)) {
            const productData = this.trainedModels.get(productId);
            
            // Dispose tensors
            if (productData.centroid) {
                productData.centroid.dispose();
            }
            
            this.trainedModels.delete(productId);
            
            // Remove from storage
            await this.removeModelFromStorage(productId);
        }
    }
    
    // Storage functions using IndexedDB
    async openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('BakeryMLModels', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('models')) {
                    db.createObjectStore('models', { keyPath: 'id' });
                }
            };
        });
    }
    
    async saveModelToStorage(productId, productData) {
        try {
            const db = await this.openDatabase();
            const transaction = db.transaction(['models'], 'readwrite');
            const store = transaction.objectStore('models');
            
            // Convert tensors to arrays for storage
            const dataToStore = {
                id: productId,
                centroid: await productData.centroid.array(),
                threshold: productData.threshold,
                version: this.modelVersion
            };
            
            await store.put(dataToStore);
            
            console.log(`Model for product ${productId} saved to storage`);
        } catch (error) {
            console.error('Failed to save model:', error);
        }
    }
    
    async loadModelsFromStorage() {
        try {
            const db = await this.openDatabase();
            const transaction = db.transaction(['models'], 'readonly');
            const store = transaction.objectStore('models');
            
            const request = store.getAll();
            
            return new Promise((resolve) => {
                request.onsuccess = () => {
                    const models = request.result;
                    
                    models.forEach(model => {
                        if (model.version === this.modelVersion) {
                            const productData = {
                                id: model.id,
                                features: [], // Features are not stored, only centroid
                                centroid: tf.tensor(model.centroid),
                                threshold: model.threshold
                            };
                            
                            this.trainedModels.set(model.id, productData);
                        }
                    });
                    
                    console.log(`Loaded ${this.trainedModels.size} models from storage`);
                    resolve();
                };
            });
        } catch (error) {
            console.error('Failed to load models:', error);
        }
    }
    
    async removeModelFromStorage(productId) {
        try {
            const db = await this.openDatabase();
            const transaction = db.transaction(['models'], 'readwrite');
            const store = transaction.objectStore('models');
            
            await store.delete(productId);
            
            console.log(`Model for product ${productId} removed from storage`);
        } catch (error) {
            console.error('Failed to remove model:', error);
        }
    }
    
    // Get statistics about trained models
    getModelStats() {
        return {
            totalModels: this.trainedModels.size,
            modelVersion: this.modelVersion,
            isInitialized: this.isInitialized
        };
    }
    
    // Clear all models
    async clearAllModels() {
        // Dispose all tensors
        for (const [productId, productData] of this.trainedModels) {
            if (productData.centroid) {
                productData.centroid.dispose();
            }
        }
        
        this.trainedModels.clear();
        
        // Clear IndexedDB
        try {
            const db = await this.openDatabase();
            const transaction = db.transaction(['models'], 'readwrite');
            const store = transaction.objectStore('models');
            await store.clear();
        } catch (error) {
            console.error('Failed to clear storage:', error);
        }
    }
}

// Export for use in main app
window.MLEngine = MLEngine;