import Navbar from '../../components/navigation/Navbar'
import Footer from '../../components/navigation/Footer'
import HeroSection from '../../components/common/HeroSection'
import Department from '../Department/Department'
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';


const Home = () => {

  useEffect(()=>{
    AOS.init();
  },[]);

  return (
    <section className='bg-gradient-to-b from-white to-blue-gradient'>
      <section className='wrapper w-full h-full'>
        <Navbar />
        <main>
          <HeroSection />
          <Department />
        </main>
      </section>
      <Footer />
    </section>
  )
}
export default Home