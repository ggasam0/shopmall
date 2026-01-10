import { createContext, useContext, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { getDistributorByLocation, preloadDistributorInventory } from "../utils/distributor";
import { useSupplier } from "./supplier";
import { defaultDistributor } from "../data/distributors";

const DistributorContext = createContext(null);

export const DistributorProvider = ({ children }) => {
  const location = useLocation();
  const supplier = useSupplier();

  const distributor = useMemo(() => {
    if (supplier?.distributor?.code) {
      return {
        code: supplier.distributor.code,
        name: supplier.distributor.name || defaultDistributor.name,
        pickupAddress:
          supplier.distributor.pickupAddress || defaultDistributor.pickupAddress,
        theme: defaultDistributor.theme
      };
    }
    return getDistributorByLocation(location);
  }, [location, supplier]);

  useEffect(() => {
    preloadDistributorInventory(distributor.code);
  }, [distributor.code]);

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
