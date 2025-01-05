import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";
import { auth, googleProvider, db } from "../firebase";
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function AdminAuth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Register
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate("/profile");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleEmailSubmission = () => {
    if (isLogin) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  const handleRegister = async () => {
    if (values.name && values.email && values.password && values.confirmPassword) {
      setErrorMsg("");
      if (values.password === values.confirmPassword) {
        try {
          const response = await createUserWithEmailAndPassword(auth, values.email, values.password);
          const user = response.user;
          await updateProfile(user, { displayName: values.name });

          // Store user data in Firestore with UID as the document ID
          await setDoc(doc(db, "users", user.uid), {
            name: values.name,
            email: values.email,
            createdAt: new Date()
          });

          setSuccessMsg("Registration done successfully!");
          setTimeout(() => {
            setSuccessMsg("");
            navigate("/profile");
          }, 3000);
        } catch (err) {
          setErrorMsg(err.message);
        }
      } else {
        setErrorMsg("Passwords don't match!");
      }
    } else {
      setErrorMsg("Please fill out all required fields");
    }
  };

  const handleLogin = async () => {
    if (values.email && values.password) {
      setErrorMsg("");
      try {
        const response = await signInWithEmailAndPassword(auth, values.email, values.password);
        const user = response.user;

        // Fetch user data from Firestore using UID
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("User Data:", userData);
          navigate("/profile");
        } else {
          setErrorMsg("User data not found!");
        }
      } catch (err) {
        setErrorMsg(err.message);
      }
    } else {
      setErrorMsg("Please fill all the required fields!");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user data exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        // If user data does not exist, create a new document
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          email: user.email,
          createdAt: new Date()
        });
      }

      navigate("/profile");
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="d-flex h-100 justify-content-center align-items-center">
      <div className="card container col-10 col-sm-8 col-md-6 col-lg-4 mt-5 p-0">
        <div className="card-header text-center">
          <h3>MediCare</h3>
          <h4>{isLogin ? "Login" : "Register"}</h4>
        </div>
        <div className="card-body">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                placeholder="Full Name"
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="Email Address"
              onChange={(event) =>
                setValues((prev) => ({ ...prev, email: event.target.value }))
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Password"
              onChange={(event) =>
                setValues((prev) => ({ ...prev, password: event.target.value }))
              }
            />
          </div>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                placeholder="Confirm Password"
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    confirmPassword: event.target.value,
                  }))
                }
              />
            </div>
          )}
          <div className="text-center text-danger">{errorMsg}</div>
          <div className="text-center text-success">{successMsg}</div>
          <div className="form-group mt-4">
            <button
              type="button"
              onClick={handleEmailSubmission}
              className="btn btn-success btn-block"
            >
              {isLogin ? "Login" : "Register"}
            </button>
          </div>
          <div className="form-group text-center mt-3">
            {isLogin ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => setIsLogin(false)}
                  className="btn btn-link p-0"
                >
                  Register here!
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setIsLogin(true)}
                  className="btn btn-link p-0"
                >
                  Login here!
                </button>
              </>
            )}
          </div>
          <div className="form-group text-center mt-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="btn btn-danger btn-block"
            >
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}