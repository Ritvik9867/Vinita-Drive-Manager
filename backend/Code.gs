// Google Apps Script backend for Driver Management System

// Initialize cache for session management
const cache = CacheService.getScriptCache();

// Import configuration from config.gs
const SHEET_IDS = CONFIG.SHEETS;

// Initialize sheets
function initializeSheets() {
  const sheets = [
    { id: SHEET_IDS.USERS, name: 'Users', headers: ['Username', 'PasswordHash', 'Role', 'Name', 'Email', 'JoinDate', 'LastLogin', 'Status'] },
    { id: SHEET_IDS.TRIPS, name: 'Trips', headers: ['Driver', 'Date', 'Time', 'TripKM', 'Amount', 'Toll', 'PaymentType', 'CashCollected', 'OnlinePayment', 'Status', 'Notes'] },
    { id: SHEET_IDS.CNG_EXPENSES, name: 'CNGExpenses', headers: ['Driver', 'Date', 'Amount', 'PaidBy', 'ImageLink', 'Status', 'AdminApproval', 'ApprovalDate'] },
    { id: SHEET_IDS.OD_LOG, name: 'ODLog', headers: ['Driver', 'Date', 'StartOD', 'EndOD', 'StartImage', 'EndImage', 'TotalDrivenKM', 'Status', 'Verified'] },
    { id: SHEET_IDS.COMPLAINTS, name: 'Complaints', headers: ['From', 'Against', 'Date', 'Type', 'Description', 'Image', 'Status', 'Resolution'] },
    { id: SHEET_IDS.ADVANCE, name: 'Advance', headers: ['Driver', 'Date', 'AdvanceGiven', 'PaidBack', 'PaymentProof', 'AdminApproved', 'ApprovalDate', 'Notes'] },
    { id: SHEET_IDS.LOGIN_LOGS, name: 'LoginLogs', headers: ['Driver', 'LoginTime', 'LogoutTime', 'TotalHours', 'IPAddress', 'DeviceInfo'] }
  ];

  sheets.forEach(sheet => {
    try {
      const ss = SpreadsheetApp.openById(sheet.id);
      const activeSheet = ss.getActiveSheet();
      if (activeSheet.getRange('A1').getValue() === '') {
        activeSheet.getRange(1, 1, 1, sheet.headers.length).setValues([sheet.headers]);
        activeSheet.setFrozenRows(1);
        activeSheet.getRange(1, 1, 1, sheet.headers.length).setBackground('#f3f3f3').setFontWeight('bold');
      }
    } catch (error) {
      console.error(`Failed to initialize sheet ${sheet.name}: ${error.message}`);
    }
  });
}

// Web app endpoint
function doPost(e) {
  // Set CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (e.method === 'OPTIONS') {
    return ContentService.createTextOutput(JSON.stringify({status: 'ok'}))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }

  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const token = e.parameter.token;

    // Check authentication for protected endpoints
    if (!['login', 'register'].includes(action)) {
      const isValid = validateSession(token);
      if (!isValid) {
        return sendResponse(false, null, 'Invalid or expired session');
      }
    }

    // Set response wrapper function with CORS headers
    const sendCorsResponse = (success, data, error = null) => {
      const response = {
        success: success,
        data: data,
        error: error
      };
      return ContentService.createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
    };

    switch (action) {
      case 'register':
        return handleRequest(() => register(data));
      case 'login':
        return handleRequest(() => login(data));
      case 'logout':
        return handleRequest(() => logout(token));
      case 'addTrip':
        return handleRequest(() => addTrip(data));
      case 'getTrips':
        return handleRequest(() => getTrips(data));
      case 'addCNGExpense':
        return handleRequest(() => addCNGExpense(data));
      case 'getCNGExpenses':
        return handleRequest(() => getCNGExpenses(data));
      case 'updateODLog':
        return handleRequest(() => updateODLog(data));
      case 'getODLog':
        return handleRequest(() => getODLog(data));
      case 'addComplaint':
        return handleRequest(() => addComplaint(data));
      case 'getComplaints':
        return handleRequest(() => getComplaints(data));
      case 'updateAdvance':
        return handleRequest(() => updateAdvance(data));
      case 'getAdvances':
        return handleRequest(() => getAdvances(data));
      case 'generateReport':
        return handleRequest(() => generateReport(data));
      default:
        return sendResponse(false, null, 'Invalid action');
    }
  } catch (error) {
    console.error('Error in doPost:', error);
    return sendResponse(false, null, 'Internal server error');
  }
}

// Request handler wrapper for consistent error handling
function handleRequest(callback) {
  try {
    return callback();
  } catch (error) {
    console.error('Request handler error:', error);
    return sendResponse(false, null, error.message || 'Internal server error');
  }
}

// Session management
function validateSession(token) {
  if (!token) return false;
  const sessionData = cache.get(token);
  return !!sessionData;
}

function createSession(userData) {
  const token = Utilities.getUuid();
  cache.put(token, JSON.stringify(userData), CONFIG.AUTH.SESSION_DURATION);
  return token;
}

function clearSession(token) {
  if (token) {
    cache.remove(token);
  }
}

// Helper function to send response
function sendResponse(success, data, error = null) {
  return ContentService.createTextOutput(JSON.stringify({
    success: success,
    data: data,
    error: error
  })).setMimeType(ContentService.MimeType.JSON);
}

// Password hashing
function hashPassword(password) {
  const salt = Utilities.getUuid();
  const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,
    password + salt + CONFIG.AUTH.TOKEN_SECRET);
  return { hash: hash, salt: salt };
}

function verifyPassword(password, storedHash, storedSalt) {
  const computedHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,
    password + storedSalt + CONFIG.AUTH.TOKEN_SECRET);
  return Utilities.newBlob(computedHash).getBytes().toString() === 
         Utilities.newBlob(storedHash).getBytes().toString();
}

// Authentication functions
function register(data) {
  try {
    const { email, password, name, role = 'driver' } = data;
    
    // Validate input
    if (!email || !password || !name) {
      return sendResponse(false, null, 'Missing required fields: email, password, and name are mandatory');
    }

    // Validate email format
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      return sendResponse(false, null, 'Invalid email format. Please enter a valid email address');
    }

    // Enhanced password validation
    if (password.length < CONFIG.VALIDATION.PASSWORD.MIN_LENGTH) {
      return sendResponse(false, null, `Password must be at least ${CONFIG.VALIDATION.PASSWORD.MIN_LENGTH} characters long`);
    }

    if (CONFIG.VALIDATION.PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      return sendResponse(false, null, 'Password must contain at least one uppercase letter');
    }

    if (CONFIG.VALIDATION.PASSWORD.REQUIRE_NUMBER && !/[0-9]/.test(password)) {
      return sendResponse(false, null, 'Password must contain at least one number');
    }

    if (CONFIG.VALIDATION.PASSWORD.REQUIRE_SPECIAL && !/[!@#$%^&*]/.test(password)) {
      return sendResponse(false, null, 'Password must contain at least one special character (!@#$%^&*)');
    }
    
    // Get users sheet with retry logic
    let usersSheet;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        usersSheet = SpreadsheetApp.openById(SHEET_IDS.USERS).getActiveSheet();
        break;
      } catch (error) {
        retryCount++;
        if (retryCount === maxRetries) {
          console.error('Failed to access users sheet after ' + maxRetries + ' attempts:', error);
          return sendResponse(false, null, 'Unable to access user database. Please try again later');
        }
        Utilities.sleep(1000); // Wait 1 second before retrying
      }
    }

    const users = usersSheet.getDataRange().getValues();
    
    // Check if email already exists
    if (users.some(user => user[4] === email)) {
      return sendResponse(false, null, 'An account with this email already exists');
    }

    // Hash password
    const { hash, salt } = hashPassword(password);

    // Add new user with retry logic
    retryCount = 0;
    while (retryCount < maxRetries) {
      try {
        usersSheet.appendRow([
          email,
          Utilities.base64Encode(hash) + ':' + salt,
          role,
          name,
          email,
          new Date().toISOString(),
          '',
          'active'
        ]);
        break;
      } catch (error) {
        retryCount++;
        if (retryCount === maxRetries) {
          console.error('Failed to create user after ' + maxRetries + ' attempts:', error);
          return sendResponse(false, null, 'Failed to create user account. Please try again later');
        }
        Utilities.sleep(1000);
      }
    }

    // Return success response with user data
    return sendResponse(true, {
      message: 'Registration successful! You can now log in with your email and password',
      user: {
        name,
        email,
        role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return sendResponse(false, null, 'An unexpected error occurred. Please try again later');
  }
}

function login(data) {
  try {
    const { email, password } = data;
    
    // Validate input
    if (!email || !password) {
      return sendResponse(false, null, 'Missing credentials');
    }

    const usersSheet = SpreadsheetApp.openById(SHEET_IDS.USERS).getActiveSheet();
    const users = usersSheet.getDataRange().getValues();
    
    // Find user by email
    const userRow = users.findIndex(user => user[4] === email);
    if (userRow === -1) {
      return sendResponse(false, null, 'Invalid credentials');
    }

    const user = users[userRow];
    if (user[7] !== 'active') {
      return sendResponse(false, null, 'Account is not active');
    }

    // Verify password
    const [storedHashBase64, storedSalt] = user[1].split(':');
    const storedHash = Utilities.base64Decode(storedHashBase64);
    
    if (!verifyPassword(password, storedHash, storedSalt)) {
      return sendResponse(false, null, 'Invalid credentials');
    }

    // Update last login time
    const now = new Date().toISOString();
    usersSheet.getRange(userRow + 1, 7).setValue(now);

    // Log login
    const loginLogsSheet = SpreadsheetApp.openById(SHEET_IDS.LOGIN_LOGS).getActiveSheet();
    loginLogsSheet.appendRow([
      user[3],
      now,
      '',
      '',
      Session.getActiveUser().getUserLoginId(),
      Session.getActiveUserLocale()
    ]);

    // Create session
    const userData = {
      id: userRow + 1,
      name: user[3],
      email: user[4],
      role: user[2]
    };
    const sessionToken = createSession(userData);

    return sendResponse(true, {
      user: userData,
      token: sessionToken
    });
  } catch (error) {
    console.error('Login error:', error);
    return sendResponse(false, null, 'An unexpected error occurred during login');
  }
}

// Trip management functions
function addTrip(data) {
  const { driver, date, tripKM, tripAmount, toll = 0, paymentType, cashCollected = 0 } = data;

  // Validate input
  if (!driver || !date || !tripKM || !tripAmount || !paymentType) {
    throw new Error('Missing required fields');
  }

  // Validate amounts
  if (tripAmount < CONFIG.VALIDATION.TRIP.MIN_AMOUNT || 
      tripAmount > CONFIG.VALIDATION.TRIP.MAX_AMOUNT) {
    throw new Error('Invalid trip amount');
  }

  if (tripKM < CONFIG.VALIDATION.TRIP.MIN_KM || 
      tripKM > CONFIG.VALIDATION.TRIP.MAX_KM) {
    throw new Error('Invalid trip kilometers');
  }

  const tripsSheet = SpreadsheetApp.openById(SHEET_IDS.TRIPS).getActiveSheet();
  const now = new Date();
  
  tripsSheet.appendRow([
    driver,
    date,
    now.toTimeString(),
    tripKM,
    tripAmount,
    toll,
    paymentType,
    cashCollected,
    paymentType === 'online' ? tripAmount : 0,
    'pending',
    ''
  ]);

  return sendResponse(true, { 
    message: 'Trip added successfully',
    tripId: tripsSheet.getLastRow(),
    timestamp: now.toISOString()
  });
}

function getTrips(data) {
  const { driver, startDate, endDate, status } = data;
  
  const tripsSheet = SpreadsheetApp.openById(SHEET_IDS.TRIPS).getActiveSheet();
  const trips = tripsSheet.getDataRange().getValues();
  const headers = trips.shift(); // Remove header row

  // Filter trips based on criteria
  const filteredTrips = trips.filter(trip => {
    const tripDate = new Date(trip[1]);
    return (!driver || trip[0] === driver) &&
           (!startDate || tripDate >= new Date(startDate)) &&
           (!endDate || tripDate <= new Date(endDate)) &&
           (!status || trip[9] === status);
  });

  // Calculate summary
  const summary = {
    totalTrips: filteredTrips.length,
    totalKM: filteredTrips.reduce((sum, trip) => sum + trip[3], 0),
    totalEarnings: filteredTrips.reduce((sum, trip) => sum + trip[4], 0),
    totalToll: filteredTrips.reduce((sum, trip) => sum + trip[5], 0),
    cashCollected: filteredTrips.reduce((sum, trip) => sum + trip[7], 0),
    onlinePayments: filteredTrips.reduce((sum, trip) => sum + trip[8], 0)
  };

  return sendResponse(true, {
    trips: filteredTrips.map(trip => {
      const tripObj = {};
      headers.forEach((header, index) => {
        tripObj[header.toLowerCase()] = trip[index];
      });
      return tripObj;
    }),
    summary: summary
  });
}

// CNG Expense management functions
function addCNGExpense(data) {
  const { driver, date, amount, paidBy, imageLink } = data;

  // Validate input
  if (!driver || !date || !amount || !paidBy) {
    throw new Error('Missing required fields');
  }

  // Validate amount
  if (amount < CONFIG.VALIDATION.CNG.MIN_AMOUNT || 
      amount > CONFIG.VALIDATION.CNG.MAX_AMOUNT) {
    throw new Error('Invalid CNG amount');
  }

  const expensesSheet = SpreadsheetApp.openById(SHEET_IDS.CNG_EXPENSES).getActiveSheet();
  const now = new Date();

  expensesSheet.appendRow([
    driver,
    date,
    amount,
    paidBy,
    imageLink || '',
    'pending',
    '',
    ''
  ]);

  return sendResponse(true, {
    message: 'CNG expense added successfully',
    expenseId: expensesSheet.getLastRow(),
    timestamp: now.toISOString()
  });
}

function getCNGExpenses(data) {
  const { driver, startDate, endDate, status } = data;

  const expensesSheet = SpreadsheetApp.openById(SHEET_IDS.CNG_EXPENSES).getActiveSheet();
  const expenses = expensesSheet.getDataRange().getValues();
  const headers = expenses.shift(); // Remove header row

  // Filter expenses based on criteria
  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense[1]);
    return (!driver || expense[0] === driver) &&
           (!startDate || expenseDate >= new Date(startDate)) &&
           (!endDate || expenseDate <= new Date(endDate)) &&
           (!status || expense[5] === status);
  });

  // Calculate summary
  const summary = {
    totalExpenses: filteredExpenses.length,
    totalAmount: filteredExpenses.reduce((sum, expense) => sum + expense[2], 0),
    pendingApproval: filteredExpenses.filter(expense => expense[5] === 'pending').length,
    approved: filteredExpenses.filter(expense => expense[5] === 'approved').length
  };

  return sendResponse(true, {
    expenses: filteredExpenses.map(expense => {
      const expenseObj = {};
      headers.forEach((header, index) => {
        expenseObj[header.toLowerCase()] = expense[index];
      });
      return expenseObj;
    }),
    summary: summary
  });
}

// OD Log management functions
function updateODLog(data) {
  const { driver, date, startOD, endOD, startImage, endImage } = data;

  // Validate input
  if (!driver || !date || (startOD === undefined && endOD === undefined)) {
    throw new Error('Missing required fields');
  }

  // Validate OD readings
  if (startOD !== undefined && (startOD < CONFIG.VALIDATION.OD.MIN_READING || 
      startOD > CONFIG.VALIDATION.OD.MAX_READING)) {
    throw new Error('Invalid start OD reading');
  }

  if (endOD !== undefined && (endOD < CONFIG.VALIDATION.OD.MIN_READING || 
      endOD > CONFIG.VALIDATION.OD.MAX_READING)) {
    throw new Error('Invalid end OD reading');
  }

  if (startOD !== undefined && endOD !== undefined && endOD <= startOD) {
    throw new Error('End OD must be greater than start OD');
  }

  const odLogSheet = SpreadsheetApp.openById(SHEET_IDS.OD_LOG).getActiveSheet();
  const logs = odLogSheet.getDataRange().getValues();
  const existingLogRow = logs.findIndex(log => 
    log[0] === driver && new Date(log[1]).toDateString() === new Date(date).toDateString());

  const totalDrivenKM = (endOD !== undefined && startOD !== undefined) ? 
    endOD - startOD : null;

  if (existingLogRow === -1) {
    // Create new log
    odLogSheet.appendRow([
      driver,
      date,
      startOD || '',
      endOD || '',
      startImage || '',
      endImage || '',
      totalDrivenKM,
      'pending',
      false
    ]);
  } else {
    // Update existing log
    const rowNum = existingLogRow + 1;
    if (startOD !== undefined) {
      odLogSheet.getRange(rowNum, 3).setValue(startOD);
      odLogSheet.getRange(rowNum, 5).setValue(startImage || '');
    }
    if (endOD !== undefined) {
      odLogSheet.getRange(rowNum, 4).setValue(endOD);
      odLogSheet.getRange(rowNum, 6).setValue(endImage || '');
    }
    if (totalDrivenKM !== null) {
      odLogSheet.getRange(rowNum, 7).setValue(totalDrivenKM);
    }
    odLogSheet.getRange(rowNum, 8).setValue('pending');
    odLogSheet.getRange(rowNum, 9).setValue(false);
  }

  return sendResponse(true, {
    message: 'OD log updated successfully',
    date: date,
    totalDrivenKM: totalDrivenKM
  });
}

function getODLog(data) {
  const { driver, startDate, endDate, verified } = data;

  const odLogSheet = SpreadsheetApp.openById(SHEET_IDS.OD_LOG).getActiveSheet();
  const logs = odLogSheet.getDataRange().getValues();
  const headers = logs.shift(); // Remove header row

  // Filter logs based on criteria
  const filteredLogs = logs.filter(log => {
    const logDate = new Date(log[1]);
    return (!driver || log[0] === driver) &&
           (!startDate || logDate >= new Date(startDate)) &&
           (!endDate || logDate <= new Date(endDate)) &&
           (verified === undefined || log[8] === verified);
  });

  // Calculate summary
  const summary = {
    totalDays: filteredLogs.length,
    totalKM: filteredLogs.reduce((sum, log) => sum + (log[6] || 0), 0),
    pendingVerification: filteredLogs.filter(log => !log[8]).length,
    verified: filteredLogs.filter(log => log[8]).length
  };

  return sendResponse(true, {
    logs: filteredLogs.map(log => {
      const logObj = {};
      headers.forEach((header, index) => {
        logObj[header.toLowerCase()] = log[index];
      });
      return logObj;
    }),
    summary: summary
  });
}

// Report generation functions

// Report generation function
function generateReport(data) {
  try {
    const { reportType, timeFrame, driverId, startDate, endDate } = data;
    
    if (!reportType) {
      return sendResponse(false, null, 'Report type is required');
    }

    let reportData = [];

    switch (reportType) {
      case 'earnings':
        reportData = generateEarningsReport(driverId, timeFrame, startDate, endDate);
        break;
      case 'expenses':
        reportData = generateExpensesReport(driverId, timeFrame, startDate, endDate);
        break;
      default:
        return sendResponse(false, null, 'Invalid report type');
    }

    return sendResponse(true, { reportData });
  } catch (error) {
    console.error('Report generation error:', error);
    return sendResponse(false, null, 'Failed to generate report');
  }
}

// Helper function to generate earnings report
function generateEarningsReport(driverId, timeFrame, startDate, endDate) {
  try {
    const tripsSheet = SpreadsheetApp.openById(SHEET_IDS.TRIPS).getActiveSheet();
    const trips = tripsSheet.getDataRange().getValues();
    const headers = trips.shift(); // Remove header row
    
    // Filter and process trips based on parameters
    const filteredTrips = trips.filter(trip => {
      const tripDate = new Date(trip[1]);
      return (!driverId || trip[0] === driverId) &&
             (!startDate || tripDate >= new Date(startDate)) &&
             (!endDate || tripDate <= new Date(endDate));
    });

    // Calculate earnings summary
    const summary = {
      totalTrips: filteredTrips.length,
      totalEarnings: filteredTrips.reduce((sum, trip) => sum + trip[4], 0),
      totalKM: filteredTrips.reduce((sum, trip) => sum + trip[3], 0),
      cashCollected: filteredTrips.reduce((sum, trip) => sum + trip[7], 0),
      onlinePayments: filteredTrips.reduce((sum, trip) => sum + trip[8], 0),
      totalToll: filteredTrips.reduce((sum, trip) => sum + (trip[5] || 0), 0)
    };

    // Group trips by date for detailed breakdown
    const tripsByDate = {};
    filteredTrips.forEach(trip => {
      const dateKey = new Date(trip[1]).toISOString().split('T')[0];
      if (!tripsByDate[dateKey]) {
        tripsByDate[dateKey] = [];
      }
      tripsByDate[dateKey].push({
        driver: trip[0],
        time: trip[2],
        tripKM: trip[3],
        amount: trip[4],
        toll: trip[5],
        paymentType: trip[6],
        cashCollected: trip[7],
        onlinePayment: trip[8],
        status: trip[9]
      });
    });

    return {
      summary: summary,
      details: tripsByDate
    };
  } catch (error) {
    console.error('Error generating earnings report:', error);
    throw new Error('Failed to generate earnings report');
  }
}

// Helper function to generate expenses report
function generateExpensesReport(driverId, timeFrame, startDate, endDate) {
  try {
    const expensesSheet = SpreadsheetApp.openById(SHEET_IDS.CNG_EXPENSES).getActiveSheet();
    const expenses = expensesSheet.getDataRange().getValues();
    const headers = expenses.shift(); // Remove header row

    // Filter and process expenses based on parameters
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense[1]);
      return (!driverId || expense[0] === driverId) &&
             (!startDate || expenseDate >= new Date(startDate)) &&
             (!endDate || expenseDate <= new Date(endDate));
    });

    // Calculate expenses summary
    const summary = {
      totalExpenses: filteredExpenses.length,
      totalAmount: filteredExpenses.reduce((sum, expense) => sum + expense[2], 0),
      pendingApproval: filteredExpenses.filter(expense => expense[5] === 'pending').length,
      approved: filteredExpenses.filter(expense => expense[5] === 'approved').length
    };

    // Group expenses by date for detailed breakdown
    const expensesByDate = {};
    filteredExpenses.forEach(expense => {
      const dateKey = new Date(expense[1]).toISOString().split('T')[0];
      if (!expensesByDate[dateKey]) {
        expensesByDate[dateKey] = [];
      }
      expensesByDate[dateKey].push({
        driver: expense[0],
        amount: expense[2],
        paidBy: expense[3],
        imageLink: expense[4],
        status: expense[5],
        adminApproval: expense[6],
        approvalDate: expense[7]
      });
    });

    return {
      summary: summary,
      details: expensesByDate
    };
  } catch (error) {
    console.error('Error generating expenses report:', error);
    throw new Error('Failed to generate expenses report');
  }
}