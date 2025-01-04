import React, { useState, useEffect } from "react";
import AdminHeader from "./layouts/AdminHeader";
import AdminSideBar from "./layouts/AdminSideBar";
import AdminFooter from "./layouts/AdminFooter";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, doc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import { Modal } from 'react-bootstrap';
import { Eye } from 'lucide-react'; // Import the Eye icon

export default function Inventory() {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useState([]);
  const [sellHistory, setSellHistory] = useState([]); // State to store sell history for the selected medicine
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSellHistoryModal, setShowSellHistoryModal] = useState(false); // State to control sell history modal visibility
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [stockInputs, setStockInputs] = useState({});
  const [filterCategory, setFilterCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const medicinesCollectionRef = collection(db, "medicine_inventory");
  const invoicesCollectionRef = collection(db, "invoices"); // Reference to invoices collection

  const getTypes = async () => {
    const data = await getDocs(medicinesCollectionRef);
    const medicinesList = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setMedicines(medicinesList);
    setFilteredMedicines(medicinesList);
  };

  const getCategories = async () => {
    const categoriesCollectionRef = collection(db, "medicine_categories");
    const categoryData = await getDocs(categoriesCollectionRef);
    const categoryList = categoryData.docs.map((doc) => doc.data().name);
    setCategories(categoryList);
  };

  const handleDeleteButton = async (id) => {
    const medDoc = doc(medicinesCollectionRef, id);
    const medicineData = await getDoc(medDoc);
    
    if (medicineData.exists()) {
      const newHistoryEntry = {
        action: `Deleted ${medicineData.data().name} from inventory`,
        date: new Date().toLocaleString(),
      };
      await updateDoc(medDoc, {
        history: [...(medicineData.data().history || []), newHistoryEntry]
      });

      await deleteDoc(medDoc);
      getTypes();
    }
  };

  const handleAddStock = async (medicineId) => {
    const input = stockInputs[medicineId];
    if (!input || isNaN(input) || input <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }

    const medDoc = doc(medicinesCollectionRef, medicineId);
    const medicineData = await getDoc(medDoc);
    if (medicineData.exists()) {
      const newStock = medicineData.data().stock + parseInt(input);
      await updateDoc(medDoc, { stock: newStock });

      const newHistoryEntry = {
        action: `Added ${input} more items of ${medicineData.data().name} to stock`,
        date: new Date().toLocaleString(),
      };
      await updateDoc(medDoc, {
        history: [...(medicineData.data().history || []), newHistoryEntry]
      });

      setStockInputs((prev) => ({ ...prev, [medicineId]: "" }));
      getTypes();
    }
  };

  const handleShowHistory = async (medicine) => {
    setSelectedMedicine(medicine);
    setHistory(medicine.history || []);
    setShowHistoryModal(true);
  };

  const handleShowSellHistory = async (medicine) => {
    setSelectedMedicine(medicine);
    const invoiceData = await getDocs(invoicesCollectionRef);
    const sellHistoryData = [];

    invoiceData.forEach((doc) => {
      const invoice = doc.data();
      invoice.medicines.forEach((med) => {
        if (med.medicineId === medicine.id) {
          sellHistoryData.push({
            customerName: invoice.to.name,
            quantitySold: med.quantity,
            date: new Date(invoice.createdAt.seconds * 1000).toLocaleString() // Convert Firestore timestamp to a readable date
          });
        }
      });
    });

    setSellHistory(sellHistoryData);
    setShowSellHistoryModal(true);
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = medicines.filter(medicine =>
      medicine.name.toLowerCase().includes(query)
    );
    setFilteredMedicines(filtered);
  };

  const handleFilterCategory = (e) => {
    const category = e.target.value;
    setFilterCategory(category);
    filterMedicines(category);
  };

  const filterMedicines = (category) => {
    let filtered = medicines;

    if (category) {
      filtered = filtered.filter(medicine => medicine.category === category);
    }

    setFilteredMedicines(filtered);
  };

  useEffect(() => {
    getTypes();
    getCategories();
  }, []);

  return (
    <>
      <AdminHeader />
      <AdminSideBar />
      <div className="main-panel">
        <div className="content">
          <div className="container-fluid">
            <h4 className="page-title">Medicine Inventory</h4>
            <div className="row">
              <div className="col-md-12">
                <div className="card card-tasks">
                  <div className="card-header">
                    <h4 className="card-title">
                      Inventory List{" "}
                      <Link to="/addmedicine" className="btn btn-primary btn-sm float-right">
                        Add new Medicine
                      </Link>
                    </h4>
                    <input
                      type="text"
                      placeholder="Search Medicine"
                      className="form-control"
                      value={searchQuery}
                      onChange={handleSearch}
                      style={{ width: "300px", marginTop: "10px" }}
                    />
                    <select onChange={handleFilterCategory} className="form-control" style={{ width: "150px", marginTop: "10px", marginLeft: "10px" }}>
                      <option value="">Filter by Category</option>
                      {categories.map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive text-center mx-auto">
                      <table className="table table-striped" style={{ width: "100%" }}>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>
                              Name<sup>Power</sup>
                            </th>
                            <th>Category</th>
                            <th>Type</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Action</th>
                            <th>Buy History</th>
                            <th>Sell History</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMedicines.map((medicine, index) => (
                            <tr key={medicine.id}>
                              <td>{index + 1}</td>
                              <td>
                                {medicine.name} <sup>{medicine.power}</sup>
                              </td>
                              <td>{medicine.category}</td>
                              <td>{medicine.type}</td>
                              <td>₹{medicine.price}</td>
                              <td>{medicine.stock}</td>
                              <td className="td-actions">
                                <div className="form-button-action">
                                  <Link to="/updatemedicine">
                                    <button
                                      type="button"
                                      className="btn btn-link btn-success"
                                      onClick={() => {
                                        localStorage.setItem(
                                          "medicine_obj",
                                          JSON.stringify(medicine)
                                        );
                                      }}
                                    >
                                      <i className="la la-edit"></i>
                                    </button>
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleDeleteButton(medicine.id);
                                    }}
                                    className="btn btn-link btn-danger"
                                  >
                                    <i className="la la-times"></i>
                                  </button>
                                  <div className="add-stock">
                                    <input
                                      type="number"
                                      placeholder="Add stock"
                                      className="form-control"
                                      style={{ width: "100px", display: "inline-block" }}
                                      value={stockInputs[medicine.id] || ""}
                                      onChange={(e) =>
                                        setStockInputs((prev) => ({
                                          ...prev,
                                          [medicine.id]: e.target.value,
                                        }))
                                      }
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleAddStock(medicine.id)}
                                      class ="btn btn-link btn-primary"
                                    >
                                      <i className="la la-plus"></i>
                                    </button>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-link btn-info"
                                  onClick={() => handleShowHistory(medicine)}
                                >
                                  <i className="la la-eye"></i>
                                </button>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-link btn-danger"
                                  onClick={() => handleShowSellHistory(medicine)}
                                >
                                  <i className="la la-eye" style={{ color: 'red' }}></i>
                                </button>
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
        </div>
        <AdminFooter />
      </div>

      {/* History Modal for Selected Medicine */}
      <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Stock Change History for {selectedMedicine?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul className="list-group">
            {history.map((entry, index) => (
              <li key={index} className="list-group-item">
                {entry.action} - <small>{entry.date}</small>
              </li>
            ))}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={() => setShowHistoryModal(false)}>
            Close
          </button>
        </Modal.Footer>
      </Modal>

      {/* Sell History Modal for Selected Medicine */}
      <Modal show={showSellHistoryModal} onHide={() => setShowSellHistoryModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Sell History for {selectedMedicine?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul className="list-group">
            {sellHistory.map((entry, index) => (
              <li key={index} className="list-group-item">
                {entry.quantitySold} of {selectedMedicine?.name} sold to {entry.customerName} - <small>{entry.date}</small>
              </li>
            ))}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={() => setShowSellHistoryModal(false)}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}