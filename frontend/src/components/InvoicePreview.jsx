import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { fetchInvoiceById } from '../api';

export default function InvoicePreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    loadInvoice();
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

  useEffect(() => {
    if (invoice && printRef.current) {
      generatePdfPreview();
    }
  }, [invoice]);

  const generatePdfPreview = async () => {
    setIsGenerating(true);
    const element = printRef.current;
    const opt = {
      margin: [10, 10, 0, 10], // top, right, bottom, left
      filename: `${invoice.invoiceNumber || 'Invoice'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, windowWidth: 800 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };
    try {
      const worker = html2pdf().set(opt).from(element);
      const url = await worker.output('bloburl');
      setPdfUrl(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = () => {
    const element = printRef.current;
    const opt = {
      margin: [10, 10, 0, 10],
      filename: `${invoice.invoiceNumber || 'Invoice'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, windowWidth: 800 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };
    html2pdf().set(opt).from(element).save();
  };

  if (loading || !invoice) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/')} className="btn btn-secondary">
          <ArrowLeft size={18} /> Back
        </button>
        <button onClick={handleExportPDF} className="btn btn-primary">
          <Download size={18} /> Export as PDF
        </button>
      </div>

      {/* PDF Iframe Viewer */}
      <div className="glass-panel" style={{ padding: '10px', height: '800px', display: 'flex', flexDirection: 'column' }}>
        {isGenerating ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#666' }}>Generating accurate PDF preview...</p>
          </div>
        ) : (
          <iframe 
            src={pdfUrl} 
            style={{ width: '100%', height: '100%', border: 'none', borderRadius: '4px' }} 
            title="Invoice PDF Preview" 
          />
        )}
      </div>

      {/* Hidden A4 Paper Canvas (For Generator) */}
      <div
        style={{
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          width: '210mm',
          background: '#fff',
          color: '#333'
        }}
      >
        <div ref={printRef} style={{ padding: '0', fontFamily: '"Inter", sans-serif' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '40px' }}>
            <div>
              <h1 style={{ color: '#111', fontSize: '2rem', margin: 0 }}>SERVICE INVOICE</h1>
              <div style={{ color: '#666', marginTop: '10px' }}>
                <p style={{ margin: '2px 0' }}><strong>Invoice Number:</strong> {invoice.invoiceNumber}</p>
                <p style={{ margin: '2px 0' }}><strong>Date:</strong> {invoice.date}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ color: '#333', fontSize: '1.25rem', margin: '0 0 5px 0' }}>{invoice.userName}</h2>
              <p style={{ margin: '2px 0', color: '#555' }}>{invoice.userAddress}</p>
              <p style={{ margin: '2px 0', color: '#555' }}>{invoice.userPhone}</p>
              <p style={{ margin: '2px 0', color: '#111', fontWeight: 'bold' }}>PAN: {invoice.userPan}</p>
            </div>
          </div>

          {/* Billed To */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ color: '#666', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '10px' }}>Billed To</h3>
            <h2 style={{ color: '#333', fontSize: '1.25rem', margin: '0 0 5px 0' }}>{invoice.clientName}</h2>
            <p style={{ margin: '0', color: '#555', whiteSpace: 'pre-wrap' }}>{invoice.clientAddress}</p>
          </div>

          {/* Services Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#495057' }}>Description</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#495057' }}>Qty</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#495057' }}>Rate</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#495057' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee', pageBreakInside: 'avoid' }}>
                  <td style={{ padding: '12px', color: '#333' }}>{item.description}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#333' }}>{item.quantity}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#333' }}>Rs. {Number(item.rate).toLocaleString()}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#333' }}>
                    Rs. {(Number(item.quantity) * Number(item.rate)).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary & Payment Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', pageBreakInside: 'avoid' }}>

            {/* Payment Details */}
            <div style={{ flex: 1, paddingRight: '40px' }}>
              <h3 style={{ color: '#666', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '10px' }}>Payment Details</h3>
              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '4px' }}>
                <p style={{ margin: '5px 0', color: '#333' }}><strong>Bank Name:</strong> {invoice.bankName}</p>
                <p style={{ margin: '5px 0', color: '#333' }}><strong>Account Name:</strong> {invoice.accountName}</p>
                <p style={{ margin: '5px 0', color: '#333' }}><strong>Account Number:</strong> {invoice.accountNumber}</p>
              </div>
            </div>

            {/* Totals */}
            <div style={{ width: '350px' }}>
              {/* Box 1: Highlighted Total Due */}
              <div style={{ background: '#f8fdfa', padding: '20px', borderRadius: '8px', marginBottom: '10px', border: '2px solid #198754' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '4px 0', color: '#555' }}>Subtotal</td>
                      <td style={{ padding: '4px 0', textAlign: 'right', color: '#333' }}>Rs. {invoice.subtotal.toLocaleString()}</td>
                    </tr>
                    {(invoice.advancePayment > 0) && (
                      <tr>
                        <td style={{ padding: '4px 0', color: '#dc3545' }}>Advance Payment</td>
                        <td style={{ padding: '4px 0', textAlign: 'right', color: '#dc3545' }}>- Rs. {Number(invoice.advancePayment).toLocaleString()}</td>
                      </tr>
                    )}
                    <tr style={{ borderTop: '2px solid #198754' }}>
                      <td style={{ padding: '12px 0 0 0', fontWeight: 'bold', fontSize: '1.4rem', color: '#198754' }}>Total Due</td>
                      <td style={{ padding: '12px 0 0 0', textAlign: 'right', fontWeight: 'bold', fontSize: '1.4rem', color: '#198754' }}>
                        Rs. {invoice.totalDue?.toLocaleString() || (invoice.subtotal - invoice.advancePayment).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Box 2: De-emphasized TDS and Gross Total */}
              <div style={{ padding: '5px 20px', fontSize: '0.85rem', color: '#777' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '2px 0' }}>TDS on Subtotal ({invoice.tdsRate}%)</td>
                      <td style={{ padding: '2px 0', textAlign: 'right' }}>+ Rs. {invoice.tdsAmount?.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '2px 0', fontWeight: '500' }}>Gross Total (Incl. TDS)</td>
                      <td style={{ padding: '2px 0', textAlign: 'right', fontWeight: '500' }}>
                        Rs. {(invoice.subtotal + invoice.tdsAmount).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Notes */}
          <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderLeft: '4px solid #17a2b8', borderRadius: '4px', pageBreakInside: 'avoid' }}>
            <p style={{ margin: '0 0 5px 0', color: '#333', fontSize: '0.75rem' }}>
              <strong>Note:</strong> The total amount before adding TDS (Subtotal: Rs. {invoice.subtotal?.toLocaleString()}) is payable to <strong>{invoice.userName || 'the service provider'}</strong>.
            </p>
            <p style={{ margin: 0, color: '#333', fontSize: '0.75rem' }}>
              The TDS amount of Rs. {invoice.tdsAmount?.toLocaleString()} is designated exclusively for remittance to the tax office by <strong>{invoice.clientName || 'the client'}</strong>, if legally mandated during tax filing. This amount is not payable to the service provider under any circumstances.
            </p>
          </div>

          {/* Footer Note */}
          <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '15px', textAlign: 'center', color: '#888', fontSize: '0.85rem', pageBreakInside: 'avoid' }}>
            <p style={{ margin: 0 }}>Thank you for your continued trust and the opportunity to work together.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
