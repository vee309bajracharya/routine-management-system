import React from "react";
import { Link } from "react-router-dom";
import mainLogo from "../../assets/svg/default_logo.svg";
import { Linkedin, Instagram, Facebook } from "lucide-react";


const Footer = () => {
  return (
    <footer className="bg-white border-t border-box-outline text-primary-text px-8 font-general-sans">
      {/* Main Content */}
      <div className="wrapper px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[4fr_1fr_1fr_1fr] gap-10">
        {/* Logo & Description */}
        <div className="space-y-4 max-w-sm">
          <div className="flex items-center space-x-3">
            <img
              src={mainLogo}
              alt="RMS Logo"
              className="w-30 h-20 rounded-md object-contain"
            />
            
          </div>
          <p className="text-sm text-primary-text leading-relaxed">
            Routine Management System (RMS) is a smart platform designed to
            simplify academic scheduling. It helps students, teachers, and staff
            stay organized, consistent, and connected — all in one place.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-primary-text mb-4 tracking-wide">
            Quick Links
          </h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            {["Home", "Routine", "Room", "Labs"].map((link) => (
              <li key={link}>
                <Link
                  to="#"
                  className="hover:text-blue-600 transition-colors duration-200"
                >
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4 tracking-wide">
            Support
          </h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            {["FAQ", "Contacts", "Help Center", "How it works"].map((item) => (
              <li key={item}>
                <Link
                  to="#"
                  className="hover:text-blue-600 transition-colors duration-200"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Get in Touch */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4 tracking-wide">
            Get in Touch
          </h3>
          <p className="text-sm text-gray-600 mb-3">hallo@mentora.com</p>
          <div className="flex space-x-3">
            {[Linkedin, Instagram, Facebook].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label={Icon.name}
                className="bg-primary5-blue p-2.5 rounded-md hover:bg-blue-600 hover:text-white transition-colors duration-200"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-black">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center text-sub-text text-sm">
          <span>© 2025 Routine Management System, All rights reserved</span>
          <div className="flex space-x-6 mt-2 md:mt-0">
            <Link to="#" className="hover:text-gray-900 transition-colors">
              Terms & Conditions
            </Link>
            <Link to="#" className="hover:text-gray-900 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

