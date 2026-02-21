// App.jsx
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function App() {
  return (
    <BrowserRouter>
      <nav className="p-4 bg-slate-900 text-white flex justify-between">
        <Link to="/" className="font-bold">Purchase Tracker</Link>
        <AddInvoiceButton />
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/vendors/:year" element={<Vendors />} />
        <Route path="/invoices/:year/:vendor" element={<InvoiceList />} />
        <Route path="/invoice/:id" element={<InvoiceView />} />
      </Routes>
    </BrowserRouter>
  );
}

function AddInvoiceButton() {
  const nav = useNavigate();
  return (
    <button onClick={() => nav("/invoice/new")} className="bg-blue-600 px-4 py-2 rounded">
      + Add Invoice
    </button>
  );
}

/* ---------------- DASHBOARD ---------------- */
function Dashboard() {
  const [years, setYears] = useState([]);

  useEffect(() => {
    fetch(`${API}/reports/yearly`).then(r => r.json()).then(setYears);
  }, []);

  return (
    <Page title="Dashboard" exportUrl="/export/pdf">
      <table className="table">
        <thead><tr><th>Year</th><th>Total Purchase</th><th></th></tr></thead>
        <tbody>
          {years.map(y => (
            <tr key={y.year}>
              <td>{y.year}</td>
              <td>₹ {y.total_purchase}</td>
              <td><Link to={`/vendors/${y.year}`} className="link">View Vendors</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Page>
  );
}

/* ---------------- VENDORS ---------------- */
function Vendors() {
  const { year } = useParams();
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    fetch(`${API}/reports/vendors?year=${year}`).then(r => r.json()).then(setVendors);
  }, [year]);

  return (
    <Page title={`Vendors – ${year}`} exportUrl={`/export/excel?year=${year}`}>
      <table className="table">
        <thead><tr><th>Vendor</th><th>Total Purchase</th><th></th></tr></thead>
        <tbody>
          {vendors.map(v => (
            <tr key={v.vendor}>
              <td>{v.vendor}</td>
              <td>₹ {v.total_purchase}</td>
              <td><Link to={`/invoices/${year}/${encodeURIComponent(v.vendor)}`} className="link">View Invoices</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Page>
  );
}

/* ---------------- INVOICE LIST ---------------- */
function InvoiceList() {
  const { year, vendor } = useParams();
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetch(`${API}/reports/invoices?year=${year}&vendor=${vendor}`)
      .then(r => r.json())
      .then(setInvoices);
  }, [year, vendor]);

  return (
    <Page title={`Invoices – ${decodeURIComponent(vendor)}`}>
      <table className="table">
        <thead><tr><th>No</th><th>Date</th><th>Amount</th><th></th></tr></thead>
        <tbody>
          {invoices.map(i => (
            <tr key={i.invoice_id}>
              <td>{i.invoice_number}</td>
              <td>{i.invoice_date}</td>
              <td>₹ {i.amount}</td>
              <td><Link to={`/invoice/${i.invoice_id}`} className="link">View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Page>
  );
}

/* ---------------- INVOICE VIEW + ADD ---------------- */
function InvoiceView() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    if (id !== "new") fetch(`${API}/invoice/${id}`).then(r => r.json()).then(setInvoice);
  }, [id]);

  return (
    <Page title="Invoice">
      <InvoiceForm invoice={invoice} />
    </Page>
  );
}

/* ---------------- INVOICE FORM ---------------- */
function InvoiceForm({ invoice }) {
  const [data, setData] = useState(invoice || { items: [], totals: {} });

  const uploadBill = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API}/invoice/upload`, { method: "POST", body: fd });
    const json = await res.json();
    setData(json);
  };

  const addItem = () => setData({ ...data, items: [...data.items, {}] });
  const removeItem = (i) => setData({ ...data, items: data.items.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-4">
      <input type="file" onChange={e => uploadBill(e.target.files[0])} />

      <input className="input" placeholder="Invoice Number" value={data.invoice_number || ""} />
      <input className="input" placeholder="Vendor Name" value={data.vendor_name || ""} />

      <h3 className="font-semibold">Items</h3>
      {data.items.map((item, idx) => (
        <div key={idx} className="grid grid-cols-6 gap-2">
          <input placeholder="Item Name" value={item.item_name || ""} />
          <input placeholder="Qty" value={item.quantity || ""} />
          <input placeholder="Unit" value={item.unit || ""} />
          <input placeholder="Rate" value={item.rate_per_quantity || ""} />
          <input placeholder="Amount" value={item.amount || ""} />
          <button onClick={() => removeItem(idx)}>✕</button>
        </div>
      ))}
      <button onClick={addItem} className="btn">+ Add Item</button>

      <button className="btn-primary">Save Invoice</button>
    </div>
  );
}

/* ---------------- SHARED UI ---------------- */
function Page({ title, children, exportUrl }) {
  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">{title}</h1>
        {exportUrl && <a href={`${API}${exportUrl}`} className="btn">Export</a>}
      </div>
      {children}
    </div>
  );
}

/* Tailwind helpers assumed:
.btn { @apply px-3 py-2 border rounded }
.btn-primary { @apply bg-green-600 text-white px-4 py-2 rounded }
.input { @apply border p-2 w-full }
.link { @apply text-blue-600 underline }
.table { @apply w-full border }
*/
