'use client';

import React from 'react';

const LoginButton = () => {
    const handleLoginClick = () => {
        // Your login/signup logic here (NextAuth.js or custom JWT)
    };

    return (
        <button
            onClick={handleLoginClick}
            className="bg-blue-500 p-2 rounded text-white cursor-pointer"
        >
            Login/Signup
        </button>
    );
};

export default LoginButton;