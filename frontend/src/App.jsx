import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { FileText, Plus } from 'lucide-react'
import InvoiceList from './components/InvoiceList'
import InvoiceForm from './components/InvoiceForm'
import InvoicePreview from './components/InvoicePreview'

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <FileText color="var(--primary-color)" />
        Invoice<span>Gen</span>
      </Link>
      <Link to="/create" className="btn btn-primary">
        <Plus size={18} /> New Invoice
      </Link>
    </nav>
  )
}

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<InvoiceList />} />
          <Route path="/create" element={<InvoiceForm />} />
          <Route path="/edit/:id" element={<InvoiceForm />} />
          <Route path="/preview/:id" element={<InvoicePreview />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
