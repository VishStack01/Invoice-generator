# Raum Invoice Generator

A minimal thermal-receipt style invoice generator inspired by the supplied reference image.

Features:
- Invoice form with line items, tax, discount, notes and payment status
- Live thermal-paper invoice preview
- Print / Save as PDF through the browser print dialog
- Saves invoice records to a configured Google Apps Script / Sheets webhook
- Local browser fallback when the sheet endpoint is not configured
- CSV export of locally stored invoices
- Responsive desktop/mobile UI

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Google Sheets

Create a Google Apps Script web app that accepts POST JSON and appends a row to a Google Sheet. Put the deployed web-app URL in:

```env
NEXT_PUBLIC_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/REPLACE_ME/exec
```

The app sends one JSON object per generated invoice. See `google-apps-script.gs` for the backend script and sheet columns.

## Deployment

The project is structured for Vercel/Netlify-style deployment from GitHub. Add `NEXT_PUBLIC_SHEETS_WEBHOOK_URL` as a production environment variable.
