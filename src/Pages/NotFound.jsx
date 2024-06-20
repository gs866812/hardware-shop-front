import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className='flex flex-col items-center justify-center h-full w-full space-y-2 mt-20'>
            <h2 className='text-red-600 text-9xl font-bold'>404</h2>
            <p>Page not found</p>
            <br />
            <Link to='/' className='border px-3 py-1 rounded-md hover:bg-gray-200'>Home</Link>
        </div>
    );
};

export default NotFound;