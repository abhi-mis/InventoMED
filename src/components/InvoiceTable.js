import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

export default function InvoiceTable({ invoices, isLoading, handleEdit, handleDelete }) {
  return (
    <div className="table-full-width px-5 py-4 table-striped">
      <table className="table table-responsive-md">
        <thead>
          <tr>
            <th>#</th>
            <th>From</th>
            <th>To</th>
            <th>Total Amount</th>
            <th>Payment Status</th>
            <th>Payment Mode</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="8" className="text-center">
                Loading invoices...
              </td>
            </tr>
          ) : (
            invoices.map((invoice, index) => (
              <tr key={invoice.id}>
                <td>{index + 1}</td>
                <td>{invoice.from.name}</td>
                <td>{invoice.to.name}</td>
                <td>₹{invoice.total}</td>
                <td>
                  <span className={`badge ${invoice.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                    {invoice.paymentStatus}
                  </span>
                </td>
                <td>{invoice.paymentMode}</td>
                <td>{new Date(invoice.date).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => handleEdit(invoice)}
                    className="btn btn-link btn-success btn-sm mr-2"
                    title="Edit Invoice"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(invoice.id)}
                    className="btn btn-link btn-danger btn-sm"
                    title="Delete Invoice"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}