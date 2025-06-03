// Configuration file with proper setup
const APP_CONFIG = {
    // Google Drive Setup (FREE)
    GOOGLE_CLIENT_ID: '', // Will be filled during setup
    GOOGLE_API_KEY: '', // Will be filled during setup
    
    // App settings
    APP_NAME: 'Bakery Scanner',
    VERSION: '1.0.0',
    
    // Default settings
    DEFAULT_TAX_RATE: 0.20,
    CONFIDENCE_THRESHOLD: 0.75,
    
    // Storage keys
    STORAGE_KEYS: {
        PRODUCTS: 'products',
        SALES: 'sales',
        EMPLOYEES: 'employees',
        SHIFTS: 'shifts',
        SETTINGS: 'settings'
    }
};

// Check if running locally or online
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.protocol === 'file:';

// Helper function to check configuration
function checkConfiguration() {
    const issues = [];
    
    if (!APP_CONFIG.GOOGLE_CLIENT_ID && document.getElementById('setupCloudBackup')) {
        issues.push('Google Drive not configured - Cloud backup disabled');
        document.getElementById('setupCloudBackup').textContent = 'Konfiguro Google Drive (Kliko për udhëzime)';
    }
    
    return issues;
}

// Export config
window.APP_CONFIG = APP_CONFIG;