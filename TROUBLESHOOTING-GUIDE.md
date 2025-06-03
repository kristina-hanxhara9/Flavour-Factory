# 🔧 TROUBLESHOOTING GUIDE - Sistemi i Skanimit për Furra

## 📋 Quick Diagnostic Tool

### **Run System Check**
```javascript
// Open browser console (F12) and run:
window.runTests(); // Runs all system tests
window.healthChecker.generateHealthReport(); // Health check
window.performanceMonitor.generateReport(); // Performance report
```

---

## 🚨 COMMON ISSUES & SOLUTIONS

### **1. CAMERA ISSUES**

#### **Problem: Camera won't open**
```
Error: "Nuk mund të hapet kamera"
```

**Diagnosis:**
- Browser permissions denied
- Camera in use by another application
- Hardware camera malfunction

**Solutions:**
```bash
✅ Check browser permissions:
   - Chrome: Settings → Privacy & Security → Site Settings → Camera
   - Safari: Preferences → Websites → Camera
   - Allow access for your site

✅ Close other camera applications:
   - Check Task Manager (Windows) or Activity Monitor (Mac)
   - Close Skype, Zoom, or other video apps

✅ Test camera in other applications:
   - Windows Camera app
   - Photo Booth (Mac)
   - Browser's camera test: https://webcamtests.com

✅ Browser-specific fixes:
   - Clear browser cache and cookies
   - Try incognito/private mode
   - Update browser to latest version
```

#### **Problem: Camera shows black screen**
**Solutions:**
```bash
✅ Check lighting conditions
✅ Clean camera lens
✅ Try different camera (if multiple available)
✅ Restart browser
✅ Check camera drivers (Windows)
```

#### **Problem: Poor image quality affecting AI recognition**
**Solutions:**
```bash
✅ Improve lighting - use daylight or bright LED
✅ Clean camera lens
✅ Hold device steady
✅ Ensure product is in focus
✅ Try different angles
✅ Adjust camera distance (20-30cm optimal)
```

---

### **2. AI RECOGNITION ISSUES**

#### **Problem: AI not recognizing products**
```
Error: "Produkti nuk u gjet"
Confidence: < 60%
```

**Diagnosis:**
```javascript
// Check AI model status
console.log('Model loaded:', !!window.app.model);
console.log('Base model loaded:', !!window.app.baseModel);
console.log('Products trained:', window.app.products.length);
```

**Solutions:**
```bash
✅ Ensure products are trained:
   - Minimum 15-20 photos per product
   - Various angles and lighting conditions
   - Clear, focused images

✅ Improve training data:
   - Add more photos from different angles
   - Use consistent lighting
   - Avoid blurry or dark images
   - Include product in different orientations

✅ Check AI confidence threshold:
   - Go to Settings → AI Settings
   - Lower confidence threshold if too strict
   - Default is 75%, try 65% for more lenient recognition

✅ Retrain model:
   - Go to Products tab
   - Select problematic product
   - Add more training photos
   - Run training again
```

#### **Problem: TensorFlow.js fails to load**
```
Error: "tf is not defined"
```

**Solutions:**
```bash
✅ Check internet connection
✅ Clear browser cache
✅ Try different browser
✅ Check browser console for network errors
✅ Verify CDN availability:
   https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js
```

#### **Problem: Model training fails**
```
Error during training process
```

**Solutions:**
```bash
✅ Check available memory:
   - Close other browser tabs
   - Restart browser
   - Use more powerful device

✅ Verify training data:
   - At least 5 photos (recommend 15-20)
   - Valid image formats (JPG, PNG)
   - Images under 5MB each

✅ Try training with fewer photos first
✅ Enable advanced training features gradually
```

---

### **3. DATA & STORAGE ISSUES**

#### **Problem: Data not saving**
```
Error: "QuotaExceededError"
```

**Diagnosis:**
```javascript
// Check localStorage usage
const used = JSON.stringify(localStorage).length;
const maxSize = 5 * 1024 * 1024; // 5MB typical limit
console.log(`Storage used: ${(used/1024/1024).toFixed(2)}MB / ${(maxSize/1024/1024)}MB`);
```

**Solutions:**
```bash
✅ Clear old data:
   - Go to Settings → Data Management
   - Click "Fshi të Dhënat e Vjetra"
   - Export important data first

✅ Enable cloud backup:
   - Go to Settings → Cloud Backup
   - Configure Google Drive or other provider
   - Enable automatic backup

✅ Browser storage fixes:
   - Clear browser data
   - Try incognito mode
   - Use different browser
   - Increase browser storage quota (advanced)
```

#### **Problem: Cloud backup failing**
```
Error: "Backup në cloud dështoi"
```

**Solutions:**
```bash
✅ Check API credentials:
   - Go to Settings → Cloud Backup
   - Click "Testo Lidhjen"
   - Verify API key is correct

✅ Network connectivity:
   - Check internet connection
   - Try manual backup
   - Check firewall/proxy settings

✅ Provider-specific fixes:
   Google Drive:
   - Verify OAuth 2.0 setup
   - Check API quotas
   - Refresh access token
   
   Firebase:
   - Verify project configuration
   - Check security rules
   - Monitor usage limits
```

#### **Problem: Data corruption or loss**
```
Data appears corrupted or missing
```

**Solutions:**
```bash
✅ Check backup files:
   - Look for 'backup_before_*' in localStorage
   - Restore from cloud backup
   - Check browser's local backup files

✅ Data recovery:
   - Export any remaining data
   - Clear corrupted data
   - Restore from backup
   - Re-import clean data

✅ Prevention:
   - Enable automatic cloud backup
   - Regular manual exports
   - Test restore procedures
```

---

### **4. PERFORMANCE ISSUES**

#### **Problem: Slow AI recognition**
```
Recognition takes > 5 seconds
```

**Diagnosis:**
```javascript
// Check performance metrics
window.performanceMonitor.generateReport();
```

**Solutions:**
```bash
✅ Hardware optimization:
   - Use device with more RAM (8GB+ recommended)
   - Close other applications
   - Clear browser cache
   - Restart browser

✅ Software optimization:
   - Update browser to latest version
   - Enable hardware acceleration
   - Use Chrome or Safari (better TensorFlow.js support)
   - Reduce image resolution in training

✅ Model optimization:
   - Retrain with smaller dataset if needed
   - Use fewer training epochs
   - Disable advanced AI features temporarily
```

#### **Problem: App freezing or crashing**
```
Browser becomes unresponsive
```

**Solutions:**
```bash
✅ Memory management:
   - Restart browser
   - Close unnecessary tabs
   - Clear browser cache
   - Increase virtual memory (Windows)

✅ Browser fixes:
   - Update browser
   - Disable browser extensions
   - Try different browser
   - Reset browser settings

✅ Device fixes:
   - Restart device
   - Free up storage space
   - Update device OS
   - Check for hardware issues
```

---

### **5. PRINTING ISSUES**

#### **Problem: Printer not detected**
```
Error: "Printeri nuk u gjet"
```

**Solutions:**
```bash
✅ USB Thermal Printer:
   - Check USB connection
   - Install printer drivers
   - Test with other software
   - Try different USB port

✅ Bluetooth Printer:
   - Pair printer with device
   - Enable Bluetooth permissions in browser
   - Check printer battery
   - Try reconnecting

✅ Browser permissions:
   - Chrome: Enable "Web Serial API"
   - Safari: Check print permissions
   - Try different browser
```

#### **Problem: Receipt prints incorrectly**
```
Garbled text or wrong formatting
```

**Solutions:**
```bash
✅ Check printer settings:
   - Select correct printer type in Settings
   - Verify paper width (80mm recommended)
   - Test with standard text

✅ Format fixes:
   - Try different receipt template
   - Adjust font size settings
   - Check character encoding

✅ Hardware fixes:
   - Replace printer paper
   - Clean print head
   - Check printer alignment
```

---

### **6. NETWORK & CONNECTIVITY ISSUES**

#### **Problem: Offline mode not working**
```
App doesn't work without internet
```

**Solutions:**
```bash
✅ Service worker registration:
   - Check browser console for SW errors
   - Clear cache and reload
   - Verify manifest.json

✅ Cache verification:
   - Open DevTools → Application → Storage
   - Check Cache Storage
   - Verify offline resources cached

✅ Browser support:
   - Use modern browser (Chrome 60+, Safari 11+)
   - Enable service workers
   - Check browser compatibility
```

#### **Problem: Slow loading times**
```
App takes long to load initially
```

**Solutions:**
```bash
✅ Network optimization:
   - Check internet speed
   - Use wired connection if possible
   - Clear DNS cache

✅ Asset optimization:
   - Clear browser cache
   - Disable browser extensions
   - Try during off-peak hours

✅ CDN issues:
   - Check if TensorFlow.js CDN is accessible
   - Try different CDN or local hosting
```

---

## 🔍 ADVANCED DIAGNOSTICS

### **System Information Collection**
```javascript
// Run in browser console for support
function collectDiagnosticInfo() {
    const info = {
        // Browser info
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        
        // Screen info
        screen: {
            width: screen.width,
            height: screen.height,
            colorDepth: screen.colorDepth
        },
        
        // App info
        app: {
            products: window.app?.products?.length || 0,
            sales: window.app?.sales?.length || 0,
            shifts: window.app?.shifts?.length || 0,
            modelLoaded: !!window.app?.model,
            baseModelLoaded: !!window.app?.baseModel
        },
        
        // Storage info
        storage: {
            localStorage: !!window.localStorage,
            sessionStorage: !!window.sessionStorage,
            indexedDB: !!window.indexedDB
        },
        
        // Features support
        features: {
            camera: !!navigator.mediaDevices?.getUserMedia,
            serviceWorker: 'serviceWorker' in navigator,
            webGL: !!document.createElement('canvas').getContext('webgl'),
            webAssembly: !!window.WebAssembly
        }
    };
    
    console.log('Diagnostic Info:', JSON.stringify(info, null, 2));
    return info;
}

// Run diagnostic
collectDiagnosticInfo();
```

### **Performance Profiling**
```javascript
// Enable performance monitoring
window.app.enablePerformanceMonitoring = true;

// Monitor AI inference time
performance.mark('ai-start');
// ... AI recognition happens ...
performance.mark('ai-end');
performance.measure('ai-inference', 'ai-start', 'ai-end');

// Check measurements
performance.getEntriesByType('measure').forEach(entry => {
    console.log(`${entry.name}: ${entry.duration.toFixed(2)}ms`);
});
```

### **Error Log Analysis**
```javascript
// View recent errors
window.errorTracker.getErrorReport();

// Monitor for new errors
window.addEventListener('error', (event) => {
    console.error('New error detected:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
});
```

---

## 📞 GETTING HELP

### **Self-Service Resources**
1. **Run built-in diagnostics** (see above)
2. **Check browser console** for error messages
3. **Review system requirements** in README.md
4. **Test with different browser** or device

### **Escalation Path**
1. **Level 1**: Basic troubleshooting (this guide)
2. **Level 2**: Advanced diagnostics and configuration
3. **Level 3**: Code-level debugging and system modification

### **Information to Provide When Seeking Help**
```bash
📋 When contacting support, provide:

✅ Diagnostic information (use collectDiagnosticInfo())
✅ Error messages from browser console
✅ Steps to reproduce the issue
✅ Browser type and version
✅ Device type and specifications
✅ Network configuration
✅ Screenshots or videos of the problem
✅ Recent changes made to the system
```

### **Emergency Procedures**

#### **Complete System Reset**
```bash
⚠️ WARNING: This will delete all data!

1. Export all data first (if possible)
2. Clear browser data completely
3. Reload application
4. Restore from backup
5. Reconfigure settings
6. Retrain AI models
```

#### **Disaster Recovery**
```bash
📊 If system is completely broken:

1. Access backup files:
   - Check cloud storage
   - Look for local backup files
   - Contact support for assistance

2. Alternative access methods:
   - Use different browser
   - Try on different device
   - Access via mobile hotspot

3. Business continuity:
   - Use manual cash register temporarily
   - Keep paper records
   - Document all transactions for later entry
```

---

## 📈 PREVENTION & BEST PRACTICES

### **Regular Maintenance**
```bash
📅 Daily:
- Check system health via dashboard
- Verify backup completion
- Monitor performance metrics

📅 Weekly:
- Review error logs
- Update training data if needed
- Test critical features

📅 Monthly:
- Full system backup
- Performance review
- Security audit
- Update documentation
```

### **Monitoring Setup**
```javascript
// Set up automatic health checks
setInterval(() => {
    window.healthChecker.generateHealthReport()
        .then(report => {
            if (report.overall !== 'HEALTHY') {
                console.warn('System health warning:', report);
                // Alert administrator
            }
        });
}, 30 * 60 * 1000); // Every 30 minutes
```

### **Performance Optimization**
```bash
🚀 Keep system running smoothly:

✅ Regular browser cache clearing
✅ Keep training datasets organized
✅ Monitor storage usage
✅ Update browser regularly
✅ Maintain good lighting for camera
✅ Keep device storage above 20% free
✅ Use wired internet when possible
✅ Regular system reboots
```

---

**🎯 Remember: Most issues can be resolved with basic troubleshooting. When in doubt, try the "turn it off and on again" approach - restart the browser, clear cache, and reload the application.**

**💡 For complex issues, always check the browser console first - it usually contains the specific error message that explains what went wrong.**