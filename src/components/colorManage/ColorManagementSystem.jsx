class ColorManagementSystem {
  constructor(initialColors = []) {
    this.colors = initialColors;
    this.nextId =
      initialColors.length > 0
        ? Math.max(...initialColors.map((color) => color.id)) + 1
        : 1;
  }

  addColor(name, colorCode, isActive = true) {
    if (!name || !colorCode) {
      return { success: false, message: "Color name and code are required" };
    }
    // Ensure color code is in HEX format
    const hexColor = this.ensureHexFormat(colorCode);
    console.log("Adding color with hex:", hexColor); // Debug log

    const newColor = {
      id: this.nextId++,
      name: name,
      colorCode: hexColor,
      isActive: isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.colors.push(newColor);
    return {
      success: true,
      message: "Color added successfully",
      color: newColor,
    };
  }

  editColor(id, updates) {
    const colorIndex = this.colors.findIndex((color) => color.id === id);
    if (colorIndex === -1) {
      return { success: false, message: "Color not found" };
    }
    const color = { ...this.colors[colorIndex] };
    if (updates.name !== undefined) {
      color.name = updates.name;
    }
    if (updates.colorCode !== undefined) {
      // Ensure color code is in HEX format
      color.colorCode = this.ensureHexFormat(updates.colorCode);
      console.log("Editing color with hex:", color.colorCode); // Debug log
    }
    if (updates.isActive !== undefined) {
      color.isActive = updates.isActive;
    }
    color.updatedAt = new Date();
    this.colors[colorIndex] = color;
    return { success: true, message: "Color updated successfully", color };
  }

  deleteColor(id) {
    const colorIndex = this.colors.findIndex((color) => color.id === id);
    if (colorIndex === -1) {
      return { success: false, message: "Color not found" };
    }
    const deletedColor = this.colors.splice(colorIndex, 1)[0];
    return {
      success: true,
      message: "Color deleted successfully",
      color: deletedColor,
    };
  }

  getAllColors() {
    return [...this.colors];
  }

  getActiveColors() {
    return this.colors.filter((color) => color.isActive);
  }

  toggleColorStatus(id) {
    const colorIndex = this.colors.findIndex((color) => color.id === id);
    if (colorIndex === -1) {
      return { success: false, message: "Color not found" };
    }
    const updatedColor = { ...this.colors[colorIndex] };
    updatedColor.isActive = !updatedColor.isActive;
    updatedColor.updatedAt = new Date();
    this.colors[colorIndex] = updatedColor;
    return {
      success: true,
      message: `Color status toggled to ${
        updatedColor.isActive ? "active" : "inactive"
      }`,
      color: updatedColor,
    };
  }

  searchColors(query) {
    if (!query) return this.getAllColors();
    query = query.toLowerCase();
    return this.colors.filter(
      (color) =>
        color.name.toLowerCase().includes(query) ||
        color.colorCode.toLowerCase().includes(query)
    );
  }

  // Helper method to ensure color is in HEX format
  ensureHexFormat(color) {
    console.log("Raw color input:", color); // Debug log

    // If it's already a proper hex string
    if (typeof color === "string") {
      // If it's a hex code with # prefix
      if (color.startsWith("#") && /^#([0-9A-F]{3}){1,2}$/i.test(color)) {
        return color;
      }

      // If it's a hex code without # prefix
      if (/^([0-9A-F]{3}){1,2}$/i.test(color)) {
        return `#${color}`;
      }
    }

    // If we received an object from Ant Design's ColorPicker
    if (color && typeof color === "object") {
      // Check for Ant Design v5 ColorPicker that provides hexString directly
      if (color.hexString) {
        return color.hexString;
      }

      // Check for color.toHexString() method
      if (typeof color.toHexString === "function") {
        return color.toHexString();
      }

      // Check for simple hex property
      if (color.hex) {
        return color.hex.startsWith("#") ? color.hex : `#${color.hex}`;
      }
    }

    // If we somehow still don't have a valid hex, return a default
    // This should not happen with the fixed implementation
    console.error("Failed to extract hex color, defaulting to #1890ff");
    return "#1890ff"; // Default to blue instead of black as a more obvious signal
  }
}

export default ColorManagementSystem;
