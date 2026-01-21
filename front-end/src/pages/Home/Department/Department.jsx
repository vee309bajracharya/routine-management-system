/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import axiosClient from "../../../services/api/axiosClient";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import RoutineSelectionModal from "./RoutineSelectionModal";
import { motion } from "framer-motion";

const INSTITUTION_ID = import.meta.env.VITE_INSTITUTION_ID;

const Department = () => {

  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const response = await axiosClient.get(`/public/${INSTITUTION_ID}/departments`);
        setDepartments(response.data.data);
      } catch (error) {
        toast.error(error.userMessage || 'Failed to load departments');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDepts();
  }, []);

  const handleOpenSelection = (dept) => {
    setSelectedDept(dept);
    setIsModalOpen(true);
  }

  if (isLoading) 
    return (
    <div className="text-center my-20">
      <Loader2 size={20} className="animate-spin text-main-blue mx-auto" />
      <p className="mt-2 text-primary-blue font-semibold text-lg">Loading Departments</p>
    </div>
  );


  return (
    <section className="mb-16 mt-9 font-general-sans">
      <div className="text-center mb-8">
        <h3 className="xs:text-2xl md:text-4xl font-bold text-primary-text my-4">Choose a department</h3>
        <p className="text-primary-text text-sm text-center mx-auto max-w-2xl">
          Select a department to view your schedule and stay organized with all your classes, labs, and routines in one place.
        </p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div key={dept.id} className="bg-white transition-shadow py-6 px-6 rounded-md text-left">
            <h3 className="text-lg font-bold">{dept.code}</h3>
            <p className="text-sm mt-6 h-12 overflow-hidden">
              View schedules and stay organized with all your classes in one place.
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOpenSelection(dept)}
              className="bg-main-blue text-white py-2 px-4 rounded w-full text-center block active:scale-95 transition-all hover:bg-blue-700 cursor-pointer"
            >
              View Routine
            </motion.button>
          </div>
        ))}
      </section>

      {selectedDept && (
        <RoutineSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          department={selectedDept}
        />
      )}
    </section>
  );
};

export default Department;
