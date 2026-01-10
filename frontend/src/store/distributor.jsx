import { createContext, useContext, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { getDistributorByLocation } from "../utils/distributor";

const DistributorContext = createContext(null);

export const DistributorProvider = ({ children }) => {
  const location = useLocation();
  const distributor = useMemo(() => getDistributorByLocation(location), [location]);

  return (
    <DistributorContext.Provider value={distributor}>
      {children}
    </DistributorContext.Provider>
  );
};

export const useDistributor = () => {
  const context = useContext(DistributorContext);
  if (!context) {
    throw new Error("useDistributor must be used within DistributorProvider");
  }
  return context;
};
