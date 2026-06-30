const API_URL = '/api/invoices';

export const fetchInvoices = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch invoices');
  return res.json();
};

export const fetchInvoiceById = async (id) => {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch invoice');
  return res.json();
};

export const createInvoice = async (invoice) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoice),
  });
  if (!res.ok) throw new Error('Failed to create invoice');
  return res.json();
};

export const updateInvoice = async (id, invoice) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoice),
  });
  if (!res.ok) throw new Error('Failed to update invoice');
  return res.json();
};

export const deleteInvoice = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete invoice');
  return res.json();
};
