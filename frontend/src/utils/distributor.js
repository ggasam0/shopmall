import distributorMap, { defaultDistributor, distributorList } from "../data/distributors";

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

const distributorOrder = distributorList.map((item) => item.code);

export const getStockForDistributor = (productId, distributorCode) => {
  const index = Math.max(0, distributorOrder.indexOf(distributorCode));
  const baseStock = 18 + ((productId || 1) * 7 + index * 11) % 30;
  return baseStock;
};
