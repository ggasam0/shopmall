import { useEffect, useState } from "react";
import { apiRequest } from "../api";

const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadProducts = async () => {
      try {
        const data = await apiRequest("/products");
        if (mounted) {
          setProducts(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setProducts([]);
          setError(err?.message || "加载失败");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    loadProducts();
    return () => {
      mounted = false;
    };
  }, []);

  return { products, loading, error };
};

export default useProducts;
