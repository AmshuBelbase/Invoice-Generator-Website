import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2, Save, X, ArrowUp, ArrowDown } from 'lucide-react';
import { fetchInvoiceById, createInvoice, updateInvoice } from '../api';

const defaultInvoice = {
  id: '',
  invoiceNumber: '',
  date: new Date().toISOString().split('T')[0],
  // User Details
  userName: '',
  userAddress: '',
  userPhone: '',
  userPan: '',
  // Client Details
  clientName: '',
  clientAddress: '',
  // Services
  items: [{ id: uuidv4(), description: '', quantity: 1, rate: 0 }],
  // Payment Details
  bankName: '',
  accountName: '',
  accountNumber: '',
  // Settings
  tdsRate: 15, // default 15%
  advancePayment: 0,
};

export default function InvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(defaultInvoice);
  const [loading, setLoading] = useState(id ? true : false);

  useEffect(() => {
    if (id) {
      loadInvoice();
    } else {
      setInvoice({ ...defaultInvoice, id: uuidv4(), invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}` });
    }
  }, [id]);

  const loadInvoice = async () => {
    try {
      const data = await fetchInvoiceById(id);
      setInvoice(data);
    } catch (err) {
      console.error(err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvoice((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (itemId, field, value) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addItem = () => {
    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, { id: uuidv4(), description: '', quantity: 1, rate: 0 }],
    }));
  };

  const removeItem = (itemId) => {
    if (invoice.items.length === 1) return; // keep at least one
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  };

  const moveItemUp = (index) => {
    if (index === 0) return;
    setInvoice((prev) => {
      const newItems = [...prev.items];
      const temp = newItems[index];
      newItems[index] = newItems[index - 1];
      newItems[index - 1] = temp;
      return { ...prev, items: newItems };
    });
  };

  const moveItemDown = (index) => {
    if (index === invoice.items.length - 1) return;
    setInvoice((prev) => {
      const newItems = [...prev.items];
      const temp = newItems[index];
      newItems[index] = newItems[index + 1];
      newItems[index + 1] = temp;
      return { ...prev, items: newItems };
    });
  };

  const calculateTotals = () => {
    const subtotal = invoice.items.reduce(
      (acc, item) => acc + (Number(item.quantity) * Number(item.rate) || 0),
      0
    );
    const tdsAmount = (subtotal * Number(invoice.tdsRate)) / 100;
    const advance = Number(invoice.advancePayment) || 0;
    const totalDue = subtotal - advance;
    const grandTotal = subtotal + tdsAmount;
    return { subtotal, tdsAmount, advance, totalDue, grandTotal };
  };

  const { subtotal, tdsAmount, advance, totalDue, grandTotal } = calculateTotals();

  const handleSave = async (e) => {
    e.preventDefault();
    const finalInvoice = { ...invoice, subtotal, tdsAmount, grandTotal, totalDue };
    try {
      if (id) {
        await updateInvoice(id, finalInvoice);
      } else {
        await createInvoice(finalInvoice);
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Failed to save invoice');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSave} className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>{id ? 'Edit Invoice' : 'Create Invoice'}</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="button" onClick={() => navigate('/')} className="btn btn-secondary">
            <X size={18} /> Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <Save size={18} /> Save Invoice
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Your Details */}
        <div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Your Details</h3>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input required type="text" name="userName" value={invoice.userName} onChange={handleChange} className="form-input" placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input type="text" name="userAddress" value={invoice.userAddress} onChange={handleChange} className="form-input" placeholder="Kathmandu, Nepal" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="text" name="userPhone" value={invoice.userPhone} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Personal PAN</label>
              <input required type="text" name="userPan" value={invoice.userPan} onChange={handleChange} className="form-input" />
            </div>
          </div>
        </div>

        {/* Client Details */}
        <div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--accent-color)' }}>Client Details</h3>
          <div className="form-group">
            <label className="form-label">Client / College Name</label>
            <input required type="text" name="clientName" value={invoice.clientName} onChange={handleChange} className="form-input" placeholder="XYZ College" />
          </div>
          <div className="form-group">
            <label className="form-label">Client Address</label>
            <input type="text" name="clientAddress" value={invoice.clientAddress} onChange={handleChange} className="form-input" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Invoice Number</label>
              <input required type="text" name="invoiceNumber" value={invoice.invoiceNumber} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input required type="date" name="date" value={invoice.date} onChange={handleChange} className="form-input" />
            </div>
          </div>
        </div>
      </div>

      <hr style={{ borderColor: 'var(--border-color)', margin: '2rem 0' }} />

      {/* Itemized Services */}
      <h3 style={{ marginBottom: '1rem' }}>Itemized Services</h3>
      <div className="table-container" style={{ marginBottom: '1rem' }}>
        <table className="table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: '50%' }}>Description</th>
              <th style={{ width: '15%' }}>Qty</th>
              <th style={{ width: '20%' }}>Rate (Rs.)</th>
              <th style={{ width: '15%' }}>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={item.id}>
                <td>
                  <input required type="text" value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} className="form-input" placeholder="Website, Social Media..." />
                </td>
                <td>
                  <input required type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} className="form-input" />
                </td>
                <td>
                  <input required type="number" min="0" value={item.rate} onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)} className="form-input" />
                </td>
                <td style={{ verticalAlign: 'middle', fontWeight: '500' }}>
                  Rs. {((Number(item.quantity) * Number(item.rate)) || 0).toLocaleString()}
                </td>
                <td style={{ display: 'flex', gap: '5px' }}>
                  <button type="button" onClick={() => moveItemUp(index)} className="btn-icon" style={{ background: '#e9ecef', color: '#495057' }} disabled={index === 0} title="Move Up">
                    <ArrowUp size={16} />
                  </button>
                  <button type="button" onClick={() => moveItemDown(index)} className="btn-icon" style={{ background: '#e9ecef', color: '#495057' }} disabled={index === invoice.items.length - 1} title="Move Down">
                    <ArrowDown size={16} />
                  </button>
                  <button type="button" onClick={() => removeItem(item.id)} className="btn-icon btn-danger" disabled={invoice.items.length === 1} title="Remove">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={addItem} className="btn btn-secondary" style={{ marginBottom: '2rem' }}>
        <Plus size={16} /> Add Item
      </button>

      <hr style={{ borderColor: 'var(--border-color)', margin: '2rem 0' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Payment Details */}
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Payment Details</h3>
          <div className="form-group">
            <label className="form-label">Bank Name</label>
            <input required type="text" name="bankName" value={invoice.bankName} onChange={handleChange} className="form-input" placeholder="Nepal Bank Ltd" />
          </div>
          <div className="form-group">
            <label className="form-label">Account Name</label>
            <input required type="text" name="accountName" value={invoice.accountName} onChange={handleChange} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Account Number</label>
            <input required type="text" name="accountNumber" value={invoice.accountNumber} onChange={handleChange} className="form-input" />
          </div>
        </div>

        {/* Totals */}
        <div>
          {/* Box 1: Provider Payable (HIGHLIGHTED) */}
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--accent-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: '500' }}>Rs. {subtotal.toLocaleString()}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
              <span>Advance Payment:</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="number" name="advancePayment" value={invoice.advancePayment} onChange={handleChange} className="form-input" style={{ width: '100px', padding: '0.25rem' }} />
              </span>
            </div>
            {advance > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--danger-color)' }}>- Rs. {advance.toLocaleString()}</span>
              </div>
            )}

            <hr style={{ borderColor: 'rgba(16, 185, 129, 0.3)', margin: '1rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.5rem', color: 'var(--accent-color)' }}>
              <span>Total Due (To You):</span>
              <span>Rs. {totalDue.toLocaleString()}</span>
            </div>
          </div>

          {/* Box 2: Tax & Gross Total (DE-EMPHASIZED) */}
          <div style={{ padding: '0.5rem 1.5rem', opacity: 0.7, fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                TDS on Subtotal (Optional):
                <input type="number" name="tdsRate" value={invoice.tdsRate} onChange={handleChange} className="form-input" style={{ width: '60px', padding: '0.15rem', fontSize: '0.8rem' }} /> %
              </span>
              <span>+ Rs. {tdsAmount.toLocaleString()}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '500', color: 'var(--text-muted)' }}>
              <span>Gross Total Amount (Including TDS):</span>
              <span>Rs. {grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
