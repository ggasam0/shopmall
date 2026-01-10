import { createContext, useContext, useMemo } from "react";
import { useLocation } from "react-router-dom";
import useSuppliers from "../hooks/useSuppliers";
import { defaultSupplier, resolveSupplierByLocation } from "../utils/supplier";

const SupplierContext = createContext(null);

export const SupplierProvider = ({ children }) => {
  const location = useLocation();
  const { suppliers } = useSuppliers();

  const supplier = useMemo(() => {
    if (!suppliers.length) {
      return defaultSupplier;
    }
    return resolveSupplierByLocation(location, suppliers);
  }, [location, suppliers]);

  return <SupplierContext.Provider value={supplier}>{children}</SupplierContext.Provider>;
};

export const useSupplier = () => {
  const context = useContext(SupplierContext);
  if (!context) {
    throw new Error("useSupplier must be used within SupplierProvider");
  }
  return context;
};
