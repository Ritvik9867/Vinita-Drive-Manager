// Configuration for the Driver Management System

export const config = {
  // Google Apps Script deployment URL
  API_URL: 'https://script.google.com/macros/s/AKfycbwYuN0JrHvFs9_QO9UZaVr1rvHKqlNVT1qoLhJXb0Kj/exec',

  // API Request Configuration
  API: {
    TIMEOUT: 30000,
    RETRY_COUNT: 3,
    RETRY_DELAY: 1000
  },

  // Image upload settings
  IMAGE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png'],
    RESIZE_OPTIONS: {
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.8
    }
  },

  // Session settings
  SESSION: {
    TOKEN_KEY: 'sessionToken',
    REFRESH_INTERVAL: 5 * 60 * 1000 // 5 minutes
  },

  // Route paths
  ROUTES: {
    LOGIN: '/login',
    REGISTER: '/register',
    ADMIN: {
      DASHBOARD: '/admin',
      DRIVERS: '/admin/drivers',
      REPORTS: '/admin/reports'
    },
    DRIVER: {
      DASHBOARD: '/driver',
      TRIPS: '/driver/trips',
      EXPENSES: '/driver/expenses',
      COMPLAINTS: '/driver/complaints',
      OD_LOG: '/driver/odlog'
    }
  },

  // Data refresh intervals (in milliseconds)
  REFRESH_INTERVALS: {
    DASHBOARD: 5 * 60 * 1000, // 5 minutes
    TRIPS: 2 * 60 * 1000, // 2 minutes
    EXPENSES: 5 * 60 * 1000, // 5 minutes
    COMPLAINTS: 5 * 60 * 1000 // 5 minutes
  },

  // Validation rules
  VALIDATION: {
    PASSWORD: {
      MIN_LENGTH: 8,
      REQUIRE_UPPERCASE: true,
      REQUIRE_LOWERCASE: true,
      REQUIRE_NUMBER: true,
      REQUIRE_SPECIAL: true
    },
    OD_READING: {
      MIN: 0,
      MAX: 999999
    },
    TRIP: {
      MIN_AMOUNT: 10,
      MAX_AMOUNT: 10000,
      MIN_KM: 1,
      MAX_KM: 1000
    }
  }
};

// Helper functions
export const validatePassword = (password) => {
  const rules = config.VALIDATION.PASSWORD;
  return (
    password.length >= rules.MIN_LENGTH &&
    (!rules.REQUIRE_UPPERCASE || /[A-Z]/.test(password)) &&
    (!rules.REQUIRE_LOWERCASE || /[a-z]/.test(password)) &&
    (!rules.REQUIRE_NUMBER || /[0-9]/.test(password)) &&
    (!rules.REQUIRE_SPECIAL || /[!@#$%^&*]/.test(password))
  );
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};