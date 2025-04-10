# Complete Setup Guide for Driver Management System

## 1. Google Apps Script Backend Setup

### Initial Setup
1. Go to [Google Apps Script](https://script.google.com)
2. Create a new project named "Driver-Management-Backend"
3. Create required Google Sheets:
   ```
   - Users Sheet
   - Trips Sheet
   - CNG Expenses Sheet
   - OD Log Sheet
   - Complaints Sheet
   - Advance Sheet
   - Login Logs Sheet
   ```

### Configure Script Properties
1. In Google Apps Script editor, go to Project Settings (⚙️)
2. Under 'Script Properties', add the following:
   ```
   USERS_SHEET_ID=<your-users-sheet-id>
   TRIPS_SHEET_ID=<your-trips-sheet-id>
   CNG_EXPENSES_SHEET_ID=<your-cng-expenses-sheet-id>
   OD_LOG_SHEET_ID=<your-od-log-sheet-id>
   COMPLAINTS_SHEET_ID=<your-complaints-sheet-id>
   ADVANCE_SHEET_ID=<your-advance-sheet-id>
   LOGIN_LOGS_SHEET_ID=<your-login-logs-sheet-id>
   TOKEN_SECRET=<your-secure-random-string>
   ```

### Deploy the Backend
1. Click 'Deploy' > 'New deployment'
2. Choose 'Web app'
3. Set the following:
   - Description: "Driver Management System API"
   - Execute as: "Me"
   - Who has access: "Anyone"
4. Click 'Deploy'
5. Authorize the application
6. Copy the deployment URL

## 2. Frontend Configuration

### Update API Configuration
1. Open `src/config/config.js`
2. Update the API URL:
   ```javascript
   export const config = {
     API_URL: 'YOUR_GOOGLE_APPS_SCRIPT_DEPLOYMENT_URL',
     API: {
       TIMEOUT: 30000,
       RETRY_COUNT: 3
     }
   };
   ```

## 3. GitHub Repository Setup

### Initialize Repository
1. Create a new repository on GitHub
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/driver-management-systems.git
   git push -u origin main
   ```

### Configure GitHub Pages
1. Go to repository Settings
2. Navigate to Pages section
3. Under "Source", select:
   - Branch: main
   - Folder: dist
4. Click Save

## 4. Environment Setup

### Create Environment Files
1. Create `.env` in project root:
   ```env
   VITE_APP_TITLE=Driver Management System
   VITE_APP_API_URL=YOUR_GOOGLE_APPS_SCRIPT_URL
   ```

## 5. Deployment

### Deploy Frontend
1. Build the project:
   ```bash
   npm install
   npm run build
   ```
2. Push to GitHub:
   ```bash
   git add .
   git commit -m "Deploy frontend"
   git push
   ```

### Verify Deployment
1. Check GitHub Actions tab for build status
2. Wait for deployment to complete
3. Access your site at: `https://YOUR_USERNAME.github.io/driver-management-systems`

## 6. Security Checklist

### Backend Security
- [x] Implement session management
- [x] Set up CORS headers
- [x] Configure rate limiting
- [x] Implement secure password hashing
- [x] Set up proper error handling

### Frontend Security
- [x] Secure API communication
- [x] Implement token-based authentication
- [x] Handle session expiration
- [x] Protect sensitive routes

## 7. Testing

### Test Authentication Flow
1. Register a new user
2. Login with credentials
3. Verify session persistence
4. Test logout functionality

### Test API Endpoints
1. Test all CRUD operations
2. Verify error handling
3. Check rate limiting
4. Test session management

## 8. Troubleshooting

### Common Issues
1. CORS Errors
   - Verify CORS headers in Google Apps Script
   - Check API URL configuration

2. Authentication Issues
   - Clear browser cache and local storage
   - Verify API endpoint configuration
   - Check session token handling

3. Deployment Issues
   - Verify GitHub Actions workflow
   - Check build configuration
   - Validate environment variables

### Getting Help
- Check GitHub Issues
- Review Google Apps Script logs
- Consult documentation