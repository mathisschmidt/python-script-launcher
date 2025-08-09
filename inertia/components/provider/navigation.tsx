// NavigationContext.tsx
import React, { createContext, useContext, useState } from 'react';

type Page = 'dashboard' | 'execution' | 'config' | 'history';

type NavigationContextType = {
  currentPage: Page;
  navigateTo: (page: Page) => void;
};

const NavigationContext = createContext<NavigationContextType | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  return (
    <NavigationContext.Provider value={{ currentPage, navigateTo }}>
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation doit être utilisé dans un NavigationProvider');
  }
  return context;
};
