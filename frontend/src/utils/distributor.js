import distributorMap, { defaultDistributor } from "../data/distributors";
import { apiRequest } from "../api";

const normalizeCode = (value) => value?.trim().toLowerCase();

export const resolveDistributorCode = (location) => {
  const searchParams = new URLSearchParams(location.search);
  const queryCode = normalizeCode(searchParams.get("dist") || searchParams.get("d"));
  if (queryCode && distributorMap[queryCode]) {
    return queryCode;
  }

  const segments = location.pathname.split("/").filter(Boolean);
  if (segments.length >= 2) {
    const [prefix, suffix] = segments.slice(-2);
    if (prefix === "d" && distributorMap[normalizeCode(suffix)]) {
      return normalizeCode(suffix);
    }
  }

  const lastSegment = normalizeCode(segments[segments.length - 1]);
  if (lastSegment && distributorMap[lastSegment]) {
    return lastSegment;
  }

  return defaultDistributor.code;
};

export const getDistributor = (code) => distributorMap[code] || defaultDistributor;

export const getDistributorByLocation = (location) => {
  const code = resolveDistributorCode(location);
  return getDistributor(code);
};

const inventoryCache = new Map();

const buildInventoryCacheKey = (code) => `distributorInventory:${code}`;

const readInventoryFromStorage = (code) => {
  if (typeof window === "undefined") {
    return null;
  }
  const saved = window.localStorage.getItem(buildInventoryCacheKey(code));
  if (!saved) {
    return null;
  }
  try {
    return JSON.parse(saved);
  } catch (error) {
    return null;
  }
};

export const preloadDistributorInventory = async (distributorCode) => {
  const normalized = normalizeCode(distributorCode || defaultDistributor.code) || "";
  if (!normalized || typeof window === "undefined") {
    return {};
  }
  try {
    const inventoryList = await apiRequest(`/inventory/${normalized}`);
    const nextInventory = inventoryList.reduce((acc, item) => {
      acc[item.product_id] = item.stock;
      return acc;
    }, {});
    window.localStorage.setItem(
      buildInventoryCacheKey(normalized),
      JSON.stringify(nextInventory)
    );
    inventoryCache.set(normalized, nextInventory);
    return nextInventory;
  } catch (error) {
    const fallback = readInventoryFromStorage(normalized) || {};
    inventoryCache.set(normalized, fallback);
    return fallback;
  }
};

export const getStockForDistributor = (productId, distributorCode) => {
  const normalized = normalizeCode(distributorCode || defaultDistributor.code) || "";
  if (typeof window === "undefined") {
    return 0;
  }
  const cached =
    inventoryCache.get(normalized) || readInventoryFromStorage(normalized) || {};
  const stock = Number(cached?.[productId] ?? 0);
  return Number.isFinite(stock) ? stock : 0;
};
