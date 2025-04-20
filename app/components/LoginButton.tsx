'use client';  // Mark this as a client-side component

const LoginButton = () => {
  const handleLoginClick = () => {
    // Your login/signup logic here (NextAuth.js or custom JWT)
  };

  return (
    <button onClick={handleLoginClick} className="bg-blue-500 p-2 rounded text-white">
      Login/Signup
    </button>
  );
};

export default LoginButton;