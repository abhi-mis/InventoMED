import React, { useState, useEffect } from "react";
import AdminHeader from "./layouts/AdminHeader";
import AdminSideBar from "./layouts/AdminSideBar";
import AdminFooter from "./layouts/AdminFooter";
import { db } from "../firebase";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function InvoiceManagement() {
  const [fromName, setFromName] = useState("");
  const [fromPhone, setFromPhone] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [toName, setToName] = useState("");
  const [toPhone, setToPhone] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [medicines, setMedicines] = useState([{ name: "", quantity: 1, price: 0 }]);
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);

  const invoicesCollectionRef = collection(db, "invoices");

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: "", quantity: 1, price: 0 }]);
  };

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...medicines];
    newMedicines[index][field] = value;
    setMedicines(newMedicines);
  };

  const handleRemoveMedicine = (index) => {
    const newMedicines = medicines.filter((_, i) => i !== index);
    setMedicines(newMedicines);
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice.id);
    setFromName(invoice.from.name);
    setFromPhone(invoice.from.phone);
    setFromAddress(invoice.from.address || "");
    setToName(invoice.to.name);
    setToPhone(invoice.to.phone);
    setToAddress(invoice.to.address || "");
    setMedicines(invoice.medicines);
    setPaymentStatus(invoice.paymentStatus);
    setPaymentMode(invoice.paymentMode);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      const invoiceDoc = doc(db, "invoices", id);
      await deleteDoc(invoiceDoc);
      toast.success("Invoice deleted successfully!");
      fetchInvoices();
    } catch (error) {
      toast.error("Error deleting invoice!");
      console.error("Error deleting invoice:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const totalAmount = medicines.reduce((total, med) => total + (med.quantity * med.price), 0);
    const invoiceData = {
      from: { name: fromName, phone: fromPhone, address: fromAddress },
      to: { name: toName, phone: toPhone, address: toAddress },
      medicines,
      total: totalAmount,
      paymentStatus,
      paymentMode,
      date: new Date().toISOString(),
    };

    try {
      if (editingInvoice) {
        const invoiceDoc = doc(db, "invoices", editingInvoice);
        await updateDoc(invoiceDoc, invoiceData);
        toast.success("Invoice updated successfully!");
      } else {
        await addDoc(invoicesCollectionRef, invoiceData);
        toast.success("Invoice added successfully!");
      }
      resetForm();
      fetchInvoices();
    } catch (error) {
      toast.error(editingInvoice ? "Error updating invoice!" : "Error adding invoice!");
      console.error("Error with invoice:", error);
    }
  };

  const resetForm = () => {
    setFromName("");
    setFromPhone("");
    setFromAddress("");
    setToName("");
    setToPhone("");
    setToAddress("");
    setMedicines([{ name: "", quantity: 1, price: 0 }]);
    setPaymentStatus("Pending");
    setPaymentMode("Cash");
    setShowForm(false);
    setEditingInvoice(null);
  };

  const fetchInvoices = async () => {
    try {
      const data = await getDocs(invoicesCollectionRef);
      setInvoices(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } catch (error) {
      toast.error("Error fetching invoices!");
      console.error("Error fetching invoices:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <>
      <AdminHeader />
      <AdminSideBar />
      <div className="main-panel">
        <div className="content">
          <div className="container-fluid">
            <h4 className="page-title">Invoice Management</h4>
            <div className="row">
              <div className="col-md-12">
                <div className="card card-tasks">
                  <div className="card-header">
                    <h4 className="card-title">
                      Invoice List{" "}
                      <button
                        onClick={() => {
                          setShowForm(!showForm);
                          if (!showForm) resetForm();
                        }}
                        className="btn btn-primary btn-sm float-right"
                      >
                        {showForm ? "Show Invoices" : "Create New Invoice"}
                      </button>
                    </h4>
                  </div>
                  <div className="card-body">
                    {showForm ? (
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
                    ) : (
                      <div className="table-full-width px-5 py-4 table-striped">
                        <table className="table">
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
                                    >
                                      <i className="la la-edit"></i>
                                    </button>
                                    <button
                                      onClick={() => handleDelete(invoice.id)}
                                      className="btn btn-link btn-danger btn-sm"
                                    >
                                      <i className="la la-times"></i>
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <AdminFooter />
      </div>
      <ToastContainer />
    </> 
  );
}