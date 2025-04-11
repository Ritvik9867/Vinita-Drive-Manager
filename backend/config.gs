// Google Apps Script Configuration

/*
IMPORTANT: Before using this script, you need to set up the following Script Properties:

1. Sheet IDs: For each sheet below, you need to create a new Google Sheet and copy its ID
   The Sheet ID is the long string in your Google Sheet URL between /d/ and /edit
   Example: https://docs.google.com/spreadsheets/d/1234567890abcdefghijk/edit
   In this URL, '1234567890abcdefghijk' would be your Sheet ID

   Required Sheet IDs:
   - USERS_SHEET_ID: ID of the sheet that stores user information
   - TRIPS_SHEET_ID: ID of the sheet that stores trip records
   - CNG_EXPENSES_SHEET_ID: ID of the sheet that tracks CNG expenses
   - OD_LOG_SHEET_ID: ID of the sheet that maintains odometer readings
   - COMPLAINTS_SHEET_ID: ID of the sheet for storing complaints
   - ADVANCE_SHEET_ID: ID of the sheet tracking advance payments
   - LOGIN_LOGS_SHEET_ID: ID of the sheet that records login activities

2. Security:
   - TOKEN_SECRET: A secure random string used for authentication
     Example: Generate a UUID like '550e8400-e29b-41d4-a716-446655440000'
     You can generate one at: https://www.uuidgenerator.net/

To set these properties:
1. In the Apps Script editor, go to Project Settings
2. Under Script Properties, click 'Add Script Property'
3. Add each property name (e.g., USERS_SHEET_ID) and its corresponding value
   (the Sheet ID from step 1 or the generated UUID for TOKEN_SECRET)
*/

// Get script properties
const scriptProperties = PropertiesService.getScriptProperties();

// Validate and set required script properties
const requiredProperties = [
  'USERS_SHEET_ID',
  'TRIPS_SHEET_ID',
  'CNG_EXPENSES_SHEET_ID',
  'OD_LOG_SHEET_ID',
  'COMPLAINTS_SHEET_ID',
  'ADVANCE_SHEET_ID',
  'LOGIN_LOGS_SHEET_ID',
  'TOKEN_SECRET'
];

// Check for missing required properties
const missingProperties = requiredProperties.filter(prop => !scriptProperties.getProperty(prop));

if (missingProperties.length > 0) {
  throw new Error(`Missing required script properties: ${missingProperties.join(', ')}. Please set these properties in the Script Editor.`);
}

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
    },
    CORS: {
      ALLOWED_ORIGINS: ['*'],
      ALLOWED_METHODS: ['GET', 'POST', 'OPTIONS'],
      ALLOWED_HEADERS: ['Content-Type', 'Accept', 'X-Requested-With', 'Origin', 'Authorization'],
      ALLOW_CREDENTIALS: true,
      MAX_AGE: 3600
    }
  },
  
  // Deployment settings
  DEPLOYMENT: {
    // Note: Replace this URL with your actual deployment URL after deploying the script
    WEB_APP_URL: ScriptApp.getService().getUrl(),
    VERSION: '1.0.0',
    ENVIRONMENT: 'production'
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