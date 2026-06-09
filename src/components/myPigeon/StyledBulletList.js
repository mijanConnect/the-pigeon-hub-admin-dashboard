import { isAtStartOfNode } from "@tiptap/core";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import { TextSelection } from "@tiptap/pm/state";

function getLastTextblockEndInNode(doc, listStartPos) {
  const listNode = doc.nodeAt(listStartPos);
  if (!listNode) return null;

  const listContentStart = listStartPos + 1;
  const listContentEnd = listStartPos + listNode.nodeSize - 1;
  let lastEnd = null;

  doc.nodesBetween(listContentStart, listContentEnd, (node, pos) => {
    if (node.isTextblock) {
      // pos is absolute; +1 enters the textblock, +content.size lands after the last character
      lastEnd = pos + 1 + node.content.size;
    }
  });

  return lastEnd;
}

function joinPlainParagraphWithPreviousBulletList(editor) {
  const { $from } = editor.state.selection;

  if ($from.parentOffset !== 0) {
    return false;
  }

  const blockStart = $from.before();
  if (blockStart <= 0) {
    return false;
  }

  const nodeBefore = editor.state.doc.resolve(blockStart).nodeBefore;
  if (!nodeBefore || nodeBefore.type.name !== "bulletList") {
    return false;
  }

  const listStart = blockStart - nodeBefore.nodeSize;
  const lastTextPos = getLastTextblockEndInNode(editor.state.doc, listStart);

  if (lastTextPos == null) {
    return false;
  }

  const blockFrom = blockStart;
  const blockTo = $from.after();
  const isEmpty = $from.parent.content.size === 0;

  if (isEmpty) {
    return editor
      .chain()
      .deleteRange({ from: blockFrom, to: blockTo })
      .setTextSelection(lastTextPos)
      .run();
  }

  const content = $from.parent.content;

  return editor
    .chain()
    .command(({ tr, dispatch }) => {
      tr.insert(lastTextPos, content);
      const mappedFrom = tr.mapping.map(blockFrom);
      const mappedTo = tr.mapping.map(blockTo);
      tr.delete(mappedFrom, mappedTo);
      tr.setSelection(TextSelection.create(tr.doc, lastTextPos));
      if (dispatch) {
        dispatch(tr);
      }
      return true;
    })
    .run();
}

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

  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      Backspace: ({ editor }) => {
        const { empty } = editor.state.selection;

        if (!empty) {
          return false;
        }

        // 1st backspace on a bullet line: remove bullet, stay on this line.
        if (editor.isActive(this.name) && isAtStartOfNode(editor.state)) {
          return editor.commands.liftListItem(this.name);
        }

        // 2nd backspace on the plain line: move to previous line without re-adding a bullet.
        if (
          editor.isActive("paragraph") &&
          !editor.isActive(this.name) &&
          isAtStartOfNode(editor.state)
        ) {
          if (joinPlainParagraphWithPreviousBulletList(editor)) {
            return true;
          }

          return editor.commands.joinBackward();
        }

        return false;
      },
    };
  },
});
