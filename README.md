# Professional Invoice Generator

A custom, beautifully designed web application built to generate professional service invoices. Tailored specifically for freelancers, this app features a sleek glassmorphism UI, automatic tax (TDS) and advance payment calculations, and a high-fidelity 1-click PDF export system.

## 🚀 Purpose

This tool was created to provide a fast, private, and highly professional way to bill clients. 
Unlike bloated SaaS platforms, this app stores all invoice data completely locally in a secure text file, ensuring that sensitive financial details are never sent to third-party databases. It natively handles complex deductions like advance payments and conditional government TDS requirements.

## 🛠️ Tech Stack

### Frontend
* **React** (via **Vite**): Fast, component-based user interface.
* **Vanilla CSS**: Custom styling featuring modern glassmorphism aesthetics and carefully tailored color palettes.
* **html2pdf.js**: Powers the 100% WYSIWYG, single-page PDF generation engine.
* **Lucide React**: Clean, modern iconography.

### Backend & Persistence
* **Node.js & Express**: Lightweight REST API handling CRUD operations.
* **Local Flat-File DB**: Uses Node's native `fs` module to securely read and write JSON data to a local `invoices.txt` file, completely eliminating the need for complex database setups (like MongoDB).

## 📋 Features

- **Dashboard:** View, track, and manage all previously generated invoices.
- **Dynamic Calculations:** Automatically computes Subtotals, Advance Payments, conditional TDS liabilities, and Final Due amounts.
- **Item Reordering:** Easily rearrange invoice line items with Up/Down controls.
- **True-to-life Preview:** Uses an embedded browser iframe to show you *exactly* what the exported PDF will look like before you save it.
- **Smart PDF Engine:** Prevents awkward page breaks by keeping logic blocks (like totals and notes) perfectly intact across A4 pages.

## ⚙️ How to Use (Local Setup)

To run this application locally on your machine, you will need to start both the backend server and the frontend development server.

### 1. Start the Backend
Open a terminal and run the following commands:
```bash
cd backend
npm install
node server.js
```
*The backend API will start running on http://localhost:3001*

### 2. Start the Frontend
Open a second, separate terminal and run:
```bash
cd frontend
npm install
npm run dev
```
*The React app will start running on http://localhost:5173*

### 3. Generate Invoices
Open `http://localhost:5173` in your browser. 
- Click **"Create Invoice"** to draft a new bill.
- Fill out your details, the client's details, and the services provided.
- Click **"Save Invoice"** to securely write the data to your local `invoices.txt` file.
- Click **"Preview"** to verify the PDF layout, and click **"Export as PDF"** to save it to your computer!

---
*Note: Your invoice data is strictly local. A `.gitignore` file is included to ensure `backend/invoices.txt` is never uploaded if you push this code to a public repository.*
