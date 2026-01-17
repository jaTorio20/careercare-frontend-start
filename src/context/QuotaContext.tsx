// QuotaContext.tsx
import { createContext, useContext, useState, useMemo } from "react";

const QuotaContext = createContext<{
  quotaExceeded: boolean;
  setQuotaExceeded: (val: boolean) => void;
}>({
  quotaExceeded: false,
  setQuotaExceeded: () => {},
});

export const QuotaProvider = ({ children }: { children: React.ReactNode }) => {
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  
  const value = useMemo(() => ({ 
    quotaExceeded, 
    setQuotaExceeded 
  }), [quotaExceeded]);
  
  return (
    <QuotaContext.Provider value={value}>
      {children}
    </QuotaContext.Provider>
  );
};

export const useQuota = () => useContext(QuotaContext);
