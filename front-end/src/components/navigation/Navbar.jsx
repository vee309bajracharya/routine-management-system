/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import mainLogo from "../../assets/svg/default_logo.svg";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="relative flex rounded-lg font-general-sans">
      <section
        className="flex justify-between items-center w-full mt-5"
        data-aos="fade-right"
        data-aos-duration="4000">
        {/* Navbar content goes here */}
        <div>
          <Link to='/'>
            <img src={mainLogo} alt="Logo" className="h-10 object-contain cursor-pointer" />
          </Link>
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
          <Link to="/contact" className="navbar-center-link">
            Contact
          </Link>
        </div>
        {/* Right side button */}
        <div>
          <motion.button
            className="hidden md:flex bg-main-blue text-white cursor-pointer px-4 py-2 rounded-lg hover:bg-primary-blue transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link to="/teacher-login">Sign in</Link>
          </motion.button>
        </div>
        {/* Mobile menu button */}
        <button
          className="md:hidden flex items-center text-primary-text cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Nav-links button"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </section>
      {/* Mobile Menu */}
      {isOpen && (
        <section className="md:hidden absolute top-full left-0 w-full mt-2 bg-white border border-box-outline p-4 rounded-lg shadow-lg z-10 flex flex-col space-y-3">
          <Link
            to="/"
            className="mobile-nav-link"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/routine"
            className="mobile-nav-link block"
            onClick={() => setIsOpen(false)}
          >
            Routine
          </Link>
          <Link
            to="/room"
            className="mobile-nav-link block"
            onClick={() => setIsOpen(false)}
          >
            Room
          </Link>
          <Link
            to="/labs"
            className="mobile-nav-link block"
            onClick={() => setIsOpen(false)}
          >
            Labs
          </Link>
          <Link
            to="/contact"
            className="mobile-nav-link block"
            onClick={() => setIsOpen(false)}
          >
            Contact
          </Link>
          <div className="text-center">
            <motion.button
              className="bg-main-blue text-white px-4 py-2 rounded-lg hover:bg-primary-blue transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}>
              <Link
                to="/teacher-login" 
                onClick={() => setIsOpen(false)}>Sign in</Link>
            </motion.button>
          </div>
        </section>
      )}
    </nav>
  );
};

export default Navbar;