# Git Setup Guide for Driver Management System

## File-by-File Setup Guide

### 1. Root Directory Files

#### .gitignore
This file is already properly configured to exclude:
- Dependencies (node_modules/, .pnp, .pnp.js)
- Build outputs (build/, dist/)
- Environment files (.env*)
- IDE files (.vscode/, .idea/)
- System files and logs

#### package.json & package-lock.json
- These files should be committed as they define project dependencies
- Ensure all dependencies are properly listed

#### Configuration Files
- `vite.config.js`: Include this as it defines build configuration
- `capacitor.config.ts`: Include for mobile build settings

### 2. Source Code (/src)

#### React Components and Pages
- All files under /src should be committed:
  - App.jsx
  - main.jsx
  - components/Layout.jsx
  - pages/Login.jsx, Register.jsx
  - contexts/AuthContext.jsx
  - theme/theme.js
  - config/config.js (ensure no sensitive data)

### 3. Backend Files

#### Google Apps Script Files
- `backend/Code.gs`: Include all backend logic
- `backend/config.gs`: **IMPORTANT**: Remove any sensitive information before committing

### 4. GitHub Workflow

#### .github/workflows
- `deploy.yml`: Include for CI/CD configuration

## Step-by-Step Git Commands

1. Initialize Git Repository (if not already done)
   ```bash
   git init
   ```

2. Configure Git (if not already done)
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

3. Stage Files
   ```bash
   # Stage all files (respecting .gitignore)
   git add .
   ```

4. Create Initial Commit
   ```bash
   git commit -m "Initial commit: Driver Management System"
   ```

5. Connect to GitHub
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/driver-management-systems.git
   ```

6. Push to GitHub
   ```bash
   git branch -M main
   git push -u origin main
   ```

## Important Notes

1. **Environment Variables**
   - Never commit .env files
   - Create a .env.example with dummy values as a template

2. **Sensitive Information**
   - Double-check config files for API keys or secrets
   - Use environment variables for sensitive data

3. **Large Files**
   - Avoid committing large binary files
   - Use Git LFS if necessary for large assets

4. **Node Modules**
   - Never commit node_modules directory
   - Use package.json for dependency management

## Regular Development Workflow

1. Create Feature Branch
   ```bash
   git checkout -b feature/new-feature
   ```

2. Make Changes and Commit
   ```bash
   git add .
   git commit -m "Add new feature: description"
   ```

3. Push Changes
   ```bash
   git push origin feature/new-feature
   ```

4. Create Pull Request
   - Use GitHub's interface to create PR
   - Add appropriate description and reviewers

## Deployment

Refer to DEPLOYMENT_GUIDE.md for detailed deployment instructions after setting up Git.