import React, { useState, useEffect } from "react";
import AdminHeader from "./layouts/AdminHeader";
import AdminSideBar from "./layouts/AdminSideBar";
import AdminFooter from "./layouts/AdminFooter";
import InvoiceForm from "./InvoiceForm";
import InvoiceTable from "./InvoiceTable";
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
                      <InvoiceForm
                        fromName={fromName}
                        setFromName={setFromName}
                        fromPhone={fromPhone}
                        setFromPhone={setFromPhone}
                        fromAddress={fromAddress}
                        setFromAddress={setFromAddress}
                        toName={toName}
                        setToName={setToName}
                        toPhone={toPhone}
                        setToPhone={setToPhone}
                        toAddress={toAddress}
                        setToAddress={setToAddress}
                        medicines={medicines}
                        handleMedicineChange={handleMedicineChange}
                        handleRemoveMedicine={handleRemoveMedicine}
                        handleAddMedicine={handleAddMedicine}
                        paymentStatus={paymentStatus}
                        setPaymentStatus={setPaymentStatus}
                        paymentMode={paymentMode}
                        setPaymentMode={setPaymentMode}
                        handleSubmit={handleSubmit}
                        resetForm={resetForm}
                        editingInvoice={editingInvoice}
                      />
                    ) : (
                      <InvoiceTable
                        invoices={invoices}
                        isLoading={isLoading}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                      />
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