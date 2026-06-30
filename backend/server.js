const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

const dataFilePath = path.join(__dirname, 'invoices.txt');

// Helper to read data
const readData = () => {
  if (!fs.existsSync(dataFilePath)) {
    return [];
  }
  const fileContent = fs.readFileSync(dataFilePath, 'utf8');
  if (!fileContent.trim()) {
    return [];
  }
  try {
    return JSON.parse(fileContent);
  } catch (err) {
    console.error("Error parsing invoices.txt", err);
    return [];
  }
};

// Helper to write data
const writeData = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
};

// GET all invoices
app.get('/api/invoices', (req, res) => {
  const invoices = readData();
  res.json(invoices);
});

// GET single invoice
app.get('/api/invoices/:id', (req, res) => {
  const invoices = readData();
  const invoice = invoices.find(inv => inv.id === req.params.id);
  if (invoice) {
    res.json(invoice);
  } else {
    res.status(404).json({ error: 'Invoice not found' });
  }
});

// POST new invoice
app.post('/api/invoices', (req, res) => {
  const invoices = readData();
  const newInvoice = {
    ...req.body,
    createdAt: new Date().toISOString()
  };
  invoices.push(newInvoice);
  writeData(invoices);
  res.status(201).json(newInvoice);
});

// PUT update invoice
app.put('/api/invoices/:id', (req, res) => {
  const invoices = readData();
  const index = invoices.findIndex(inv => inv.id === req.params.id);
  if (index !== -1) {
    invoices[index] = { ...invoices[index], ...req.body };
    writeData(invoices);
    res.json(invoices[index]);
  } else {
    res.status(404).json({ error: 'Invoice not found' });
  }
});

// DELETE invoice
app.delete('/api/invoices/:id', (req, res) => {
  let invoices = readData();
  const initialLength = invoices.length;
  invoices = invoices.filter(inv => inv.id !== req.params.id);
  if (invoices.length < initialLength) {
    writeData(invoices);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Invoice not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
