import React from 'react';

export default function InvoiceForm({
  fromName,
  setFromName,
  fromPhone,
  setFromPhone,
  fromAddress,
  setFromAddress,
  toName,
  setToName,
  toPhone,
  setToPhone,
  toAddress,
  setToAddress,
  medicines,
  handleMedicineChange,
  handleRemoveMedicine,
  handleAddMedicine,
  paymentStatus,
  setPaymentStatus,
  paymentMode,
  setPaymentMode,
  handleSubmit,
  resetForm,
  editingInvoice
}) {
  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded">
      <div className="row">
        <div className="col-md-6">
          <h5 className="mb-3">From</h5>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Name"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Phone Number"
              value={fromPhone}
              onChange={(e) => setFromPhone(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <textarea
              className="form-control"
              placeholder="Address"
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
              required
              rows="3"
            />
          </div>
        </div>
        <div className="col-md-6">
          <h5 className="mb-3">To</h5>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Name"
              value={toName}
              onChange={(e) => setToName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Phone Number"
              value={toPhone}
              onChange={(e) => setToPhone(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <textarea
              className="form-control"
              placeholder="Address"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              required
              rows="3"
            />
          </div>
        </div>
      </div>

      <h5 className="mt-4 mb-3">Medicines</h5>
      {medicines.map((med, index) => (
        <div key={index} className="row mb-3">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Medicine Name"
              value={med.name}
              onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="number"
              className="form-control"
              placeholder="Quantity"
              value={med.quantity}
              onChange={(e) => handleMedicineChange(index, "quantity", e.target.value)}
              min="1"
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="number"
              className="form-control"
              placeholder="Price"
              value={med.price}
              onChange={(e) => handleMedicineChange(index, "price", e.target.value)}
              min="0"
              required
            />
          </div>
          <div className="col-md-2">
            <button
              type="button"
              onClick={() => handleRemoveMedicine(index)}
              className="btn btn-danger btn-sm"
              disabled={medicines.length === 1}
            >
              <i className="la la-times"></i>
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddMedicine}
        className="btn btn-info btn-sm mb-4"
      >
        Add Medicine
      </button>

      <div className="row">
        <div className="col-md-6">
          <div className="form-group">
            <label>Payment Status</label>
            <select
              className="form-control"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label>Payment Mode</label>
            <select
              className="form-control"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
            >
              <option value="Cash">Cash</option>
              <option value="Online">Online</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button type="submit" className="btn btn-success mr-2">
          {editingInvoice ? "Update Invoice" : "Create Invoice"}
        </button>
        <button type="button" onClick={resetForm} className="btn btn-danger">
          Cancel
        </button>
      </div>
    </form>
  );
}