/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');

    // initial theme
    useEffect(() => {
        const saved = localStorage.getItem('theme');
        if (saved) {
            setTheme(saved);
            document.documentElement.classList.toggle('dark', saved === 'dark');
        }
    }, []);

    // apply theme change
    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )

}

export const useTheme = () => useContext(ThemeContext);