import React, { createContext, useContext, useState, useEffect } from 'react';

interface NavigationContextType {
  currentPath: string;
  navigate: (path: string, params?: Record<string, string>) => void;
  queryParams: Record<string, string>;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [queryParams, setQueryParams] = useState<Record<string, string>>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const params: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      params[key] = val;
    });
    return params;
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      const searchParams = new URLSearchParams(window.location.search);
      const params: Record<string, string> = {};
      searchParams.forEach((val, key) => {
        params[key] = val;
      });
      setQueryParams(params);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string, params?: Record<string, string>) => {
    let url = path;
    if (params && Object.keys(params).length > 0) {
      const q = new URLSearchParams(params).toString();
      url = `${path}?${q}`;
      setQueryParams(params);
    } else {
      setQueryParams({});
    }

    if (window.location.pathname !== path || window.location.search !== (params ? `?${new URLSearchParams(params).toString()}` : '')) {
      window.history.pushState({}, '', url);
    }

    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <NavigationContext.Provider value={{ currentPath, navigate, queryParams }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};
