import React, { useState, useEffect } from 'react';
import AdminHeader from "./layouts/AdminHeader";
import AdminSideBar from "./layouts/AdminSideBar";
import AdminFooter from "./layouts/AdminFooter";
import { db } from '../firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import {
  Package2,
  Pill,
  AlertCircle,
  DollarSign,
  ShoppingCart,
  FileText,
  Boxes,
  TrendingUp
} from 'lucide-react';

export default function Dashboard() {
  const [medicines, setMedicines] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to medicines collection
    const medicinesQuery = query(collection(db, 'medicine_inventory'));
    const unsubMedicines = onSnapshot(medicinesQuery, (snapshot) => {
      const medicineData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMedicines(medicineData);
    });

    // Listen to invoices collection
    const invoicesQuery = query(collection(db, 'invoices'));
    const unsubInvoices = onSnapshot(invoicesQuery, (snapshot) => {
      const invoiceData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInvoices(invoiceData);
      setLoading(false);
    });

    return () => {
      unsubMedicines();
      unsubInvoices();
    };
  }, []);

  // Calculate dashboard metrics
  const totalStock = medicines.reduce((acc, med) => acc + parseInt(med.stock || 0), 0);
  const totalUniqueItems = medicines.length;
  const lowStockItems = medicines.filter(med => parseInt(med.stock) < 10).length;

  const totalInventoryValue = medicines.reduce((acc, med) =>
    acc + (parseInt(med.stock || 0) * parseFloat(med.price || 0)), 0
  );

  const totalSales = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
  const pendingAmount = invoices
    .filter(inv => inv.paymentStatus === 'Pending')
    .reduce((acc, inv) => acc + (inv.total || 0), 0);
  const paidAmount = invoices
    .filter(inv => inv.paymentStatus === 'Paid')
    .reduce((acc, inv) => acc + (inv.total || 0), 0);

  const totalInvoices = invoices.length;

  // Calculate total profit
  const totalProfit = invoices.reduce((acc, inv) => {
    const profit = inv.medicines.reduce((profitAcc, med) => {
      const sellingPrice = med.sellingPrice || 0;
      const costPrice = medicines.find(m => m.id === med.medicineId)?.price || 0; // Get cost price from medicines
      return profitAcc + ((sellingPrice - costPrice) * med.quantity);
    }, 0);
    return acc + profit;
  }, 0);

  // Calculate total cost price
  const totalCostPrice = invoices.reduce((acc, inv) => {
    const costPrice = inv.medicines.reduce((costAcc, med) => {
      const price = medicines.find(m => m.id === med.medicineId)?.price || 0; // Get cost price from medicines
      return costAcc + (price * med.quantity);
    }, 0);
    return acc + costPrice;
  }, 0);

  // Get recent transactions
  const recentTransactions = invoices
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Get low stock medicines
  const lowStockMedicines = medicines
    .filter(med => parseInt(med.stock) < 10)
    .slice(0, 5);

  return (
    <>
      <AdminHeader />
      <AdminSideBar />
      <div className="main-panel">
        <div className="content">
          <div className="container-fluid">
            <h4 className="page-title">Dashboard</h4>

            {/* STOCK and INVENTORY Section */}
            <div className="row">
              <div className="col-md-12">
                <h5 className="mb-3"> STOCK and INVENTORY</h5>
                <div className="row">
                  <div className="col-md-3">
                    <div className="card card-stats card-primary">
                      <div className="card-body">
                        <div className="numbers">
                          <p className="card-category">Current Inventory Value</p>
                          <h4 className="card-title">₹{totalInventoryValue.toLocaleString()}</h4>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="card card-stats card-info">
                      <div className="card-body">
                        <div className="numbers">
                          <p className="card-category">Total Items</p>
                          <h4 className="card-title">{totalStock}</h4>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="card card-stats card-danger">
                      <div className="card-body">
                        <div className="numbers">
                          <p className="card-category">Low Stock Items</p>
                          <h4 className="card-title">{lowStockItems}</h4>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="card card-stats card-success">
                      <div className="card-body">
                        <div className="numbers">
                          <p className="card-category">Unique Items</p>
                          <h4 className="card-title">{totalUniqueItems}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TRANSACTION ANALYTICS Section */}
            <div className="row">
              <div className="col-md-12">
                <h5 className="mb-3">TRANSACTION ANALYTICS</h5>
                <div className="row">
                  <div className="col-md-2">
                    <div className="card card-stats card-warning">
                      <div className="card-body">
                        <div className="numbers">
                          <p className="card-category">Total Sales</p>
                          <h4 className="card-title">₹{totalSales.toLocaleString()}</h4>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-2">
                    <div className="card card-stats card-success">
                      <div className="card-body">
                        <div className="numbers">
                          <p className="card-category">Cost Price</p>
                          <h4 className="card-title">₹{totalCostPrice.toLocaleString()}</h4>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-2">
                    <div className="card card-stats card-info">
                      <div className="card-body">
                        <div className="numbers">
                          <p className="card-category">Net Profit</p>
                          <h4 className="card-title">₹{(totalSales - totalCostPrice).toLocaleString()}</h4>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-2">
                    <div className="card card-stats card-danger">
                      <div className="card-body">
                        <div className="numbers">
                          <p className="card-category">Received Amount</p>
                          <h4 className="card-title">₹{paidAmount.toLocaleString()}</h4>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-2">
                    <div className="card card-stats card-warning">
                      <div className="card-body">
                        <div className="numbers">
                          <p className="card-category">Pending Amount</p>
                          <h4 className="card-title">₹{pendingAmount.toLocaleString()}</h4>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-2">
                    <div className="card card-stats card-success">
                      <div className="card-body">
                        <div className="numbers">
                          <p className="card-category">Total Transactions</p>
                          <h4 className="card-title">{totalInvoices}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                
                </div>
              </div>
            </div>

            {/* Recent Transactions & Low Stock Alerts */}
            <div className="row">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h4 className="card-title">Recent Transactions</h4>
                  </div>
                  <div className="card-body">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Customer</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTransactions.map((invoice) => (
                          <tr key={invoice.id}>
                            <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                            <td>{invoice.to?.name}</td>
                            <td>₹{invoice.total.toLocaleString()}</td>
                            <td>
                              <span className={`badge ${invoice.paymentStatus === 'Paid'
                                  ? 'bg-success'
                                  : 'bg-warning'
                                }`}>
                                {invoice.paymentStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h4 className="card-title">Low Stock Alerts</h4>
                  </div>
                  <div className="card-body">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Medicine</th>
                          <th>Category</th>
                          <th>Current Stock</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowStockMedicines.map((medicine) => (
                          <tr key={medicine.id}>
                            <td>{medicine.name}</td>
                            <td>{medicine.category}</td>
                            <td>{medicine.stock}</td>
                            <td>
                              <span className="badge bg-danger">Low Stock</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <AdminFooter />
      </div>
    </>
  );
}