import { Link } from "react-router-dom";
import mainLogo from "../../assets/svg/default_logo.svg";
import { Linkedin, Instagram, Facebook } from "lucide-react";


const Footer = () => {
  return (
    <footer className="bg-white text-primary-text font-general-sans">
      {/* Main Content */}
      <section
        className="wrapper"
        data-aos="fade-right"
        data-aos-duration="4000">

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[4fr_1fr_1fr_1fr] gap-10 mt-16">

          {/* Logo & Description */}
          <div className="space-y-4 max-w-sm">
            <div className="flex items-center space-x-3">
              <img
                src={mainLogo}
                alt="RMS Logo"
                className="w-30 h-20 object-contain"
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
                    className="hover:text-hover-blue transition-colors duration-200"
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
              {["FAQ", "Contact", "Help Center", "How it works"].map((item) => (
                <li key={item}>
                  <Link
                    to="#"
                    className="hover:text-hover-blue transition-colors duration-200"
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
                  alt={Icon.name}
                  className="bg-primary5-blue p-2.5 rounded-md hover:bg-blue-600 hover:text-white transition-colors duration-200"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom Bar */}
        <section className="border-t border-black my-9">
          <div className="flex flex-col xs:gap-4 md:flex-row justify-between md:items-center text-sub-text text-sm mt-7">
            <span>© 2025 Routine Management System. All Rights Reserved</span>
            <div className="flex xs:flex-col md:flex-row my-2">
              <Link to="#" className="hover:text-hover-blue transition-colors md:mx-3 py-1">
                Terms & Conditions
              </Link>
              <Link to="#" className="hover:text-hover-blue transition-colors py-1">
                Privacy Policy
              </Link>
            </div>
          </div>
        </section>


      </section>
    </footer>
  );
};

export default Footer;

