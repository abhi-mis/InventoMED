import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';
import AdminHeader from "./layouts/AdminHeader";
import AdminSideBar from "./layouts/AdminSideBar";
import AdminFooter from "./layouts/AdminFooter";
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
  
  // Calculate month-over-month growth
  const currentMonth = new Date().getMonth();
  const currentMonthSales = invoices
    .filter(inv => new Date(inv.date).getMonth() === currentMonth)
    .reduce((acc, inv) => acc + (inv.total || 0), 0);
  
  const lastMonthSales = invoices
    .filter(inv => new Date(inv.date).getMonth() === currentMonth - 1)
    .reduce((acc, inv) => acc + (inv.total || 0), 0);
  
  const monthlyGrowth = lastMonthSales ? 
    ((currentMonthSales - lastMonthSales) / lastMonthSales * 100).toFixed(1) : 0;

  // Get recent transactions
  const recentTransactions = invoices
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Get low stock medicines
  const lowStockMedicines = medicines
    .filter(med => parseInt(med.stock) < 10)
    .slice(0, 5);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <>
      <AdminHeader />
      <AdminSideBar />
      <div className="main-panel">
        <div className="content">
          <div className="container-fluid">
            <h4 className="page-title">Dashboard</h4>

            {/* Main Stats - First Row */}
            <div className="row">
              <div className="col-md-3">
                <div className="card card-stats card-primary">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-5">
                        <div className="icon-big text-center">
                          <Package2 size={24} />
                        </div>
                      </div>
                      <div className="col-7 d-flex align-items-center">
                        <div className="numbers">
                          <p className="card-category">Total Stock</p>
                          <h4 className="card-title">{totalStock}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card card-stats card-info">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-5">
                        <div className="icon-big text-center">
                          <Boxes size={24} />
                        </div>
                      </div>
                      <div className="col-7 d-flex align-items-center">
                        <div className="numbers">
                          <p className="card-category">Unique Items</p>
                          <h4 className="card-title">{totalUniqueItems}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card card-stats card-success">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-5">
                        <div className="icon-big text-center">
                          <DollarSign size={24} />
                        </div>
                      </div>
                      <div className="col-7 d-flex align-items-center">
                        <div className="numbers">
                          <p className="card-category">Inventory Value</p>
                          <h4 className="card-title">₹{totalInventoryValue.toLocaleString()}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card card-stats card-danger">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-5">
                        <div className="icon-big text-center">
                          <AlertCircle size={24} />
                        </div>
                      </div>
                      <div className="col-7 d-flex align-items-center">
                        <div className="numbers">
                          <p className="card-category">Low Stock Items</p>
                          <h4 className="card-title">{lowStockItems}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Row of Stats */}
            <div className="row">
              <div className="col-md-3">
                <div className="card card-stats card-warning">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-5">
                        <div className="icon-big text-center">
                          <ShoppingCart size={24} />
                        </div>
                      </div>
                      <div className="col-7 d-flex align-items-center">
                        <div className="numbers">
                          <p className="card-category">Total Sales</p>
                          <h4 className="card-title">₹{totalSales.toLocaleString()}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card card-stats card-success">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-5">
                        <div className="icon-big text-center">
                          <DollarSign size={24} />
                        </div>
                      </div>
                      <div className="col-7 d-flex align-items-center">
                        <div className="numbers">
                          <p className="card-category">Paid Amount</p>
                          <h4 className="card-title">₹{paidAmount.toLocaleString()}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card card-stats card-danger">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-5">
                        <div className="icon-big text-center">
                          <FileText size={24} />
                        </div>
                      </div>
                      <div className="col-7 d-flex align-items-center">
                        <div className="numbers">
                          <p className="card-category">Total Invoices</p>
                          <h4 className="card-title">{totalInvoices}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card card-stats card-info">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-5">
                        <div className="icon-big text-center">
                          <TrendingUp size={24} />
                        </div>
                      </div>
                      <div className="col-7 d-flex align-items-center">
                        <div className="numbers">
                          <p className="card-category">Monthly Growth</p>
                          <h4 className="card-title">{monthlyGrowth}%</h4>
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
                            <td>{new Date(invoice.date).toLocaleDateString()}</td>
                            <td>{invoice.to?.name}</td>
                            <td>₹{invoice.total.toLocaleString()}</td>
                            <td>
                              <span className={`badge ${
                                invoice.paymentStatus === 'Paid' 
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