const normalizeSegment = (value) => value?.trim().toLowerCase();

export const defaultSupplier = {
  code: "default",
  suffix: "",
  mallName: "烟花商城",
  distributor: null
};

export const resolveSupplierByLocation = (location, suppliers = []) => {
  const segments = location.pathname.split("/").filter(Boolean);
  const firstSegment = normalizeSegment(segments[0]);
  const matched = suppliers.find(
    (supplier) => normalizeSegment(supplier.suffix) === firstSegment
  );
  return matched || defaultSupplier;
};

export const buildSupplierPath = (supplier, path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!supplier?.suffix) {
    return normalizedPath;
  }
  if (normalizedPath === "/") {
    return `/${supplier.suffix}`;
  }
  return `/${supplier.suffix}${normalizedPath}`;
};
