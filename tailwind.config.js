// /** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                'text': '#1f2937',
                'background': '#ffffff',
                'primary': '#4b84af',
                'secondary': '#0f2a43',
                'accent': '#22D3EE',
            },
            fontFamily: {
                headline: ["Inter", "sans-serif"],
                body: ["Inter", "sans-serif"],
                label: ["Inter", "sans-serif"],
                inter: ['Inter', 'sans-serif'],
                manrope: ['Manrope', 'sans-serif'],
            },
            borderRadius: {
                DEFAULT: "0.125rem",
                lg: "0.25rem",
                xl: "0.5rem",
                full: "0.75rem",
            },
        },

    },
    plugins: [],
}

