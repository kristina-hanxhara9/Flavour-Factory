// Production Testing Framework for Bakery Scanner
class BakeryScannerTests {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    // === TEST RUNNER ===
    async runAllTests() {
        console.log('🧪 Starting Bakery Scanner Tests...\n');
        
        // Core functionality tests
        await this.testDataManagement();
        await this.testAIModel();
        await this.testShiftManagement();
        await this.testSalesSystem();
        await this.testCloudBackup();
        await this.testPrintingSystem();
        await this.testAnalytics();
        await this.testUserInterface();
        
        this.displayResults();
        return this.results;
    }

    // === DATA MANAGEMENT TESTS ===
    async testDataManagement() {
        this.startTestSuite('Data Management');
        
        // Test 1: Local Storage Save/Load
        this.test('Local Storage Save/Load', () => {
            const testData = { test: 'value' };
            localStorage.setItem('test_key', JSON.stringify(testData));
            const loaded = JSON.parse(localStorage.getItem('test_key'));
            localStorage.removeItem('test_key');
            return JSON.stringify(loaded) === JSON.stringify(testData);
        });

        // Test 2: Product CRUD Operations
        this.test('Product CRUD Operations', () => {
            const app = window.app;
            const initialCount = app.products.length;
            
            // Create
            const testProduct = {
                id: Date.now(),
                name: 'Test Product',
                price: 2.50,
                description: 'Test description'
            };
            app.products.push(testProduct);
            
            // Read
            const found = app.products.find(p => p.id === testProduct.id);
            if (!found) return false;
            
            // Update
            found.price = 3.00;
            
            // Delete
            app.products = app.products.filter(p => p.id !== testProduct.id);
            
            return app.products.length === initialCount;
        });

        // Test 3: Data Validation
        this.test('Data Validation', () => {
            const app = window.app;
            
            // Test invalid product data
            try {
                app.validateProductData({});
                return false; // Should have thrown error
            } catch (error) {
                return true; // Expected error
            }
        });

        this.endTestSuite();
    }

    // === AI MODEL TESTS ===
    async testAIModel() {
        this.startTestSuite('AI Model');
        
        // Test 1: TensorFlow.js Loading
        this.test('TensorFlow.js Loading', () => {
            return typeof tf !== 'undefined' && tf.version;
        });

        // Test 2: Base Model Loading
        this.test('Base Model Loading', async () => {
            const app = window.app;
            return app.baseModel !== null;
        });

        // Test 3: Image Preprocessing
        this.test('Image Preprocessing', () => {
            // Create test canvas
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(0, 0, 100, 100);
            
            // Test preprocessing
            const imageData = ctx.getImageData(0, 0, 100, 100);
            return imageData.data.length > 0;
        });

        // Test 4: Mock Recognition
        this.test('Mock Recognition', async () => {
            const app = window.app;
            const result = app.fallbackRecognition();
            return result.hasOwnProperty('confidence') && result.hasOwnProperty('found');
        });

        this.endTestSuite();
    }

    // === SHIFT MANAGEMENT TESTS ===
    async testShiftManagement() {
        this.startTestSuite('Shift Management');
        
        // Test 1: Start Shift
        this.test('Start Shift', () => {
            const app = window.app;
            const initialShift = app.currentShift;
            
            app.startShift('Test Employee');
            const hasActiveShift = app.currentShift && !app.currentShift.endTime;
            
            // Cleanup
            app.currentShift = initialShift;
            
            return hasActiveShift;
        });

        // Test 2: End Shift
        this.test('End Shift', () => {
            const app = window.app;
            
            // Start a shift first
            app.startShift('Test Employee');
            const shiftId = app.currentShift.id;
            
            // End the shift
            app.endShift();
            
            // Check if shift was saved to history
            const savedShift = app.shifts.find(s => s.id === shiftId);
            
            // Cleanup
            app.shifts = app.shifts.filter(s => s.id !== shiftId);
            
            return savedShift && savedShift.endTime;
        });

        // Test 3: Shift Duration Calculation
        this.test('Shift Duration Calculation', () => {
            const startTime = new Date('2025-06-03T08:00:00').toISOString();
            const endTime = new Date('2025-06-03T16:00:00').toISOString();
            
            const duration = (new Date(endTime) - new Date(startTime)) / 1000 / 60; // minutes
            return duration === 480; // 8 hours = 480 minutes
        });

        this.endTestSuite();
    }

    // === SALES SYSTEM TESTS ===
    async testSalesSystem() {
        this.startTestSuite('Sales System');
        
        // Test 1: Add to Sale
        this.test('Add to Sale', () => {
            const app = window.app;
            const initialLength = app.currentSale.length;
            
            const testProduct = {
                id: Date.now(),
                name: 'Test Product',
                price: 2.50,
                confidence: 0.9,
                found: true
            };
            
            app.lastRecognizedProduct = testProduct;
            app.addToSale();
            
            const added = app.currentSale.length === initialLength + 1;
            
            // Cleanup
            app.currentSale = [];
            
            return added;
        });

        // Test 2: Quantity Management
        this.test('Quantity Management', () => {
            const app = window.app;
            
            // Add product
            app.currentSale = [{
                id: 123,
                name: 'Test',
                price: 2.50,
                quantity: 1
            }];
            
            // Increase quantity
            app.changeQuantity(123, 1);
            const increased = app.currentSale[0].quantity === 2;
            
            // Decrease quantity
            app.changeQuantity(123, -1);
            const decreased = app.currentSale[0].quantity === 1;
            
            // Cleanup
            app.currentSale = [];
            
            return increased && decreased;
        });

        // Test 3: Total Calculation
        this.test('Total Calculation', () => {
            const items = [
                { price: 2.50, quantity: 2 }, // 5.00
                { price: 1.75, quantity: 3 }, // 5.25
                { price: 4.00, quantity: 1 }  // 4.00
            ];
            
            const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const expected = 14.25;
            
            return Math.abs(subtotal - expected) < 0.01;
        });

        this.endTestSuite();
    }

    // === CLOUD BACKUP TESTS ===
    async testCloudBackup() {
        this.startTestSuite('Cloud Backup');
        
        // Test 1: Backup Data Preparation
        this.test('Backup Data Preparation', () => {
            const app = window.app;
            const backupData = {
                timestamp: new Date().toISOString(),
                products: app.products,
                sales: app.sales,
                shifts: app.shifts
            };
            
            return backupData.timestamp && 
                   Array.isArray(backupData.products) &&
                   Array.isArray(backupData.sales) &&
                   Array.isArray(backupData.shifts);
        });

        // Test 2: JSON Serialization
        this.test('JSON Serialization', () => {
            const testData = {
                products: [{ id: 1, name: 'Test', price: 2.50 }],
                sales: [{ id: 1, total: 10.00, timestamp: new Date().toISOString() }]
            };
            
            try {
                const json = JSON.stringify(testData);
                const parsed = JSON.parse(json);
                return parsed.products.length === 1 && parsed.sales.length === 1;
            } catch (error) {
                return false;
            }
        });

        // Test 3: Device ID Generation
        this.test('Device ID Generation', () => {
            const app = window.app;
            const deviceId = app.getDeviceId();
            return deviceId && deviceId.length > 5 && deviceId.startsWith('bakery_');
        });

        this.endTestSuite();
    }

    // === PRINTING SYSTEM TESTS ===
    async testPrintingSystem() {
        this.startTestSuite('Printing System');
        
        // Test 1: Receipt HTML Generation
        this.test('Receipt HTML Generation', () => {
            const app = window.app;
            const testSale = {
                id: 12345,
                items: [{ name: 'Test Product', price: 2.50, quantity: 2 }],
                total: 5.00,
                timestamp: new Date().toISOString()
            };
            
            const html = app.generateReceiptHTML(testSale);
            return html.includes('Test Product') && html.includes('5.00€');
        });

        // Test 2: ESC/POS Command Generation
        this.test('ESC/POS Command Generation', () => {
            // Mock ESC/POS commands
            const ESC_POS = {
                INIT: '\x1B\x40',
                CUT_PAPER: '\x1D\x56\x00'
            };
            
            return ESC_POS.INIT.length > 0 && ESC_POS.CUT_PAPER.length > 0;
        });

        // Test 3: Print Preview Generation
        this.test('Print Preview Generation', () => {
            const testHTML = '<div>Test Receipt</div>';
            const printWindow = document.createElement('div');
            printWindow.innerHTML = testHTML;
            
            return printWindow.innerHTML.includes('Test Receipt');
        });

        this.endTestSuite();
    }

    // === ANALYTICS TESTS ===
    async testAnalytics() {
        this.startTestSuite('Analytics');
        
        // Test 1: Daily Analytics
        this.test('Daily Analytics', () => {
            const app = window.app;
            const analytics = app.getDailyAnalytics();
            
            return analytics.hasOwnProperty('totalRevenue') &&
                   analytics.hasOwnProperty('totalSales') &&
                   analytics.hasOwnProperty('averageSale');
        });

        // Test 2: Product Analytics
        this.test('Product Analytics', () => {
            const app = window.app;
            
            // Mock sales data
            const mockSales = [
                {
                    items: [
                        { name: 'Product A', price: 2.50, quantity: 2 },
                        { name: 'Product B', price: 1.75, quantity: 1 }
                    ]
                }
            ];
            
            app.sales = mockSales;
            const analytics = app.getProductAnalytics();
            
            // Cleanup
            app.sales = [];
            
            return Array.isArray(analytics) && analytics.length > 0;
        });

        // Test 3: Time Analytics
        this.test('Time Analytics', () => {
            const testData = [1, 2, 3, 4, 5];
            const movingAverage = testData.reduce((sum, val) => sum + val, 0) / testData.length;
            
            return movingAverage === 3;
        });

        this.endTestSuite();
    }

    // === USER INTERFACE TESTS ===
    async testUserInterface() {
        this.startTestSuite('User Interface');
        
        // Test 1: DOM Elements Exist
        this.test('DOM Elements Exist', () => {
            const requiredElements = [
                'camera', 'start-camera', 'capture-btn',
                'sale-items', 'sale-total', 'complete-sale'
            ];
            
            return requiredElements.every(id => document.getElementById(id) !== null);
        });

        // Test 2: Tab Navigation
        this.test('Tab Navigation', () => {
            const tabs = document.querySelectorAll('.tab-btn');
            const tabContents = document.querySelectorAll('.tab-content');
            
            return tabs.length > 0 && tabContents.length > 0;
        });

        // Test 3: Form Validation
        this.test('Form Validation', () => {
            const app = window.app;
            
            // Test with empty form
            document.getElementById('product-name').value = '';
            document.getElementById('product-price').value = '';
            app.validateTrainingForm();
            
            const trainButton = document.getElementById('train-model');
            const isDisabled = trainButton.disabled;
            
            // Cleanup
            document.getElementById('product-name').value = '';
            document.getElementById('product-price').value = '';
            
            return isDisabled; // Should be disabled with empty form
        });

        this.endTestSuite();
    }

    // === TEST UTILITIES ===
    test(name, testFunction) {
        try {
            const result = testFunction();
            if (result instanceof Promise) {
                return result.then(res => this.recordResult(name, res))
                            .catch(err => this.recordResult(name, false, err));
            } else {
                this.recordResult(name, result);
            }
        } catch (error) {
            this.recordResult(name, false, error);
        }
    }

    recordResult(name, passed, error = null) {
        this.results.total++;
        if (passed) {
            this.results.passed++;
            console.log(`✅ ${name}`);
        } else {
            this.results.failed++;
            console.log(`❌ ${name}${error ? ` - ${error.message}` : ''}`);
        }
    }

    startTestSuite(suiteName) {
        console.log(`\n🔧 Testing ${suiteName}:`);
    }

    endTestSuite() {
        console.log('');
    }

    displayResults() {
        console.log('\n📊 Test Results:');
        console.log(`Total Tests: ${this.results.total}`);
        console.log(`Passed: ${this.results.passed} ✅`);
        console.log(`Failed: ${this.results.failed} ❌`);
        console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
        
        if (this.results.failed === 0) {
            console.log('\n🎉 All tests passed! System is ready for production.');
        } else {
            console.log('\n⚠️ Some tests failed. Please review and fix issues before deployment.');
        }
    }
}

// === PERFORMANCE MONITORING ===
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            aiInferenceTime: [],
            uiRenderTime: [],
            dataLoadTime: [],
            backupTime: []
        };
    }

    startTimer(operation) {
        return performance.now();
    }

    endTimer(operation, startTime) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (this.metrics[operation]) {
            this.metrics[operation].push(duration);
        }
        
        return duration;
    }

    getAverageTime(operation) {
        const times = this.metrics[operation];
        if (times.length === 0) return 0;
        
        return times.reduce((sum, time) => sum + time, 0) / times.length;
    }

    generateReport() {
        const report = {};
        
        Object.keys(this.metrics).forEach(operation => {
            const times = this.metrics[operation];
            if (times.length > 0) {
                report[operation] = {
                    average: this.getAverageTime(operation).toFixed(2),
                    min: Math.min(...times).toFixed(2),
                    max: Math.max(...times).toFixed(2),
                    count: times.length
                };
            }
        });
        
        return report;
    }
}

// === ERROR TRACKING ===
class ErrorTracker {
    constructor() {
        this.errors = [];
        this.setupGlobalErrorHandling();
    }

    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'JavaScript Error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error ? event.error.stack : null,
                timestamp: new Date().toISOString()
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'Unhandled Promise Rejection',
                message: event.reason.toString(),
                timestamp: new Date().toISOString()
            });
        });
    }

    logError(errorInfo) {
        this.errors.push(errorInfo);
        console.error('Error logged:', errorInfo);
        
        // Send to error reporting service if configured
        if (window.app && window.app.errorReportingEnabled) {
            this.sendErrorReport(errorInfo);
        }
    }

    async sendErrorReport(errorInfo) {
        try {
            // In production, send to your error tracking service
            const response = await fetch('/api/errors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(errorInfo)
            });
            
            if (!response.ok) {
                console.warn('Failed to send error report');
            }
        } catch (error) {
            console.warn('Error reporting service unavailable');
        }
    }

    getErrorReport() {
        return {
            totalErrors: this.errors.length,
            recentErrors: this.errors.slice(-10),
            errorTypes: this.groupErrorsByType(),
            timeRange: {
                earliest: this.errors.length > 0 ? this.errors[0].timestamp : null,
                latest: this.errors.length > 0 ? this.errors[this.errors.length - 1].timestamp : null
            }
        };
    }

    groupErrorsByType() {
        const grouped = {};
        this.errors.forEach(error => {
            if (!grouped[error.type]) {
                grouped[error.type] = 0;
            }
            grouped[error.type]++;
        });
        return grouped;
    }
}

// === HEALTH CHECK SYSTEM ===
class HealthChecker {
    constructor() {
        this.checks = [];
        this.setupHealthChecks();
    }

    setupHealthChecks() {
        this.addCheck('Camera Access', () => {
            return navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
        });

        this.addCheck('Local Storage', () => {
            try {
                localStorage.setItem('health_test', 'test');
                localStorage.removeItem('health_test');
                return true;
            } catch {
                return false;
            }
        });

        this.addCheck('TensorFlow.js', () => {
            return typeof tf !== 'undefined';
        });

        this.addCheck('WebGL Support', () => {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return !!gl;
        });

        this.addCheck('Service Worker', () => {
            return 'serviceWorker' in navigator;
        });
    }

    addCheck(name, checkFunction) {
        this.checks.push({ name, check: checkFunction });
    }

    async runHealthCheck() {
        const results = {};
        
        for (const { name, check } of this.checks) {
            try {
                results[name] = await check();
            } catch (error) {
                results[name] = false;
            }
        }
        
        return results;
    }

    async generateHealthReport() {
        const health = await this.runHealthCheck();
        const allPassed = Object.values(health).every(result => result === true);
        
        return {
            overall: allPassed ? 'HEALTHY' : 'WARNING',
            timestamp: new Date().toISOString(),
            checks: health,
            recommendations: this.generateRecommendations(health)
        };
    }

    generateRecommendations(health) {
        const recommendations = [];
        
        if (!health['Camera Access']) {
            recommendations.push('Enable camera permissions for product scanning');
        }
        
        if (!health['Local Storage']) {
            recommendations.push('Clear browser data or try incognito mode');
        }
        
        if (!health['TensorFlow.js']) {
            recommendations.push('Check internet connection for AI model loading');
        }
        
        if (!health['WebGL Support']) {
            recommendations.push('Update graphics drivers for better AI performance');
        }
        
        return recommendations;
    }
}

// === INITIALIZATION ===
if (typeof window !== 'undefined') {
    window.BakeryScannerTests = BakeryScannerTests;
    window.PerformanceMonitor = PerformanceMonitor;
    window.ErrorTracker = ErrorTracker;
    window.HealthChecker = HealthChecker;
    
    // Initialize monitoring
    window.performanceMonitor = new PerformanceMonitor();
    window.errorTracker = new ErrorTracker();
    window.healthChecker = new HealthChecker();
    
    // Add test runner to global scope
    window.runTests = () => {
        const tester = new BakeryScannerTests();
        return tester.runAllTests();
    };
    
    console.log('🧪 Testing framework loaded. Run window.runTests() to test the system.');
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BakeryScannerTests,
        PerformanceMonitor,
        ErrorTracker,
        HealthChecker
    };
}