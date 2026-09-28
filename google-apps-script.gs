/**
 * Google Apps Script backend for the invoice generator.
 * Create a Google Sheet, open Extensions -> Apps Script, paste this file,
 * replace SHEET_NAME if needed, deploy as a Web App, and use the /exec URL
 * as NEXT_PUBLIC_SHEETS_WEBHOOK_URL.
 */

const SHEET_NAME = 'Invoices';

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Invoice No','Issue Date','Due Date','Seller','Customer','Email',
      'Currency','Subtotal','Tax','Discount','Total','Status','Items JSON','Notes','Created At'
    ]);
  }

  sheet.appendRow([
    data.invoiceNo || '',
    data.date || '',
    data.dueDate || '',
    data.seller || '',
    data.customer || '',
    data.email || '',
    data.currency || '',
    data.subtotal || 0,
    data.tax || 0,
    data.discount || 0,
    data.total || 0,
    data.status || '',
    JSON.stringify(data.items || []),
    data.notes || '',
    new Date()
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'invoice-sheet-webhook' }))
    .setMimeType(ContentService.MimeType.JSON);
}
