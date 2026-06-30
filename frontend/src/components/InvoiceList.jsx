import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Eye } from 'lucide-react';
import { fetchInvoices, deleteInvoice } from '../api';

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const data = await fetchInvoices();
      setInvoices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteInvoice(id);
        setInvoices(invoices.filter((inv) => inv.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) return <div>Loading invoices...</div>;

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Your Invoices</h2>
      </div>

      {invoices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <p>No invoices found. Create your first invoice!</p>
          <Link to="/create" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Create Invoice
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice No.</th>
                <th>Client</th>
                <th>Date</th>
                <th>Total Amt</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.invoiceNumber}</td>
                  <td>{inv.clientName}</td>
                  <td>{inv.date}</td>
                  <td>Rs. {inv.grandTotal?.toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/preview/${inv.id}`} className="btn-icon btn-secondary" title="View/Export">
                        <Eye size={16} />
                      </Link>
                      <Link to={`/edit/${inv.id}`} className="btn-icon btn-secondary" title="Edit">
                        <Edit size={16} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(inv.id)} 
                        className="btn-icon btn-danger"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
