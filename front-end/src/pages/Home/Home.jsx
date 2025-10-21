import Navbar from '../../components/navigation/Navbar'
import Footer from '../../components/navigation/Footer'
import HeroSection from '../../components/common/HeroSection'
import Department from '../Department/Department'
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';


const Home = () => {

  useEffect(()=>{
    AOS.init();
  },[]);

  return (
    <section className='bg-gradient-to-b from-white to-blue-gradient'>
      <Helmet>
        <title>Home - Routine Management System</title>
        <meta name="description" content="Routine Management System Home page" />
      </Helmet>
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