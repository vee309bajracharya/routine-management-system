import React, { useState } from "react";
import mainLogo from "../../assets/svg/default_logo.svg";
import { Link } from "react-router-dom";
import {Menu,X} from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="relative px-8 py-4 mt-5 flex rounded-lg font-general-sans">
      <div className="wrapper flex justify-between items-center w-full">
        {/* Navbar content goes here */}
        <div>
          <img src={mainLogo} alt="Logo" className="h-10 w-30 object-contain" />
        </div>
        {/* Center navigation*/}
        <div className="hidden md:flex space-x-8 text-primary-text font-medium">
          <Link to="/" className="navbar-center-link">
            Home
          </Link>
          <Link to="/routine" className="navbar-center-link">
            Routine
          </Link>
          <Link to="/room" className="navbar-center-link">
            Rooms
          </Link>
          <Link to="/labs" className="navbar-center-link">
            Labs
          </Link>
          <Link to="/contacts" className="navbar-center-link">
            Contacts
          </Link>
        </div>
        {/* Right side button */}
        <div>
          <button className="hidden md:flex bg-main-blue text-white cursor-pointer px-4 py-2 rounded-lg hover:bg-hover-blue transition">
            <Link to="/Teacher-login">Sign in</Link>
          </button>
        </div>
        {/* Mobile menu button */}
        <button
         className="md:hidden flex items-center text-primary-text"
         onClick={()=>setIsOpen(!isOpen)}
        >
          {isOpen ?<X size={28}/> : <Menu size={28}/>}
        </button>
      </div>
      {/* Mobile Menu */}
       {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full mt-2 bg-white border border-box-outline p-4 rounded-lg shadow-lg z-10 flex flex-col space-y-3">
          <Link
            to="/"
            className="mobile-nav-link "
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/routine"
            className="mobile-nav-link block "
            onClick={() => setIsOpen(false)}
          >
            Routine
          </Link>
          <Link
            to="/room"
            className="mobile-nav-link block "
            onClick={() => setIsOpen(false)}
          >
            Room
          </Link>
          <Link
            to="/labs"
            className="mobile-nav-link block "
            onClick={() => setIsOpen(false)}
          >
            Labs
          </Link>
          <Link
            to="/contacts"
            className="mobile-nav-link block "
            onClick={() => setIsOpen(false)}
          >
            Contacts
          </Link>
          <button className="bg-main-blue text-white px-4 py-2 rounded-lg hover:bg-hover-blue transition">
            <Link to="/teacher-login" onClick={() => setIsOpen(false)}>Sign in</Link>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;