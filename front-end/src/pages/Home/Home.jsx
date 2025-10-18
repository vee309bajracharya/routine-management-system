import React from 'react'
import Navbar from '../../components/navigation/Navbar'
import Footer from '../../components/navigation/Footer'
import HeroSection from '../../components/HeroSection'
import Department from '../../pages/Home/Department'


const Home = () => {
  return (

    <div className='bg-gradient-to-b from-white to-blue-gradient w-full h-full '>
      <Navbar />
      <HeroSection />
      <Department />
      <Footer />
    </div>
    
    
  )
}
export default Home