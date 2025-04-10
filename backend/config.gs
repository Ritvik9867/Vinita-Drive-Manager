// Google Apps Script Configuration

// Get script properties
const scriptProperties = PropertiesService.getScriptProperties();

// Sheet IDs for the Driver Management System
const CONFIG = {
  SHEETS: {
    USERS: scriptProperties.getProperty('USERS_SHEET_ID'),
    TRIPS: scriptProperties.getProperty('TRIPS_SHEET_ID'),
    CNG_EXPENSES: scriptProperties.getProperty('CNG_EXPENSES_SHEET_ID'),
    OD_LOG: scriptProperties.getProperty('OD_LOG_SHEET_ID'),
    COMPLAINTS: scriptProperties.getProperty('COMPLAINTS_SHEET_ID'),
    ADVANCE: scriptProperties.getProperty('ADVANCE_SHEET_ID'),
    LOGIN_LOGS: scriptProperties.getProperty('LOGIN_LOGS_SHEET_ID')
  },

  // API Response Settings
  API: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    TIMEOUT: 30000,
    RATE_LIMIT: {
      MAX_REQUESTS: 100,
      WINDOW_MS: 60000
    }
  },
  
  // Deployment settings
  DEPLOYMENT: {
    WEB_APP_URL: 'https://script.google.com/macros/s/YOUR_ACTUAL_DEPLOYMENT_ID/exec',
    VERSION: '1.0.0',
    ENVIRONMENT: 'production' // or 'development'
  },
  
  // Authentication settings
  AUTH: {
    SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    TOKEN_SECRET: scriptProperties.getProperty('TOKEN_SECRET'),
    SALT_ROUNDS: 10 // For password hashing
  },
  
  // API endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout'
    },
    DRIVER: {
      TRIPS: '/driver/trips',
      CNG: '/driver/cng',
      OD_LOG: '/driver/odlog',
      COMPLAINTS: '/driver/complaints',
      ADVANCE: '/driver/advance'
    },
    ADMIN: {
      REPORTS: '/admin/reports',
      USERS: '/admin/users',
      SETTINGS: '/admin/settings'
    }
  },
  
  // Validation rules
  VALIDATION: {
    TRIP: {
      MIN_AMOUNT: 50,
      MAX_AMOUNT: 10000,
      MIN_KM: 1,
      MAX_KM: 1000
    },
    CNG: {
      MIN_AMOUNT: 100,
      MAX_AMOUNT: 5000
    },
    OD: {
      MIN_READING: 0,
      MAX_READING: 999999
    }
  }
};

// Export configuration
function getConfig() {
  return CONFIG;
}