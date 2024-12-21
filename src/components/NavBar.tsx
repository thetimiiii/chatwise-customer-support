// src/components/NavBar.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
    return (
        <nav className="bg-blue-600 text-white py-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold">BrandName</Link>
                <ul className="flex space-x-6">
                    <li><Link to="/login" className="hover:underline">Login</Link></li>
                    <li><Link to="/signup" className="hover:underline">Sign Up</Link></li>
                </ul>
            </div>
        </nav>
    );
};

export default NavBar;
