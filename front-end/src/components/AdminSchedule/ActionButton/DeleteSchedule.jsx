/* eslint-disable no-unused-vars */
import React from 'react'
import { motion, AnimatePresence } from "framer-motion"; 

const DeleteSchedule = ({ isOpen}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.section>
            
        </motion.section>
      )}
    </AnimatePresence>
  )
}

export default DeleteSchedule