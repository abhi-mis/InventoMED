import React, { useState, useEffect } from "react";
import AdminHeader from "./layouts/AdminHeader";
import AdminSideBar from "./layouts/AdminSideBar";
import AdminFooter from "./layouts/AdminFooter";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, doc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import { Modal } from 'react-bootstrap';

export default function Inventory() {
  const [medicines, setMedicines] = useState([]);
  const [history, setHistory] = useState([]); // State to store history for the selected medicine
  const [showHistoryModal, setShowHistoryModal] = useState(false); // State to control modal visibility
  const [selectedMedicine, setSelectedMedicine] = useState(null); // State to store the selected medicine for history
  const [stockInputs, setStockInputs] = useState({}); // State to manage input visibility and values
  const medicinesCollectionRef = collection(db, "medicine_inventory");

  const getTypes = async () => {
    const data = await getDocs(medicinesCollectionRef);
    setMedicines(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  const handleDeleteButton = async (id) => {
    const medDoc = doc(medicinesCollectionRef, id);
    const medicineData = await getDoc(medDoc);
    
    if (medicineData.exists()) {
      const currentStock = medicineData.data().stock;

      // Log the deletion in history
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

      // Update the stock in the database
      await updateDoc(medDoc, { stock: newStock });

      // Log the addition in history
      const newHistoryEntry = {
        action: `Added ${input} more items of ${medicineData.data().name} to stock`,
        date: new Date().toLocaleString(),
      };
      await updateDoc(medDoc, {
        history: [...(medicineData.data().history || []), newHistoryEntry]
      });

      // Reset the input for this medicine
      setStockInputs((prev) => ({ ...prev, [medicineId]: "" }));
      getTypes(); // Refresh the data
    }
  };

  const handleShowHistory = async (medicine) => {
    setSelectedMedicine(medicine);
    setHistory(medicine.history || []); // Load the history from the selected medicine
    setShowHistoryModal(true);
  };

  useEffect(() => {
    getTypes();
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
                      <button
                        className="btn btn-info btn-sm float-right mr-2"
                        onClick={() => setShowHistoryModal(true)}
                      >
                        History
                      </button>
                    </h4>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>
                              Medicine Name<sup>Power</sup>
                            </th>
                            <th>Medicine Category</th>
                            <th>Medicine Type</th>
                            <th>Medicine Price</th>
                            <th>Stock</th>
                            <th>Action</th>
                            <th>History</th> {/* New History Column */}
                          </tr>
                        </thead>
                        <tbody>
                          {medicines.map((medicine, index) => (
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
                                      className="btn btn-link btn-primary"
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
    </>
  );
}