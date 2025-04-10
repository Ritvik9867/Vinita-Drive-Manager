# Detailed Deployment Guide

## Part 1: GitHub Setup

### 1. Set Up GitHub Desktop
1. Download and install GitHub Desktop from https://desktop.github.com/
2. Launch GitHub Desktop
3. Sign in to your GitHub account if you haven't already

### 2. Create a Local Repository
1. In GitHub Desktop, click 'File' > 'New Repository' (or press Ctrl+N)
2. Fill in:
   - Name: driver-management-systems
   - Local path: Choose your project folder
   - Description (optional)
   - Initialize with a README (uncheck if you already have one)
3. Click 'Create Repository'

### 3. Publish Repository to GitHub
1. In GitHub Desktop, click 'Publish repository'
2. Configure settings:
   - Repository name: driver-management-systems
   - Description (optional)
   - Keep 'Keep this code private' checked if you want a private repository
3. Click 'Publish Repository'

### 4. Commit and Push Changes
1. In GitHub Desktop:
   - Review changed files in the 'Changes' tab
   - Enter a summary and description for your commit
   - Click 'Commit to main'
2. Click 'Push origin' to upload your code to GitHub

### 4. Configure GitHub Pages
1. Go to repository Settings
2. Navigate to 'Pages' in the left sidebar
3. Under 'Source':
   - Select 'GitHub Actions'
   - Choose 'Static HTML'
4. Commit the workflow file to your repository

## Part 2: Google Apps Script Setup

### 1. Create New Google Apps Script Project
1. Go to script.google.com
2. Click '+ New project'
3. Rename project to 'Driver-Management-Backend'

### 2. Set Up Backend Files
1. In the Google Apps Script editor:
   - Copy content from your local `backend/Code.gs` to the editor
   - Create new file named `config.gs`
   - Copy content from your local `backend/config.gs`

### 3. Configure Project Settings
1. Click on ⚙️ (Project Settings)
2. Under 'Script Properties':
   - Add necessary configuration variables
   - Keep sensitive data here instead of in code

### 4. Deploy Web App
1. Click 'Deploy' > 'New deployment'
2. Choose 'Web app'
3. Configure settings:
   - Description: 'Driver Management System API'
   - Execute as: 'Me'
   - Who has access: 'Anyone'
4. Click 'Deploy'
5. Authorize the application when prompted
6. Copy the deployment URL

### 5. Update Frontend Configuration
1. Open `src/config/config.js`
2. Update the API_URL with your Google Apps Script deployment URL:
```javascript
export const config = {
  API_URL: 'YOUR_GOOGLE_APPS_SCRIPT_DEPLOYMENT_URL',
  // ... other config
};
```

## Part 3: Security and CORS Setup

### 1. Configure CORS in Google Apps Script
In `Code.gs`, ensure you have proper CORS headers:
```javascript
function doPost(e) {
  var headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  // ... rest of your code
}
```

### 2. Set Up Environment Variables
1. Create `.env` file in root directory
2. Add necessary environment variables:
```env
VITE_APP_TITLE=Driver Management System
VITE_APP_API_URL=YOUR_GOOGLE_APPS_SCRIPT_URL
```

## Part 4: Deployment Verification

### 1. Test Backend API
1. Deploy Google Apps Script
2. Test endpoints using Postman or similar tool
3. Verify CORS is working correctly

### 2. Test Frontend Deployment
1. Build the project locally:
```bash
npm run build
```
2. Test the production build:
```bash
npm run preview
```
3. Verify all features work as expected

### 3. Monitor Deployment
1. Check GitHub Actions for build status
2. Verify the deployed site works correctly
3. Test authentication flow
4. Monitor Google Apps Script logs for backend issues

## Troubleshooting

### Common Issues and Solutions

1. CORS Errors
- Verify CORS headers in Google Apps Script
- Check if API URL is correct in frontend config
- Ensure proper protocol (https) is used

2. Authentication Issues
- Check if Google Apps Script deployment settings are correct
- Verify API permissions and access settings
- Clear browser cache and local storage

3. Deployment Failures
- Check GitHub Actions logs for errors
- Verify all environment variables are set correctly
- Ensure build commands complete successfully

### Getting Help
- Check GitHub Issues for similar problems
- Review Google Apps Script documentation
- Consult the project's README for specific guidance