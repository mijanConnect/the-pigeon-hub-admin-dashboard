import proImage from "../../../src/assets/image4.png";

export const getImageUrl = (path) => {
  if (!path) {
    return proImage;
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  } else {
    // const baseUrl = "http://10.10.7.41:5001";
    const baseUrl = "https://api.thepigeonhub.com";

    // const baseUrl = "http://206.162.244.155:5001";
    return `${baseUrl}/${path}`;
  }
};
