/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './app/**/*.{js,ts,jsx,tsx}',
      './pages/**/*.{js,ts,jsx,tsx}',
      './components/**/*.{js,ts,jsx,tsx}',
      './node_modules/@shadcn/ui/dist/**/*.js',
    ],
    theme: {
      extend: {
        colors: {
          brand: {
            black: '#000000',
            olive: '#3F3D2F',
            orange: '#FF4F18',
            cream: '#E6E5CA',
            ivory: '#F8F6F1',
          },
        },
      },
    },
    plugins: [
      require('@tailwindcss/typography'),
    ],
  };
  