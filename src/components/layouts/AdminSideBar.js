import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import { Eye, Ambulance, AlignJustify, StickyNote, User, ClipboardCheck, LogOut } from "lucide-react"; // Import Lucide icons

export default function AdminSideBar(props) {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserName(user.displayName);
      }
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/login", { replace: true });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <div className="sidebar">
        <div className="scrollbar-inner sidebar-wrapper">
          <div className="user">
            <div className="photo">
              <img src={`assets/img/profile4.jpg`} alt="Profile" />
            </div>
            <div className="info">
              <a>
                <span>
                  {userName !== "" ? userName : "Username"}
                  <span className="user-level">Administrator</span>
                </span>
              </a>
            </div>
          </div>
          <ul className="nav">
            <li className="nav-item">
              <Link to="/">
                <Eye className="w-5 h-5" />
                <p  className="ml-4">Dashboard</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/inventory">
                <Ambulance className="w-5 h-5" />
                <p  className="ml-4">Inventory</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/categories">
                <AlignJustify className="w-5 h-5" />
                <p  className="ml-4">Medicine Categories</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/types">
                <StickyNote className="w-5 h-5" />
                <p  className="ml-4">Medicine Types</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/profile">
                <User  className="w-5 h-5" />
                <p  className="ml-4">Profile</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/invoices"> {/* New Invoice Management Link */}
                <ClipboardCheck className="w-5 h-5" />
                <p  className="ml-4">Invoice Management</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
                <p  className="ml-4">Logout</p>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}