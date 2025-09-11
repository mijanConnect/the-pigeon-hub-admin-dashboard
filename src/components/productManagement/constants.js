// constants.js
export const dummyCategories = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Clothing" },
  { id: 3, name: "Furniture" },
  { id: 4, name: "Books" },
  { id: 5, name: "Home Appliances" },
];

export const dummySubCategories = [
  { id: 1, name: "Mobile Phones", parentCategory: "Electronics" },
  { id: 2, name: "Laptops", parentCategory: "Electronics" },
  { id: 3, name: "Audio", parentCategory: "Electronics" },
  { id: 4, name: "Wearables", parentCategory: "Electronics" },
  { id: 5, name: "Casual Wear", parentCategory: "Clothing" },
  { id: 6, name: "Outerwear", parentCategory: "Clothing" },
  { id: 7, name: "Bottoms", parentCategory: "Clothing" },
  { id: 8, name: "Footwear", parentCategory: "Clothing" },
  { id: 9, name: "Living Room", parentCategory: "Furniture" },
  { id: 10, name: "Bedroom", parentCategory: "Furniture" },
  { id: 11, name: "Dining Room", parentCategory: "Furniture" },
  { id: 12, name: "Storage", parentCategory: "Furniture" },
  { id: 13, name: "Fiction", parentCategory: "Books" },
  { id: 14, name: "Non-fiction", parentCategory: "Books" },
  { id: 15, name: "Kitchen", parentCategory: "Home Appliances" },
  { id: 16, name: "Cleaning", parentCategory: "Home Appliances" },
];

export const sizeOptions = ["S", "M", "L", "XL", "XXL"];

export const colorOptions = [
  { name: "White", value: "#ffffff" },
  { name: "Black", value: "#000000" },
  { name: "Primary", value: "#6200EE" },
  { name: "Red", value: "#ff0000" },
  { name: "Green", value: "#00ff00" },
  { name: "Blue", value: "#0000ff" },
  { name: "Yellow", value: "#ffff00" },
  { name: "Purple", value: "#800080" },
  { name: "Gray", value: "#808080" },
  { name: "Brown", value: "#a52a2a" },
];

export const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
