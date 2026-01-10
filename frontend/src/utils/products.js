import API_BASE from "../api";

export const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return "";
  }
  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }
  return `${API_BASE}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
};
