import proImage from "../../../src/assets/image4.png";

export const getImageUrl = (path) => {
  if (!path) {
    return proImage;
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  } else {
    const baseUrl = import.meta.env.VITE_ASSET_BASE_URL;
    return `${baseUrl}/${path}`;
  }
};
