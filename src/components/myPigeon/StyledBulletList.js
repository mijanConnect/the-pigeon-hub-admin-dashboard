import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";

/**
 * Bullet list with a `class` attribute for circle / arrow / stripe styling.
 */
export const StyledBulletList = BulletList.extend({
  addAttributes() {
    return {
      class: {
        default: "rich-ul-disc",
        parseHTML: (element) =>
          element.getAttribute("class") ?? "rich-ul-disc",
        renderHTML: (attributes) => ({
          class: attributes.class || "rich-ul-disc",
        }),
      },
    };
  },
});

/**
 * Per-item bullet style so one list can contain mixed markers.
 */
export const StyledListItem = ListItem.extend({
  addAttributes() {
    return {
      bulletStyle: {
        default: "disc",
        parseHTML: (element) => {
          const value = element.getAttribute("data-bullet-style");
          return value || "disc";
        },
        renderHTML: (attributes) => ({
          "data-bullet-style": attributes.bulletStyle || "disc",
        }),
      },
    };
  },
});
