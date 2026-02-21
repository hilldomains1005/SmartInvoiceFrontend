# Invoice Management System

A modern React-based invoice management system that integrates with your Node.js backend for managing purchase invoices with bill upload and extraction capabilities.

## Features

- **Dashboard**: View yearly purchase summaries
- **Vendor Management**: Browse vendors and their purchase amounts by year
- **Invoice List**: View all invoices for a specific vendor and year
- **Invoice Details**: Complete invoice information with itemized breakdown
- **Bill Upload**: Upload bills (images/PDFs) and auto-extract data into forms
- **Manual Entry**: Fill invoice forms manually
- **Dynamic Items**: Add or remove invoice items as needed
- **Export**: Export all invoices to Excel

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```
VITE_API_BASE_URL=http://localhost:5000
```

Replace `http://localhost:5000` with your backend API URL.

### 3. Start Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173` (or another available port).

### 4. Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

## Backend API Requirements

Your backend must implement these endpoints:

### Upload Routes
- `POST /upload` - Upload bill file (multipart/form-data with field name "bill")

### Invoice Routes
- `POST /invoices` - Create new invoice
- `GET /invoices/:id` - Get invoice by ID
- `GET /invoices?year=YYYY&vendor=VendorName` - Get invoices by year and vendor

### Report Routes
- `GET /report/yearly` - Get yearly purchase report
- `GET /report/vendors?year=YYYY` - Get vendor report for a year

### Export Routes
- `GET /export/excel` - Export all invoices to Excel

## Application Structure

```
src/
├── components/
│   ├── Layout.tsx           # Main layout with navigation
│   └── AddInvoiceModal.tsx  # Invoice creation modal
├── pages/
│   ├── Dashboard.tsx        # Yearly overview
│   ├── Vendors.tsx          # Vendor list by year
│   ├── InvoiceList.tsx      # Invoice list by vendor
│   └── InvoiceDetail.tsx    # Invoice detail view
├── services/
│   └── api.ts               # API service layer
├── config/
│   └── api.ts               # API configuration
└── App.tsx                  # Main app with routing
```

## Usage

1. **View Dashboard**: The dashboard shows all years with their total purchase amounts
2. **Select Year**: Click on a year to view vendors for that year
3. **Select Vendor**: Click on a vendor to view their invoices
4. **View Invoice**: Click on an invoice to see full details
5. **Add Invoice**: Click "Add Invoice" button (available on all pages)
   - Upload a bill image/PDF to auto-extract data
   - Or manually fill the form
   - Add/remove items as needed
6. **Export Data**: Click "Export" button to download Excel file

## Technologies Used

- React 18
- TypeScript
- React Router DOM
- Tailwind CSS
- Lucide React (icons)
- Vite

## Notes

- The application expects invoice dates in a format that can be parsed by JavaScript's `Date` constructor
- Currency formatting is set to INR (Indian Rupees)
- The application automatically refreshes data after adding a new invoice
- File uploads support both images and PDF files
