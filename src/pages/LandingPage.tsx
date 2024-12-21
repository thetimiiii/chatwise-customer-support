// src/pages/LandingPage.tsx
import React from 'react';
import NavBar from '../components/NavBar';

const LandingPage = () => {
    return (
        <div>
            <NavBar />
            <header className="bg-gray-100 py-20 text-center">
                <h1 className="text-5xl font-bold text-gray-800">Welcome to BrandName</h1>
                <p className="text-xl text-gray-600 mt-4">Your one-stop solution for customer support.</p>
                <div className="mt-6">
                    <Link to="/signup" className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700">Get Started</Link>
                </div>
            </header>
        </div>
    );
};
