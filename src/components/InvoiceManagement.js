import React, { useState, useEffect } from "react";
import AdminHeader from "./layouts/AdminHeader";
import AdminSideBar from "./layouts/AdminSideBar";
import AdminFooter from "./layouts/AdminFooter";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Pencil, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';

export default function InvoiceManagement() {
  const [fromName, setFromName] = useState("");
  const [fromPhone, setFromPhone] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [toName, setToName] = useState("");
  const [toPhone, setToPhone] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [medicines, setMedicines] = useState([{ name: "", quantity: 1, sellingPrice: 0 }]);
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [availableMedicines, setAvailableMedicines] = useState([]);

  const invoicesCollectionRef = collection(db, "invoices");
  const medicinesCollectionRef = collection(db, "medicine_inventory");

  // Fetch available medicines from Firestore
  const fetchMedicines = async () => {
    try {
      const medicinesSnapshot = await getDocs(medicinesCollectionRef);
      const medicinesList = medicinesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAvailableMedicines(medicinesList);
    } catch (error) {
      toast.error("Error fetching medicines!");
      console.error("Error fetching medicines:", error);
    }
  };

  useEffect(() => {
    fetchMedicines();
    fetchInvoices();
  }, []);

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: "", quantity: 1, sellingPrice: 0 }]);
  };

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...medicines];

    if (field === "name") {
      const selectedMed = availableMedicines.find(med => med.name === value);
      if (selectedMed) {
        newMedicines[index] = {
          ...newMedicines[index],
          name: selectedMed.name,
          sellingPrice: selectedMed.sellingPrice || 0, // Use selling price
          medicineId: selectedMed.id
        };
      }
    } else {
      newMedicines[index][field] = value;
    }

    setMedicines(newMedicines);
  };

  const handleRemoveMedicine = (index) => {
    const newMedicines = medicines.filter((_, i) => i !== index);
    setMedicines(newMedicines);
  };

  const updateInventory = async (medicines) => {
    for (const medicine of medicines) {
      if (medicine.medicineId) {
        const medicineRef = doc(db, "medicine_inventory", medicine.medicineId);
        const medicineDoc = await getDoc(medicineRef);

        if (medicineDoc.exists()) {
          const currentStock = medicineDoc.data().stock;
          const newStock = currentStock - medicine.quantity;

          if (newStock < 0) {
            throw new Error(`Insufficient stock for ${medicine.name}`);
          }

          await updateDoc(medicineRef, {
            stock: newStock
          });
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const totalAmount = medicines.reduce((total, med) => total + (med.quantity * med.sellingPrice), 0);

      const invoiceData = {
        from: {
          name: fromName || '',
          phone: fromPhone || '',
          address: fromAddress || ''
        },
        to: {
          name: toName || '',
          phone: toPhone || '',
          address: toAddress || ''
        },
        medicines: medicines.map(med => ({
          name: med.name || '',
          quantity: Number(med.quantity) || 0,
          sellingPrice: Number(med.sellingPrice) || 0,
          medicineId: med.medicineId || null
        })),
        total: totalAmount || 0,
        paymentStatus: paymentStatus || 'Pending',
        paymentMode: paymentMode || 'Cash',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        sellHistory: medicines.map(med => ({
          entry: `${med.quantity} ${med.name} sold to ${toName}`,
          timestamp: new Date().toISOString()
        }))
      };

      await updateInventory(medicines);
      await addDoc(invoicesCollectionRef, invoiceData);
      toast.success("Invoice created successfully!");
      resetForm();
      fetchInvoices();
      fetchMedicines();
    } catch (error) {
      console.error("Error processing invoice:", error);
      toast.error(error.message);
    }
  };

  const resetForm = () => {
    setFromName("");
    setFromPhone("");
    setFromAddress("");
    setToName("");
    setToPhone("");
    setToAddress("");
    setMedicines([{ name: "", quantity: 1, sellingPrice: 0 }]);
    setPaymentStatus("Pending");
    setPaymentMode("Cash");
    setShowForm(false);
    setEditingInvoice(null);
  };

  const fetchInvoices = async () => {
    try {
      const data = await getDocs(invoicesCollectionRef);
      const invoiceList = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      setInvoices(invoiceList);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Error fetching invoices");
    }
    setIsLoading(false);
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice.id);
    setFromName(invoice.from.name || '');
    setFromPhone(invoice.from.phone || '');
    setFromAddress(invoice.from.address || '');
    setToName(invoice.to.name || '');
    setToPhone(invoice.to.phone || '');
    setToAddress(invoice.to.address || '');
    setMedicines(invoice.medicines || [{ name: "", quantity: 1, sellingPrice: 0 }]);
    setPaymentStatus(invoice.paymentStatus || 'Pending');
    setPaymentMode(invoice.paymentMode || 'Cash');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "invoices", id));
      toast.success("Invoice deleted successfully!");
      fetchInvoices();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Error deleting invoice");
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    if (!showForm) {
      resetForm();
      setShowForm(true);
    }
  };

  const generatePDF = async (invoice) => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    
    // Add title
    doc.setFontSize(16);
    doc.text(`Invoice_${invoice.to.name.replace(/\s+/g, ' ')}`, 20, 20);
    doc.setFontSize(12);
    
    // Add From section on the left
    doc.text("From:", 20, 30);
    doc.text(`Name: ${invoice.from.name}`, 20, 40);
    doc.text(`Phone: ${invoice.from.phone}`, 20, 50);
    doc.text(`Address: ${invoice.from.address}`, 20, 60);
    
    // Add To section on the right
    doc.text("To:", 140, 30);
    doc.text(`Name: ${invoice.to.name}`, 140, 40);
    doc.text(`Phone: ${invoice.to.phone}`, 140, 50);
    doc.text(`Address: ${invoice.to.address}`, 140, 60);
    
    // Add Date and Payment details
    doc.text(`Date: ${invoice.createdAt.toLocaleDateString()}`, 20, 80);
    doc.text(`Payment Mode: ${invoice.paymentMode}`, 140, 80);
    doc.text(`Payment Status: ${invoice.paymentStatus}`, 140, 90);
    
    // Add Medicines table header
    const startY = 110;
    const lineHeight = 10;
    const tableStartY = startY + lineHeight;
 
    doc.text("Medicines:", 20, startY);
    doc.text("Name", 20, tableStartY);
    doc.text("Quantity", 100, tableStartY);
    doc.text("Price", 140, tableStartY);
    
    // Draw a line under the header
    doc.line(20, tableStartY + 2, 190, tableStartY + 2); // Horizontal line
    
    let y = tableStartY + lineHeight;
    let totalAmount = 0;
  
    invoice.medicines.forEach(med => {
      doc.text(med.name, 20, y);
      doc.text(med.quantity.toString(), 100, y);
      const price = med.sellingPrice;
      doc.text(`INR ${price} /Item`, 140, y);
      totalAmount += med.quantity * price; // Calculate total amount
      y += lineHeight;
    });
  
    // Draw a line above the total
    doc.line(20, y, 190, y); // Horizontal line
    y += 5; // Space before total
    
    // Add total amount in bold
    doc.setFontSize(14);
    doc.setFont("bold");
    doc.text(`Total Amount: INR ${totalAmount}`, 20, y);
    
    // Save the PDF with the name of the recipient
    const fileName = `Invoice_${invoice.to.name.replace(/\s+/g, '-')}.pdf`; // Replace spaces with underscores
    doc.save(fileName);
  };

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
                    <h4 className="card-title">Invoice List</h4>
                    <button onClick={toggleForm} className="btn btn-primary">
                      {showForm ? "Hide Form" : "Create New Invoice"}
                    </button>
                  </div>
                  <div className="card-body">
                    {showForm ? (
                      <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded ">
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
                              />
                            </div>
                            <div className="form-group">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Phone Number"
                                value={fromPhone}
                                onChange={(e) => setFromPhone(e.target.value)}
                              />
                            </div>
                            <div className="form-group">
                              <textarea
                                className="form-control"
                                placeholder="Address"
                                value={fromAddress}
                                onChange={(e) => setFromAddress(e.target.value)}
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
                              />
                            </div>
                            <div className="form-group">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Phone Number"
                                value={toPhone}
                                onChange={(e) => setToPhone(e.target.value)}
                              />
                            </div>
                            <div className="form-group">
                              <textarea
                                className="form-control"
                                placeholder="Address"
                                value={toAddress}
                                onChange={(e) => setToAddress(e.target.value)}
                                rows="3"
                              />
                            </div>
                          </div>
                        </div>

                        <h5 className="mt-4 mb-3">Medicines</h5>
                        {medicines.map((med, index) => (
                          <div key={index} className="row mb-3">
                            <div className="col-md-4">
                              <select
                                className="form-control"
                                value={med.name}
                                onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
                              >
                                <option value="">Select Medicine</option>
                                {availableMedicines.map((medicine) => (
                                  <option key={medicine.id} value={medicine.name}>
                                    {medicine.name} (Stock: {medicine.stock})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-3">
                              <input
                                type="number"
                                className="form-control"
                                placeholder="Quantity"
                                value={med.quantity}
                                onChange={(e) => handleMedicineChange(index, "quantity", e.target.value)}
                                min="1"
                              />
                            </div>
                            <div className="col-md-3">
                              <input
                                type="number"
                                className="form-control"
                                placeholder="Selling Price"
                                value={med.sellingPrice}
                                onChange={(e) => handleMedicineChange(index, "sellingPrice", e.target.value)}
                              />
                            </div>
                            <div className="col-md-2">
                              <button
                                type="button"
                                onClick={() => handleRemoveMedicine(index)}
                                className="btn btn-danger btn-sm"
                                disabled={medicines.length === 1}
                              >
                                Remove
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
                                <option value="Online">Online </option>
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
                          ) : invoices.length === 0 ? (
                            <tr>
                              <td colSpan="8" className="text-center">
                                No invoices found
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
                                  <select
                                    className={`form-control ${invoice.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning'}`}
                                    value={invoice.paymentStatus}
                                    onChange={async (e) => {
                                      const newStatus = e.target.value;
                                      const invoiceDoc = doc(db, "invoices", invoice.id);
                                      await updateDoc(invoiceDoc, { paymentStatus: newStatus });
                                      toast.success("Payment status updated successfully!");
                                      fetchInvoices();
                                    }}
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Paid">Paid</option>
                                  </select>
                                </td>
                                <td>{invoice.paymentMode}</td>
                                <td>{invoice.created}</td>
                                <td>{invoice.createdAt.toLocaleDateString()}</td>
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
                                  <button
                                    onClick={() => generatePDF(invoice)}
                                    className="btn btn-link btn-info btn-sm"
                                    title="Print Invoice"
                                  >
                                    Print
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
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