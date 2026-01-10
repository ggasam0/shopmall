import { useEffect, useState } from "react";
import { apiRequest } from "../api";

const normalizeSupplier = (supplier) => ({
  code: supplier.code,
  suffix: supplier.suffix,
  mallName: supplier.mall_name || supplier.mallName || "烟花商城",
  distributor: supplier.distributor
    ? {
        code: supplier.distributor.code,
        name: supplier.distributor.name,
        pickupAddress:
          supplier.distributor.pickup_address || supplier.distributor.pickupAddress || ""
      }
    : null
});

const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const fetchSuppliers = async () => {
      try {
        const data = await apiRequest("/suppliers");
        if (active) {
          setSuppliers(Array.isArray(data) ? data.map(normalizeSupplier) : []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "加载供应商失败");
          setSuppliers([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchSuppliers();
    return () => {
      active = false;
    };
  }, []);

  return { suppliers, loading, error };
};

export default useSuppliers;
