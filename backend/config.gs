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

// Set default values for Sheet IDs and TOKEN_SECRET if not already set
if (!scriptProperties.getProperty('USERS_SHEET_ID')) {
  scriptProperties.setProperty('USERS_SHEET_ID', '1xKj2mPzN8iQ3vYtR5wL7aE9oD4fH6gU8pB2cM1n');
}
if (!scriptProperties.getProperty('TRIPS_SHEET_ID')) {
  scriptProperties.setProperty('TRIPS_SHEET_ID', '2yVk4nQzP9jR7xWt6bF8mH3sL5gC1hD0qA4eN2p');
}
if (!scriptProperties.getProperty('CNG_EXPENSES_SHEET_ID')) {
  scriptProperties.setProperty('CNG_EXPENSES_SHEET_ID', '3zXm5rSzQ1kT8yUv7cG9pH4tM6jD2iE0nB5fP3q');
}
if (!scriptProperties.getProperty('OD_LOG_SHEET_ID')) {
  scriptProperties.setProperty('OD_LOG_SHEET_ID', '4wYn6tTwR2mU9zVx8dH1qJ5uN7kE3jF0pC6gQ4r');
}
if (!scriptProperties.getProperty('COMPLAINTS_SHEET_ID')) {
  scriptProperties.setProperty('COMPLAINTS_SHEET_ID', '5vZp7uUxS3nV1wWy9eJ2rK6vP8mF4kG0qD7hR5s');
}
if (!scriptProperties.getProperty('ADVANCE_SHEET_ID')) {
  scriptProperties.setProperty('ADVANCE_SHEET_ID', '6xAq8vVyT4pW2xXz1fK3sL7wQ9nG5mH0rE8iS6t');
}
if (!scriptProperties.getProperty('LOGIN_LOGS_SHEET_ID')) {
  scriptProperties.setProperty('LOGIN_LOGS_SHEET_ID', '7yBr9wWzU5qX3yYw2gL4tM8xR1pH6nJ0sF9jT7u');
}
if (!scriptProperties.getProperty('TOKEN_SECRET')) {
  scriptProperties.setProperty('TOKEN_SECRET', '550e8400-e29b-41d4-a716-446655440000');
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