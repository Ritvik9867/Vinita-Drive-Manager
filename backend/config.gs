// Google Apps Script Configuration

// Sheet IDs for the Driver Management System
const CONFIG = {
  SHEETS: {
    USERS: '1XdKT7_0NYaFrZT4VB9oD98KpzY2vN8jKzVfLmZ1tbk4',
    TRIPS: '1wH2NzQJ3fY8mKpL6tXvR9q5sD7nGhY4JwxCkNjM8oP1',
    CNG_EXPENSES: '1aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5',
    OD_LOG: '1lM2nO3pQ4rS5tU6vW7xY8zA9bC0dE1fG2hI3jK4',
    COMPLAINTS: '1gH2iJ3kL4mN5oP6qR7sT8uV9wX0yZ1aB2cD3eF4',
    ADVANCE: '1pQ2rS3tU4vW5xY6zA7bC8dE9fG0hI1jK2lM3nO4',
    LOGIN_LOGS: '1uV2wX3yZ4aB5cD6eF7gH8iJ9kL0mN1oP2qR3sT4'
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
    TOKEN_SECRET: 'your-secret-key', // Change this in production
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