/* eslint-disable no-unused-vars */
import lightning from '../../assets/svg/lightning.svg';
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="my-16">
      <section
        className="text-center font-general-sans">

        {/* Intro section */}
        <section
          data-aos="zoom-in"
          data-aos-anchor-placement="top-bottom"
          data-aos-duration="4000">
          {/* Subtitle */}
          <p className="inline-flex items-center gap-2 xs:text-[1rem] md:text-lg text-main-blue bg-primary6-blue mb-2 px-4 py-2 rounded-lg">
            <img src={lightning} alt="lightning icon" className="w-5 h-5" />
            Take full control of your day
          </p>

          {/* Main Title */}
          <h1 className="xs:text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Routines Made Simple,
            <br />
            <span className="text-primary-text">Smart, and Effective</span>
          </h1>

          {/* Description */}
          <p className="xs:text-[1rem] md:text-xl text-sub-text mb-8 max-w-3xl mx-auto">
            Simplifying your daily routines so you can stay focused, consistent,
            and effective. Spend less time planning and more time achieving your
            goals, turning small actions into meaningful progress.
          </p>

          {/* Buttons */}
          <div
            className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-main-blue cursor-pointer text-white px-8 py-3 rounded-md hover:bg-primary-blue transition-colors duration-200 text-lg font-semibold">
              Check Routines
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="border-1 border-main-blue cursor-pointer text-primary-text px-8 py-3 rounded-md hover:bg-primary5-blue transition-colors duration-200 text-lg font-semibold">
              How it works
            </motion.button>
          </div>
        </section>

        {/* Stats Bar */}
        <section
          className="bg-white rounded-lg p-6 mx-auto my-4"
          data-aos="zoom-in"
          data-aos-anchor-placement="fade-down"
          data-aos-duration="4000">

          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 text-center">
              <div className="flex-1 md:divide-x-1">
                <h3 className="heroStateBar-num">10,000+</h3>
                <p className="heroStateBar-title">Students</p>
              </div>
              <div className="flex-1 md:divide-x-1">
                <h3 className="heroStateBar-num">6</h3>
                <p className="heroStateBar-title">Labs</p>
              </div>
              <div className="flex-1 md:divide-x-1">
                <h3 className="heroStateBar-num">10,000+</h3>
                <p className="heroStateBar-title">Rooms</p>
              </div>
              <div className="flex-1 md:divide-x-1">
                <h3 className="heroStateBar-num">10</h3>
                <p className="heroStateBar-title">Departments</p>
              </div>
              <div className="flex-1">
                <h3 className="heroStateBar-num">500+</h3>
                <p className="heroStateBar-title">Teachers</p>
              </div>
            </div>
          </div>
        </section>
      </section>
    </section>
  );
};

export default HeroSection;
