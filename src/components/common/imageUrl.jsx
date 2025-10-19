export const getImageUrl = (path) => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  } else {
    const baseUrl = "http://10.10.7.41:5001";
    // const baseUrl = "https://ftp.thepigeonhub.com";

    // const baseUrl = "http://206.162.244.155:5001";
    return `${baseUrl}/${path}`;
  }
};
