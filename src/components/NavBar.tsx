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

export default LandingPage;

// src/pages/Login.tsx
import React from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

const Login = () => {
    const supabase = useSupabaseClient();

    const handleLogin = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) alert(error.message);
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <form className="bg-white p-8 rounded shadow-md" onSubmit={handleLogin}>
                <h2 className="text-2xl font-bold mb-6">Login</h2>
                <input name="email" type="email" placeholder="Email" className="w-full mb-4 p-2 border rounded" />
                <input name="password" type="password" placeholder="Password" className="w-full mb-4 p-2 border rounded" />
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Login</button>
            </form>
        </div>
    );
};

export default Login;

// src/pages/Signup.tsx
import React from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

const Signup = () => {
    const supabase = useSupabaseClient();

    const handleSignup = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) alert(error.message);
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <form className="bg-white p-8 rounded shadow-md" onSubmit={handleSignup}>
                <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
                <input name="email" type="email" placeholder="Email" className="w-full mb-4 p-2 border rounded" />
                <input name="password" type="password" placeholder="Password" className="w-full mb-4 p-2 border rounded" />
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Sign Up</button>
            </form>
        </div>
    );
};

export default Signup;
