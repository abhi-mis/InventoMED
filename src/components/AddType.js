import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AdminHeader from "./layouts/AdminHeader";
import AdminSideBar from "./layouts/AdminSideBar";
import AdminFooter from "./layouts/AdminFooter";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AddType() {
  const navigate = useNavigate();
  const medTypesCollectionRef = collection(db, "medicine_types");
  const [medTypeName, setMedTypeName] = useState("");

  const handleAddType = async () => {
    if (medTypeName) {
      try {
        await addDoc(medTypesCollectionRef, { name: medTypeName });
        toast.success("Medicine Type added successfully!");
        setTimeout(() => {
          navigate("/types");
        }, 1000);
      } catch (error) {
        toast.error("Error adding Medicine Type!");
      }
    } else {
      toast.error("Medicine Type name required!");
    }
  };

  return (
    <>
      <AdminHeader />
      <AdminSideBar />
      <div className="main-panel">
        <div className="content">
          <div className="container-fluid">
            <h4 className="page-title">Create Type</h4>
            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">
                      New Type Details
                      <Link to="/types" className="btn btn-danger btn-sm float-right">
                        Go BACK
                      </Link>{" "}
                    </div>
                  </div>
                  <div className="card-body px-4">
                    <div className="form-group">
                      <label htmlFor="name">Type Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={medTypeName}
                        id="name"
                        onChange={(event) => {
                          setMedTypeName(event.target.value);
                        }}
                        placeholder="Enter Type Name"
                      />
                    </div>
                  </div>
                  <div className="form-group px-4 mb-3">
                    <button className="btn btn-primary mx-3" onClick={handleAddType}>
                      Add Medicine Type
                    </button>
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