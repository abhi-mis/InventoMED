import React, { useState, useEffect } from "react";
import AdminHeader from "./layouts/AdminHeader";
import AdminSideBar from "./layouts/AdminSideBar";
import AdminFooter from "./layouts/AdminFooter";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function MedicineTypes() {
  const [medTypes, setMedTypes] = useState([]);
  const medTypesCollectionRef = collection(db, "medicine_types");

  const getTypes = async () => {
    const data = await getDocs(medTypesCollectionRef);
    setMedTypes(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  const handleDeleteButton = async (id) => {
    try {
      const categoryDoc = doc(medTypesCollectionRef, id);
      await deleteDoc(categoryDoc);
      toast.success("Medicine Type deleted successfully!");
      getTypes();
    } catch (error) {
      toast.error("Error deleting Medicine Type!");
      console.error("Error deleting medicine type:", error);
    }
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
            <h4 className="page-title">Medicine Types</h4>
            <div className="row">
              <div className="col-md-12">
                <div className="card card-tasks">
                  <div className="card-header ">
                    <h4 className="card-title">
                      Types List{" "}
                      <Link to="/addtype" className="btn btn-primary btn-sm float-right">
                        Add new Type
                      </Link>{" "}
                    </h4>
                  </div>
                  <div className="card-body ">
                    <div className="table-full-width px-5 py-4 table-striped">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Type Name</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {medTypes.map((medType, index) => {
                            return (
                              <tr key={medType.id}>
                                <td>{index + 1}</td>
                                <td>{medType.name}</td>
                                <td className="td-actions">
                                  <div className="form-button-action">
                                    <Link to="/updatetype">
                                      <button
                                        type="button"
                                        className="btn btn-link btn-success"
                                        onClick={() => {
                                          localStorage.setItem(
                                            "medtype_obj",
                                            JSON.stringify(medType)
                                          );
                                          toast.info("Editing Medicine Type...");
                                        }}>
                                        <i className="la la-edit"></i>
                                      </button>
                                    </Link>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleDeleteButton(medType.id);
                                      }}
                                      className="btn btn-link btn-danger">
                                      <i className="la la-times"></i>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
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
      <ToastContainer />
    </>
  );
}