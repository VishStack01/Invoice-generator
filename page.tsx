'use client';

import { useMemo, useState } from 'react';

type Item = { description: string; qty: number; rate: number };

type Invoice = {
  invoiceNo: string;
  date: string;
  dueDate: string;
  seller: string;
  customer: string;
  email: string;
  currency: string;
  taxRate: number;
  discount: number;
  status: string;
  notes: string;
  items: Item[];
  subtotal: number;
  tax: number;
  total: number;
};

const today = new Date().toISOString().slice(0, 10);

const initialItems: Item[] = [
  { description: 'Design / Service', qty: 1, rate: 0 }
];

function money(n: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 2
    }).format(n);
  } catch {
    return `${currency || 'INR'} ${n.toFixed(2)}`;
  }
}

export default function Home() {
  const [invoiceNo, setInvoiceNo] = useState(`INV-${new Date().getFullYear()}-001`);
  const [date, setDate] = useState(today);
  const [dueDate, setDueDate] = useState(today);
  const [seller, setSeller] = useState('Your Business');
  const [customer, setCustomer] = useState('');
  const [email, setEmail] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [taxRate, setTaxRate] = useState(18);
  const [discount, setDiscount] = useState(0);
  const [status, setStatus] = useState('Unpaid');
  const [notes, setNotes] = useState('Thank you for your business.');
  const [items, setItems] = useState<Item[]>(initialItems);
  const [saved, setSaved] = useState(false);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.rate || 0), 0);
    const discountAmount = Math.max(0, Number(discount || 0));
    const taxable = Math.max(0, subtotal - discountAmount);
    const tax = taxable * (Number(taxRate || 0) / 100);
    return { subtotal, discount: discountAmount, taxable, tax, total: taxable + tax };
  }, [items, taxRate, discount]);

  function updateItem(index: number, patch: Partial<Item>) {
    setItems(current => current.map((item, i) => i === index ? { ...item, ...patch } : item));
  }

  function addItem() {
    setItems(current => [...current, { description: 'New item', qty: 1, rate: 0 }]);
  }

  function removeItem(index: number) {
    setItems(current => current.length === 1 ? current : current.filter((_, i) => i !== index));
  }

  async function saveInvoice() {
    const invoice: Invoice = {
      invoiceNo, date, dueDate, seller, customer, email, currency, taxRate,
      discount, status, notes, items, subtotal: totals.subtotal, tax: totals.tax, total: totals.total
    };

    const existing = JSON.parse(localStorage.getItem('raum_invoices') || '[]');
    localStorage.setItem('raum_invoices', JSON.stringify([invoice, ...existing]));

    const webhook = process.env.NEXT_PUBLIC_SHEETS_WEBHOOK_URL;
    if (webhook) {
      try {
        await fetch(webhook, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(invoice)
        });
      } catch {}
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  function exportCsv() {
    const invoices: Invoice[] = JSON.parse(localStorage.getItem('raum_invoices') || '[]');
    const rows = [
      ['Invoice No','Date','Due Date','Seller','Customer','Email','Currency','Subtotal','Tax','Discount','Total','Status'],
      ...invoices.map(i => [i.invoiceNo,i.date,i.dueDate,i.seller,i.customer,i.email,i.currency,i.subtotal,i.tax,i.discount,i.total,i.status])
    ];
    const csv = rows.map(row => row.map(v => `"${String(v ?? '').replaceAll('"','""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'invoices.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <div className="brand">raum<span>.</span></div>
          <div className="eyebrow">INVOICE GENERATOR</div>
        </div>
        <div className="top-actions">
          <button className="ghost" onClick={exportCsv}>export sheet</button>
          <button className="primary" onClick={saveInvoice}>{saved ? 'saved ✓' : 'save invoice'}</button>
        </div>
      </header>

      <section className="workspace">
        <div className="panel form-panel">
          <div className="section-title"><span>01</span> invoice details</div>
          <div className="grid two">
            <label>invoice no<input value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} /></label>
            <label>status<select value={status} onChange={e => setStatus(e.target.value)}><option>Unpaid</option><option>Paid</option><option>Partially Paid</option><option>Overdue</option></select></label>
            <label>issue date<input type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
            <label>due date<input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></label>
            <label>currency<select value={currency} onChange={e => setCurrency(e.target.value)}><option>INR</option><option>USD</option><option>EUR</option><option>GBP</option><option>AED</option></select></label>
            <label>tax %<input type="number" min="0" step="0.01" value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} /></label>
          </div>

          <div className="section-title"><span>02</span> people</div>
          <div className="grid two">
            <label>from<input value={seller} onChange={e => setSeller(e.target.value)} /></label>
            <label>bill to<input value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Customer / Company" /></label>
            <label className="wide">customer email<input value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" /></label>
          </div>

          <div className="section-title"><span>03</span> line items</div>
          <div className="items">
            <div className="item-head"><span>description</span><span>qty</span><span>rate</span><span></span></div>
            {items.map((item, index) => (
              <div className="item-row" key={index}>
                <input value={item.description} onChange={e => updateItem(index, { description: e.target.value })} />
                <input type="number" min="0" step="1" value={item.qty} onChange={e => updateItem(index, { qty: Number(e.target.value) })} />
                <input type="number" min="0" step="0.01" value={item.rate} onChange={e => updateItem(index, { rate: Number(e.target.value) })} />
                <button className="remove" onClick={() => removeItem(index)}>×</button>
              </div>
            ))}
            <button className="add" onClick={addItem}>+ add item</button>
          </div>

          <div className="grid two">
            <label>discount<input type="number" min="0" step="0.01" value={discount} onChange={e => setDiscount(Number(e.target.value))} /></label>
            <label>notes<textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} /></label>
          </div>
        </div>

        <div className="preview-area">
          <div className="preview-label">LIVE PREVIEW · THERMAL ROLL</div>
          <div className="phone">
            <div className="phone-bar"><span>9:41</span><span>•••</span></div>
            <div className="paper">
              <div className="tear">▼<br/>▼<br/>▼</div>
              <div className="paper-brand">{seller || 'raum'}<b>.</b></div>
              <div className="paper-sub">INVOICE · STATEMENT OF PAYMENT</div>
              <div className="paper-meta"><span>{invoiceNo}</span><span>{date}</span></div>
              <div className="rule" />
              <div className="receipt-grid">
                <span>bill to.</span><strong>{customer || 'anonymous'}</strong>
                <span>email.</span><strong>{email || '—'}</strong>
                <span>due.</span><strong>{dueDate}</strong>
                <span>status.</span><strong>{status.toLowerCase()}</strong>
              </div>
              <div className="rule dotted" />
              <div className="receipt-items">
                {items.map((item, i) => (
                  <div className="receipt-item" key={i}>
                    <span>{item.description || 'item'} × {item.qty}</span>
                    <strong>{money(Number(item.qty || 0) * Number(item.rate || 0), currency)}</strong>
                  </div>
                ))}
              </div>
              <div className="rule dotted" />
              <div className="receipt-totals">
                <span>subtotal.</span><strong>{money(totals.subtotal, currency)}</strong>
                <span>discount.</span><strong>{money(totals.discount, currency)}</strong>
                <span>tax.</span><strong>{money(totals.tax, currency)}</strong>
              </div>
              <div className="total-line"><span>TOTAL</span><strong>{money(totals.total, currency)}</strong></div>
              <div className="stamp">{status === 'Paid' ? 'PAYMENT VERIFIED' : 'PAYMENT DUE'}</div>
              <div className="paper-note">{notes}</div>
              <div className="paper-footer">READY. <span>THERMAL ROLL · #{invoiceNo.slice(-6)}</span></div>
            </div>
            <div className="phone-bottom">
              <button className="ghost" onClick={() => window.print()}>print again ↗</button>
              <button className="primary" onClick={saveInvoice}>{saved ? 'saved ✓' : 'save invoice'}</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
