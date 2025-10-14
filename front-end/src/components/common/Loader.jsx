import mainLogo from '../../assets/svg/default_logo.svg'

const Loader = () => {
  return (
    <section
      className='fixed inset-0 flex items-center justify-center h-screen z-50 backdrop-blur-sm'>
      <img
        src={mainLogo}
        alt="Main Logo"
        className='xs:w-32 xs:h-32 md:w-52 md:h-52 animate-pulse'
        loading='lazy' />
    </section>
  )
}

export default Loader