const API_BASE =
  import.meta.env.VITE_API_BASE ?? (import.meta.env.DEV ? "/api" : "");

const DEFAULT_TIMEOUT = 10000;

export const apiRequest = async (path, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    signal: controller.signal,
    ...options
  }).finally(() => clearTimeout(timeoutId));

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "请求失败");
  }

  return response.json();
};

export default API_BASE;
