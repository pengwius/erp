import { createContext, useContext, useEffect, useState } from "react";


type ThemeContextType = {
  theme: string;
  setTheme: (theme: string) => void;
  themes: string[];
};

const themes = [
  'light', 'dark'
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: any = ({ children }: { children: any }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('erp-theme') || 'corporate';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('erp-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
