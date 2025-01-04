import React from "react";
import './styles.css'; // Make sure to import your CSS file if it's not already imported

export default function AdminFooter() {
  return (
    <>
      <footer className="footer">
        <div className="container-fluid">
          MediShelf
          <div className="copyright ml-auto">
            Copyright &copy;&nbsp;
            {new Date().getFullYear()}{" "}
            by{" "}
            <a href="https://www.aboutabhi.site" target={"_blank"} rel="noopener noreferrer">
              AbhishekMishra
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}