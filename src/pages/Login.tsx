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
