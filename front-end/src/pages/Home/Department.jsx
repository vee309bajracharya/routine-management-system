import { Link } from "react-router-dom";
import Arch from "../../assets/svg/Architecture.svg";
import Science from "../../assets/svg/Science.svg";
import CivilEng from "../../assets/svg/CivilEng.svg";
import Electric from "../../assets/svg/Electric.svg";
import ElectroniComp from "../../assets/svg/ElectronicComp.svg";
import Mechanical from "../../assets/svg/Mechanical.svg";


const Department = () => {
  const departments = [
    {
      id: 1,
      icon: Arch,
      name: "Architecure",
      description:
        "Design, planning, and construction of buildings and spaces; combines creativity with technical skills.",
      routine_link: "#",
    },
    {
      id: 2,
      icon: Science,
      name: "Applied Science and Chemical",
      description:
        "Design, planning, and construction of buildings and spaces; combines creativity with technical skills.",
      routine_link: "#",
    },
    {
      id: 3,
      icon: CivilEng,
      name: "Civil Engineering",
      description:
        "Design, planning, and construction of buildings and spaces; combines creativity with technical skills.",
      routine_link: "#",
    },
    {
      id: 4,
      icon: Electric,
      name: "Electrical Engineering",
      description:
        "Design, planning, and construction of buildings and spaces; combines creativity with technical skills.",
      routine_link: "#",
    },
    {
      id: 5,
      icon: ElectroniComp,
      name: "Electronics and Computer",
      description:
        "Design, planning, and construction of buildings and spaces; combines creativity with technical skills.",
      routine_link: "#",
    },
    {
      id: 6,
      icon: Mechanical,
      name: "Mechanical and Aerospace",
      description:
        "Design, planning, and construction of buildings and spaces; combines creativity with technical skills.",
      routine_link: "#",
    },
  ];
  return (
    <section className="mb-16 mt-9 font-general-sans">
      <section>
        {/* Title */}
        <div
          className="text-center mb-8"
          data-aos="fade-down"
          data-aos-duration="4000">
          <h2
            className="xs:text-2xl md:text-4xl font-bold text-primary-text my-4"
          >Choose a department</h2>
          <p
            className="text-primary-text text-sm  text-center mx-auto">
            Select a department to view schedules and stay organized with all
            your classes, labs, and events in one place.
          </p>
        </div>

        {/* Department cards */}
        <section
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          data-aos="zoom-out"
          data-aos-duration="4000">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white shadow-md hover:shadow-lg transition-shadow py-4 px-6 rounded">
              <img
                className="w-8 h-8 bg-primary5-blue px-1 py-2 rounded-lg mb-6"
                src={dept.icon}
                alt={dept.name} />

              <h3
                className="text-xl font-bold text-primary-text">{dept.name}</h3>

              <p
                className="text-primary-text mb-6">{dept.description}</p>

              <Link
                to={dept.routine_link}
                className="bg-main-blue text-white py-1 px-4 rounded w-full text-center block active:scale-95">View Routine</Link>
            </div>
          ))}
        </section>
      </section>
    </section>
  );
};

export default Department;
