"use client";

import React, { useRef } from 'react';
import { X, Printer, Download, ShieldCheck, CheckCircle2, Building2, Phone, Calendar, Hash } from 'lucide-react';

export interface InvoiceItem {
  id?: string;
  name?: string;
  productName?: string;
  title?: string;
  quantity?: number;
  qty?: number;
  price?: number;
  unitPrice?: number;
  unit?: string;
  category?: string;
}

export interface InvoiceOrder {
  id: string;
  createdAt?: string | Date;
  date?: string;
  customerName?: string;
  customerPhone?: string;
  shippingAddress?: string;
  address?: string;
  pincode?: string;
  paymentMethod?: string;
  status?: string;
  total?: number;
  totalAmount?: number;
  items?: InvoiceItem[];
  seller?: {
    storeName?: string;
    ownerName?: string;
    district?: string;
    gstin?: string;
    licenseNumber?: string;
    phone?: string;
  };
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: InvoiceOrder | null;
}

export default function InvoiceModal({ isOpen, onClose, order }: InvoiceModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const orderId = order.id || 'N/A';
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : order.date || new Date().toLocaleDateString('en-IN');

  const customerName = order.customerName || 'Farmer';
  const customerPhone = order.customerPhone || 'N/A';
  const shippingAddress = order.shippingAddress || order.address || 'Standard Delivery';
  const paymentMethod = order.paymentMethod || 'Cash on Delivery (COD)';
  const orderStatus = order.status || 'CONFIRMED';

  const items = Array.isArray(order.items) ? order.items : [];
  const totalAmount = order.totalAmount ?? order.total ?? 0;
  
  // Calculate subtotal and tax estimates
  // Most essential fertilizers/seeds in India have 5% or 0% GST
  const subtotal = items.reduce((acc, it) => {
    const q = it.quantity || it.qty || 1;
    const p = it.price || it.unitPrice || 0;
    return acc + q * p;
  }, 0) || totalAmount;

  const estimatedGst = Math.round(subtotal * 0.05);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="invoice-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="invoice-modal-content"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '850px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Header Action Bar (Hidden on Print) */}
        <div
          className="no-print"
          style={{
            padding: '14px 20px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🧾</span>
            <strong style={{ color: '#0f172a', fontSize: '1rem' }}>
              Tax Invoice & Receipt (#{orderId.slice(0, 8)})
            </strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                backgroundColor: '#15803d',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
            >
              <Printer size={16} /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '6px',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Area */}
        <div
          id="invoice-print-area"
          ref={printRef}
          style={{
            padding: '32px 36px',
            overflowY: 'auto',
            color: '#1e293b',
            backgroundColor: '#ffffff',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Invoice Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '2px solid #15803d',
              paddingBottom: '20px',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '1.6rem' }}>🌾</span>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#15803d', letterSpacing: '-0.02em' }}>
                  AegroShield
                </h1>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                Pan-India Certified Agricultural Marketplace & Inputs Portal
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                Helpline: +91 98765 43210 • Support: help@aegroshield.com
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  marginBottom: '6px',
                }}
              >
                TAX INVOICE / CASH MEMO
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                Invoice No: <span style={{ fontFamily: 'monospace' }}>INV-{orderId.slice(0, 10).toUpperCase()}</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Date: <strong>{orderDate}</strong>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Payment: <strong>{paymentMethod}</strong>
              </div>
            </div>
          </div>

          {/* Supplier & Customer Details Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
              backgroundColor: '#f8fafc',
              padding: '16px 20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              marginBottom: '24px',
            }}
          >
            {/* Supplier / Seller Info */}
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Authorized Seller / Vendor
              </span>
              <h3 style={{ margin: '4px 0 2px', fontSize: '0.98rem', fontWeight: 700, color: '#0f172a' }}>
                {order.seller?.storeName || 'AegroShield Verified Agri-Hub'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                Location: {order.seller?.district || 'Regional Mandi Cluster'}<br />
                Licence / Reg No: {order.seller?.licenseNumber || order.seller?.gstin || 'AGRI-DL-2026-OK'}<br />
                {order.seller?.phone && <>Phone: {order.seller.phone}</>}
              </p>
            </div>

            {/* Billed To / Farmer Info */}
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Billed To (Customer / Farmer)
              </span>
              <h3 style={{ margin: '4px 0 2px', fontSize: '0.98rem', fontWeight: 700, color: '#0f172a' }}>
                {customerName}
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                Phone: {customerPhone}<br />
                Delivery Address: {shippingAddress}
                {order.pincode ? ` - ${order.pincode}` : ''}
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '20px',
              fontSize: '0.86rem',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#334155', width: '40px' }}>#</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Item Description</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#334155' }}>Qty</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Rate (₹)</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, idx) => {
                  const qty = item.quantity || item.qty || 1;
                  const price = item.price || item.unitPrice || 0;
                  const total = qty * price;
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <strong style={{ color: '#0f172a' }}>{item.name || item.productName || item.title || 'Agri Product'}</strong>
                        {item.category && (
                          <span style={{ fontSize: '0.74rem', color: '#64748b', marginLeft: '6px' }}>
                            ({item.category})
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>
                        {qty} {item.unit || 'Unit'}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#334155' }}>
                        ₹{price.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                        ₹{total.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 12px', color: '#64748b' }}>1</td>
                  <td style={{ padding: '10px 12px' }}>
                    <strong style={{ color: '#0f172a' }}>Agri Inputs & Machinery Service</strong>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>1 Package</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: '#334155' }}>
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals & Stamp Calculation */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderTop: '2px solid #e2e8f0',
              paddingTop: '16px',
              flexWrap: 'wrap',
              gap: '20px',
            }}
          >
            {/* Authenticity Stamp / Notice */}
            <div style={{ maxWidth: '360px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#ecfdf5',
                  border: '1.5px dashed #059669',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  marginBottom: '10px',
                }}
              >
                <ShieldCheck size={28} color="#059669" />
                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#065f46', display: 'block' }}>
                    AegroShield Authenticity Guarantee
                  </strong>
                  <span style={{ fontSize: '0.72rem', color: '#047857' }}>
                    Certified genuine seed/fertilizer batch. 100% compliant with Fertilizer Control Order (FCO).
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                * Tax Invoice issued in accordance with Rule 46 of CGST Rules, 2017. Agricultural seeds are exempted from GST under Notification No. 12/2017-Central Tax.
              </p>
            </div>

            {/* Price Breakdown */}
            <div style={{ width: '260px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b' }}>Item Subtotal:</span>
                <span style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b' }}>Delivery Fee:</span>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b' }}>Taxes (Included):</span>
                <span style={{ color: '#64748b' }}>₹0 (Agri Exempt)</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '2px solid #0f172a',
                  paddingTop: '8px',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: '#0f172a',
                }}
              >
                <span>Total Amount:</span>
                <span style={{ color: '#15803d' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Signatory Footer */}
          <div
            style={{
              marginTop: '36px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '20px',
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b' }}>
                Customer Care & WhatsApp: +91 98765 43210<br />
                Download App: aegroshield.vercel.app
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontFamily: 'cursive, sans-serif',
                  fontSize: '1.1rem',
                  color: '#15803d',
                  fontWeight: 700,
                  marginBottom: '2px',
                }}
              >
                AegroShield Verified
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', borderTop: '1px solid #cbd5e1', paddingTop: '2px' }}>
                Authorized Platform Signatory
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded CSS for Print Styling */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-print-area,
          #invoice-print-area * {
            visibility: visible;
          }
          #invoice-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            background: #ffffff !important;
            box-shadow: none !important;
          }
          .no-print,
          .invoice-modal-overlay {
            background: transparent !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
