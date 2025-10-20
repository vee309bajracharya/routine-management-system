import PageError from '../../../assets/svg/error.svg';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PageNotFound = () => {
  return (
    <section>
      <div className='flex justify-center items-center flex-col min-h-screen'>
        <img
          src={PageError}
          alt="Page Not Found Image"
          loading='lazy'
          className='max-w-md' />

        {/* link to home-page */}
        <div className="justify-center mt-6">
          <Link
            to='/'
            className="back-page-link"
          >
            <span className="mr-1 text-lg">
              <ChevronLeft size={16} />
            </span> Back to Home Page
          </Link>
        </div>
      </div>
    </section>
  )
}

export default PageNotFound