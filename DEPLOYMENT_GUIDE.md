# Deployment Guide

## GitHub Pages Setup
1. Create new repository named `driver-management-systems`
2. Push built code to `gh-pages` branch:
```bash
git checkout --orphan gh-pages
git rm -rf .
npm run build
git add dist/
git commit -m "Deploy"
git push origin gh-pages
```
3. Enable GitHub Pages in repo settings (Source: gh-pages branch /docs folder)

## Google Apps Script Deployment
1. Publish > Deploy as web app
2. Set:
   - Execute as: Me
   - Who has access: Anyone
3. Copy web app URL and update `config.js`

## Google Sheets Setup
1. Create sheets from template: [LINK TO TEMPLATE]
2. Replace sheet IDs in `backend/config.gs`
3. Enable Google Sheets API in Script Editor

## Environment Variables
Add these to GitHub Secrets:
- `SHEET_IDS`: JSON of your sheet IDs
- `GAS_DEPLOY_ID`: Your Apps Script deployment ID