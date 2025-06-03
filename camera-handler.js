// Camera Handler for managing camera access and video streaming
class CameraHandler {
    constructor() {
        this.video = document.getElementById('cameraPreview');
        this.canvas = document.getElementById('cameraCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.stream = null;
        this.currentCamera = 'environment'; // 'user' for front camera
        this.isScanning = false;
        this.scanInterval = null;
        this.frameRate = 30;
        
        // Camera constraints
        this.constraints = {
            video: {
                facingMode: this.currentCamera,
                width: { ideal: 1280 },
                height: { ideal: 720 },
                frameRate: { ideal: this.frameRate }
            },
            audio: false
        };
        
        // Initialize canvas size
        this.canvas.width = 640;
        this.canvas.height = 480;
    }
    
    async startCamera() {
        try {
            // Check if camera is already running
            if (this.stream) {
                return true;
            }
            
            // Request camera permission
            this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);
            
            // Attach stream to video element
            this.video.srcObject = this.stream;
            
            // Wait for video to be ready
            await new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    this.video.play();
                    resolve();
                };
            });
            
            // Update canvas size to match video
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            
            console.log('Camera started successfully');
            
            // Start continuous scanning if enabled
            if (window.app && window.app.settings && window.app.settings.continuousScan) {
                this.startContinuousScanning();
            }
            
            return true;
            
        } catch (error) {
            console.error('Failed to start camera:', error);
            this.handleCameraError(error);
            return false;
        }
    }
    
    stopCamera() {
        if (this.stream) {
            // Stop all tracks
            this.stream.getTracks().forEach(track => track.stop());
            
            // Clear video source
            this.video.srcObject = null;
            this.stream = null;
            
            // Stop scanning
            this.stopContinuousScanning();
            
            console.log('Camera stopped');
        }
    }
    
    async toggleCamera() {
        // Stop current camera
        this.stopCamera();
        
        // Switch camera facing mode
        this.currentCamera = this.currentCamera === 'environment' ? 'user' : 'environment';
        this.constraints.video.facingMode = this.currentCamera;
        
        // Start new camera
        await this.startCamera();
        
        // Show notification
        if (window.app && typeof window.app.showToast === 'function') {
            window.app.showToast(`Kamerat u ndërrua në ${this.currentCamera === 'user' ? 'përpara' : 'mbrapa'}`, 'info');
        }
    }
    
    captureFrame() {
        if (!this.video || !this.stream) {
            console.error('Camera not initialized');
            return null;
        }
        
        // Draw current video frame to canvas
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        
        // Convert canvas to image element
        const img = new Image();
        img.src = this.canvas.toDataURL('image/jpeg', 0.8);
        
        return img;
    }
    
    async capturePhoto() {
        const frame = this.captureFrame();
        
        if (frame) {
            // Add capture animation
            this.showCaptureAnimation();
            
            // Play capture sound if available
            this.playCaptureSound();
            
            return frame;
        }
        
        return null;
    }
    
    startContinuousScanning() {
        if (this.isScanning) return;
        
        this.isScanning = true;
        
        // Scan every 2 seconds
        this.scanInterval = setInterval(async () => {
            if (window.app && window.app.mlEngine && window.app.settings.continuousScan) {
                const frame = this.captureFrame();
                if (frame) {
                    frame.onload = async () => {
                        const result = await window.app.mlEngine.recognizeProduct(frame);
                        if (result && result.confidence > 0.75) {
                            window.app.displayDetectedProduct(result);
                        }
                    };
                }
            }
        }, 2000);
    }
    
    stopContinuousScanning() {
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }
        this.isScanning = false;
    }
    
    showCaptureAnimation() {
        const overlay = document.getElementById('scanOverlay');
        overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        
        setTimeout(() => {
            overlay.style.backgroundColor = 'transparent';
        }, 200);
    }
    
    playCaptureSound() {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSl7yvLZhjoIGGS57OihUQ0MSKXd6brMizUFE12n0+CIkWU1iz1hnpitqJBnKStleGRLiqm8mHonIXGDUm9wVGhwl4+sQSIiUHVPIXOMa3JqbXVrm5hqLxw6gaunt2olDxQ4eZKbnZ2gm4xtSUVHTk1QV1dTU1lZWFtWU1pTSkdJR0hGR0RKSk5KTUdGPDw9ODg9OT05Ozg+Pzo/PTxBOjlAOztAPz1AODw');
            audio.volume = 0.3;
            audio.play();
        } catch (error) {
            // Ignore audio errors
        }
    }
    
    handleCameraError(error) {
        let message = 'Gabim në hapjen e kamerës';
        
        if (error.name === 'NotAllowedError') {
            message = 'Ju lutem lejoni aksesin në kamerë për të përdorur skanerin';
        } else if (error.name === 'NotFoundError') {
            message = 'Nuk u gjet asnjë kamerë në këtë pajisje';
        } else if (error.name === 'NotReadableError') {
            message = 'Kamera është duke u përdorur nga një aplikacion tjetër';
        } else if (error.name === 'OverconstrainedError') {
            message = 'Cilësimet e kamerës nuk mbështeten nga pajisja juaj';
        }
        
        // Show error in console
        console.error('Camera error:', error);
        
        // Show toast if app is available
        if (window.app && typeof window.app.showToast === 'function') {
            window.app.showToast(message, 'error');
        } else {
            // Fallback alert if app not ready
            alert(message);
        }
    }
    
    // Advanced camera features
    async enableFlash(enable) {
        if (!this.stream) return;
        
        const track = this.stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        
        if (capabilities.torch) {
            try {
                await track.applyConstraints({
                    advanced: [{ torch: enable }]
                });
                console.log(`Flash ${enable ? 'enabled' : 'disabled'}`);
            } catch (error) {
                console.error('Failed to control flash:', error);
            }
        } else {
            console.log('Flash not supported on this device');
        }
    }
    
    async setFocus(mode = 'continuous') {
        if (!this.stream) return;
        
        const track = this.stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        
        if (capabilities.focusMode) {
            try {
                await track.applyConstraints({
                    advanced: [{ focusMode: mode }]
                });
                console.log(`Focus mode set to ${mode}`);
            } catch (error) {
                console.error('Failed to set focus mode:', error);
            }
        }
    }
    
    async setZoom(zoomLevel) {
        if (!this.stream) return;
        
        const track = this.stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        
        if (capabilities.zoom) {
            const minZoom = capabilities.zoom.min || 1;
            const maxZoom = capabilities.zoom.max || 1;
            const zoom = Math.max(minZoom, Math.min(maxZoom, zoomLevel));
            
            try {
                await track.applyConstraints({
                    advanced: [{ zoom: zoom }]
                });
                console.log(`Zoom set to ${zoom}`);
            } catch (error) {
                console.error('Failed to set zoom:', error);
            }
        }
    }
    
    // Get camera capabilities
    getCameraCapabilities() {
        if (!this.stream) return null;
        
        const track = this.stream.getVideoTracks()[0];
        const settings = track.getSettings();
        const capabilities = track.getCapabilities();
        
        return {
            settings,
            capabilities,
            hasFlash: capabilities.torch || false,
            hasFocus: capabilities.focusMode || false,
            hasZoom: capabilities.zoom || false,
            currentCamera: this.currentCamera
        };
    }
    
    // Take multiple photos for training
    async captureTrainingPhotos(count = 10, interval = 500) {
        const photos = [];
        
        for (let i = 0; i < count; i++) {
            const photo = await this.capturePhoto();
            if (photo) {
                photos.push(photo);
            }
            
            // Wait before next capture
            if (i < count - 1) {
                await new Promise(resolve => setTimeout(resolve, interval));
            }
            
            // Update progress if callback provided
            if (window.app && window.app.updateTrainingProgress) {
                window.app.updateTrainingProgress((i + 1) / count * 100);
            }
        }
        
        return photos;
    }
    
    // Process video stream for real-time detection
    processVideoStream(callback) {
        if (!this.video || !this.stream) return;
        
        const processFrame = () => {
            if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
                // Draw frame to canvas
                this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
                
                // Get image data
                const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
                
                // Call callback with image data
                if (callback) {
                    callback(imageData);
                }
            }
            
            // Continue processing if camera is still active
            if (this.stream) {
                requestAnimationFrame(processFrame);
            }
        };
        
        requestAnimationFrame(processFrame);
    }
    
    // Get video statistics
    getVideoStats() {
        if (!this.video || !this.stream) return null;
        
        return {
            width: this.video.videoWidth,
            height: this.video.videoHeight,
            aspectRatio: this.video.videoWidth / this.video.videoHeight,
            readyState: this.video.readyState,
            currentTime: this.video.currentTime,
            duration: this.video.duration
        };
    }
}

// Export for use in main app
window.CameraHandler = CameraHandler;