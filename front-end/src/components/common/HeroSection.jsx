/* eslint-disable no-unused-vars */
import { Link } from 'react-router-dom';
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

        </section>

      </section>
    </section>
  );
};

export default HeroSection;
